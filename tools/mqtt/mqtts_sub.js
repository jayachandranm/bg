var mqtt = require('mqtt')
var fs = require('fs');
var decode_rpt = require('./decode_mqtt_rpt');
var decode_alt1 = require('./decode_mqtt_alt1');
var decode_alt2 = require('./decode_mqtt_alt2');
var assemble = require('./encode_mqtt');
var dbutil = require('./dbutil');
var alert_utils = require('./send_alert');

//var client  = mqtt.connect('mqtt://localhost', { host: 'localhost', port: 8883 })

var deviceRoot="demo/device/"
var mqtthost = 'localhost';

var cert_folder = '/home/ubuntu/cert';

var KEY = fs.readFileSync(cert_folder + '/client.key');
var CERT = fs.readFileSync(cert_folder + '/client.crt');
var CAfile = fs.readFileSync(cert_folder + '/ca.crt');
//var CAfile = [fs.readFileSync('/ca.crt')];
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
	password: 'pass',
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
 
var client = mqtt.connect(options);

client.on('connect', function () {
  console.log("Connected.")
  client.subscribe('#')
  //client.publish('presence', 'Hello mqtt')
})
 
client.on('message', function (topic, message) {
  // message is Buffer
  //console.log('Message:', message.toString())
  console.log('Topic:', topic);
  var mqttTopic = topic;
  var topicFields = mqttTopic.split('/');
  if(topicFields.length != 2) {
	  console.log("Topic " + mqttTopic + " does not have two fields.")
	  return;
  }
  var liftId = topicFields[0];
  var javTopic = topicFields[1];
  //var clientId = message.clientId;
  switch(javTopic) {
	  case 'rpt':
	  var base64str = new Buffer(message).toString('hex');
	  console.log('DATA(base64) ' +  ': ' + base64str);
	  var rptMsg = decode_rpt.decodeRptMessage(message);
	  var dcMsg = dbutil.transformRptMsg(rptMsg);
	  dbutil.add2dbErrors(liftId, dcMsg);
	  //var dcMsg = decode_alt1.decodeAlt1Message(message);
	  var replyMsg = assemble.rptReply(dcMsg);
	  client.publish('res', replyMsg);
	  break;
	  case 'alt1':
	  var base64str = new Buffer(message).toString('hex');
	  console.log('DATA(base64) ' +  ': ' + base64str);
	  var dcMsg = decode_alt1.decodeAlt1Message(message);
	  dbutil.add2dbAlerts(liftId, dcMsg);
	  var replyMsg = assemble.alt1Reply(dcMsg);
	  client.publish('res', replyMsg);
	  var liftEvent = dcMsg['type'];
	  if(liftEvent && dcMsg['set_reset']) {
              console.log("Send Alert: ");
	      //alert_utils.sendSMS("123456", dcMsg);
              //alert_utils.sendAlert(liftId, dcMsg);
	  }
	  break;
	  case 'alt2':
	  var base64str = new Buffer(message).toString('hex');
	  console.log('DATA(base64) ' +  ': ' + base64str);
	  var altMsg = decode_alt2.decodeAlt2Message(message);
	  var dcMsg = dbutil.transformAlt2Msg(altMsg);
	  dbutil.add2dbErrors(liftId, dcMsg);
	  var replyMsg = assemble.alt2Reply(dcMsg);
	  client.publish('res', replyMsg);	  
	  break;
  }
  //client.end()
})
