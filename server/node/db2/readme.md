
# Node/DB2 w2ui example backend driver

## Synopsis

The example uses Users and positions to demonstrate 

Note that a user can only be at one posision, but there might be posisions without locataions

The example is not yet finnished but can serve as a starting point and example.
I have tried to reuse and look at the postgress node implementation found here,
http://w2ui.com/kickstart/

## Installation

Install db2 and create database and tables with help of the scripts in sql

To run the server with example client public/index.html

npm install

node start.js

http://localhost:8080

---------------------------------------------

## Files

* w2db.js,  The db2 server driver. 
* w2ui.js,  More db2 server driver. 
* ksdb.js,  Example how to use mongo as simple backend for the kickstart project.
* start.js, Http & api node server. 
* public/index.html test application

## Example

The application stores users and positions in the tables 
"user" & "position"

It uses an openlayer map to generate data when clicking the map 
and then pressing save. [Open layers](http://openlayers.org/)

In the top part you can generate users and later use them in the
"Users at location" form.


## Test data

When you have entered some data you can test the api with,

http://localhost:8080/api/enum/user

