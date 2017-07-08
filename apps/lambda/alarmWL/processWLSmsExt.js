//console.log('Loading function');
// Load the AWS SDK
var AWS = require("aws-sdk");
var http = require('http');
var sync_request = require('sync-request');
var https = require('https');
var utils = require('./wlAlertUtils');
var config = require('./config.json');
//var mqttmsg = require('./mqtt.json');
var dateFormat = require('dateformat');
var moment = require('moment');


var iotdata = new AWS.IotData({endpoint: config.endpointAddress, region: 'ap-southeast-1'});
//var iotdata = new AWS.IotData({endpoint: config.endpointAddress});

AWS.config.update({ region: 'ap-southeast-1' });
dynDoc = new AWS.DynamoDB.DocumentClient();

// Create an SNS object
var sns = new AWS.SNS({region: 'ap-southeast-1'});

module.exports.processWL = processWL;
//processWL(mqttmsg, null);

// Set up the code to call when the Lambda function is invoked
//exports.handler = (event, context, callback) => {
function processWL(stream, context) {
    // Load the message passed into the Lambda function into a JSON object
    //var eventText = JSON.stringify(msg, null, 2);
    var record_0 = stream.Records[0].dynamodb;
    var eventText = JSON.stringify(record_0, null, 2);
    // Log a message to the console, you can view this text in the Monitoring tab in the Lambda console or in the CloudWatch Logs console
    //console.log("Received DDB record-0:", eventText);

    var msg_0 = record_0.NewImage;
    //console.log("Received DDB record-0 (NewImage):", JSON.stringify(msg_0, null, 2));
    var currWL = msg_0.wl.N;
    var lastWL = currWL;
    //var lastWL = msg.hs.wl_1;
    var sid = msg_0.sid.S;
    var thingName = sid; 
    var ts_unix = msg_0.ts.N;
    var ts_r = msg_0.ts_r.S;

    var msg = {
        sid: sid,
        wl: currWL,
        wa: msg_0.wa.N,
        ts: ts_unix
    };
    
    // If md does not exist in the message, this lambda will not be called.
    // If md is set and md =0, this lambda may be called.
    /*
     if(typeof msg.md !== 'undefined' && msg.md !== null) {
     if(msg.md !== 0 ) {
     // Do send alerts, if md is non-zero.
     return;
     }
     }
     */
    var alertLevel = 0;
    var devState;
    iotdata.getThingShadow({
        thingName: thingName
    }, function (err, data) {
        if (err) {
            context.fail(err);
            console.log("Error in getting Shadow.", err);
        } else {
            var jsonPayload = JSON.parse(data.payload);
            //console.log('Shadow: ' + JSON.stringify(jsonPayload, null, 2));
            devState = jsonPayload.state.reported;
	    // TODO: delta will be handled on device side.
            //var delta = devState.delta;
            var delta = 0;

            // Get prev value for this sid from DDB table.
            var tablename = 'pubc5wl-ddb';
            var ddb_params = {
                TableName: tablename,
                KeyConditionExpression: 'sid = :hkey',
                ExpressionAttributeValues: {
                    ':hkey': sid
                },
                ScanIndexForward: false,
                Limit: 2,
            };

            var record_1;
            dynDoc.query(ddb_params, function (err, data) {
                if (err) {
                    console.log(err, err.stack);
                    callback(err);
                }
                else {
                    record_1 =  data.Items[1];
                    console.log("Current wl=", currWL, "; TS_R=", ts_r);
                    console.log("Prev record: ", JSON.stringify(record_1, null, 2));
                    lastWL = record_1.wl;
                    //
                    var wlRise = true;
                    if (currWL > lastWL) {
                        wlRise = true;
                        alertLevel = utils.getAlertlevelRise(currWL, lastWL, config);
                        console.log("Level Rising ->", alertLevel);
                    }

                    if (currWL < lastWL) {
                        wlRise = false;
                        alertLevel = utils.getAlertlevelFall(currWL, lastWL, delta, config);
                        console.log("Level Falling ->", alertLevel);
                    }

                    // May have to use history by accessing Shadow.
                    if (alertLevel) {

                        var res = sync_request('GET', 'http://13.228.68.232/stationname.php?stationid=' + sid);
                        var locName = res.body.toString('utf-8').replace('\t','');
                        //var locName = res.getBody();
                        console.log(locName);
                        devState.location = locName;

                        var messageText = utils.composeSMS(msg, alertLevel, wlRise, devState);

                        var subscriberList = new Array();
                        var params_sns = {
                            TopicArn: config.snsArn + ":" + sid
                            //NextToken: 'STRING_VALUE'
                        };
                        //console.log("SNS params: ", params_sns);
                        sns.listSubscriptionsByTopic(params_sns, function (err, data) {
                            if (err)
                                console.log(err, err.stack); // an error occurred
                            else {
                                //console.log("Num subscritpions: ", data.Subscriptions.length);
                                for (var i = 0; i < data.Subscriptions.length; i++) {
                                    subscriberList.push(data.Subscriptions[i].Endpoint)
                                }
                                // Use the subscriber list to send SMS through external vendor.
                                sendMsg(sid, messageText, subscriberList);
                            }
                        }); // listSubscriptionsByTopic
                    } // if alertLevel
                }
            });
        } // else (get shadow success)
    }); // getThingShadow
}

function sendMsg(sid, msgTxt, subsList) {
    var user = encodeURI(config.smsUser);
    var pass = encodeURI(config.smsPass);
    var sms_from = encodeURI(config.smsFrom);
    // Create a comma separared list of numbers. (max=10?)
    //var phoneList = document.write(subsList.join(", "));
    //
    var sms_server = 'www.isms.com.my';
    var path1 = "/isms_send_bulk.php?un=" + user + "&pwd=" + pass;
    var path2 = "&msg=" + encodeURI(msgTxt) + "&type=1";

    // TODO: Prepare the CSV while parsing SNS response.
    var subsCsvList = '';
    for (i = 0; i < subsList.length; i++) {
        subsCsvList = subsCsvList + "," + subsList[i];
    }

    var path3 = "&sendid=" + encodeURI(sms_from)
        + "&dstno=" + encodeURI(subsCsvList);
    //
    console.log(path1 + path2 + path3);

    var options = {
        host: sms_server,
        path: path1 + path2 + path3,
        //method: 'POST'
    };
    //var req = http.request(options, callback);
    var req = https.get(options, callback).end();
    // TODO: Update log based on SMS send response.
    storeInS3(sid, msgTxt, subsCsvList);

    var callback = function (response) {
        var str = '';

        //another chunk of data has been recieved, so append it to `str`
        response.on('data', function (chunk) {
            str += chunk;
        });
        response.on('error', (e) => {
            console.error(e);
        });
        //the whole response has been recieved, so we just print it out here
        response.on('end', function () {
            console.log('SMS Sent: ', str);
            // TODO: If error, write to S3?
        });
    }
}

function storeInS3(sid, smsMsg, subsCsvList) {
  var bucket_name = 'pubc5wl';
  var folder_name = 'sms_log';
  var ts = dateFormat(new Date(), "mmddyyyy-HHMMss")
  var s3_key = folder_name + '/' + sid + '-' + ts + '-sms.log';
  
  var dt = moment(new Date()).utcOffset('+0800').format("YYYY-MM-DD HH:mm:ss"); 
  var sms_report = sid + '\t' + dt + '\t' + subsCsvList 
		+ '\t' + smsMsg.replace(/(?:\r\n|\r|\n)/g, ', ');
  console.log('Report filename: ', s3_key);
  console.log('Log_msg: ', sms_report);
  var params = {
     Bucket : bucket_name,
     Key : s3_key,
     Body : sms_report
  }
/*
  var s3obj = new aws.S3(params);
  s3obj.upload({Body: body}).
    on('httpUploadProgress', function(evt) {
      console.log(evt);
    }).
    send(function(err, data) { console.log(err, data); });
*/
  var s3 = new AWS.S3();
  s3.putObject(params, function(err, data) {
    if (err) 
      console.log(err, err.stack); // an error occurred
    else
      console.log(data);           // successful response
    });
}

