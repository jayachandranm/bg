var mysql = require('mysql');
//var config = require('./config');
var dyndb_util = require('./dyndb_util');

var config = {};
config.mysql = {};

config.mysql.db = 'bgtrans_obd';
config.mysql.host = 'localhost';
config.mysql.user = 'ubgtrans';
config.mysql.pass = 'drinkNdrive$4god';

var pool = mysql.createPool({
    connectionLimit: 10,
    host: config.mysql.host,
    user: config.mysql.user,
    password: config.mysql.pass,
    database: config.mysql.db
});


pool.getConnection(function (err, connection) {
    // Use the connection
    if (err) {
        console.log("Error in connection database");
        return;
    }
    console.log("Connection success.");
    connection.query("select * from obd_gps limit 100", function (err, rows) {
        connection.release();
        if (!err) {
            //console.log(rows[0].timestamp);
            for (var i=0; i< rows.length; i++) {
                //console.log(rows[0]);
                row = rows[i];
                sid = row.sid;
                ts = Number(row.timestamp);
                lng = Number(row.longitude);
                lat = Number(row.latitude);
                console.log(sid, ts, lng, lat);
                var gpsJson = {};
                gpsJson["longitude"] = lng;
                gpsJson["latitude"] = lat;
                gpsJson["speed"] = 0;
                gpsJson["direction"] = 0;
                dyndb_util.import2db(sid, ts, gpsJson);
            }
        }
    });
});

