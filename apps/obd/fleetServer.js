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
//var buf = new Buffer('40407F000431333630303030303030310000000000000000001001C1F06952FDF069529C91110000000000698300000C0000000000036401014C00030001190A0D04121A1480D60488C5721800000000AF4944445F3231364730325F532056312E322E31004944445F3231364730325F482056312E322E31000000DF640D0A', 'hex');
//var buf = new Buffer('4040e801043231334558323031343030323936340000000000400101d6add65545b0d655481e48001101000034980000030000000400076401240c0003001414080f0c0e3bce844f0086d54516b90000000314080f0c0e3bce844f0086d54516b90000000314080f0c0e3bce844f0086d54516b90000000314080f0c0e3bce844f0086d54516b90000000314080f0c0e3bce844f0086d54516b90000000314080f0c0e3bce844f0086d54516b90000000314080f0c0e3bce844f0086d54516b90000000314080f0c0e3bce844f0086d54516b90000000314080f0c0e3bce844f0086d54516b90000000314080f0c0e3bce844f0086d54516b90000000314080f0c0e3bce844f0086d54516b90000000314080f0c0e3bce844f0086d54516b90000000314080f0c0e3bce844f0086d54516b90000000314080f0c0e3bce844f0086d54516b90000000314080f0c0e3bce844f0086d54516b90000000314080f0c0e3bce844f0086d54516b90000000314080f0c0e3bce844f0086d54516b90000000314080f0c0e3bce844f0086d54516b90000000314080f0c0e3bce844f0086d54516b90000000314080f0c0e3bce844f0086d54516b90000000314380480066403460489021706cf046705b104a0027f0299061f07ed08160a630817058f093509520847c80d0a', 'hex');
var buf = new Buffer('4040590004323133474c323031343030363633310000000000400100bbdb9d572edc9d572c6f1f00d80100009a4500000600000004000764011112000300011f07100b0b1be8d14e004a1b45166003d206af01f40228510d0a', 'hex');

//4040290004323133474c32303134303036363331000000000090010E64864121EECA3F2A53CA3F2A53263C
//console.log('\n' + respToOBD +'\n');

// TODO: for test.

/*
var dcMsg = decode.decodeMessage(buf);
console.log(dcMsg.payload.gps_items[0]);
var gpsVals = dcMsg.payload.gps_items[0];
dbutil.updateDB(gpsVals);
*/
//console.log(dcMsg.payload.gps_items[0]);
//processMessage2(dcMsg);


// Create a server instance, and chain the listen function to it
// The function passed to net.createServer() becomes the event handler for the 'connection' event
// The sock object the callback function receives UNIQUE for each connection
net.createServer(function(sock) {

    // We have a connection - a socket object is assigned to the connection automatically
    console.log('CONNECTED: ' + sock.remoteAddress +':'+ sock.remotePort);

    // Add a 'data' event handler to this instance of socket
    sock.on('data', function(data) {
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
          console.log("Error in decoding.");
        }
        try {
          processMessage(sock, dcMsg);
        } catch (err) {
          console.log("Error in processing decoded data.");
        }
        //sock.pipe(sock);
    });

    // Add a 'close' event handler to this instance of socket
    sock.on('close', function(data) {
        console.log('CLOSED: ' + sock.remoteAddress +' '+ sock.remotePort);
    });

    sock.on('end', function() {
        console.log('client disconnected');
    });

}).listen(PORT);//, HOST);

console.log('Server listening on ' + HOST +':'+ PORT);

function processMessage(sock, dcMsg) {
  switch(dcMsg.type) {
      case 0x1001:
          console.log('Login Message from OBD.');
          var replyMsg = assemble.loginReply(dcMsg);
          sock.write(replyMsg);
          dbutil.updateDB(dcMsg.payload.gps_item);
          //console.log("DB updated.");
          // TODO: Login reply.
          break;
      case 0x1003:
          console.log('HeartBeatPackage received, send reply.')
          var heartReply = assemble.heartBeatReply(dcMsg);
          sock.write(heartReply);
          break;
      case 0x4001:
          console.log('GPS data');
          if(dcMsg.payload.gps_count > 0) {
            dbutil.updateDB(dcMsg.payload.gps_items[0]);
          } else {
            console.log("No GPS items available.");
          }
      case 0x4004:
          console.log("Data Flow");
  }
}


// TODO: for test
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
