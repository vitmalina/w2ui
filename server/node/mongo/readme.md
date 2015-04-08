To run the server with example client public/index.htlm

npm install

node server.js

http://localhost:3000

---------------------------------------------

The mongo server driver is w2mdb.js
The test application is public/index.html 

The application stores users and positions in the collections 
"users" & "positions"

It uses an openlayer map to generate data when clicking the map 
and then pressing save.

In the top part you can generate users and later use them in the
"Users at location" form.

When you have entered some data you can test the api with,

http://localhost:3000/api/position/enum

http://localhost:3000/api/user/enum

