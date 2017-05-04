console.log('Loading function');
// Load the AWS SDK
var AWS = require("aws-sdk");
var http = require('http');
var utils = require('./wlAlertUtils');
var config = require('./config.json');
//var mqttmsg = require('./mqtt.json');

var iotdata = new AWS.IotData({endpoint: config.endpointAddress, region: 'ap-southeast-1'});
//var iotdata = new AWS.IotData({endpoint: config.endpointAddress});

// Create an SNS object
var sns = new AWS.SNS({region: 'ap-southeast-1'});

module.exports.processWL = processWL;
//processWL(mqttmsg, null);

// Set up the code to call when the Lambda function is invoked
//exports.handler = (event, context, callback) => {
function processWL(msg, context) {
    // Load the message passed into the Lambda function into a JSON object
    var eventText = JSON.stringify(msg, null, 2);
    // Log a message to the console, you can view this text in the Monitoring tab in the Lambda console or in the CloudWatch Logs console
    console.log("Received event:", eventText);

    var currWL = msg.wl;
    var lastWL = msg.history.wl_1;
    config.thingName = msg.sid;
    var sid = msg.sid;

    var alertLevel = 0;
    var wlRise = true;
    if (currWL > lastWL) {
        wlRise = true;
        alertLevel = utils.getAlertlevelRise(currWL, lastWL);
        console.log("Level Rising ->", alertLevel);
    }

    if (currWL < lastWL) {
        wlRise = false;
        alertLevel = utils.getAlertlevelFall(currWL, lastWL);
        console.log("Level Falling ->", alertLevel);
    }

    // May have to use history by accessing Shadow.
    if (alertLevel) {
        // Make sure that thing name is same as station id.
        // TODO : test
        config.thingName = "hello";
        /*
         var devState = utils.getShadowState(iotdata, config);
         console.log("devState: ", devState);
         //
         if(devState == null) {
         return "Error";
         }
         */
        var devState;
        var subscriberList = new Array();
        iotdata.getThingShadow({
            thingName: config.thingName
        }, function (err, data) {
            if (err) {
                context.fail(err);
                console.log("Error in getting Shadow.", err);
            } else {
                var jsonPayload = JSON.parse(data.payload);
                var status = jsonPayload.state.reported.location;
                console.log('status: ' + status);
                devState = data;
                var messageText = utils.composeSMS(msg, alertLevel, wlRise, devState);

                var topic = config.snsTopicArn + ":" + sid;
                var params2 = {
                    TopicArn: config.snsTopicArn + ":" + "MyIoTTestTopic"
                    //NextToken: 'STRING_VALUE'
                };
                console.log("SNS params: ", params2);
                sns.listSubscriptionsByTopic(params2, function (err, data) {
                    if (err)
                        console.log(err, err.stack); // an error occurred
                    else {
                        console.log(data.Subscriptions[0].Endpoint);           // successful response
                        console.log(data.Subscriptions[1].Endpoint);
                        for (var i = 0; i < data.Subscriptions.length; i++) {
                            subscriberList.push(data.Subscriptions[i].Endpoint)
                        }
                        // Use the subscriber list to send SMS through external vendor.
                        sendMsg(messageText, subscriberList);
                    }
                });
            }
        });
    } // if
//
}

function sendMsg(msg, subsList) {
    var user = config.smsUser;
    var pass = config.smsPass;
    var sms_from = config.smsFrom;
    // Create a comma separared list of numbers. (max=10?)
    //var phoneList = document.write(subsList.join(", "));
    //
    var sms_server = 'gateway80.onewaysms.sg';
    var path1 = "/api2.aspx?apiusername=" + user + "&apipassword=" + pass;
    var path2 = "&message=" + encodeURI(msg) + "&languagetype=1";

    for (i = 0; i < subsList.length; i++) {
        var path3 = "&senderid=" + encodeURI(sms_from)
            + "&mobileno=" + encodeURI(subsList[i]);
	//
        console.log(path1 + path2 + path3);
        var options = {
            host: sms_server,
            path: path1 + path2 + path3,
            //method: 'POST'
        };
        //var req = http.request(options, callback);
        var req = http.get(options, callback);
    }
    /*
     req.write("hello world!");
     req.end();
     */
    var callback = function (response) {
        var str = '';

        //another chunk of data has been recieved, so append it to `str`
        response.on('data', function (chunk) {
            str += chunk;
        });

        //the whole response has been recieved, so we just print it out here
        response.on('end', function () {
            console.log(str);
            // TODO: If error, write to S3?
        });
    }
}

