package main

import (
	"database/sql"
	"embed"
	"fmt"
	"log"
	"net/http"

	"github.com/dv1x3r/w2go/w2"
	"github.com/dv1x3r/w2go/w2sort"
	"github.com/dv1x3r/w2go/w2sql/w2sqlbuilder"

	"github.com/huandu/go-sqlbuilder"
	_ "modernc.org/sqlite"
)

const address = "localhost:3000"

//go:embed index.html
var staticFS embed.FS

var db *sql.DB

func init() {
	var err error
	if db, err = sql.Open("sqlite", ":memory:"); err != nil {
		log.Fatalln(err)
	}

	// :memory: database is bound to the connection
	db.SetMaxOpenConns(1)

	_, err = db.Exec(`
		create table status (
			[id] integer primary key,
			[name] text not null,
			[position] integer not null
		) strict;

		insert into status ([name], [position]) values
			('pending', 0),
			('in progress', 1),
			('completed', 2);

		create table todo (
			[id] integer primary key,
			[name] text not null,
			[description] text not null,
			[quantity] integer not null,
			[status_id] integer not null references status(id) on delete restrict
		) strict;

		insert into todo ([name], [description], [quantity], [status_id]) values
			('buy groceries', 'go to the store and buy some food and drinks', 4, 3),
			('throw out the trash', 'ew, it stinks', 1, 1),
			('build a house', 'build a solid one for your family', 1, 2),
			('plant a tree', 'it is not that hard', 2, 2),
			('raise a son', 'so you can enjoy your food and drinks together', 1, 1);
	`)

	if err != nil {
		log.Fatalln(err)
	}
}

func main() {
	router := http.NewServeMux()

	router.HandleFunc("GET /{$}", func(w http.ResponseWriter, r *http.Request) {
		http.ServeFileFS(w, r, staticFS, "index.html")
	})

	v1 := http.NewServeMux()

	v1.HandleFunc("GET /todo/grid/records", getTodoGridRecords)
	v1.HandleFunc("POST /todo/grid/save", postTodoGridSave)
	v1.HandleFunc("POST /todo/grid/remove", postTodoGridRemove)

	v1.HandleFunc("GET /todo/form", getTodoForm)
	v1.HandleFunc("POST /todo/form", postTodoForm)

	v1.HandleFunc("GET /status/dropdown", getStatusDropdown)
	v1.HandleFunc("GET /status/grid/records", getStatusGridRecords)
	v1.HandleFunc("POST /status/grid/reorder", postStatusGridReorder)

	router.Handle("/api/v1/", http.StripPrefix("/api/v1", v1))

	log.Println("listening on: " + address)
	if err := http.ListenAndServe(address, router); err != nil {
		log.Fatalln(err)
	}
}

type Status struct {
	ID   int    `json:"id"`
	Name string `json:"name"`
}

type Todo struct {
	ID          int                 `json:"id"`
	Name        string              `json:"name"`
	Description w2.Editable[string] `json:"description"`
	Quantity    w2.Editable[int]    `json:"quantity"`
	Status      w2.EditableDropdown `json:"status"`
}

func getTodoGridRecords(w http.ResponseWriter, r *http.Request) {
	req, err := w2.ParseGridDataRequest(r.URL.Query().Get("request"))
	if err != nil {
		w2.NewErrorResponse(err.Error()).Write(w, http.StatusBadRequest)
		return
	}

	var total int
	var records []Todo

	sb := sqlbuilder.Select("count(*)").From("todo as t")
	w2sqlbuilder.Where(sb, req, map[string]string{
		"id":          "t.id",
		"name":        "t.name",
		"description": "t.description",
		"quantity":    "t.quantity",
		"status":      "t.status_id",
	})

	// query total number of rows with w2grid filters applied
	query, args := sb.BuildWithFlavor(sqlbuilder.SQLite)
	row := db.QueryRow(query, args...)
	if err := row.Scan(&total); err != nil && err != sql.ErrNoRows {
		w2.NewErrorResponse(err.Error()).Write(w, http.StatusInternalServerError)
		return
	}

	// reuse the same query builder for data records
	sb.Select("t.id", "t.name", "t.description", "t.quantity", "t.status_id", "s.name as status_name")
	sb.JoinWithOption(sqlbuilder.LeftJoin, "status as s", "s.id = t.status_id")
	w2sqlbuilder.OrderBy(sb, req, map[string]string{
		"id":          "t.id",
		"name":        "t.name",
		"description": "t.description",
		"quantity":    "t.quantity",
		"status":      "s.name",
	})

	w2sqlbuilder.Limit(sb, req)
	w2sqlbuilder.Offset(sb, req)

	query, args = sb.BuildWithFlavor(sqlbuilder.SQLite)
	rows, err := db.Query(query, args...)
	if err != nil {
		w2.NewErrorResponse(err.Error()).Write(w, http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	for rows.Next() {
		var todo Todo
		if err := rows.Scan(
			&todo.ID,
			&todo.Name,
			&todo.Description,
			&todo.Quantity,
			&todo.Status.ID,
			&todo.Status.Text,
		); err != nil {
			w2.NewErrorResponse(err.Error()).Write(w, http.StatusInternalServerError)
			return
		}
		records = append(records, todo)
	}

	if err := rows.Err(); err != nil {
		w2.NewErrorResponse(err.Error()).Write(w, http.StatusInternalServerError)
		return
	}

	w2.NewGridDataResponse(records, total).Write(w)
}

func postTodoGridSave(w http.ResponseWriter, r *http.Request) {
	req, err := w2.ParseGridSaveRequest[Todo](r.Body)
	if err != nil {
		w2.NewErrorResponse(err.Error()).Write(w, http.StatusBadRequest)
		return
	}

	tx, err := db.Begin()
	if err != nil {
		w2.NewErrorResponse(err.Error()).Write(w, http.StatusInternalServerError)
		return
	}
	defer tx.Rollback()

	for _, change := range req.Changes {
		ub := sqlbuilder.Update("todo")
		ub.Where(ub.EQ("id", change.ID))

		w2sqlbuilder.SetEditableWithDefault(ub, change.Description, "description")
		w2sqlbuilder.SetEditable(ub, change.Quantity, "quantity")
		w2sqlbuilder.SetEditable(ub, change.Status.ID, "status_id")

		query, args := ub.BuildWithFlavor(sqlbuilder.SQLite)
		if _, err := tx.Exec(query, args...); err != nil {
			w2.NewErrorResponse(err.Error()).Write(w, http.StatusInternalServerError)
			return
		}
	}

	if err := tx.Commit(); err != nil {
		w2.NewErrorResponse(err.Error()).Write(w, http.StatusInternalServerError)
		return
	}

	w2.NewSuccessResponse().Write(w, http.StatusOK)
}

func postTodoGridRemove(w http.ResponseWriter, r *http.Request) {
	req, err := w2.ParseGridRemoveRequest(r.Body)
	if err != nil {
		w2.NewErrorResponse(err.Error()).Write(w, http.StatusBadRequest)
		return
	}

	dlb := sqlbuilder.DeleteFrom("todo")
	dlb.Where(dlb.In("id", sqlbuilder.List(req.ID)))

	query, args := dlb.BuildWithFlavor(sqlbuilder.SQLite)
	if _, err := db.Exec(query, args...); err != nil {
		w2.NewErrorResponse(err.Error()).Write(w, http.StatusInternalServerError)
		return
	}

	w2.NewSuccessResponse().Write(w, http.StatusOK)
}

func getTodoForm(w http.ResponseWriter, r *http.Request) {
	req, err := w2.ParseFormGetRequest(r.URL.Query().Get("request"))
	if err != nil {
		w2.NewErrorResponse(err.Error()).Write(w, http.StatusBadRequest)
		return
	}

	var todo Todo

	const query = `
		select
			t.id,
			t.name,
			t.description,
			t.quantity,
			t.status_id,
			s.name as status_name
		from todo as t
		left join status as s on s.id = t.status_id
		where t.id = ?;
	`

	row := db.QueryRow(query, req.RecID)
	if err := row.Scan(
		&todo.ID,
		&todo.Name,
		&todo.Description,
		&todo.Quantity,
		&todo.Status.ID,
		&todo.Status.Text,
	); err != nil {
		if err == sql.ErrNoRows {
			w2.NewErrorResponse("todo not found").Write(w, http.StatusNotFound)
			return
		} else {
			w2.NewErrorResponse(err.Error()).Write(w, http.StatusInternalServerError)
			return
		}
	}

	w2.NewFormGetResponse(todo).Write(w)
}

func postTodoForm(w http.ResponseWriter, r *http.Request) {
	req, err := w2.ParseFormSaveRequest[Todo](r.Body)
	if err != nil {
		w2.NewErrorResponse(err.Error()).Write(w, http.StatusBadRequest)
		return
	}

	if req.RecID == 0 {
		const query = "insert into todo (name, description, quantity, status_id) values (?, ?, ?, ?);"
		res, err := db.Exec(query, req.Record.Name, req.Record.Description, req.Record.Quantity, req.Record.Status.ID)
		if err != nil {
			w2.NewErrorResponse(err.Error()).Write(w, http.StatusInternalServerError)
			return
		}
		lastInsertId, err := res.LastInsertId()
		if err != nil {
			w2.NewErrorResponse(err.Error()).Write(w, http.StatusInternalServerError)
			return
		}
		req.RecID = int(lastInsertId)
	} else {
		const query = "update todo set name = ?, description = ?, quantity = ?, status_id = ? where id = ?;"
		_, err := db.Exec(query, req.Record.Name, req.Record.Description, req.Record.Quantity, req.Record.Status.ID, req.RecID)
		if err != nil {
			w2.NewErrorResponse(err.Error()).Write(w, http.StatusInternalServerError)
			return
		}
	}

	w2.NewFormSaveResponse(req.RecID).Write(w)
}

func getStatusDropdown(w http.ResponseWriter, r *http.Request) {
	req, err := w2.ParseDropdownRequest(r.URL.Query().Get("request"))
	if err != nil {
		w2.NewErrorResponse(err.Error()).Write(w, http.StatusBadRequest)
		return
	}

	var records []w2.DropdownValue

	const query = "select id, name from status where name like ? order by position limit ?;"
	rows, err := db.Query(query, fmt.Sprintf("%%%s%%", req.Search), req.Max)
	if err != nil {
		w2.NewErrorResponse(err.Error()).Write(w, http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	for rows.Next() {
		var value w2.DropdownValue
		if err := rows.Scan(&value.ID, &value.Text); err != nil {
			w2.NewErrorResponse(err.Error()).Write(w, http.StatusInternalServerError)
			return
		}
		records = append(records, value)
	}

	if err := rows.Err(); err != nil {
		w2.NewErrorResponse(err.Error()).Write(w, http.StatusInternalServerError)
		return
	}

	w2.NewDropdownResponse(records).Write(w)
}

func getStatusGridRecords(w http.ResponseWriter, r *http.Request) {
	req, err := w2.ParseGridDataRequest(r.URL.Query().Get("request"))
	if err != nil {
		w2.NewErrorResponse(err.Error()).Write(w, http.StatusBadRequest)
		return
	}

	var total int
	var records []Status

	sb := sqlbuilder.Select("count(*)").From("status")
	query, args := sb.BuildWithFlavor(sqlbuilder.SQLite)
	row := db.QueryRow(query, args...)
	if err := row.Scan(&total); err != nil && err != sql.ErrNoRows {
		w2.NewErrorResponse(err.Error()).Write(w, http.StatusInternalServerError)
		return
	}

	sb.Select("id", "name").OrderBy("position")
	w2sqlbuilder.Limit(sb, req)
	w2sqlbuilder.Offset(sb, req)

	query, args = sb.BuildWithFlavor(sqlbuilder.SQLite)
	rows, err := db.Query(query, args...)
	if err != nil {
		w2.NewErrorResponse(err.Error()).Write(w, http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	for rows.Next() {
		var status Status
		if err := rows.Scan(&status.ID, &status.Name); err != nil {
			w2.NewErrorResponse(err.Error()).Write(w, http.StatusInternalServerError)
			return
		}
		records = append(records, status)
	}

	if err := rows.Err(); err != nil {
		w2.NewErrorResponse(err.Error()).Write(w, http.StatusInternalServerError)
		return
	}

	w2.NewGridDataResponse(records, total).Write(w)
}

func postStatusGridReorder(w http.ResponseWriter, r *http.Request) {
	req, err := w2.ParseGridReorderRequest(r.Body)
	if err != nil {
		w2.NewErrorResponse(err.Error()).Write(w, http.StatusBadRequest)
		return
	}

	tx, err := db.Begin()
	if err != nil {
		w2.NewErrorResponse(err.Error()).Write(w, http.StatusInternalServerError)
		return
	}
	defer tx.Rollback()

	var ids []int

	rows, err := tx.Query("select id from status order by position;")
	if err != nil {
		w2.NewErrorResponse(err.Error()).Write(w, http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	for rows.Next() {
		var id int
		if err := rows.Scan(&id); err != nil {
			w2.NewErrorResponse(err.Error()).Write(w, http.StatusInternalServerError)
			return
		}
		ids = append(ids, id)
	}

	if err := rows.Err(); err != nil {
		w2.NewErrorResponse(err.Error()).Write(w, http.StatusInternalServerError)
		return
	}

	if err := w2sort.ReorderArray(ids, req); err != nil {
		w2.NewErrorResponse(err.Error()).Write(w, http.StatusInternalServerError)
		return
	}

	for i, id := range ids {
		if _, err := tx.Exec("update status set position = ? where id = ?;", i, id); err != nil {
			w2.NewErrorResponse(err.Error()).Write(w, http.StatusInternalServerError)
			return
		}
	}

	if err := tx.Commit(); err != nil {
		w2.NewErrorResponse(err.Error()).Write(w, http.StatusInternalServerError)
		return
	}

	w2.NewSuccessResponse().Write(w, http.StatusOK)
}
