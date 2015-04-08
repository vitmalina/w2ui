/**
*  Module that helps to work with mongodb DB
*  DEPENDENCIES: mongodb
*  
*      Setting recid to 0  should create a new document unless record._id is given
*     
*       Note that mongo uses _id to uniquely identify documents.
*       This code tries to set the _id to recid unless given from the record._id  
*       
*       The code is not so fast but can get you started quickly
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


// dataitem, contains the document item to extract from the collection
exports.enumDBMongo = function(req, res, collectionName,dataitem)
{
    //console.log("enumDBMongo ", collectionName,dataitem); 
    mc.connect(dbs, function(err, db) {
        
     if (err)
         throw(err);
         db.collection(collectionName, function(err, collection) {

             var array = new Array();
             // ).sort({ recid : 1}
             var cursor = collection.find(function(err, cursor) {
                 var j = 0;
                 cursor.each(function(err, item) {
                    if (item)
                    {
                        var myRes=
                                {
                                  id : item._id,
                                  text: item[dataitem]
                                };
                        array.push(myRes);
                        array[j].recid = j+1;

                        j++;

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
}

getRecords = function(req,res,collectionName)
{
    var searchFor =
            {
                _id: 1
            }

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
    mc.connect(dbs, function(err, db) {
        if (err)
            throw(err);
        var collection = db.collection(collectionName, function(err, collection) {
            var array = new Array();
            collection.find(function(err, cursor) {
                if (err)
                    console.log("Err", err.err);

                cursor.sort(searchFor);

                cursor.each(function(err, item) {
                    if (item) {
                        //console.log(item);
                        item.selected = false;
                        item.recid = Number(item.recid);
                        array.push(item);
                        //array[j].recid = j;
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
                        db.close();
                    }
                });
            });

        });
    });

}


exports.serveDBMongo = function(req, res, collectionName)
{
    //console.log("serveDBMongo body", req.body);
    //console.log("serverCmd", req.body.cmd);

    switch (req.body.cmd)
    {
        // This is not standard w2ui, needed to get a unique recid
        // Only returns a record with the next usable recid
        case 'add-record':
            {
                //console.log("add-record");
                mc.connect(dbs, function(err, db) {
                    if (err)
                        throw(err);
                                        
                    db.collection(collectionName, function(err, collection) {
                        var array = new Array();
                        collection.find().toArray(function(err, docs) {
                                // Find next available id
                                var maxId=0;
                                for (var qix=0;qix<docs.length;qix++)
                                {
                                    if (Number(docs[qix].recid)>maxId)
                                    {
                                       maxId=Number(docs[qix].recid);
                                    }
                                }
                                maxId+=1;
        
                                var doc = {
                                    recid : maxId
                                }
                                var result_data = {
                                    status: "sucess",
                                    record: doc
                                };
                                //console.log(result_data);
                                res.send(result_data);
                                db.close();
                        });
                    });
                });           
            }            
        break;
        case 'get-record':
            {
                //console.log("--- Get record --- with",req.body.recid);
                mc.connect(dbs, function(err, db) {
                    if (err)
                        throw(err);
                    
                    
                    db.collection(collectionName, function(err, collection) {

                        var array = new Array();
                        var cursor = collection.find(function(err, cursor) {
                            cursor.each(function(err, item) {
                                //console.log("++",item);
                                if (item)
                                {
                                    if (item.recid==req.body.recid)
                                    {
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
                                    db.close();
                                }
                            });
                        });
                    });
                });           
           }
        
          break;
        case 'get-records':
            {
                getRecords(req,res,collectionName);
            }
            break;
            
        case  'save-records':
            console.log("save-records");
            {
                //console.log("c",req.body.changes);

                if (req.body.changes)
                {

                    var changes = req.body.changes;
                    var myRecId = req.body.changes[0].recid;
                    var myId = req.body.changes[0].id;
                    var myData = req.body.changes[0];


                    mc.connect(dbs, function(err, db) {
                        db.collection(collectionName, function(err, collection) {
                            // Use count as the key if we dont have recid
                            collection.find().toArray(function(err, docs) {
                                if (err)
                                {
                                    var err_response = {
                                        status: "error",
                                        message: err.err
                                    };
                                    res.send(err_response);
                                    //throw(err);                                        
                                }
                                else
                                {
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
                                for (var ix = 0; ix < changes.length; ix++)
                                {                                    
                                    // Find _id for our recid
                                    var docId;
                                    for (var z = 0; z < docs.length; z++)
                                    {
                                        if (Number(docs[z].recid)==Number(changes[ix].recid))
                                        {
                                            docId=docs[z]._id;
                                        }
                                    }

                                    myRecId = changes[ix].recid;
                                    myData = changes[ix];

                                    if (changes[ix]._id)
                                    {
                                        myId = changes[ix]._id
                                    }
                                    else
                                    {
                                        myId = maxId;
                                    }

                                    // Similar function to $extend
                                    function clone(a) {
                                        return JSON.parse(JSON.stringify(a));
                                    }
                                    var doc = clone(myData);
                                    doc._id = myId.toString();
                                    doc.recid = Number(myRecId);
                                    myData.recid=Number(myData.recid);

                                    // Document already exists
                                    if (docId)
                                    {
                                        collection.update(
                                          {_id: docId},
                                          { $set: myData},
                                          {w: 0},function(err,doc) {                                           
                                            if (err) {
                                                var err_response = {
                                                    status: "error",
                                                    message: err.err
                                                };
                                                //res.send(err_response);
                                                //console.log(err_response);
                                            }
                                            else
                                            {
                                                var save_response = {
                                                    status    : "success",
                                                };

                                                res.send(save_response);

                                            }
                                          });
                                    }
                                    else 
                                    {
                                        // No such recid was found create new document
                                        collection.save(doc, {w: 1}, function(err, docs) {
                                            if (err) {
                                                var err_response = {
                                                    status: "error",
                                                    message: err.err
                                                };
                                                //res.send(err_response);
                                                //console.log(err_response);
                                            }
                                            else
                                            {
                                                var save_response = {
                                                    status    : "success",
                                                };

                                                res.send(save_response);

                                            }
                                        });
                                    }
                                }
                            });
                        });
                    });
                }
            }
           break;
            
        case 'save-record':
            {
                //console.log("save-record");
                mc.connect(dbs, function(err, db) {
                    if (err)
                        throw(err);                                        
                    db.collection(collectionName, function(err, collection) {
                    collection.find().toArray(function(err, docs) {

                        var myRecId=req.body.recid;
                        //console.log("save",myRecId);

                        // Get next free recid
                        var maxId=0;
                        for (var qix=0;qix<docs.length;qix++)
                        {
                            if (Number(docs[qix].recid)>maxId)
                            {
                               maxId=Number(docs[qix].recid);
                            }
                        }
                        maxId+=1;
                        
                        // We use the _id received as our _id if it exists. :-P 
                        var myId=req.body.record["_id"];
                        //console.log("got _id",myId);
                        // Prevent using "3" and 3 as same _id
                        if (Number(req.body.record["_id"])==myId)
                        {
                            myId=Number(req.body.record["_id"]);
                        }
                        if (!myId){
                            // Set the id to next free recid
                            myId=maxId;
                        }
                        
                        // Check if we need a new recid 
                        if (myRecId==0)
                        {
                            myRecId=maxId;
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
                        doc._id=myId;
                        doc.recid=Number(myRecId);
                        //console.log("saving id,recid",myId,myRecId);

 
                        collection.save(doc, { w: 1} , function(err, docs) {
                            if (err) {
                                var err_response = {
                                    status: "error",
                                    message: err.err
                                };
                                res.send(err_response);
                                //console.log(err_response);
                            }
                            else
                            {
                                var save_response = {
                                    status    : "success",
                                };

                                //console.log("Saved",doc);
                                res.send(save_response);
                                db.close();
                            }
                        });
                    });
                });
            });

            }

            break;
        case 'delete-records':
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
}

