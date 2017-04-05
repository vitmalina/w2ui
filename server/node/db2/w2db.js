/**
*  Module that helps to work with Postgres DB
*  DEPENDENCIES: pg or mysql
*/

var dbLink  = null;

var ibmdb = require('ibm_db');


// public
module.exports = {
    type    : 'db2',
    connect : connect,
    exec    : exec
};
return;

/*
*  Implementation
*/

function connect () {
    // postgres
    if (conf.type == 'postgres') {
        // reads connect information from conf.js file
        var postgres = require('pg');
        module.exports.type = 'postgres';
        dbLink = new postgres.Client('postgres://'+ conf.user + ':' + conf.pass + '@' + conf.host + ':' + conf.port + '/' + conf.db);
        dbLink.connect(function (error) {
            // log connection error 
            if (error) { 
                var msg = 'Postgres: cannot connect to the database (HOST:'+ conf.host + ', USER:' + conf.user + ', DB:' + conf.db + ')' + ' -- ' + error;
                if (logger) logger.error(msg); else console.log(msg);
            }
        });
        return 'postgres';
    }
    // MySQL
    if (conf.type == 'mysql') {
        var msg = 'Mysql is not currently supported.';
        if (logger) logger.error(msg); else console.log(msg);
        return 'mysql';
    }
}

/*
    // db2 Non sync version
    if (module.exports.type == 'db2') {
        var cn = "DRIVER={DB2};DATABASE=W2UI;UID=user;PWD=password;HOSTNAME=olas-dev;port=50000";

        ibmdb.open(cn, function (err, conn) {
            conn.query(sql, function (err, data) {
                if (err) {
                    //could not prepare for some reason 
                    var msg = 'DB2: SQL Error' + ' -- ' + err + '\n' + sql;
                    if (logger) logger.error(msg); else console.log(msg);
                    callBack(err, msg);
                    return;
                } else {
                    console.log("Result",data);
                }
                // process records
                var len=data.size;


                callBack(null, {
                    count: len,
                    records: data,
                    fields: Object.keys(data),
                    _result: data
                });

                // Create params object 
                conn.close(function () {
                    console.log('done');
                });
            });
        });
    }

*/

function exec (sql, callBack) {
    // DB2
    if (module.exports.type == 'db2') {
        var cn = "DRIVER={DB2};DATABASE=W2UI;UID=user;PWD=password;HOSTNAME=olas-dev;port=50000";

        ibmdb.open(cn, function (err, conn) {
            var stmt=conn.prepareSync(sql);

            stmt.execute([], function (err, result) {
                if (err) {
                    //could not execute for some reason 
                    var msg = 'DB2: SQL Error' + ' -- ' + err + '\n' + sql;
                    if (logger) logger.error(msg); else console.log(msg);
                    callBack(err, msg);
                    return;
                } else {
                    console.log("Result",result);
                }
                if (result) {
                    data=result.fetchAllSync();
                    // process records
                    var len=data.size;

                    callBack(null, {
                        count: len,
                        records: data,
                        fields: Object.keys(data),
                        _result: data
                    });

                    result.closeSync();
                }
                stmt.closeSync();
                // Create params object 
                conn.close(function (err) {
                    console.log('close done',err);
                });
            });
        });
    }

    // Postgres
    if (module.exports.type == 'postgres') {
        dbLink.query(sql, function (err, result) {
            if (err) {
                var msg = 'Postgres: SQL Error' + ' -- ' + err + '\n' + sql;
                if (logger) logger.error(msg); else console.log(msg);
                callBack(err, msg);
                return;
            }
            // process records
            callBack(null, {
                count    : result.rowCount,
                records  : result.rows,
                fields   : result.fields,
                _result  : result
            });
        });
    }
}