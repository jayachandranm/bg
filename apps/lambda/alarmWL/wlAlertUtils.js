// Load the AWS SDK
var AWS = require("aws-sdk");
//var http = require('http');
var moment = require('moment');
var bs = require('binarysearch');
var math = require('mathjs')

//module.exports.getAlertlevelRise = getAlertlevelRise;

module.exports = {
    getAlertlevelRise,
    getAlertlevelFall,
    getShadowState,
    setShadowState,
    composeSMS
};

function getAlertlevelRise(currWL, lastWL, config) {
    var alertLevel = 0;
    var riseThresholds = config.riseThrs;
    //
    var thrBins = bs.rangeValue(riseThresholds, lastWL, currWL);
    var thrIdxRange = bs.range(riseThresholds, lastWL, currWL);
    // thrBins === undefined ||
    if (thrBins.length == 0) {
        // Neither value is within the range of interest. alertLevel remains 0.
        console.log("No Thr bins, both values outside threshold ranges, no alerts.");
    }
    if (thrBins.length == 1) {
        // Either both values are split across a threshold.
        // OR at least one of the values is exactly at the threshold.
        if(lastWL == thrBins[0]) {
            console.log("Single Thr bin, caused by last value on Thr, no alerts.");
        } 
        else {
            alertLevel = thrBins[0];
            console.log("Both values within same threshold range, no alerts.");
        }
    }
    if (thrBins.length > 1) {
        // A large jump, at least one complete threshold level. Mark this as alert and handle separately.
        alertLevel = thrBins[thrBins.length - 1];
        console.log("Large jump, at least one complete threshold range, set alert.");
    }
/*
    if ((currWL >= config.riseThr_cr) && (lastWL < config.riseThr_cr)) {
        // critical.
        alertLevel = 200;
    }
    else */
    /*
    if ((currWL >= config.riseThr_d) && (lastWL < config.riseThr_d)) {
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
    */

    return alertLevel;
}

function getAlertlevelFall(currWL, lastWL, delta, config) {
    var alertLevel = 0;
    var fallThresholds = config.fallThrs;
    //
    var Thr_a = config.fallThr_a - delta;
    var Thr_b = config.fallThr_b - delta;
    var Thr_c = config.fallThr_c - delta;
    var Thr_d = config.fallThr_d - delta;
    var Thr_cr = config.fallThr_cr - delta;
    //
    var fallThresholds2 = fallThresholds.map( function(value) { 
        return value - delta; 
    } );
    // Here currWL is the lower range than lastWL.
    var thrBins = bs.rangeValue(riseThresholds2, currWL, lastWL);
    var thrIdxRange = bs.range(riseThresholds2, currWL, lastWL);
    //
    if (thrBins.length == 0) {
        // Neither value is within the range of interest. alertLevel remains 0.
        console.log("No Thr bins, both values outside threshold ranges, no alerts.");
    }
    if (thrBins.length == 1) {
        // Either both values are split across a threshold.
        // OR at least one of the values is exactly at the threshold.
        if(lastWL == thrBins[0]) {
            console.log("Single Thr bin, caused by last value on Thr, no alerts.");
        } 
        else {
            alertLevel = thrBins[0];
            console.log("Both values within same threshold range, no alerts.");
        }
    }
    if (thrBins.length > 1) {
        // A large jump, at least one complete threshold level. Mark this as alert and handle separately.
        // For fall select the lower range value for threshold.
        alertLevel = thrBins[0];
        console.log("Large jump, at least one complete threshold range, set alert.");
    }

    /*
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
    */
/*
    else if ((currWL < Thr_cr) && (lastWL >= Thr_cr)) {
        alertLevel = 200;
    }
*/
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
            return null;
        } else {
            var jsonPayload = JSON.parse(data.payload);
            //console.log(jsonPayload);
            currDevState = data;
            return currDevState;
        }
    });
}

function setShadowState(iotdata, config) {
    var newStatus = config.mode;
    var update = {
        "state": {
            "desired": {
                "mode": newStatus
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
    //var dt = new Date(msg.ts);
    // 2017-04-13 10:21:39
    //var options = {};
    //options.timeZone = 'SG'; // UTC
    //options.timeZoneName = 'short';
    // date.toLocaleString();
    // moment().local() may not work as the AWS server may not be in SG timezone.
    console.log("TS-2: ", msg.ts);
    // moment (Date); 
    //var dt = moment(msg.ts).utcOffset('+0800').format("YYYY-MM-DD HH:mm:ss"); 
    var timeNow = new Date();
    console.log(timeNow.getHours() + ":" + timeNow.getMinutes() + ":" + timeNow.getSeconds());
    var dt = moment(timeNow).utcOffset('+0800').format("YYYY-MM-DD HH:mm:ss"); 
    //dt.format("YYYY-MM-DD hh:mm:ss");
    var alertLevelTxt = alertLevel.toString() + "%";
    if(alertLevel === 200) {
        alertLevelTxt = "Critical"
    }

    var lvlmtr = msg.wa/100;
    var copeLevel = devState.cope_level;
    
    var wlmrl = devState.invert_level + lvlmtr;
    var cope_m = copeLevel - devState.invert_level
    wlRiseTxt = "FALL";
    if(wlRise) {
        wlRiseTxt = "RISE";
    }
    //var messageText = "WGN " +msg.sid + "\n" 
    var messageText = msg.sid + "\n" 
	+ alertLevelTxt + "\n" 
	+ wlRiseTxt + "\n" 
	+ dt + "\n" 
	+ "Water Level:" + wlmrl.toFixed(2) + "mRL(" + lvlmtr.toFixed(2) + "m) \n" 
	+ "OPERATIONAL" + "\n"
	+ "Cope:" + copeLevel + "mRL(" + cope_m.toFixed(2) + "m) \n"
	+ devState.location;
    // Write the string to the console
    console.log("Message to send: " + messageText);
    return messageText;
}
