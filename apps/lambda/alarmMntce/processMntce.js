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
    var thingName = devMsg.sid;
    var battLevel = devMsg.bl;

    // May have to use history by accessing Shadow, or have a period of silence after an alert.
    // get shadow
    // if battery level < 80 and shadow batt_status = high, send alert.
    // set shadow batt_status = medium.
    // if batt_level < 60 and shadow batt_status = med, send alert.
    // set shadow batt_status = low.
    // From device, when batt_level > 70, if batt_status = low, set to medium.
    // From device, when batt_level > 90, if batt_statu = low/medium, set to high.
    var alertCondition = false;
    var devState;
    iotdata.getThingShadow({
        thingName: thingName
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
            //if((battLevel < config.warn_1) && (battState === "high")) {
            var messageText = '';
            if ((mode === "active")) {
                console.log("Device switched to maintenance mode.");
                messageText = composeMsg(devMsg, "switched to maintenance", devState);
                sendMsg(messageText);
                setShadowState("maintenance.");
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
        var messageText = "Switched to maintenance, "
            + " Station: " + devMsg.sid
            + " at time: " + dt.toLocaleString();
        // Write the string to the console
        console.log("Message to send: " + messageText);
        return messageText;
    }

    var setShadowState = function (status) {
        var newStatus = status;
        var update = {
            "state": {
                "desired": {
                    "mode": newStatus
                }
            }
        };
        iotdata.updateThingShadow({
            payload: JSON.stringify(update),
            thingName: thingName
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

