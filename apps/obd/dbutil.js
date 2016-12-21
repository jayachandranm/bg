var mysql      = require('mysql');
var config = require('./config');

//module.exports.updateDB = updateDB;
module.exports.add2dbGPS = add2dbGPS;
module.exports.add2dbAlarms = add2dbAlarms;

var pool  = mysql.createPool({
    connectionLimit : 10,
    host            : config.mysql.host,
    user            : config.mysql.user,
    password        : config.mysql.pass,
    database        : config.mysql.db
});


function add2dbGPS(obdID, arrGpsVals) {
  //console.log("add2dbGPS:");
  for (i = 0; i < arrGpsVals.length; i++) { 
    var gpsVals = arrGpsVals[i];
    //console.log(gpsVals);
    //
    var LocLong = gpsVals.longitude/3600000;
    var LocLat = gpsVals.latitude/3600000;

    var dt = gpsVals.date_time;
    var yr = '20' + dt.year;
    // NOTE: Month starts from 0.
    var utime = new Date(yr, dt.month-1, dt.day, dt.hour, dt.minute, dt.second).getTime();
    //
    var dateNow = new Date();
    var currTimeMillis = Date.now();
    var offset = dateNow.getTimezoneOffset();
    //console.log(offset);
    var adjTime = utime + (8*60*60*1000);
    var datetime_db = new Date(adjTime).toISOString().slice(0, 19).replace('T', ' ');
    console.log("GPS time :", utime, "=>", datetime_db);

    pool.getConnection(function(err, connection) {
        // Use the connection
        connection.query('INSERT INTO obd_gps SET ?',
                    {sid: obdID, timestamp: utime, datetime: datetime_db, longitude: LocLong, latitude: LocLat},
                    function(err, result) {
            connection.release();
            if (err) throw err;

            console.log(result.insertId);
        });
    });
  }
}


function add2dbAlarms(obdID, arrAlarmVals, gpsVals) {
  //console.log("add2dbGPS:");
    //
    var LocLong = gpsVals.longitude/3600000;
    var LocLat = gpsVals.latitude/3600000;

    var dt = gpsVals.date_time;
    var yr = '20' + dt.year;
    // NOTE: Month starts from 0.
    var utime = new Date(yr, dt.month-1, dt.day, dt.hour, dt.minute, dt.second).getTime();
    //
    var dateNow = new Date();
    var currTimeMillis = Date.now();
    var offset = dateNow.getTimezoneOffset();
    //console.log(offset);
    var adjTime = utime + (8*60*60*1000);
    var datetime_db = new Date(adjTime).toISOString().slice(0, 19).replace('T', ' ');
    //console.log(gpsVals);
    console.log("GPS time :", utime, "=>", datetime_db);
    //
  for (i = 0; i < arrAlarmVals.length; i++) { 
    var alarmVals = arrAlarmVals[i];
    var alarmType = alarmVals.alarm_type;
  
    console.log("Alarm type: ", alarmType);
    if(alarmType == 0x06) {

    pool.getConnection(function(err, connection) {
        // Use the connection
        connection.query('INSERT INTO obd_alarms SET ?',
                    {sid: obdID, timestamp: utime, datetime: datetime_db, longitude: LocLong, latitude: LocLat, alarm_type: alarmType},
                    function(err, result) {
            connection.release();
            if (err) throw err;

            console.log(result.insertId);
        });
    });
    
    }
  }
}

/*
function updateDB(gpsVals) {

    var LocLong = gpsVals.longitude/3600000;
    var LocLat = gpsVals.latitude/3600000;

    var dt = gpsVals.date_time;
    var yr = '20' + dt.year;
    //console.log(yr, dt.month, dt.day, dt.hour, dt.minute, dt.second);
    // NOTE: Month starts from 0.
    var utime = new Date(yr, dt.month-1, dt.day, dt.hour, dt.minute, dt.second).getTime();
    //console.log(utime);
    //console.log(LocLong, LocLat);
   
    var dateNow = new Date();
    var currTimeMillis = Date.now();
    var offset = dateNow.getTimezoneOffset();
    //console.log(offset);
    // Use moment.js instead of manually adding +8hrs for SGT.
    var adjTime = utime + (8*60*60*1000);
    // TODO: add server time to DB table.
    //var adjTime = currTimeMillis + (8*60*60*1000);
    //var datetime_db = new Date(adjTime).toISOString().slice(0, 19).replace('T', ' ');
    var datetime_db = new Date(adjTime).toISOString().slice(0, 19).replace('T', ' ');
    //console.log(adjTime, datetime_db);

    pool.getConnection(function(err, connection) {
        // Use the connection
        connection.query('INSERT INTO bgmap_obd_gps SET ?',
                    {sid: '204', timestamp: utime, datetime: datetime_db, longitude: LocLong, latitude: LocLat},
                    function(err, result) {
            connection.release();
            if (err) throw err;

            //console.log(result.insertId);
        });

/*        connection.query( 'SELECT * from location', function(err, rows) {
            // And done with the connection.
            connection.release();
            if (!err)
                console.log('The solution is: ', rows);
            else
                console.log('Error while performing Query.');

        // Don't use the connection here, it has been returned to the pool.
        });
*    
    });
}
*/
