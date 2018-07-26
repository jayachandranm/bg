var moment = require('moment');
var dateFormat = require('dateformat');
var https = require('https');
var request = require('request');
var config = require('./config');
const querystring = require('querystring');

module.exports.sendSMS = sendSMS;

function composeSMS(liftId, msg, liftAddress) {
    var timeNow = new Date();
    //console.log(timeNow.getHours() + ":" + timeNow.getMinutes() + ":" + timeNow.getSeconds());
    var dt = moment(timeNow).utcOffset('+0800').format("YYYY-MM-DD HH:mm:ss");
    //var eventTxt = "None";
    var liftEvent = msg['type'];

    //
    var messageText = "Event from, " + liftId + "\n"
        + " (" + liftAddress + ")" + "\n"
        + liftEvent + "\n"
        + dt + "\n";
        //+ ".";
    // Write the string to the console
    console.log("Message to send: " + messageText);
    return messageText;
}

function sendMsg(liftId, msgTxt, subsList) {
    var user = encodeURI(config.smsUser);
    var pass = encodeURI(config.smsPass);
    var sms_from = encodeURI(config.smsFrom);
    // Create a comma separared list of numbers. (max=10?)
    //var phoneList = document.write(subsList.join(", "));
    //
    //var sms_server = 'www.commzgate.net/gateway/SendMsg';

    var postData = querystring.stringify({
        'ID': config.sms.user,
        'Password': config.sms.pass,
        'Mobile': encodeURI(subsList),
        'Type': 'A',
        'Batch': 'true',
        'Message': encodeURI(msgTxt)
    });

    var options = {
        hostname: 'www.commzgate.net',
        port: 443,
        path: '/gateway/SendMsg',
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Content-Length': postData.length
        }
    };
    //
    var req = https.request(options, (res) => {
        console.log('statusCode:', res.statusCode);
        console.log('headers:', res.headers);

        res.on('data', (d) => {
            process.stdout.write(d);
        });
    });

    req.on('error', (e) => {
        console.error(e);
    });

    req.write(postData);
    req.end();
}

function sendMsg2(liftId, msgTxt, subsList) {
    var headers = {
      'Content-Type':     'application/x-www-form-urlencoded'
    }
  
    api_url = 'https://www.commzgate.net/gateway/SendMsg';
  
    userId = config.sms.user;
    pass = config.sms.pass;
    //mobile = encodeURI(subsList);
    mobile = subsList;

    //
    //msg = encodeURI(msgTxt);
    msg = msgTxt;
    
    var options = {
      url: api_url,
      method: 'POST',
      headers: headers,
      form: {
          'ID': userId, 
          'Password': pass, 
          'Mobile' : mobile, 
          'Type' : 'A', 
          'Batch': 'true',
          'Message' : msg
        }
    } 
    //
    request(options, function (error, response, body) {
      if (!error && response.statusCode == 200) {
          // Print out the response body
          console.log(body)
      } 
      else {
          console.log("SMS Gateway request failed.");
      }
    })
  }
  


function sendSMS(liftId, mqttMsg, smsSubsList, liftAddress) {
    var messageText = composeSMS(liftId, mqttMsg, liftAddress);
    //
    //sendMsg(liftId, messageText, smsSubsList);
    sendMsg2(liftId, messageText, smsSubsList);
}
