var mqtt = require('mqtt')
var fs = require('fs');
//var client  = mqtt.connect('mqtt://localhost', { host: 'localhost', port: 8883 })

var deviceRoot="demo/device/"
var mqtthost = 'localhost';

var KEY = fs.readFileSync('/home/comfort/dev/worksheet/mqtt/client.key');
var CERT = fs.readFileSync('/home/comfort/dev/worksheet/mqtt/client.crt');
var CAfile = [fs.readFileSync('/home/comfort/dev/worksheet/mqtt/ca.crt')];
/*
var KEY = '/etc/keys/client.key';
var CERT = '/etc/keys/client.crt';
var CAfile = '/etc/keys/ca.crt';
*/

var options = {
	host: mqtthost,
	port: 8883,
	protocol: 'mqtts',
	protocolId: 'MQIsdp',
	username: 'admin',
	password: 'test',
	ca: CAfile,
	key: KEY,
	cert: CERT,
	secureProtocol: 'TLSv1_method',
	protocolId: 'MQIsdp',
	protocolVersion: 3
};

/*
var client  = mqtt.connect('mqtt://test.mosquitto.org', {
    rejectUnauthorized: false
})
*/
 
var client=mqtt.connect(options);

client.on('connect', function () {
  console.log("Connected.")
  client.subscribe('#')
  client.publish('presence', 'Hello mqtt')
})
 
client.on('message', function (topic, message) {
  // message is Buffer
  console.log('Message:', message.toString())
  //client.end()
})
