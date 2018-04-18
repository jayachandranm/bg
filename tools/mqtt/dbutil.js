var mysql = require('mysql');
//var config = require('./config');
var config = require('./config.json');


//module.exports.updateDB = updateDB;
module.exports.add2dbAlerts = add2dbAlerts;
module.exports.add2dbErrors = add2dbErrors;

var pool = mysql.createPool({
    connectionLimit: 10,
    host: config.mysql.host,
    user: config.mysql.user,
    password: config.mysql.pass,
    database: config.mysql.db
});


function add2dbAlerts(clientID, arrVals) {
    for (i = 0; i < arrVals.length; i++) {
        var testVals = arrVals[i];
        //

        var dt = testVals.date_time;
        var yr = '20' + dt.year;
        // NOTE: Month starts from 0.
        var utime = new Date(yr, dt.month - 1, dt.day, dt.hour, dt.minute, dt.second).getTime();
        //
        var dateNow = new Date();
        var currTimeMillis = Date.now();
        var offset = dateNow.getTimezoneOffset();
        //console.log(offset);
        var adjTime = utime + (8 * 60 * 60 * 1000);
        var datetime_db = new Date(adjTime).toISOString().slice(0, 19).replace('T', ' ');
        console.log("GPS time :", utime, "=>", datetime_db);

        pool.getConnection(function (err, connection) {
            // Use the connection
            connection.query('INSERT INTO alarms SET ?',
                {sid: clientID, timestamp: utime, datetime: datetime_db, longitude: LocLong, latitude: LocLat},
                function (err, result) {
                    connection.release();
                    if (err) throw err;

                    console.log(result.insertId);
                });
        });
    }
}

function add2dbErrors(clientID, arrVals) {}