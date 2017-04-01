
var express     = require('express'); 
var bodyParser  = require('body-parser');
//var compress    = require('compression');
var conf        = require('./conf.js');
var winston     = require('winston');
var server      = express();

var ibmdb = require('ibm_db');

// globals
global._        = require('underscore');
global.w2ui     = require('./w2ui.js');
global.w2db     = require('./w2db.js');


//var dbLink = null;
// postgres
//w2db.connect(_.extend({}, conf.postgres, { type: 'postgres' }));

// general
server.use(bodyParser({ extended: true }));
server.use('/favicon.ico', function (req, res, next) { 
    res.end(); 
});

// add headers
server.use(function (req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    next();
});


// create log folder
var fs = require('fs');
if (!fs.existsSync('log')) fs.mkdirSync('log');

// logger: access
var loggerAccess = new (winston.Logger) ({
    transports: [
        new (winston.transports.Console)({ 
            colorize: true 
        }),
        //new (winston.transports.DailyRotateFile)({ 
        //    maxsize     : 100 * 1024 * 1024, // 100MB
        //    filename    : './log/access',
        //    datePattern : '.dd-MM-yyyy.log',
        //    json        : false 
        //})
    ]
});

server.use(function (req, res, next) {
    loggerAccess.info(req.ip + ' - ' + req.url + ', sesid:' +  ', agent:"' + req.headers['user-agent'] + '"');
    next();
});

// logger: errors
global.logger = new (winston.Logger) ({
    transports: [
        new (winston.transports.Console)({
            colorize: true
        })
        //new (winston.transports.DailyRotateFile)({ 
        //    maxsize     : 100 * 1024 * 1024, // 100MB
        //    filename    : './log/log',
        //    datePattern : '.dd-MM-yyyy.log',
        //    json        : false 
        //})
    ]
});

// public folder express.static(__dirname.substr(0, __dirname.length - 4) + 
//server.use('/','./web');

server.use('/',express.static(__dirname + '/web'));

logger.info('================= Server Started ==================');

//------ Routing of api ---------

server.post("/api/user/",function(req,res,next){   
	w2ui.serveDB2(req,res,"USER");
});

// Delete field users until code handles this
server.post("/api/position/",function(req,res,next){

   // Remove field users TODO! Handle this relationship 
   var evaluated;
   console.log(req.body);

   // Remove field users TODO! Handle this relationship 
   if (req.body.request) {
        evaluated=JSON.parse(req.body.request);
        if (evaluated.cmd == "save") {
            console.log("SAVE POSITION WITH USERS",evaluated);
            if (evaluated.record) {
                var test=evaluated.record
                delete test.users;
                console.log("DONE",test);
            }
        }
   } else {
       evaluated=req.body;
   }
   var tmp= {
       body : evaluated
   }

   w2ui.serveDB2(tmp,res,"POSITION");
});

server.get("/api/enum/user",function(req,res,next){   
	w2ui.enumDB2(req,res,"USER","NAME");
});


// START THE SERVER
server.listen(conf.port);
logger.info('LISTENING on port ' + conf.port);
