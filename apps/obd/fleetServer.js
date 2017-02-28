//vre('net');
var net = require('net') //aby
//var crc = require('crc')

var decode = require('./decode');
var assemble = require('./assemble-obd-message');
var dbutil = require('./dbutil');

var HOST = '127.0.0.1';
var PORT = 8686;
var count = 1;
//var respToOBD = new Buffer ('4040290004323133474c32303134303036363331000000000090010E64864121EECA3F2A53CA3F2A53263C');
// LOGIN with GPS active.
//var buf = new Buffer('40407F000431333630303030303030310000000000000000001001C1F06952FDF069529C91110000000000698300000C0000000000036401014C00030001190A0D04121A1480D60488C5721800000000AF4944445F3231364730325F532056312E322E31004944445F3231364730325F482056312E322E31000000DF640D0A', 'hex');
//var buf = new Buffer('4040e801043231334558323031343030323936340000000000400101d6add65545b0d655481e48001101000034980000030000000400076401240c0003001414080f0c0e3bce844f0086d54516b90000000314080f0c0e3bce844f0086d54516b90000000314080f0c0e3bce844f0086d54516b90000000314080f0c0e3bce844f0086d54516b90000000314080f0c0e3bce844f0086d54516b90000000314080f0c0e3bce844f0086d54516b90000000314080f0c0e3bce844f0086d54516b90000000314080f0c0e3bce844f0086d54516b90000000314080f0c0e3bce844f0086d54516b90000000314080f0c0e3bce844f0086d54516b90000000314080f0c0e3bce844f0086d54516b90000000314080f0c0e3bce844f0086d54516b90000000314080f0c0e3bce844f0086d54516b90000000314080f0c0e3bce844f0086d54516b90000000314080f0c0e3bce844f0086d54516b90000000314080f0c0e3bce844f0086d54516b90000000314080f0c0e3bce844f0086d54516b90000000314080f0c0e3bce844f0086d54516b90000000314080f0c0e3bce844f0086d54516b90000000314080f0c0e3bce844f0086d54516b90000000314380480066403460489021706cf046705b104a0027f0299061f07ed08160a630817058f093509520847c80d0a', 'hex');
//var buf = new Buffer('4040590004323133474c323031343030363633310000000000400100bbdb9d572edc9d572c6f1f00d80100009a4500000600000004000764011112000300011f07100b0b1be8d14e004a1b45166003d206af01f40228510d0a', 'hex');
// 3 G OBD, GPS disabled, login,
//var buf = new Buffer('4040d00004323133455032303136303030353730000000000010010e53ee5770f2ee57055e000060550000ac000000950000000000076301681e338181004944445f3231335730315f532056312e302e36004944445f3231335730315f482056312e302e360032000110021003100410051006100710081009100a100b100c100d100e1011100111021103110411051106110711011202120312041201130213031301160216011701180218011b011c011d011e011f021f031f041f051f061f071f01210221012601270128fa0c0d0a', 'hex');

//4040290004323133474c32303134303036363331000000000090010E64864121EECA3F2A53CA3F2A53263C
//console.log('\n' + respToOBD +'\n');

// TODO: for test.

/*
 var dcMsg = decode.decodeMessage(buf);
 console.log("==================");
 console.log(dcMsg);
 if(dcMsg.payload.gps_active) {
 console.log('GPS active');
 } else {
 console.log('GPS not active');
 }

 */
//console.log(dcMsg.payload.gps_items[0]);
//var gpsVals = dcMsg.payload.gps_items[0];
//dbutil.updateDB(gpsVals);
//console.log(dcMsg.payload.gps_items[0]);
//processMessage2(dcMsg);


// Create a server instance, and chain the listen function to it
// The function passed to net.createServer() becomes the event handler for the 'connection' event
// The sock object the callback function receives UNIQUE for each connection
net.createServer(function (sock) {

    // We have a connection - a socket object is assigned to the connection automatically
    console.log('CONNECTED: ' + sock.remoteAddress + ':' + sock.remotePort);

    // Add a 'data' event handler to this instance of socket
    sock.on('data', function (data) {
        //var base64str = new Buffer(data).toString('base64');
        var rawData = new Buffer(data); //aby

        var base64str = new Buffer(data).toString('hex');
        //console.log('DATA ' + sock.remoteAddress + ': ' + data);
        console.log('DATA(base64) ' + sock.remoteAddress + ': ' + base64str);
        //debugger;
        try {
            var dcMsg = decode.decodeMessage(rawData);
            console.log("==================");
            console.log(dcMsg);
        } catch (err) {
            console.log("Error in decoding.", err);
        }
        //
        try {
            processMessage(sock, dcMsg);
        } catch (err) {
            console.log("Error in processing decoded data.", err);
        }
        //sock.pipe(sock);
    });

    // Add a 'close' event handler to this instance of socket
    sock.on('close', function (data) {
        console.log('CLOSED: ' + sock.remoteAddress + ' ' + sock.remotePort);
    });

    sock.on('end', function () {
        console.log('client disconnected');
    });

    sock.on('timeout', function () {
        console.log('socket timeout');
    });

    sock.on('error', function (err) {
        console.log("Error: " + err);
    });

    sock.on('uncaughtException', function (err) {
        console.log('socket:uncaughtException ' + err);
    });

}).listen(PORT);//, HOST);

console.log('Server listening on ' + HOST + ':' + PORT);

function processMessage(sock, dcMsg) {
    var _obdID = hex2a(dcMsg.dev_id);
    // TODO: Ignoring the last 5 bytes now, as they are null (0x00) chars.
    var obdID = _obdID.substring(0, 15);
    console.log("OBD ID =>", obdID);
    switch (dcMsg.type) {
        case 0x1001:
            console.log('0x1001: Process Login Message from OBD.');
            var replyMsg = assemble.loginReply(dcMsg);
            sock.write(replyMsg);
            // TODO: temporarily adding to 2 DBs for testing. Remove this.
            //
            if (dcMsg.payload.gps_active) {
                //dbutil.updateDB(dcMsg.payload.gps_item);
                var arr_gps_items = []; //[dcMsg.payload.gps_item];
                arr_gps_items.push(dcMsg.payload.gps_item);
                //console.log(arr_gps_items);
                dbutil.add2dbGPS(obdID, arr_gps_items);
                //console.log("DB updated.");
            }
            // TODO: Login reply.
            break;
        case 0x1003:
            console.log('0x1003: HeartBeatPackage received, send reply.')
            var heartReply = assemble.heartBeatReply(dcMsg);
            sock.write(heartReply);
            break;
        case 0x4001:
            console.log('0x4001: Process GPS data');
            if (dcMsg.payload.gps_count > 0) {
                // TODO: temporarily adding to 2 DBs for testing. Remove this.
                //dbutil.updateDB(dcMsg.payload.gps_items[0]);
                dbutil.add2dbGPS(obdID, dcMsg.payload.gps_items);
            } else {
                console.log("No GPS items available.");
            }
            break;
        case 0x4004:
            console.log("0x4004: PID Types supported.");
            break;
        case 0x4007:
            console.log('0x4007: Process Alarm from OBD.');
            var replyMsg = assemble.alarmConfirmation(dcMsg);
            sock.write(replyMsg);
            // TODO: Currently only use Alarms when GPS active.
            if ((dcMsg.payload.alarm_count > 0) && dcMsg.payload.gps_active) {
                //if((dcMsg.payload.alarm_count > 0) && (dcMsg.payload.gps_count >0)) {
                console.log('Alarm with GPS, update DB. ');
                dbutil.add2dbAlarms(obdID, dcMsg.payload.alarms, dcMsg.payload.gps_item);
            }
            // TODO: temporarily adding to 2 DBs for testing. Remove this.
            //
            /*
             dbutil.updateDB(dcMsg.payload.gps_item);
             var arr_gps_items = []; //[dcMsg.payload.gps_item];
             arr_gps_items.push(dcMsg.payload.gps_item);
             //console.log(arr_gps_items);
             dbutil.add2dbGPS(obdID, arr_gps_items);
             */
            //console.log("DB updated.");
            // TODO: Login reply.
            break;
        case 0x1002:
            console.log("0x1002: Logout.");
            break;
        case 0x4002:
            console.log("0x4002: PID.");
            break;
        case 0x4003:
            console.log("0x4003: GSensor.");
            break;
        case 0x4005:
            console.log("0x4005: Snapshot frame.");
            break;
        case 0x4006:
            console.log("0x4006: DTCs.");
            break;
        case 0x400B:
            console.log("0x400B: DTCs commercial.");
            break;
        case 0x4008:
            console.log("0x4008: Cell IDs.");
            break;
        case 0x4009:
            console.log("0x4009: GPS in sleep.");
            break;
        case 0x400C:
            console.log("0x400C: Driver card ID.");
            break;
        case 0x5101:
            console.log("0x5101: AGPS request.");
            break;
        case 0xA001:
            console.log("0xA001: Settings response.");
            break;
        default:
            console.log("Unhandled messsage from OBD.");
            break;
    }
}


// TODO: for test
/*
 function processMessage2(dcMsg) {
 switch(dcMsg.type) {
 case 0x1001:
 console.log('Login Message from OBD.');
 var replyMsg = assemble.loginReply(dcMsg);
 console.log(replyMsg);
 //sock.write(replyMsg);
 dbutil.updateDB(dcMsg.payload.gps_data);
 //console.log("DB updated.");
 // TODO: Login reply.
 break;
 case 0x1003:
 console.log('HeartBeatPackage received, send reply.')
 var heartReply = assemble.heartBeatReply(dcMsg);
 //sock.write(heartReply);
 break;
 case 0x4001:
 console.log('GPS data');
 dbutil.updateDB(dcMsg.payload.gps_data);
 case 0x4004:
 console.log("Data Flow");
 }

 }
 */

function hex2a(hexx) {
    var hex = hexx.toString();//force conversion
    var str = '';
    for (var i = 0; i < hex.length; i += 2)
        str += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
    return str;
}

/*
 process.on('uncaughtException', function (err) {
 console.error(err.stack);
 console.log("Node NOT Exiting...");
 });
 */
