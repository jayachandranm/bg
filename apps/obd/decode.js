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
    // TODO: Decode VEH_STATE details.
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
    .endianess('little')
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

// Acceleration Data, GSENSOR_DATA.
var gData = new Parser()
    .endianess('little')
    .int16('x')
    .int16('y')
    .int16('z');

var alarmItems = new Parser()
    .endianess('little')
    .uint8('new_alarm_flag')
    .uint8('alarm_type')
    // TODO: Alarm description is to be further decoded.
    .uint16('alarm_desc')
    .uint16('alarm_threshold');

var TLVItems = new Parser()
    .endianess('little')
    .uint16('tag')
    .uint16('length')
    .array('values', {
      type: 'int8',
      length: 'length'
    });


//-----------------------------------------

var LoginPackage = new Parser()
    //Parser.start()
    .nest('stat_data', {
        // 34 bytes
        type: statData
    })
    .uint8('gps_active')
    // Decode as GPS ITEM only if GPS enabled.
    .choice('gps_item', {
        tag: 'gps_active',
        choices: {
            // Nothing to decode 
            0x00: new Parser(),
            // 20 bytes 
            0x01: gpsItem 
        },
        // TODO: Check this.
        defaultChoice: new Parser()
    })
    .string('sw_version', {
        encoding: 'utf8',
        length: 20
    })
    .string('hw_version', {
        encoding: 'utf8',
        length: 20
    });

var LogoutPackage = new Parser()
    .nest('stat_data', {
        // 34 bytes
        type: statData
    })
    .uint8('gps_active')
    // Decode as GPS ITEM only if GPS enabled.
    .choice('gps_item', {
        tag: 'gps_active',
        choices: {
            // Nothing to decode 
            0x00: new Parser(),
            // 20 bytes 
            0x01: gpsItem 
        },
        // TODO: Check this.
        defaultChoice: new Parser()
    })

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

var PIDPackage = new Parser()
    .endianess('little')
    .nest('stat_data', {
        // 34 bytes
        type: statData
    })
    .uint16('pid_sample_rate')
    .uint8('pid_type_count')
    .array('pid_type', {
      type: 'uint16le',
      length: 'pid_type_count'
    })
    .uint8('pid_group_count')
    .uint8('pid_group_size')
    // TODO: Properly decode PID Group items.
    .array('pid_data', {
      type: 'uint8',
      // TODO: Fix this.
      length: 1
      //length: function() { return (pid_group_count*pid_group_size); }
    });

var GSensorPackage = new Parser()
    .endianess('little')
    .nest('stat_data', {
        // 34 bytes
        type: statData
    })
    .uint16('g_sample_rate')
    .uint8('g_group_count')
    .array('g_data', {
      // Each gData item is 6 bytes.
      type: gData,
      length: 'g_group_count'
    });

var PIDTypesPackage = new Parser()
    .endianess('little')
    .nest('stat_data', {
        // 34 bytes
        type: statData
    })
    .uint8('pid_type_count')
    .array('pid_type', {
      type: 'uint16le',
      length: 'pid_type_count'
    });

// TODO: Decoding in not complete, the tail does not match.
var SnapshotFrame = new Parser()
    .endianess('little')
    .nest('stat_data', {
        // 34 bytes
        type: statData
    })
    .uint8('frozen_flag')
    .uint8('pid_type_count')
    .array('pid_type', {
      type: 'uint16le',
      length: 'pid_type_count'
    })
    // TODO: Decode PID data properly.
    .array('pid_data', {
      type: 'uint8',
      length: 'pid_type_count'
    });

var DTCsCar = new Parser()
    .endianess('little')
    .nest('stat_data', {
        // 34 bytes
        type: statData
    })
    .uint8('dtc_flag')
    .uint8('dtc_count')
    .array('dtc_vals', {
      type: 'uint16le',
      length: 'dtc_count'
    });


var DTCsCommercial = new Parser()
    .endianess('little')
    .nest('stat_data', {
        // 34 bytes
        type: statData
    })
    .uint8('dtc_flag')
    .uint8('dtc_count')
    .array('dtc_vals', {
      // TODO: To be further decoded.
      type: 'uint32le',
      length: 'dtc_count'
    });

var AlarmsPackage = new Parser()
    .endianess('little')
    .uint32('alarm_seq_num')
    .nest('stat_data', {
        // 34 bytes
        type: statData
    })
    // TODO: GPS_DATA not described properly, count-flag/enabled-flag?.
    // Currently treated as enabled-flag, with zero or one GPS item.
    // 0 -> disabled or 0 items
    .uint8('gps_active')
    // Decode as GPS ITEM only if GPS enabled.
    .choice('gps_item', {
        tag: 'gps_active',
        choices: {
            // Nothing to decode 
            0x00: new Parser(),
            // 20 bytes 
            0x01: gpsItem 
        },
        // TODO: Check this.
        defaultChoice: new Parser()
    })
    .uint8('alarm_count')
    .array('alarms', {
      // Each item takes 6 bytes..
      type: alarmItems,
      length: 'alarm_count'
    });

var CellId = new Parser()
    .endianess('little')
    .nest('stat_data', {
        // 34 bytes
        type: statData
    })
    .uint16('local_area_code')
    .uint16('cell_id');

var GPSReportInSleep = new Parser()
    .endianess('little')
    .uint32('utc_time')
    .nest('gps_item', {
        // 19 bytes
        type: gpsItem
    });

var DriverCardId = new Parser()
    .endianess('little')
    .nest('stat_data', {
        // 34 bytes
        type: statData
    })
    .array('card_id', {
      type: 'uint8',
      // TODO: Variable length. May have to search till crc/tail data.
      length: 1
      //length: function() { return this.dataLength - 4; }
      //readUntil: function(item, buffer) { return item === oxodoa; }
    });

var AGPSRequest = new Parser()
    .endianess('little')
    .nest('gps_item', {
        // 19 bytes
        type: gpsItem
    });

var SettingResponse = new Parser()
    .endianess('little')
    .uint16('cmd_seq_num')
    .uint8('success_tag_count')
    .array('success_tags', {
      type: 'uint16le',
      length: 'success_tag_count'
    });

var QueryResponse = new Parser()
    .endianess('little')
    .uint16('cmd_seq_num')
    .uint8('resp_count')
    .uint8('resp_index')
    .uint8('fail_count')
    .array('fail_tags', {
      type: 'uint16le',
      length: 'fail_count'
    })
    .uint8('success_count')
    .array('success_tlvs', {
      type: TLVItems,
      length: 'success_count'
    });

var CurrentLocation = new Parser()
    .endianess('little')
    .uint16('cmd_seq_num')
    .nest('stat_data', {
        // 34 bytes
        type: statData
    })
    .uint8('gps_active')
    // Decode as GPS ITEM only if GPS enabled.
    .choice('gps_item', {
        tag: 'gps_active',
        choices: {
            // Nothing to decode 
            0x00: new Parser(),
            // 20 bytes 
            0x01: gpsItem 
        },
        // TODO: Check this.
        defaultChoice: new Parser()
    })

var ClearDTCResp = new Parser()
    .endianess('little')
    .uint16('cmd_seq_num')
    .uint8('flag');

var RestoreFactorySetResp = new Parser()
    .endianess('little')
    .uint16('cmd_seq_num')
    .uint8('flag');

var TextInfo = new Parser()
    .endianess('little')
    .uint16('cmd_seq_num')
    // TODO: Variable length. Will it be automatically handled?
    .string('info', {
      encoding: 'ascii',
      zeroTerminated: 'true'
    });

var TextInfoResp = new Parser()
    .endianess('little')
    .uint16('cmd_seq_num')
    .uint8('flag');

var UpdateConfirm = new Parser()
    .endianess('little')
    .uint32('update_id')
    .string('firmware_version', {
      encoding: 'ascii',
      length: 16
    })
    .uint8('update_confirmation');

var UpdateMessageConfirm = new Parser()
    .endianess('little')
    .uint32('update_id')
    .uint8('receive_mark')
    .uint16('message_index');

var AGPSConfirm = new Parser()
    .endianess('little')
    .uint8('agps_index')
    .uint8('agps_mark');

//-------------------------------------------

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
/*
    .string('dev_id', {
        encoding: 'ascii',
        length: 15
    })
    // TODO:   length: 20, 
    // last 5 chars are now ignored (issue -> hex 00=null).
    .string('dev_id_reserved', {
        encoding: 'hex',
        length: 5
    })
*/
    .uint16be('type')
    .choice('payload', {
        tag: 'type',
        choices: {
            0x1001: LoginPackage,
            0x1002: LogoutPackage,
            0x1003: HeartBeatPackage,
            0x4001: GPSPackage,
            0x4002: PIDPackage, // TODO:
            0x4003: GSensorPackage,
            0x4004: PIDTypesPackage,
            0x4005: SnapshotFrame, // TODO:
            0x4006: DTCsCar,
            0x400B: DTCsCommercial,
            0x4007: AlarmsPackage,
            0x4008: CellId,
            0x4009: GPSReportInSleep,
            0x400C: DriverCardId,
            0x5101: AGPSRequest,
            0xA001: SettingResponse,
            0xA002: QueryResponse,
            0xB001: CurrentLocation,
            0xB002: ClearDTCResp,
            0xB003: RestoreFactorySetResp,
            0x3006: TextInfo,
            0xB006: TextInfoResp,
            0xD001: UpdateConfirm,
            0xD002: UpdateMessageConfirm,
            0xD102: AGPSConfirm
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
