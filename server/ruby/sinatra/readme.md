## Ruby Example

This is a sample ruby examples that connects to MySQL database and retrieves users.

It has a grid an a form in a popup.
In order for it to work you will need to create a MySQL database test and create one table

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

The database connection information is in config/database.yml files.

## Prerequisites

* ruby2.x
* mysql
* bundler

## HOW TO RUN

$ bundle install

$ bundle exec rake db:create db:migrate

$ bundle exec rackup

http://localhost:9292/

## Insert dummy data

$ bundle exec rake db:drop db:create db:migrate db:seed

### Recreate databases

$ bundle exec rake db:drop db:create db:migrate
