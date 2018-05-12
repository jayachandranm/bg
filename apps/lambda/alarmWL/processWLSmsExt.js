//console.log('Loading function');
// Load the AWS SDK
var AWS = require("aws-sdk");
//var http = require('http');
var https = require('https');
//var sync_request = require('sync-request');
var utils = require('./wlAlertUtils');
var config = require('./config.json');
var dateFormat = require('dateformat');
var moment = require('moment');


var iotdata = new AWS.IotData({endpoint: config.endpointAddress, region: 'ap-southeast-1'});
//var iotdata = new AWS.IotData({endpoint: config.endpointAddress});

AWS.config.update({region: 'ap-southeast-1'});
dynDoc = new AWS.DynamoDB.DocumentClient();
var parse = AWS.DynamoDB.Converter.output;

// Create an SNS object
var sns = new AWS.SNS({region: 'ap-southeast-1'});

module.exports.processWL = processWL;
//processWL(mqttmsg, null);

// Set up the code to call when the Lambda function is invoked
//exports.handler = (event, context, callback) => {
function processWL(stream, context, callback) {
    // Load the message passed into the Lambda function into a JSON object
    //var eventText = JSON.stringify(msg, null, 2);
    var record_0 = stream.Records[0].dynamodb;
    var eventText = JSON.stringify(record_0, null, 2);
    // Log a message to the console, you can view this text in the Monitoring tab in the Lambda console or in the CloudWatch Logs console
    //console.log("Received DDB record-0:", eventText);
 
    var msg_0 = record_0.NewImage;
    var msg = parse({"M": msg_0});
    //console.log("Received DDB record-0 (NewImage):", JSON.stringify(msg_0, null, 2));
    var currWL = msg.wl;
    var lastWL = currWL;
    //var lastWL = msg.hs.wl_1;
    var sid = msg.sid;
    //var thingName = sid; 
    var ts_unix = msg.ts;
    var ts_r = msg.ts_r;

    if(!sid.includes("TST")) {
        console.log("Not TEST device, ignore.")
        return;
    }
    //
    console.log("New msg:", msg);

    // If md is defined, do nothing, just return.
    //if (msg.hasOwnProperty(md) ) { // && msg.md !== null) {
    if (typeof(msg.md) !== 'undefined') { // && msg.md !== null) {
        console.log("Flag md set, either maintenance or spike. Recieved Record: ", eventText);
        callback(null, "Maintenance, Exit.");
        return;
    }

    var riseLevels = process.env.RISE_LVLS === undefined ? config.riseLvls : process.env.RISE_LVLS;
    var fallLevels = process.env.FALL_LVLS === undefined ? config.fallLvls : process.env.FALL_LVLS;
    var crLvl = process.env.CR_LVL === undefined ? config.riseLvl_cr : process.env.CR_LVL;
    var spikeRange = process.env.SPIKE_RANGE === undefined ? config.spikeRange : process.env.SPIKE_RANGE;

    var riseMinLvl = riseLevels[0];
    var fallMinLvl = fallLevels[0];

    // Find the lowest threshold of concern. To optimize on processing.
    // https://docs.aws.amazon.com/apigateway/latest/developerguide/getting-started-lambda-non-proxy-integration.html
    //let name = event.name === undefined ? 'you' : event.name;
    var lowestLvl = riseMinLvl < fallMinLvl ? riseMinLvl : fallMinLvl;

    var alertLevel = 0;
    var devState;

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
            record_1 = data.Items[1];
            lastWL = record_1.wl;
            console.log("Prev record: ", JSON.stringify(record_1, null, 2));
            if (typeof(record_1.md) !== 'undefined') {
                console.log("Flag md (maintenance or spike) set in prev msg. Skip.");
                callback(null, "Prev message is Spike or Maintenance. Exit.");
                return;
            }
            //
            else if( (currWL < lowestLvl) && (lastWL < lowestLvl) ) {
                // If both current and last values are below lowest thresholds, no further processing required.
                console.log("Current and Prev values below Threshold, nothing to process.");
                callback(null, "Both values out of active range. Exit.")
                return;
            }
            // Handle possible device failure to detect spike.
            else if ((currWL >= spikeRange[1]) && (lastWL < spikeRange[0])) {
                // Set dev to maintenance mode.
                console.log("Level increased by large margin. Set the device to maintenance mode.");
                var config_mnt = {
                    mode: "maintenance",
                    thingName: msg.sid
                };
                utils.setShadowState(iotdata, config_mnt, function (err, data) {
                    if (err) {
                        //console.log("Error in setting Shadow.");
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
                        //console.log('Shadow: ' + JSON.stringify(jsonPayload, null, 2));
                        devState = jsonPayload.state.reported;
                        // var delta = devState.delta
                        // delta is handled at device side. Within delta range, wl sticks to previous value when wa changes.
                        var delta = 0;
                        //
                        var wlRise = true;
                        if (currWL > lastWL) {
                            console.log("Level Rising..");
                            wlRise = true;
                            alertLevel = utils.getAlertlevelRise(currWL, lastWL, riseLevels);
                            console.log("Rise Level ->", alertLevel);
                        } 
                        else if (currWL < lastWL) {
                            console.log("Level Falling..");
                            wlRise = false;
                            alertLevel = utils.getAlertlevelFall(currWL, lastWL, delta, fallLevels);
                            console.log("Fall Level ->", alertLevel);
                        }
                        else {
                            // If currWL==lastWL, no action.
                            console.log("No Level change.");
                        }
                        // May have to use history by accessing Shadow.
                        if (alertLevel) {
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
    //var ts = dateFormat(new Date(), "mmddyyyy-HHMMss")
    //var s3_key = folder_name + '/' + sid + '-' + ts + '-sms.log';
    var smsDate = dateFormat(new Date(), "mmddyyyy");
    var smsTime = dateFormat(new Date(), "HHMMss");
    var s3_key = folder_name + '/d' + smsDate + '/' + sid + '-' + smsTime + '_sms.log';

    var dt = moment(new Date()).utcOffset('+0800').format("YYYY-MM-DD HH:mm:ss");
    var sms_report = sid + '\t' + dt + '\t' + subsCsvList
        + '\t' + smsMsg.replace(/(?:\r\n|\r|\n)/g, ', ');
    console.log('Report filename: ', s3_key);
    console.log('Log_msg: ', sms_report);
    var params = {
        Bucket: bucket_name,
        Key: s3_key,
        Body: sms_report
    }
    var s3 = new AWS.S3();
    s3.putObject(params, function (err, data) {
        if (err)
            console.log(err, err.stack); // an error occurred
        else
            console.log(data);           // successful response
    });
}

