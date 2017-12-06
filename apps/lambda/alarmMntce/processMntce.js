// Load the AWS SDK
var AWS = require("aws-sdk");
//var utils = require('./wlAlertUtils');
var config = require('./config.json');

var iotdata = new AWS.IotData({endpoint: config.endpointAddress, region: 'ap-southeast-1'});
// Create an SNS object
var sns = new AWS.SNS({region: 'ap-southeast-1'});

module.exports.processMntce = processMntce;

// Set up the code to call when the Lambda function is invoked
//exports.handler = (event, context, callback) => {
function processMntce(devMsg, context) {
    // Load the message passed into the Lambda function into a JSON object
    var eventText = JSON.stringify(devMsg, null, 2);
    // Log a message to the console, you can view this text in the Monitoring tab in the Lambda console or in the CloudWatch Logs console
    console.log("Received event:", eventText);
    //
    var sid = devMsg.sid;

    // 
    var alertCondition = false;
    var devState;
    iotdata.getThingShadow({
        thingName: sid
    }, function (err, data) {
        if (err) {
            context.fail(err);
            console.log("Error in getting Shadow.", err);
        } else {
            var jsonPayload = JSON.parse(data.payload);
            console.log('Shadow: ' + jsonPayload);
            //console.log('status: ' + status);
            devState = jsonPayload.state.reported;
            var mode = devState.mode;
            var messageText = '';
	    // If Shadow mode is active, this is first maintenance message.
            if ((mode === "active")) {
                console.log("Device initiated switch to maintenance mode.");
                messageText = composeMsg(devMsg, "switched to maintenance", devState);
                sendMsg(messageText);
                setShadowState("maintenance");
            }

        } // else
    }); // getThingShadow


    var sendMsg = function (messageText) {

        var topic = config.snsArn + ":" + config.snsMntceTopic; //+ event.station_id;
        // Populate the parameters for the publish operation
        // - Message : the text of the message to send
        // - TopicArn : the ARN of the Amazon SNS topic to which you want to publish
        var params = {
            Message: messageText,
            TopicArn: topic
        };
        sns.publish(params, context.done);
    } // if

    //
    var composeMsg = function (devMsg, alertMsg, devState) {
        // Create a string extracting the click type and serial number from the message sent by the AWS IoT button
	var dt = new Date(devMsg.ts);
        var messageText = " Station: " + devMsg.sid
            + alertMsg
            + " at time: " + dt.toLocaleString();
        // Write the string to the console
        console.log("Message to send: " + messageText);
        return messageText;
    }

    var setShadowState = function (val) {
        var newStatus = val;
        var update = {
            "state": {
                "desired": {
                    "mode": newStatus
                }
            }
        };
        iotdata.updateThingShadow({
            payload: JSON.stringify(update),
            thingName: sid
        }, function (err, data) {
            if (err) {
                //context.fail(err);
                console.log("Error in setting Shadow.")
            } else {
                console.log(data);
                //context.succeed('newStatus: ' + newStatus);
                console.log("Setting Shadow succeeded.")
            }
        });
    }
}

