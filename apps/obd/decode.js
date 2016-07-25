//ar Parser = require('../lib/binary_parser').Parser;
var Parser = require('binary-parser').Parser;
//var crc = require('crc');
var crc16 = require('crc-itu').crc16;

module.exports.decodeMessage = decodeMessage;

var dateTime = new Parser()
    .uint8('day')
    .uint8('month')
    .uint8('year')
    .uint8('hour')
    .uint8('minute')
    .uint8('second');

var statData = new Parser()
    .endianess('little')
    //Parser.start()
    // Unix time
    .uint32('acc_on_time')
    // Unix time
    .uint32('utc_time')
    .uint32le('mileage_total')
    .uint32le('mileage_current')
    .uint32le('fuel_total')
    .uint16le('fuel_current')
    .uint32('veh_state')
/*    .nest('vstate_flags', {
        type: new Parser()
        .bit1('east_long')
        .bit1('north_lat')
        .bit2('test')
        .bit4('num_satellites')
*/    .string('reserved', {
        encoding: 'hex',
        length: 8
    });

var gpsItem = new Parser()
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
    .uint8('gps_active')
    .nest('gps_item', {
        // 20 bytes
        type: gpsItem
    })
    .string('sw_version', {
        encoding: 'utf8',
        length: 20
    })
    .string('hw_version', {
        encoding: 'utf8',
        length: 20
    });

// Nothing to decode. Just need to reply.
var HeartBeatPackage = new Parser();

var GPSPackage = new Parser()
    // history(1) or realtime(0).
    .uint8('history')
    .nest('stat_data', {
        // 34 bytes
        // UTC_Time is the sample time of the last GPS data.
        type: statData
    })
    // The first byte of GPS_DATA is interpreted differently
    // in LoginPackage and GPSPackage.
    .uint8('gps_count')
    .array('gps_items', {
      type: gpsItem,
      length: 'gps_count'
    })
    // RPM_DATA
    // if val = 0xffff, invalid RPM.
    .uint8('rpm_count')
    .array('rpm_items', {
      type: 'uint16le',
      length: 'rpm_count'
    });
    /*
    .nest('gps_item', {
        // 20 bytes
        type: gpsData
    });
    */

var DataFlow = new Parser();

var PIDPackage = new Parser();

var AlarmsPackage = new Parser();

var GSensePackage = new Parser();


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
            0x1003: HeartBeatPackage,
            0x4001: GPSPackage,
            0x4002: PIDPackage,
            0x4007: AlarmsPackage,
            0x4003: GSensePackage,
            0x4004: DataFlow
        },
        // TODO: handle this.
        defaultChoice: new Parser()
    })
    .uint16('crc16')
    .uint16('tail');

// var buf = new Buffer('40407F000431333630303030303030310000000000000000001001C1F06952FDF069529C91110000000000698300000C0000000000036401014C00030001190A0D04121A1480D60488C5721800000000AF4944445F3231364730325F532056312E322E31004944445F3231364730325F482056312E322E31000000DF640D0A', 'hex');
// var dcMsg = Message.parse(buf);

function decodeMessage(obdData) {
  var dcMsg = Message.parse(obdData);
  //console.log(dcMsg);
  return dcMsg;
}
//console.log(dcMsg);
//console.log(dcMsg.type);
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

/*
var buf2 = new Buffer('40407F000431303031313132353239393837000000000000001001C1F06952FDF069529C91110000000000698300000C0000000000036401014C00030001190A0D04121A1480D60488C5721800000000AF4944445F3231364730325F532056312E322E31004944445F3231364730325F482056312E322E31000000', 'hex');
//var crcInHex = crc.crc16ccitt(buf2).toString(16);
//var res = crc.crc16(buf2);
var crcInHex = crc16(buf2).toString(16);
console.log(crcInHex);
//console.log(Message.parse(buf));
*/




/*
require('fs').readFile('Hello.class', function(err, data) {
    console.log(require('util').inspect(Message.parse(data), {depth: null}));
});
*/
