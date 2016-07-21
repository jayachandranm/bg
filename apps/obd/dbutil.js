var mysql      = require('mysql');

module.exports.updateDB = updateDB;

var pool  = mysql.createPool({
    connectionLimit : 10,
     host            : 'localhost',
    database        : 'bgmap'
});

function updateDB(gpsVals) {

    var LocLong = gpsVals.longitude/3600000;
    var LocLat = gpsVals.latitude/3600000;

    var dt = gpsVals.date_time;
    var yr = '20' + dt.year;
    //console.log(yr, dt.month, dt.day, dt.hour, dt.minute, dt.second);
    var utime = new Date(yr, dt.month, dt.day, dt.hour, dt.minute, dt.second).getTime();
    //console.log(utime);
    //console.log(LocLong, LocLat);
   
    var dateNow = new Date();
    var currTimeMillis = Date.now();
    var offset = dateNow.getTimezoneOffset();
    var adjTime = currTimeMillis + offset*60*1000 + 8*60*60*1000;
    //var datetime_db = new Date(adjTime).toISOString().slice(0, 19).replace('T', ' ');
    var datetime_db = new Date(utime).toISOString().slice(0, 19).replace('T', ' ');

    pool.getConnection(function(err, connection) {
        // Use the connection
        connection.query('INSERT INTO bgmap_obd_gps SET ?',
                    {sid: '204', timestamp: utime, datetime: datetime_db, longitude: LocLong, latitude: LocLat},
                    function(err, result) {
            connection.release();
            if (err) throw err;

            console.log(result.insertId);
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
*/    });
}
