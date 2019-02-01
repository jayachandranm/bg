//console.log('Loading function');
// Load the AWS SDK
var AWS = require("aws-sdk");
//var http = require('http');
var https = require('https');
//var sync_request = require('sync-request');
var utils = require('./utils');
var config = require('./config.json');
var dateFormat = require('dateformat');
var moment = require('moment');


var iotdata = new AWS.IotData({endpoint: config.endpointAddress, region: 'ap-southeast-1'});

AWS.config.update({region: 'ap-southeast-1'});
var dynDoc = new AWS.DynamoDB.DocumentClient();
var parse = AWS.DynamoDB.Converter.output;

// Create an SNS object
var sns = new AWS.SNS({region: 'ap-southeast-1'});

module.exports.transformFlow = transformFlow;

//exports.handler = (event, context, callback) => {
function transformFlow(event, context, callback) {
    // Load the message passed into the Lambda function into a JSON object
    var msg = event;
    var eventText = JSON.stringify(msg, null, 2);
    // Log a message to the console, you can view this text in the Monitoring tab in the Lambda console or in the CloudWatch Logs console
    //console.log("Received msg from device:", eventText);
 
    var sid = msg.sid;
    //var thingName = sid; 
    var ts_unix = msg.ts;
    var ts_r = msg.ts_r;

    /*
    if(!sid.includes("TST")) {
        console.log("Not TEST device, ignore.")
        return;
    }
    */
    //
    console.log("New msg:", msg);
    //
    var tablename = 'pubc3fl-ddb';
    // If md is defined, do nothing, just return.
    //if (msg.hasOwnProperty(md) ) { // && msg.md !== null) {
    if (typeof(msg.md) !== 'undefined') { // && msg.md !== null) {
        var logMsg = "Either maintenance or spike. Recieved Record: " 
        console.log(logMsg, eventText);
        addToDDBexit(tablename, msg, logMsg, callback);
        // TODO: Needed?
        return;
    }

    var riseLevels = process.env.RISE_LVLS === undefined ? config.riseLvls : process.env.RISE_LVLS;
    var spikeRange = process.env.SPIKE_RANGE === undefined ? config.spikeRange : process.env.SPIKE_RANGE;

    var riseMinLvl = riseLevels[0];
    
    // Find the lowest threshold of concern. To optimize on processing.
    // https://docs.aws.amazon.com/apigateway/latest/developerguide/getting-started-lambda-non-proxy-integration.html
    //let name = event.name === undefined ? 'you' : event.name;
    var lowestLvl = riseMinLvl < fallMinLvl ? riseMinLvl : fallMinLvl;

    var devState;

    // Get prev value for this sid from DDB table.
    // As the new msg is not yet added to DDB, get most recent entry.
    var ddb_params = {
        TableName: tablename,
        KeyConditionExpression: 'sid = :hkey',
        ExpressionAttributeValues: {
            ':hkey': sid
        },
        ScanIndexForward: false,
        //Limit: 2,
        Limit: 1,
    };

    var record_0;
    console.log("Get previous record from DDB.");
    dynDoc.query(ddb_params, function (err, data) {
        if (err) {
            console.log(err, err.stack);
            // Something wrong with DDB, will not try to write the new msg.
            callback(err);
        }
        else {
            //record_1 = data.Items[0]; 
            record_0 = data.Items[0]; 
            lastWL = record_0.wl;
            console.log("Prev record: ", JSON.stringify(record_0, null, 2));
            if (typeof(record_0.md) !== 'undefined') {
                var logMsg = "Prev message is Spike or Maintenance. Exit."
                console.log(logMsg);
                addToDDBexit(tablename, msg, logMsg, callback);
                // TODO: Needed?
                return;
            }
            //
            // Handle possible device failure to detect spike.
            else if ((currWL >= spikeRange[1]) && (lastWL < spikeRange[0])) {
                console.log("Level increased by large margin. Set the device to maintenance mode.");
                // Write new msg to DDB.
                utils.addToDDB(tablename, msg, function (err, data) {
                    if (err) {
                        context.fail(err);
                    } else {
                        console.log("Spike, added new msg to DDB.");
                    }
                });
                // Set dev to maintenance mode.
                var config_mnt = {
                    mode: "maintenance",
                    thingName: msg.sid
                };
                utils.setShadowState(iotdata, config_mnt, function (err, data) {
                    if (err) {
                        context.fail(err);
                    } else {
                        console.log("Setting Shadow succeeded.");
                    }
                    callback(null, "Spike, device set to maintenance.");
                    return;
                });
            }
            else {
                iotdata.getThingShadow({
                    thingName: sid
                }, function (err, data) {
                    if (err) {
                        context.fail(err);
                        console.log("Error in getting Shadow.", err);
                    } else {
                        var jsonPayload = JSON.parse(data.payload);
                        console.log('Shadow: ' + JSON.stringify(jsonPayload, null, 2));
                        devState = jsonPayload.state.reported;
                        // var delta = devState.delta
                        // delta is handled at device side. Within delta range, wl sticks to previous value when wa changes.
                        var delta = devState.delta;
                        //
                        var wlRise = true;
                        if (currWL > lastWL) {
                            console.log("Level Rising..");
                            wlRise = true;
                            alertLevel = utils.getAlertlevelRise(currWL, lastWL, riseLevels);
                            console.log("Rise Level ->", alertLevel);
                            // Write new msg to DDB.
                            utils.addToDDB(tablename, msg, function (err, data) {
                                if (err) {
                                    context.fail(err);
                                } else {
                                    console.log("Added new msg to DDB.");
                                }
                            });
                        } 
                        else {
                            // If currWL==lastWL, no action. Just write to DDB.
                            var logMsg = "No Level change." 
                            console.log(logMsg);
                            addToDDBexit(tablename, msg, logMsg, callback);
                            // TODO: Needed?
                            return;
                        }
                        // May have to use history by accessing Shadow.
                        if (alertLevel != 0) {
                            var messageText = utils.composeSMS(msg, alertLevel, wlRise, devState);
                            //
                            var mainTopic = sid;
                            sendMsgByTopic(sid, mainTopic, messageText);
                            // Send message to level specific subscriptions.
                            // (Process in parallel).
                            var subTopic = sid + "-" + alertLevel.toString()
                            sendMsgByTopic(sid, subTopic, messageText);
                        } 
                    }
                }); // getThingShadow
            } // else
        
        } // dyn qyery, success
    }); // dyn qyery
} 

function addToDDBexit(tablename, msg, logMsg, callback) {
    utils.addToDDB(tablename, msg, function (err, data) {
        if (err) {
            context.fail(err);
        } else {
            console.log("Added new msg to DDB.");
        }
        callback(null, logMsg)
        // TODO: Needed?
        return;
    });
}

function sendMsgByTopic(sid, topicName, messageText) {
    //
    console.log("Topic: " + topicName);
    var subscriberList = new Array();
    var params_sns = {
        TopicArn: config.snsArn + ":" + topicName
        //NextToken: 'STRING_VALUE'
    };
    sns.listSubscriptionsByTopic(params_sns, function (err, data) {
        if (err)
            console.log(err, err.stack); // an error occurred
        else {
            //console.log("Num subscritpions: ", data.Subscriptions.length);
            for (var i = 0; i < data.Subscriptions.length; i++) {
                subscriberList.push(data.Subscriptions[i].Endpoint)
            }
            // Use the subscriber list to send SMS through external vendor.
            //console.log("sendMsg...");
            sendMsg(sid, messageText, subscriberList);
            //
        }
    }); // listSubscriptionsByTopic
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
    for (var i = 0; i < subsList.length; i++) {
        subsCsvList = subsCsvList + "," + subsList[i];
    }

    var path3 = "&sendid=" + encodeURI(sms_from)
        + "&dstno=" + encodeURI(subsCsvList);
    //
    //console.log(path1 + path2 + path3);

    var options = {
        host: sms_server,
        path: path1 + path2 + path3,
        //method: 'POST'
    };
    //var req = http.request(options, callback);
    var req = https.get(options, smsCallback).end();
    // TODO: Update log based on SMS send response.

    var smsCallback = function (response) {
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
