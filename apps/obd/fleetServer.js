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
var buf = new Buffer('40407F000431333630303030303030310000000000000000001001C1F06952FDF069529C91110000000000698300000C0000000000036401014C00030001190A0D04121A1480D60488C5721800000000AF4944445F3231364730325F532056312E322E31004944445F3231364730325F482056312E322E31000000DF640D0A', 'hex');

//4040290004323133474c32303134303036363331000000000090010E64864121EECA3F2A53CA3F2A53263C
//console.log('\n' + respToOBD +'\n');

// TODO: for test.
/*
var dcMsg = decode.decodeMessage(buf);
console.log(dcMsg);
processMessage2(dcMsg);
*/

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
        //console.log('rawData: ' + rawData + '\n'); // aby

        var base64str = new Buffer(data).toString('hex');
        //console.log('DATA ' + sock.remoteAddress + ': ' + data);
        console.log('DATA(base64) ' + sock.remoteAddress + ': ' + base64str);
        
        //debugger;

        var dcMsg = decode.decodeMessage(rawData);
        console.log("==================");
        console.log(dcMsg);
        processMessage(sock, dcMsg);

        // Write the data back to the socket, the client will receive it as data from the server
        //sock.write('You said "' + data + '"');
        // Send only once.
        /*
        if(count == 1)
        {
            sock.write(respToOBD);
            count --;
        }
        */
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
          dbutil.updateDB(dcMsg.payload.gps_data);
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
          dbutil.updateDB(dcMsg.payload.gps_data);
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