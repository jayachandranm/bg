var mysql      = require('mysql');

module.exports.updateDB = updateDB;

var pool  = mysql.createPool({
    connectionLimit : 10,
     host            : 'localhost',
     user            : 'root',
    password        : 'root123',
    database        : 'obd'
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

    pool.getConnection(function(err, connection) {
        // Use the connection
        connection.query('INSERT INTO location SET ?',
                    {dev_id: '23', timestamp: utime, longitude: LocLong, latitude: LocLat},
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
