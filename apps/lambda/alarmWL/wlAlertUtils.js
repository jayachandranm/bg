// Load the AWS SDK
var AWS = require("aws-sdk");
var http = require('http');
var moment = require('moment');

//module.exports.getAlertlevelRise = getAlertlevelRise;

module.exports = {
    getAlertlevelRise,
    getAlertlevelFall,
    getShadowState,
    composeSMS
};

function getAlertlevelRise(currWL, lastWL, config) {
    var alertLevel = 0;
    if ((currWL >= config.riseThr_cr) && (lastWL < config.riseThr_cr)) {
        // critical.
        alertLevel = 200;
    }
    else if ((currWL >= config.riseThr_d) && (lastWL < config.riseThr_d)) {
        alertLevel = 100;
    }
    else if ((currWL >= config.riseThr_c) && (lastWL < config.riseThr_c)) {
        alertLevel = 90;
    }
    else if ((currWL >= config.riseThr_b) && (lastWL < config.riseThr_b)) {
        alertLevel = 75;
    }
    else if ((currWL >= config.riseThr_a) && (lastWL < config.riseThr_a)) {
        alertLevel = 50;
    }

    return alertLevel;

}

function getAlertlevelFall(currWL, lastWL, delta, config) {
    var alertLevel = 0;
    var Thr_a = config.fallThr_a - delta;
    var Thr_b = config.fallThr_b - delta;
    var Thr_c = config.fallThr_c - delta;
    var Thr_d = config.fallThr_d - delta;
    var Thr_cr = config.fallThr_cr - delta;
    if ((currWL < Thr_a) && (lastWL >= Thr_a)) {
        // Special value, to indicate change to normal level.
        alertLevel = 50;
    }
    else if ((currWL < Thr_b) && (lastWL >= Thr_b)) {
        alertLevel = 75;
    }
    else if ((currWL < Thr_c) && (lastWL >= Thr_c)) {
        alertLevel = 90;
    }
    else if ((currWL < Thr_d) && (lastWL >= Thr_d)) {
        alertLevel = 100;
    }
    else if ((currWL < Thr_cr) && (lastWL >= Thr_cr)) {
        alertLevel = 200;
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
            var jsonPayload = JSON.parse(data.payload);
            //console.log(jsonPayload);
            currDevState = data;
            return currDevState;
        }
    });
}

/*
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
*/

//
function composeSMS(msg, alertLevel, wlRise, devState) {
    // Create a string extracting the click type and serial number from the message sent by the AWS IoT button
/*
    if (!wlRise && alertLevel == 10) {
        // From Level 1 to normal.
    }
*/
    //var dt = new Date(msg.ts);
    // 2017-04-13 10:21:39
    //var options = {};
    //options.timeZone = 'SG'; // UTC
    //options.timeZoneName = 'short';
    // date.toLocaleString();
    // moment().local() may not work as the AWS server may not be in SG timezone.
    var dt = moment(msg.ts).utcOffset('+0800').format("YYYY-MM-DD HH:mm:ss"); // moment (Date);
    //dt.format("YYYY-MM-DD hh:mm:ss");
    var alertLevelTxt = alertLevel.toString() + "%";
    if(alertLevel === 200) {
        alertLevelTxt = "Critical"
    }

    var lvlmtr = msg.wl/100;
    
    var wlmrl = devState.cope_level + lvlmtr;
    wlRiseTxt = "FALL";
    if(wlRise) {
        wlRiseTxt = "RISE";
    }
    var messageText = msg.sid + "\n" 
	+ alertLevelTxt + "\n" 
	+ wlRiseTxt + "\n" 
	+ dt + "\n" 
	+ "Water Level:" + wlmrl + "mRL(" + lvlmtr + "m) \n" 
	+ "OPERATIONAL" + "\n"
	+ "Cope:" + devState.cope_level + "mRL(1.0m) \n"
	+ devState.location;
    // Write the string to the console
    console.log("Message to send: " + messageText);
    return messageText;
}
