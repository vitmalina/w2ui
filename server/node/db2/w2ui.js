/**
*  Module that helps to work with W2UI & db2
*
*  DEPENDENCIES: underscore
*/

var dbType  = 'db2';

// public
module.exports = {
    prepare       : prepare,
    prependSearch : prependSearch,
    prependSort   : prependSort,
    getRecords    : getRecords,
    getEnum       : getEnum,
    saveRecord    : saveRecord,
    deleteRecords : deleteRecords,
    softDelete    : softDelete,
    randText      : randText,
    serveDB2      : serveDB2,
    enumDB2       : enumDB2
}
return;

// gets the next recid
function getNextSequence(name,cb) {

    console.log("getNextSequence");
    var sql = 'SELECT \
            recid \
            FROM ' + name + ' \
            order by recid';

        w2db.exec(sql, function (err, result) {
            if (err) {
                console.log(err);
                res.send({
                    status  : 'error',
                    message : 'DB Error: '+ err
                });
                cb(-1);
            } else {
                // Last used recid should be in last record, but do this anyways
                var highest_recid=0;
                console.log("looking for records",result);
                var r;
                var len;
                for(var i=0, len=result.records.length; i < len; i++)
                {
                    console.log("f",result.records[i]);
                    r=result.records[i];
                    if (Number(r.RECID)>highest_recid) {
                        highest_recid=Number(r.RECID);
                    }
                }
                highest_recid=highest_recid+1;
                console.log("getNextSequence ",highest_recid,result);
                cb(highest_recid);
            }
        });
}

// dataitem, contains the document item to extract from the table
function enumDB2(req, res, name,dataitem)
{
    console.log("getNextSequence");
    var sql = 'SELECT ' + dataitem  + ',recid FROM ' + name + ' \
            order by recid';
    var array = new Array();

        w2db.exec(sql, function (err, result) {
            if (err) {
                console.log(err);
                res.send({
                    status  : 'error',
                    message : 'DB Error: '+ err
                });
            } else {
                // Last used recid should be in last record, but do this anyways
                for(var i=0, len=result.records.length; i < len; i++)
                {
                    console.log("e",result.records[i]);
                    r=result.records[i];
                        var myRes=
                        {
                            text: r[dataitem],
                            recid: r.recid
                        };
                    array.push(myRes);

                }
                var resultData=
                {
                    status : "success",
                    items :  array
                };

                console.log("enum",resultData);
                res.send(resultData);

            }
        });
};


function serveDB2(req, res, collectionName)
{
    console.log("serveDB2", evaluated);
    //var evaluated=JSON.parse({ param });
    var evaluated;
    var indata;
    // Sometimes w2ui sends command in body.request, sometimes in body.
    if (req.body.request) {
        indata=req.body.request;
        try {
           evaluated=JSON.parse(indata);
        } catch (e) {
            console.log(e); 
        }
    } else {
        evaluated=req.body;        
    }

    
    console.log("serverCmd",evaluated);

    switch (evaluated.cmd)  // Was param.cmd
    {
            case 'add-record':
            {
                getNextSequence(collectionName,function(newNum) {
                    if (newNum>0) {
                        var doc = {
                            recid : newNum
                        };
                        var result_data = {
                            status: "sucess",
                            record: doc
                        };
                        //console.log(result_data);
                        res.send(result_data);
                    }
                });
           }
        break;

        case 'get-record':
            {
                //console.log("--- Get record --- with",evaluated.recid);
                //getRecord(evaluated,res,collectionName);
           }

          break;
        case 'get':
        case 'get-records':
            {

                var sql = 'SELECT \
                        * \
                        FROM ' + collectionName + ' MST\
                        WHERE ({{search}})';
//  \
//                    ORDER BY {{sort}}


                w2ui.getRecords(sql, req, res, { count: false });

            }
            break;

        case  'save-records':
            console.log("save-records");
            {
                console.log("c",evaluated.changes);
                // INSERT INTO USER (name, last, email, other, recid) VALUES ('olle', 'astrand', 'mail', '77', 1)


                //saveRecords(evaluated,res,collectionName);
            }
           break;

        case 'save':
        case 'save-record':
            // This can be called with changes as well as record as parameter.
            {
                console.log("save-record",evaluated);

                var sql = 'INSERT INTO ' + collectionName;

                var fields=Array();
                var values=Array();
                
                var obj;
                if (evaluated.changes) {
                    obj=evaluated.changes[0];
                } else {
                    obj=evaluated.record;
                }

                Object.keys(obj).forEach(function (key) {
                    var val = obj[key];
                    fields.push(key);
                    values.push(val);
                });

                sql = sql + '(' ;
                for (var i = 0; i < fields.length; i++) {
                    if (i!=0) {
                      sql = sql + ', ' + fields[i];
                    } else {
                      sql = sql  + fields[i];
                    }
                }
                sql = sql + ') VALUES (' ;
                for (var i = 0; i < values.length; i++) {
                   if (i!=0) {
                     sql = sql + ', \'' + values[i] + '\'';
                   } else {
                     sql = sql +  '\'' + values[i] + '\'';
                   }
                }
                sql = sql + ')' ;
                console.log(sql);

                w2db.exec(sql, function (err, result) {
                    if (err) {
                        console.log(err);
                        res.send({
                            status: 'error',
                            message: 'DB Error: ' + err
                        });
                    } else {
                        res.send({
                            status: 'success'
                        });
                    }
                });
            }

            break;
        case 'delete':
        case 'delete-records':
            var delsel = evaluated.selected;
            //console.log("delete-records=", Number(delsel[0]));
            // Note Only first selected record is deleted
            console.log(delsel);
            break;
        default:
            {
                console.log("Unknown cmd",evaluated.cmd)
                var err_response = {
                                        status: "error",
                                        message: "Command not recognized"
                                     };
                res.send(err_response);
            }
            break;
    }

};




/*
*  Implementation
*/

function prepare (sql, req) {
    // prepare search
    var searchStr = '';
    if (req.search) {
        for (var s in req.data.search) {
            var search = req.data.search[s];
            var oper   = '=';
            var field  = search.field;
            var value  = "'" + search.value + "'";

            if (searchStr != '') searchStr += ' ' + (req.data.searchLogic || 'OR') + ' ';
            switch (String(search.operator).toLowerCase()) {

                case 'begins':
                    oper   = (dbType == 'postgres' ? 'ILIKE' : 'LIKE');
                    value  = "'" + search.value + "%'";
                    break;

                case 'ends':
                    oper   = (dbType == 'postgres' ? 'ILIKE' : 'LIKE');
                    value  = "'%" + search.value + "'";
                    break;

                case 'contains':
                    oper   = (dbType == 'postgres' ? 'ILIKE' : 'LIKE');
                    value  = "'%" + search.value + "%'";
                    break;

                case 'is':
                    oper   = '=';
                    if (search.type == 'date') {
                        value = "'" + search.value + "'";
                    } else {
                        if (parseFloat(search.value) != search.value) {
                            field = 'LOWER('+ field + ')';
                            value = 'LOWER('+ search.value + ')';
                        } else {
                            value = search.value;
                        }
                    }
                    break;

                case 'between':
                    oper  = 'BETWEEN';
                    value = "'" + search.value[0] +"' AND '" + search.value[1] + "'";
                    break;

                case 'in':
                    oper  = 'IN';
                    value = '(' + search.value + ')';
                    break;

                case 'not in':
                    oper  = 'NOT IN';
                    value = '(' + search.value + ')';
                    break;
            }
            searchStr += field + ' ' + oper + ' ' + value;
        }
    }
    if (searchStr == '') searchStr = ' 1=1 ';

    // prepare sort
    sortStr = '';
    if (req.sort) {
        for (var s in req.data.sort) {
            var sort = req.data.sort[s];
            if (sortStr != '') sortStr += ', ';
            sortStr = sort.field + ' ' + sort.direction;
        }
    }
    if (sortStr == "") sortStr = ' 1=1 ';

    // build sql ORDER  BY  {{sort}}
    sql = sql.replace(/\{\{search\}\}/ig, searchStr);
    sql = sql.replace(/\{\{where\}\}/ig, searchStr);
    var cql = 'SELECT count(1) FROM (' + 
            sql.replace(/order( )*by( )*\{\{sort\}\}/ig, '')
                .replace(/order( )*by( )*\{\{sortby\}\}/ig, '')
                .replace(/order( )*by( )*\{\{order\}\}/ig, '')
                .replace(/order( )*by( )*\{\{orderby\}\}/ig, '') + 
        ') count_list';
    sql = sql.replace(/\{\{sort\}\}/ig, sortStr);
    sql = sql.replace(/\{\{sortby\}\}/ig, sortStr);
    sql = sql.replace(/\{\{order\}\}/ig, sortStr);
    sql = sql.replace(/\{\{orderby\}\}/ig, sortStr);
    //sql = sql + ' LIMIT ' + (req.limit ? req.limit : 100) + ' OFFSET ' + (req.offset ? req.offset : 0);
    // db2 crap
    sql = sql + ' fetch first ' +  (req.limit ? req.limit : 100) +  ' rows only';

    return { sql: sql, cql: cql };
}

function prependSearch (searches, str) {
    // prepend search fields with MST.
    if (searches) {
        for (var s in searches) {
            var search = searches[s];
            if (search.field.indexOf('.') == -1) search.field = 'MST.'+ search.field;
        }
    }
    return searches;
}

function prependSort (sorts, str) {
    // prepend search fields with MST.
    if (sorts) {
        for (var s in sorts) {
            var sort = sorts[s];
            if (sort.field.indexOf('.') == -1) sort.field = 'MST.'+ sort.field;
        }
    }
    return sorts
}

function getEnum (sql, req, res, options) {
    w2db.exec(sql, function (err, result) {
        if (err) {
            res.send({
                status  : 'error', 
                message : 'Database Error'
            });    
            return;
        }
        // process records
        var data = [];
        for (var r in result.records) {
            var record = _.extend({}, result.records[r], { recid : result.records[r][result.fields[0].name] });
            // unwrap obj.prop structures
            for (var rec in record) {
                if (rec.indexOf('.') != -1) {
                    var tmp = rec.split('.');
                    record[tmp[0]] = record[tmp[0]] || {};
                    record[tmp[0]][tmp[1]] = record[rec];
                    delete record[rec];
                }
            }
            data.push(record);
        }
        res.send({
            status : 'success',
            items  : data
        });
    });
}

function getRecords (sql, req, res, options) {
    // common for PgSQL and MySQL
    var tmp = prepare(sql, req);
    var sql = tmp.sql;
    var cql = tmp.cql;

    if (options && options.count === true) {
        w2db.exec(cql, function (err, result) {
            if (err) {
                res.send({
                    status  : 'error',
                    message : 'DB Error: '+ err
                });
            } else {
                run(parseInt(result.records[0].count));
            }
        });
    } else {
        run(-1);
    }

    function run (count) {
        w2db.exec(sql, function (err, result) {
            if (err) {
                res.send({
                    status  : 'error',
                    message : 'DB Error: '+ err
                });
            } else {
                // process records
                var data   = [];
                var master = null;
                for (var r in result.records) {
                    var record = _.extend({}, result.records[r], { recid : result.records[r][result.fields[0].name] });
                    // unwrap obj.prop structures
                    for (var rec in record) {
                        if (rec.indexOf('.') != -1) {
                            var tmp = rec.split('.');
                            record[tmp[0]] = record[tmp[0]] || {};
                            record[tmp[0]][tmp[1]] = record[rec];
                            delete record[rec];
                        }
                    }
                    if (options.master && record[options.master] != null) {
                        if (master == null) master = record[options.master];
                        delete record[options.master];
                    }
                    if (record.RECID) {
                        record.recid = record.RECID
                        delete record.RECID;
                        console.log(record.recid)                        
                    }
                    data.push(record);
                }
                var ret = {
                    status  : 'success',
                    total   : count,
                    records : data
                };
                if (options.master && master) {
                    ret[options.master] = master;
                }
                res.send(ret);
            }
        });
    }
}

function deleteRecords (table, condition, req, res, callBack) {
    var sel = req.data.selected;
    for (var s in sel) sel[s] = String(sel[s]).replace(/'/g, "''");
    var sql = 'DELETE FROM '+ table + ' WHERE '+ condition + ' IN (' + sel +')';
    // execute sql
    w2db.exec(sql, function (err, result) {
        if (typeof callBack == 'function') {
            callBack(err, result);
            return;
        }
        if (err) {
            res.send({
                status  : 'error',
                message : 'DB Error: '+ err
            });
        } else {
            res.send({
                status  : 'success',
                message : result.count + ' record(s) affected'
            });
        }
    });
}

function softDelete (table, condition, req, res, callBack) {
    var sel = req.data.selected;
    for (var s in sel) sel[s] = String(sel[s]).replace(/'/g, "''");
    var sql = 'UPDATE '+ table + ' SET deleted = true \
               WHERE deleted != true AND '+ condition + ' IN (' + sel +')';
    // execute sql
    w2db.exec(sql, function (err, result) {
        if (typeof callBack == 'function') {
            callBack(err, result);
            return;
        }
        if (err) {
            res.send({
                status  : 'error',
                message : 'DB Error: '+ err
            });
        } else {
            res.send({
                status  : 'success',
                message : result.count + ' record(s) affected'
            });
        }
    });
}

function saveRecord (data, table, pkField, req, res, callBack) {
    var fields    = '';
    var values    = '';
    var sql     = '';
    if (!data.recid || data.recid == 0) { // null, undefined, or 0
        for (var field in data.record) {
            if (field == pkField) continue; // key field should not be here
            if (fields != '') fields += ", ";
            if (values != '') values += ", ";
            if (data.record[field] == "") data.record[field] = null; 
            fields += String(field).replace(/'/g, "''");
            var tmp = String(data.record[field]).replace(/'/g, "''");
            if (tmp.substr(0, 2) != '__') tmp = "'" + tmp + "'"; else tmp = tmp.substr(2)
            values += (data.record[field] == null ? "null" : tmp);
        }
        sql = 'INSERT INTO '+ table +'('+ fields +') VALUES('+ values +')';
    } else {
        for (var field in data.record) {
            if (field == pkField) continue; // key field should not be here
            if (values != '') values += ", ";
            if (data.record[field] == "") data.record[field] = null; 
            var tmp = String(data.record[field]).replace(/'/g, "''");
            if (tmp.substr(0, 2) != '__') tmp = "'" + tmp + "'"; else tmp = tmp.substr(2)
            values += field +'='+ (data.record[field] == null ? "null" : tmp);
        }
        sql = 'UPDATE '+ table +' SET '+ values +' WHERE '+ pkField +' = '+ String(data.recid).replace(/'/g, "''");
    }
    // execute sql
    w2db.exec(sql, function (err, result) {
        if (typeof callBack == 'function') {
            if (!data.recid || data.recid == 0) { // new record
                w2db.exec('SELECT max('+ pkField +') as max FROM '+ table, function (err, result) {
                    if (err) { 
                        callBack(null);
                    } else {
                        callBack(result.records[0]['max']);
                    }
                });
            } else {
                callBack(data.recid);
            }
            return;
        }
        if (err) {
            res.send({
                status  : 'error',
                message : 'DB Error: '+ err
            });
        } else {
            res.send({
                status  : 'success',
                message : result.count + ' record(s) affected'
            });
        }
    });
}

function randText (len) {
    var pool = 'abcdefghjklmnopqrstuvwxyzABCDEFGHJKLMNOPQRSTUVWXYZ1234567890!@#$%^&*!@#$%^&*!@#$%^&*!@#$%^&*';
    var ret  = '';
    for (var i=0; i < len; i++) {
        ret += pool.substr(Math.round(Math.random() * pool.length), 1)
    }   
    return ret;
}