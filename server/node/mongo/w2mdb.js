/**
*  Module that helps to work with mongodb DB
*  DEPENDENCIES: mongodb
*
*    Setting recid to 0  should create a new document unless record._id is given
*
*     Note that mongo uses _id to uniquely identify documents.
*     This code tries to set the _id to recid unless given from the record._id
*
*     The code is not so fast but can get you started quickly
*
*
*  To get a new correct recid you can use add-record to get a new recid for the next record
*   i.e. for a grid
*
*   Example of how to add a new record in a grid for later save.
   onAdd: function (event) {

        var ajaxOptions = {
            type     : 'POST',
            url      : '/api/whatever',
            data     : {
                  cmd: "add-record"
            },
            dataType : 'text'
         };

         $.ajax(ajaxOptions)
               .done(function (data, status, xhr) {
                  var resulData =  jQuery.parseJSON(data);
                  this.add(resulData.record);
               })
               .fail(function(jqXHR, textStatus, errorThrown) {
                    // Handle error
        });

  }
*
*
*  TODO: Needs more error texts on errors from database.
*  Smarter generation of the recid. Could use a counter collection,
*  i.e. like this, http://docs.mongodb.org/manual/tutorial/create-an-auto-incrementing-field/
*/

/*
 In kickstart call the driver like this,
'/api/whatever': function (req, res, next) {
      w2mdb.serveDBMongo(req,res,"whatever-collection");

   },
'/api/whatever/enum': function (req, res, next) {
      w2mdb.enumDBMongo(req,res,"whatever-collection","property-to-enum");

   },

*/

var dbs = "mongodb://localhost:27017/w2uidb";

var mc = require('mongodb').MongoClient;
var ObjectID = require('mongodb').ObjectID;
var BSON = require('mongodb').BSONPure;
var mongodb = require('mongodb');
var events = require('events');


var event = new events.EventEmitter();
event.setMaxListeners(20);


var mydb;
// Leave the connection open and reuse it.
new mc.connect(dbs, function(err, db) {
  if (!err) {
    db.on('close', function() {
         console.log('database CLOSED!, how to reopen???');
    });
    mydb = db;
    console.log('database connected!');
    event.emit('connect');
  } else {
    console.log('database connection error', err);
    event.emit('error');
  }
});

// Get the common connection
getDB = function(fn) {
  if(mydb) {
    fn(mydb);
  } else {
    event.on('connect', function() {
      fn(mydb);
    });
  }
};


exports.initCounters=function(collname) {
 // Counters collection.
    getDB( function(db) {

        var counter = db.collection('counter');

        // Document to be inserted.
        var document =  {
            _id : collname,
            seq: 0
        };

        counter.find({_id : collname}).count(function(err, count) {
            if(err) throw err;

            if (count === 0) {
                console.log("Creating counter...",collname);
                counter.save(document, {w: 1}, function(err, docs) {
                    if(err) throw err;
                });
            }
        });
    });
};

// gets the next sequence number from the counters collection. Also increases the counter
function getNextSequence(name,cb) {
    getDB(function(db) {
        //console.log("getNextSequence",name);
        db.collection('counter', function(err, collection) {
            var ret = collection.findAndModify(
                     { _id: name },
                     [['_id','asc']],
                     { $inc: { seq: 1 } },
                     {new: true, upsert: true}
                     ,function (err, result) {
                       if (err)
                       {
                          console.log("errror",err);
                       }
                        //console.log("res===",result);
                        var toRet=result.seq;
                        // TODO, different results depending on mongodb version???
                        if (toRet)
                        {
                           cb(toRet);
                        }
                        else
                        {
                           toRet=result.value.seq;
                           cb(toRet);
                        }

                    });
        });
    });
}


// dataitem, contains the document item to extract from the collection
exports.enumDBMongo = function(req, res, collectionName,dataitem)
{
    //console.log("enumDBMongo ", collectionName,dataitem);
    getDB(function(db) {

         db.collection(collectionName, function(err, collection) {

             var array = new Array();
             var cursor = collection.find(function(err, cursor) {
                 var j = 0;
                 cursor.each(function(err, item) {
                    if (item)
                    {
                        //if (item.inactive != '1')
                        {
                            var myRes=
                                    {
                                      id : item._id,
                                      text: item[dataitem],
                                      recid: item.recid
                                    };
                               array.push(myRes);

                            j++;
                        }
                     }
                     else
                     {
                         var resultData=
                         {
                            status : "success",
                            items :  array
                         };

                         //console.log(resultData);
                         res.send(resultData);

                     }
                 });
             });
         });
      });
};

getRecords = function(req,res,collectionName)
{
    var searchFor =
            {
                _id: 1
            };

    if (req.body.sort)
    {
        //console.log(req.body.sort);
        field_name = req.body.sort[0].field;
        if (req.body.sort[0].direction === "desc")
        {
            direction = -1;
        }
        else
        {
            direction = 1;
        }

        var tmp = new Object;
        ;
        tmp[req.body.sort[0].field] = direction;

        searchFor = tmp;
    }
    //console.log("Getting records");
    getDB(function(db) {
        var collection = db.collection(collectionName, function(err, collection) {
            var array = new Array();
            collection.find(function(err, cursor) {
                if (err)
                    console.log("getRecords err", err.errmsg);

                cursor.sort(searchFor);

                cursor.each(function(err, item) {
                    if (item) {
                        //console.log(item);
                        item.selected = false;
                        item.recid = Number(item.recid);
                        array.push(item);
                    }
                    else
                    {
                        var result_data = {
                            status: "sucess",
                            total: array.length,
                            records: array
                        };

                        //console.log(result_data);
                        res.send(result_data);
                    }
                });
            });
        });
    });
};

function isValidObjectID(str) {
  // coerce to string so the function can be generically used to test both strings and native objectIds created by the driver
  str = str + '';
  var len = str.length, valid = false;
  if (len == 12 || len == 24) {
    valid = /^[0-9a-fA-F]+$/.test(str);
  }
  return valid;
}


customConvert = function(myId)
{
        if (myId) {

            if (isValidObjectID(myId))
            {
                myId=ObjectID(myId);
            }
            else if (typeof myId === 'string') {
                // No numbered strings allowed
                if (parseFloat(myId).toString() === myId) {
                    myId=Number(myId);
                }
            }
            else if (typeof myId === 'number') {
                // Store id as a number
            }
        }
   return (myId);
};

saveRecord = function(req,res,collectionName,autoIncVarName,newRecId)
{

    // We try to use these to identify our object
    // req.body.recid;
    // req.body.record["_id"];


        mc.connect(dbs, function(err, db) {
            if (err)
                throw(err);

              if (autoIncVarName)
              {
		  //console.log("Autoinc",collectionName,autoIncVarName);
                req.body.record[autoIncVarName]=newRecId;
                req.body.record.recid=newRecId;
                if (autoIncVarName!="recid")
                {
                  req.body.record["_id"]=newRecId;
                }
              }


            db.collection(collectionName, function(err, collection) {
            collection.find().toArray(function(err, docs) {


                var myRecId=req.body.recid;
                // We use the _id received as our _id if it exists. :-P
                var myId=req.body.record["_id"];
                //console.log("got _id",myId);

                // Prevent using "3" and 3 as same _id
                myId=customConvert(myId);

                // Check if we need a new recid
                if (Number(myRecId)==0)
                {
                    myRecId=newRecId;
                }
                else
                {
                    // Find the document with the same recid
                    for (var qix = 0; qix < docs.length; qix++)
                    {
                        if (docs[qix].recid==myRecId)
                        {
                            myId=docs[qix]._id;
                        }
                    }
                }
                // Same as $extend
                function clone(a) {
                    return JSON.parse(JSON.stringify(a));
                }

                var doc = clone(req.body.record);
                // Use generated id unless we found one. :-P
                if (myId) {
                   doc._id=myId;
                }
                doc.recid=Number(myRecId);
                //console.log("saving id,recid",myId,myRecId);

                collection.save(doc, { w: 1} , function(err, docs) {
                    if (err) {
                        var err_response = {
                            status: "error",
                            message: err.errmsg
                        };
                        res.send(err_response);
                        //console.log(err_response);
                    }
                    else
                    {
                        var save_response = {
                            status    : "success"
                        };

                        //console.log("Saved",doc);
                        res.send(save_response);
                        db.close();
                    }
                });
            });
        });
    });
};

getRecord = function(req,res,collectionName)
{
    getDB(function(db) {
        db.collection(collectionName, function(err, collection) {

            var array = new Array();
            var cursor = collection.find(function(err, cursor) {
                cursor.each(function(err, item) {
                    //console.log("++",item);
                    if (item)
                    {
                        if (item.recid==req.body.recid)
                        {
                            item._id=item._id.toString();
                            array.push(item);
                        }
                    }
                    else
                    {

                        var result_data = {
                            status: "sucess",
                            record: array[0]
                        };

                        //res.send(job);
                        //console.log("result",result_data);

                        res.send(result_data);
                    }
                });
            });
        });
    });
};

saveRecords = function(req,res,collectionName){
    if (req.body.changes)
    {

        var changes = req.body.changes;
        var myRecId = req.body.changes[0].recid;
        var myId = req.body.changes[0].id;
        var myData = req.body.changes[0];

        var updateEvent = new events.EventEmitter();

        // Only send the result when finished updating
        var numUpdates = 0;
        updateEvent.on('update', function() {
            numUpdates++;
            //console.log("upd2",numUpdates);
            if (numUpdates == changes.length)
            {
                var save_response = {
                    status: "success"
                };

                res.send(save_response);

                updateEvent = undefined
            }
        });

    getDB(function(db) {
         db.collection(collectionName, function(err, collection) {
                collection.find().toArray(function(err, docs) {
                    if (err)
                    {
                        var err_response = {
                            status: "error",
                            message: err.errmsg
                        };
                        res.send(err_response);
                        throw(err);
                    }

                    var maxId = 0;
                    for (var qix = 0; qix < docs.length; qix++)
                    {
                        if (Number(docs[qix]._id) > maxId)
                        {
                            maxId = Number(docs[qix]._id);
                        }
                    }
                    maxId += 1;

                    // We use the id as our id if it exists. :-P
                    for (var ix = 0; ix < changes.length; ix++) {
                        // Find _id for our recid
                        var docId;
                        for (var z = 0; z < docs.length; z++)
                        {
                            if (Number(docs[z].recid) == Number(changes[ix].recid))
                            {
                                docId = docs[z]._id;
                            }
                        }

                        myRecId = changes[ix].recid;
                        myData = changes[ix];

                        if (changes[ix]._id)
                        {
                            myId=customConvert(myId);
                        }
                        else
                        {
                            //console.log("No id was available in change");
                            if (docId) {
                                // Document with correct id was found
                                myId=docId;
                            }
                            else
                            {
                              // Use generated id
                            }
                        }

                        // Similar function to $extend
                        function clone(a) {
                            return JSON.parse(JSON.stringify(a));
                        }
                        var doc = clone(myData);
                        doc._id = myId;
                        doc.recid = Number(myRecId);
                        myData.recid = Number(myData.recid);

                        // Document already exists
                        if (docId)
                        {
                            collection.update(
                            {_id: docId},
                            {$set: myData},
                            {w: 0}, function(err, doc) {
                                updateEvent.emit('update');

                                if (err) {
                                    var err_response = {
                                        status: "error",
                                        message: err.errmsg
                                    };
                                    //res.send(err_response);
                                    //console.log(err_response);
                                }
                                else
                                {

                                }
                            });
                        }
                        else
                        {
                            // No such recid was found create new document
                            collection.save(doc, {w: 1}, function(err, docs) {
                                updateEvent.emit('update');


                                if (err) {
                                    var err_response = {
                                        status: "error",
                                        message: err.errmsg
                                    };
                                    //res.send(err_response);
                                    //console.log(err_response);
                                }
                                else
                                {
                                }
                            });
                        }
                    }
                });
            });
        });
    }
    else
    {
        var save_response = {
            status: "success"
        };

        res.send(save_response);

    }
};


exports.serveDBMongo = function(req, res, collectionName,autoIncVarName)
{
    console.log("serveDBMongo body", req.body);
    console.log("serverCmd", req.body.cmd);

    switch (req.body.cmd)
    {
        // This is not standard w2ui, needed to get a unique recid
        // Only returns a record with the next usable recid
        case 'add-record':
            {
                //console.log("add-record");
                getNextSequence(collectionName,function(newNum) {
                    var doc = {
                        recid : newNum
                    };
                    var result_data = {
                        status: "sucess",
                        record: doc
                    };
                    //console.log(result_data);
                    res.send(result_data);
                });
           }
        break;
        case 'get-record':
            {
                //console.log("--- Get record --- with",req.body.recid);
                getRecord(req,res,collectionName);
           }

          break;
        case 'get':
            {
                getRecords(req,res,collectionName);
            }
            break;

        case  'save-records':
            //console.log("save-records");
            {
                //console.log("c",req.body.changes);
                saveRecords(req,res,collectionName);
            }
           break;

        case 'save':
            {
                //console.log("save-record");

                var recid=req.body.recid;

                // We have a rec id, try to use it!
                if (req.body && req.body.recid && req.body.recid!=0)
                {
                    saveRecord(req,res,collectionName);
                }
                else
                {
                    // No rec id, maybe an _id???
                    if (req.body && req.body.record && req.body.record._id)
                    {
                        // We have _id but not recid...
                        if (req.body.recid==0) {
                            getNextSequence(collectionName,function(newNum) {
                               saveRecord(req,res,collectionName,"recid",newNum);
                            });
                        }
                        else
                        {
                           // We have _id and recid
                           saveRecord(req,res,collectionName);
                        }

                    }
                    else
                    {
                        if(autoIncVarName)
                        {
                            // Check if it already has this in records else create new
                            getNextSequence(collectionName,function(newNum) {
                               saveRecord(req,res,collectionName,autoIncVarName,newNum);
                            });
                        }
                        else
                        {
                            getNextSequence(collectionName,function(newNum) {
                               saveRecord(req,res,collectionName,"recid",newNum);
                            });
                        }
                    }
                }
            }

            break;
        case 'delete':
            var delsel = req.body.selected;
            //console.log("delete-records=", Number(delsel[0]));
            // Note Only first selected record is deleted
            mc.connect(dbs, function(err, db) {
                if (err)
                    throw(err);

                db.collection(collectionName, function(err, collection) {
                    var toRem = Number(delsel[0]);

                    collection.remove({
                        recid: toRem
                    }, function(err, removed) {
                        //console.log("removed=",removed);
                        // Rearrange the recid numbering, should not be necessary
                        //orderData(collectionName);

                        var ok_response = {
                            status: "sucess"
                        };

                        res.send(ok_response);
                        db.close();
                    });
                });
            });


            //console.log(delsel);
            break;
        default:
            {
                  console.log("Unknown cmd",req.body.cmd)
                  var err_response = {
                                        status: "error",
                                        message: "Command not recognized"
                                     };
                res.send(err_response);
            }
            break;
    }

};


// Reorder all documents  in the collection with increasing recid:s
// Not currently used
orderData = function(collectionName)
{
    //console.log("order recid");
    mc.connect(dbs, function(err, db) {

        if (err)
            throw(err);

        db.collection(collectionName, function(err, collection) {
            var array = new Array();
            collection.find(function(err, cursor) {
                var j = 0;
                cursor.each(function(err, item) {
                    if (item)
                    {
                        //console.log("j", j, item);
                        item.selected = false;
                        array.push(item);
                        array[j].recid = j + 1;

                        j++;

                        collection.update(
                                {_id: item._id},
                                {$set: {recid: j}},
                                {w: 0}
                        );

                        // Remove the selected attribute
                        collection.update(
                                {_id: item._id},
                                {$set: {selected: false}},
                                {w: 0}
                        );
                    }
                });
            });
        });
    });
};

