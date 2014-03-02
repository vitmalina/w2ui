## PHP Example

This is a sample PHP example that connects to MySQL database and retrieves users. It has a grid an a form in a popup. In order for it to work you
will need to create a MySQL database test and create one table

```sql
CREATE TABLE `users` (
  `userid` int(11) NOT NULL AUTO_INCREMENT,
  `fname` varchar(50) DEFAULT NULL,
  `lname` varchar(50) DEFAULT NULL,
  `email` varchar(75) DEFAULT NULL,
  `login` varchar(32) NOT NULL,
  `password` varchar(32) NOT NULL,
  PRIMARY KEY (`userid`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=latin1;
```

The database connection information is in users.php file.

### JSON Structures

I have generated sample JSON structures that are returned from the server. You can replace URL property of the grid to "users.json" and the form
to "user-edit.json" to run this example without a database.

#### grid

```json
{
  "status": "success",
  "total": "4",
  "records": [
    {
      "recid": "1",
      "userid": "1",
      "fname": "John",
      "lname": "Doe",
      "email": "jdoe@mail.com",
      "login": "jdoe",
      "password": "12345"
    },
    {
      "recid": "4",
      "userid": "4",
      "fname": "Vitali",
      "lname": "Malinouski",
      "email": "vitmalina@gmail.com",
      "login": "1",
      "password": "1"
    },
    {
      "recid": "8",
      "userid": "8",
      "fname": "John ",
      "lname": "Cook",
      "email": null,
      "login": "1",
      "password": "21"
    },
    {
      "recid": "9",
      "userid": "9",
      "fname": "Peter",
      "lname": "Norton",
      "email": null,
      "login": "fjf",
      "password": "kd"
    }
  ]
}
```

#### form

```json
{
  "status": "success",
  "record": {
    "userid": "8",
    "fname": "John 2",
    "lname": "Cook",
    "email": null,
    "login": "1",
    "password": "21"
  }
}
```