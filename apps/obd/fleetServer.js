//vre('net');
var net = require('net') //aby
//var crc = require('crc')

var HOST = '127.0.0.1';
var PORT = 8686;
var count = 1;
var respToOBD = new Buffer ('4040290004323133474c32303134303036363331000000000090010E64864121EECA3F2A53CA3F2A53263C');
//4040290004323133474c32303134303036363331000000000090010E64864121EECA3F2A53CA3F2A53263C
console.log('\n' + respToOBD +'\n');
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
        console.log('rawData: ' + rawData + '\n'); // aby
        
        var base64str = new Buffer(data).toString('hex');
        //console.log('DATA ' + sock.remoteAddress + ': ' + data);
        console.log('DATA(base64) ' + sock.remoteAddress + ': ' + base64str);
    
        // Write the data back to the socket, the client will receive it as data from the server
        sock.write('You said "' + data + '"');
        if(count == 1)
        {
            sock.write(respToOBD);
            count --;
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
