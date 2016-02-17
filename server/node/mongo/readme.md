
# Node/Mongo w2ui generic backend driver

## Synopsis


## Installation

To run the server with example client public/index.html

npm install

node server.js

http://localhost:3000

---------------------------------------------

## Files

* w2mdb.js, The mongo server driver. 
* ksdb.js,  Example how to use mongo as simple backend for the kickstart project.
* server.js, Http & api server. 
* public/index.html test application

## Example

The application stores users and positions in the collections 
"users" & "positions"

It uses an openlayer map to generate data when clicking the map 
and then pressing save. [Open layers](http://openlayers.org/)

In the top part you can generate users and later use them in the
"Users at location" form.


## Test data

When you have entered some data you can test the api with,

http://localhost:3000/api/enum/position

http://localhost:3000/api/enum/user

