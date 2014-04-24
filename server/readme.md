## Server side libraries

The w2ui library does not inherently depend on any server side language. However, it might be useful to provide some examples in
different languages. The goal of these examples is to implement such features as

- search fields parsing
- sort fields parsing
- retrieve/delete records for w2grid
- edit/save record for w2form

### Structure

There should be only one file named `users.[java|cs|js|php|rb]` that should implement a basic example. The following is an example of a table structure
that should be in **test** db at **localhost** of mysql database with **root** user and no password:

```sql
CREATE TABLE users(
     userid int PRIMARY KEY AUTO_INCREMENT, 
     fname varchar(50), 
     lname varchar(50), 
     email varchar(75), 
     login varchar(32) NOT NULL, 
     password varchar(32) NOT NULL
)
```

### Road Map

Contributions are welcome. 

- JAVA    : java/index.html 
- NET    : net/index.asp
- NODE    : net/index.html
- PHP    : php/index.php     - **ready**
- RUBY    : php/index.html
