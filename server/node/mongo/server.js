/*
 *  Node/Mongo server
 *
 *
 */


var express = require('express');
var bodyParser = require('body-parser');

var w2mdb = require('./w2mdb.js');

// Logging
var morgan = require('morgan');


var app = express();

app.use(bodyParser.json());

app.use(bodyParser.urlencoded({
	    extended: true
	}));

// Log all requests
app.use(morgan("dev"));


app.use('/',express.static(__dirname + '/public'));
//app.use('/dist',express.static(__dirname + '../../../dist'));
//app.use('/libs',express.static(__dirname + '../../../libs'));

// Prevent, 304 (Not changed) for api
app.disable('etag');
// Database
var db = require('./w2mdb.js');


//------ Setup position with help of ksdb.js

var ksdb = require('./ksdb.js');

ksdb.setupKickstartCollection(app,"position");

// ----- Setup counter for user collection


w2mdb.initCounters("user");


//------ Routing of api ---------



app.post("/api/user/",function(req,res,next){   
	w2mdb.serveDBMongo(req,res,"user");
    });

app.get("/api/enum/user",function(req,res,next){   
	w2mdb.enumDBMongo(req,res,"user","name");
    });

app.post("/api/enum/user",function(req,res,next){   
	w2mdb.enumDBMongo(req,res,"user","name");
    });


app.listen(3000);
