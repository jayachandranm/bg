// Load the AWS SDK
var AWS = require("aws-sdk");
//var utils = require('./wlAlertUtils');
var config = require('./config.json');

var iotdata = new AWS.IotData({endpoint: config.endpointAddress, region: 'ap-southeast-1'});
// Create an SNS object
var sns = new AWS.SNS({region: 'ap-southeast-1'});

module.exports.processSpike = processSpike;

// Set up the code to call when the Lambda function is invoked
//exports.handler = (event, context, callback) => {
function processSpike(devMsg, context) {
    // Load the message passed into the Lambda function into a JSON object
    var eventText = JSON.stringify(devMsg, null, 2);
    console.log("Received event:", eventText);
    //
    var sid = devMsg.sid;
    var mode = devMsg.md;
    var SPIKE_PERIOD_THR = config.spikeDur_Thr; //30*60*1000; // 30mts.
    // If mode != spike, something wrong, send alert and return.
    if(mode != "spike") {
        // Alert.
        console.log("Expected md to be spike, but received non-spike.");
        return;
    }
    // Get Shadow, spike_time
    var devState;
    iotdata.getThingShadow({
        thingName: sid
    }, function (err, data) {
        if (err) {
            context.fail(err);
            console.log("Error in getting Shadow.", err);
        } else {
            var jsonPayload = JSON.parse(data.payload);
            console.log('Shadow: ' + jsonPayload.toString());
            //console.log('status: ' + status);
            devState = jsonPayload.state.reported;
            var spikeTime = devState.spike_time;
            var timeNow = Date.now();
            if(spikeTime === -1) {
                // spike just detected
                // send alert, set current time as spike_time.
                messageText = composeMsg(devMsg, "Spike detected.", devState);
                sendMsg(messageText);
                setShadowState("spike_time", timeNow);
            }
            else {
                // get spike_duration.
                var spikeDuration = timeNow - spikeTime;
                if(spikeDuration > SPIKE_PERIOD_THR) {
                    // set dev to maintenance. Future MQTT messages will not come to this Lambda.
                    messageText = composeMsg(devMsg, "Switching from Spike to Maintenance.", devState);
                    sendMsg(messageText);
                    setShadowState("mode", "maintenance");
                }
            }
        }
    });


    var sendMsg = function (messageText) {

        var topic = config.snsArn + ":" + config.snsBattTopic; //+ event.station_id;
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
        var messageText = alertMsg 
            + " for Station: " + sid
            + " at time: " + dt.toLocaleString();
        // Write the string to the console
        console.log("Message to send: " + messageText);
        return messageText;
    }

    var setShadowState = function (state, val) {
        var newStatus = val;
        var update;
	// Whenever there is a mode change, spike_time is reset.
        if(state === "mode") {
            update = {
                "state": {
                    "desired": {
                        "mode": newStatus,
                        "spike_time": -1
                    }
                }
            };
        }
        else if(state === "spike_time") {
            //
            update = {
                "state": {
                    "desired": {
                        "spike_time": newStatus
                    }
                }
            };
        }
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

