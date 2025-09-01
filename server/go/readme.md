# Go server example for w2ui

This example contains a minimal Go server that implements a **full** CRUD demo using in-memory SQLite.

It showcases how to integrate w2ui with Go through the external [w2go bindings](https://github.com/dv1x3r/w2go). 

For complete bindings documentation, see the [w2go repository](https://github.com/dv1x3r/w2go).

## Features

- `w2grid` support in `JSON` mode:
  - **Pagination**, **sorting**, and **search**;
  - **Inline editing** with typed updates;
  - **Batch delete**;
  - **Drag and Drop row reordering**;

- `w2form` support in `JSON` mode:
  - **Record retrieval**;
  - **Form submission (create/update)**;

- **Dropdowns**:
  - Reusable across `w2grid` and `w2form` components;
  - **Searchable** and **dynamic**;

- **SQL Builder integration**:
  - Translate `w2grid` data request into SQL with `go-sqlbuilder`;

## Example

Run a **full** CRUD demo using in-memory SQLite:

```shell
go run main.go
```

Starts the server on `http://localhost:3000`
