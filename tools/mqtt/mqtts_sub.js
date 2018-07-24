var mqtt = require('mqtt');
var http = require('http');
var fs = require('fs');
var decode_rpt = require('./decode_mqtt_rpt');
var decode_alt1 = require('./decode_mqtt_alt1');
var decode_alt2 = require('./decode_mqtt_alt2');
var assemble = require('./encode_mqtt');
var dbutil = require('./dbutil');
var alert_utils = require('./send_alert');
var config = require('./config');

//var client  = mqtt.connect('mqtt://localhost', { host: 'localhost', port: 8883 })
//var deviceRoot = "demo/device/";
var mqtthost = 'localhost';

var cert_folder = config.aob.cert_folder;

var KEY = fs.readFileSync(cert_folder + '/client.key');
var CERT = fs.readFileSync(cert_folder + '/client.crt');
var CAfile = fs.readFileSync(cert_folder + '/ca.crt');

var isConnected = false;

var options = {
	host: mqtthost,
	port: 8883,
	protocol: 'mqtts',
	protocolId: 'MQIsdp',
	username: config.mqtt.user,
	password: config.mqtt.pass,
	ca: CAfile,
	key: KEY,
	cert: CERT,
	secureProtocol: 'TLSv1_method',
	protocolId: 'MQIsdp',
	protocolVersion: 3
};


var client = mqtt.connect(options);

client.on('connect', function () {
	console.log("Connected.");
	client.subscribe('#');
	isConnected = true;
	//client.publish('presence', 'Hello mqtt')
})

client.on('message', function (topic, message) {
	// message is Buffer
	//console.log('Message:', message.toString())
	console.log('Topic:', topic);
	var mqttTopic = topic;
	var topicFields = mqttTopic.split('/');
	if (topicFields.length != 2) {
		console.log("Topic " + mqttTopic + " does not have two fields.")
		return;
	}
	var liftId = topicFields[0];
	var javTopic = topicFields[1];
	//var clientId = message.clientId;
	switch (javTopic) {
		case 'rpt':
			var base64str = new Buffer(message).toString('hex');
			console.log('rpt->DATA(base64) ' + ': ' + base64str);
			var rptMsg = decode_rpt.decodeRptMessage(message);
			var dcMsg = dbutil.transformRptMsg(rptMsg);
			dbutil.add2dbErrors(liftId, dcMsg);
			//var dcMsg = decode_alt1.decodeAlt1Message(message);
			var replyMsg = assemble.rptReply(dcMsg);
			client.publish(liftId + '/req', replyMsg);
			break;
		case 'alt1':
			var base64str = new Buffer(message).toString('hex');
			console.log('alt1->DATA(base64) ' + ': ' + base64str);
			var dcMsg = decode_alt1.decodeAlt1Message(message);
			console.log("mqtts: adding event to DB.");
			dbutil.add2dbAlerts(liftId, dcMsg);
			var replyMsg = assemble.alt1Reply(dcMsg);
			client.publish(liftId + '/req', replyMsg);
			var liftEvent = dcMsg['type'];
			if (liftEvent && dcMsg['set_reset']) {
				console.log("Send Alert: ");
				var smsSubsList = dbutil.getSubsList(liftId, function (err, smsSubsList) {
					if (err) console.log(err);
					console.log("SMS List: ", smsSubsList);
					//alert_utils.sendSMS("123456", dcMsg);
					//alert_utils.sendAlert(liftId, dcMsg, smsSubsList);
					alert_utils.sendSMS(liftId, dcMsg, smsSubsList);
				});
			}
			break;
		case 'alt2':
			var base64str = new Buffer(message).toString('hex');
			console.log('alt2->DATA(base64) ' + ': ' + base64str);
			var altMsg = decode_alt2.decodeAlt2Message(message);
			var dcMsg = dbutil.transformAlt2Msg(altMsg);
			dbutil.add2dbErrors(liftId, dcMsg);
			var replyMsg = assemble.alt2Reply(dcMsg);
			client.publish(liftId + '/req', replyMsg);
			break;
		case 'res':
			var base64str = new Buffer(message).toString('hex');
			console.log('res->DATA(base64) ' + ': ' + base64str);
			var u8arr = new Uint8Array(message);
			//console.log(u8arr);
			// 0x4901:mnt, 0x4902:op; 0x49=73(decimal)
			if(u8arr[0] == 73) { // if maintenance related..
				var mode = '';
				if(u8arr[1] == 1) {
					// Lift switched to maintenance mode.
					mode = 'maintenance';
				}
				else if(u8arr[1] == 2) {
					// Lift switched to operational mode.
					mode = '';
				}
				dbutil.updateRemarks(liftId, mode);
			}
			break;
		case 'relay':
			var resetMsg = assemble.resetSensor(message);
			console.log("Relaying message to DC.");
			if (isConnected) {
				client.publish(liftId + '/req', resetMsg);
			}
			break;
	}
	//client.end()
})

var server = http.createServer(function (req, res) {
	console.log('Req received.');
	if (req.method == 'POST') {
		var jsonString = '';

		req.on('data', function (data) {
			jsonString += data;
		});

		req.on('end', function () {
			jsonData = JSON.parse(jsonString);
			console.log(jsonData);
			liftId = jsonData.liftId;
			sensorType = jsonData.sType;
			var resetMsg = assemble.encodeReset(sensorType);
			let base64str = new Buffer(resetMsg).toString('hex');
			console.log('DATA(base64) ' + ': ' + base64str);
			console.log("Relaying message to DC.");
			if (isConnected) {
				client.publish(liftId + '/req', resetMsg);
				console.log('Reset message published.');
				res.writeHead(200, "OK", { 'Content-Type': 'text/plain' });
				res.end();
			} else {
				console.log("MQTT not connected.");
			}
		});

	}
	console.log("Return fn.");
});
server.listen(8001);
