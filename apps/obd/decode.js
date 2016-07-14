//ar Parser = require('../lib/binary_parser').Parser;
var Parser = require('binary-parser').Parser;


var dateTime = new Parser()
    .uint8('day')
    .uint8('month')
    .uint8('year')
    .uint8('hour')
    .uint8('minute')
    .uint8('second');

var statData = new Parser()
    //Parser.start()
    // Unix time
    .uint32('acc_on_time')
    // Unix time
    .uint32('utc_time')
    .uint32('mileage_total')
    .uint32('mileage_current')
    .uint32('fuel_total')
    .uint16('fuel_current')
    .uint32('veh_state')
    .string('reserved', {
        encoding: 'hex',
        length: 8
    });

var gpsData = new Parser()
    //Parser.start()
    .uint8('gps_available')
    .nest('date_time', {
        // 3 byes for date, 3 bytes for time.
        type: dateTime
    })
    .uint32le('latitude')
    .uint32le('longitude')
    .uint16le('speed')
    .uint16le('direction')
    .nest('flags', {
        type: new Parser()
        .bit1('east_long')
        .bit1('north_lat')
        .bit2('test')
        .bit4('num_satellites')
    });


var LoginPackage = new Parser()
    //Parser.start()
    .nest('stat_data', {
        // 34 bytes
        type: statData
    })
    .nest('gps_data', {
        // 20 bytes
        type: gpsData
    })
    .string('sw_version', {
        encoding: 'utf8',
        length: 20
    })
    .string('hw_version', {
        encoding: 'utf8',
        length: 20
    });

var LoginReply = new Parser();
var DataFlow = new Parser();

var Message = new Parser()
    //Parser.start()
    .endianess('little')
    .uint16('header')
    .uint16('length')
    .uint8('version')
    .string('dev_id', {
        encoding: 'hex',
        length: 20
    })
    .uint16be('type')
    .choice('payload', {
        tag: 'type',
        choices: {
            0x1001: LoginPackage,
            0x9001: LoginReply,
            0x4004: DataFlow
        },
        defaultChoice: new Parser()
    })
    .uint16('crc16')
    .uint16('tail');

var buf = new Buffer('40407F000431303031313132353239393837000000000000001001C1F06952FDF069529C91110000000000698300000C0000000000036401014C00030001190A0D04121A1480D60488C5721800000000AF4944445F3231364730325F532056312E322E31004944445F3231364730325F482056312E322E31000000DF640D0A', 'hex');
var dcMsg = Message.parse(buf);
//console.log(dcMsg);
//console.log(dcMsg.type);
var mysql      = require('mysql');
/*var connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : 'root123',
  database : 'obd'
});

connection.connect();


connection.query('INSERT INTO location SET ?', 
    {dev_id: '23', timestamp: '12345678', longitude: '123.12', latitude: '22.45'}, 
    function(err, result) {
  if (err) throw err;

  console.log(result.insertId);
});

connection.query('SELECT * from location', function(err, rows, fields) {
  if (!err)
    console.log('The solution is: ', rows);
  else
    console.log('Error while performing Query.');
});


connection.end();
*/

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

switch(dcMsg.type) {
    case 0x1001: 
        //console.log(dcMsg.payload.gps_data);
        updateDB(dcMsg.payload.gps_data);
        //console.log("DB updated.");
        break;
    case 0x9001:
        console.log("Login Reply");
    case 0x4004:
        console.log("Data Flow");
}


var buf2 = new Buffer('40407F000431303031313132353239393837000000000000001001C1F06952FDF069529C91110000000000698300000C0000000000036401014C00030001190A0D04121A1480D60488C5721800000000AF4944445F3231364730325F532056312E322E31004944445F3231364730325F482056312E322E31000000', 'hex');

var crc = require('crc');
//var crc16 = require('crc-itu').crc16;

var res = crc.crc16(buf2);
//var crcInHex = crc16(buf2).toString(16);

console.log(res.toString(16));
//console.log(Message.parse(buf));

/*
require('fs').readFile('Hello.class', function(err, data) {
    console.log(require('util').inspect(Message.parse(data), {depth: null}));
});
*/
