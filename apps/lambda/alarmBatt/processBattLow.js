    console.log('Loading function');
// Load the AWS SDK
var AWS = require("aws-sdk");

var iotdata = new AWS.IotData({endpoint: "a1spluk5rusbj4.iot.ap-southeast-1.amazonaws.com", region: 'ap-southeast-1'});

// Set up the code to call when the Lambda function is invoked
exports.handler = (event, context, callback) =>
{
    // Load the message passed into the Lambda function into a JSON object
    var eventText = JSON.stringify(event, null, 2);
    // Log a message to the console, you can view this text in the Monitoring tab in the Lambda console or in the CloudWatch Logs console
    console.log("Received event:", eventText);
    //
    var msg = event;
    var thingName = event.sid;
    var battLevel = event.bl;

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
            var battState = devState.battery_status;
            //if((battLevel < config.warn_1) && (battState === "high")) {
            var messageText = '';
            if ((battLevel < 80) && (battState === "high")) {
                console.log("Battery level changing from high to medium");
                messageText = composeSMS(msg, "discharged to medium", devState);
                sendSMS(messageText);
                setShadowState("medium");
            }
            if ((battLevel < 60) && ((battState === "medium") || (battState === "high"))) {
                console.log("Battery level changing from medium/high to low");
                messageText = composeSMS(msg, "discharged to low", devState);
                sendSMS(messageText);
                setShadowState("low");
            } // if
            if ((battLevel > 65) && (battState === "low")) {
                console.log("Battery level changing from low to medium");
                messageText = composeSMS(msg, "charged to medium", devState);
                sendSMS(messageText);
                setShadowState("medium");
            }
            if ((battLevel > 85) && ((battState === "medium") || (battState === "low"))) {
                console.log("Battery level changing from medium/low to high");
                messageText = composeSMS(msg, "charged to high", devState);
                sendSMS(messageText);
                setShadowState("low");
            } // if

        } // else
    }); // getThingShadow


    var sendSMS = function(messageText) {

        // Create an SNS object
        var sns = new AWS.SNS();

        var topic = "arn:aws:sns:ap-southeast-1:433339126986:WSS01_alarm" //+ event.station_id;
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
    var composeSMS = function(topic, msg, devState) {
        // Create a string extracting the click type and serial number from the message sent by the AWS IoT button
        var messageText = "Battery " + msg  
            + ", Level= " + topic.bl
            + " from Station: " + topic.sid
            + " at time: " + topic.ts_r;
        // Write the string to the console
        console.log("Message to send: " + messageText);
        return messageText;
    }
    
    var setShadowState = function(status) {
    var newStatus = status;
    var update = {
        "state": {
            "desired": {
                "battery_status": newStatus
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

