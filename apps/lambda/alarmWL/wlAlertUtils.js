// Load the AWS SDK
var AWS = require("aws-sdk");
var http = require('http');

//module.exports.getAlertlevelRise = getAlertlevelRise;

module.exports = {
    getAlertlevelRise,
    getAlertlevelFall,
    getShadowState,
    composeSMS
};

function getAlertlevelRise(currWL, lastWL) {
    var alertLevel = 0;
    if ((currWL > 110) && (lastWL <= 110)) {
        // critical.
        alertLevel = 5;
    }
    if ((currWL > 100) && (lastWL <= 100)) {
        alertLevel = 4;
    }
    else if ((currWL > 90) && (lastWL <= 90)) {
        alertLevel = 3;
    }
    else if ((currWL > 75) && (lastWL <= 75)) {
        alertLevel = 2;
    }
    else if ((currWL > 50) && (lastWL <= 50)) {
        alertLevel = 1;
    }

    return alertLevel;

}

function getAlertlevelFall(currWL, lastWL) {
    var alertLevel = 0;
    if ((currWL < 50) && (lastWL >= 50)) {
        // Special value, to indicate change to normal level.
        alertLevel = 10;
    }
    if ((currWL < 75) && (lastWL >= 75)) {
        alertLevel = 1;
    }
    else if ((currWL < 90) && (lastWL >= 90)) {
        alertLevel = 2;
    }
    else if ((currWL < 100) && (lastWL >= 100)) {
        alertLevel = 3;
    }
    else if ((currWL < 110) && (lastWL >= 110)) {
        alertLevel = 4;
    }

    return alertLevel;

}

function getShadowState(iotdata, config) {
    var currDevState;
    console.log("Get Shadow for device: ", config);
    iotdata.getThingShadow({
        thingName: config.thingName
    }, function (err, data) {
        if (err) {
            //context.fail(err);
            // TODO:
            console.log("Error in getting Shadow.", err);
            //console.log("Request:");
            //console.log(this.request.httpRequest);
            //console.log("Response:");
            //console.log(this.httpResponse);
            return null;
        } else {
            console.log(data);
            var jsonPayload = JSON.parse(data.payload);
            var status = jsonPayload.state.reported.location;
            console.log('status: ' + status);
            currDevState = data;
            return currDevState;
        }
    });
}

function setShadowState(iotdata, config) {
    var newStatus = "5 battery rd";
    var update = {
        "state": {
            "desired": {
                "location": newStatus
            }
        }
    };
    iotdata.updateThingShadow({
        payload: JSON.stringify(update),
        thingName: config.thingName
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

//
function composeSMS(msg, alertLevel, wlRise, devState) {
    // Create a string extracting the click type and serial number from the message sent by the AWS IoT button
    if (!wlRise && alertLevel == 10) {
        // From Level 1 to normal.
    }
    var messageText = "Received  " + msg.wl + " message from button ID: " + msg.sid;
    // Write the string to the console
    console.log("Message to send: " + messageText);
    return messageText;
}
