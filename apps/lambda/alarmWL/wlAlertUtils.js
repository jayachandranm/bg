// Load the AWS SDK
var AWS = require("aws-sdk");
var moment = require('moment');
var bs = require('binarysearch');
//var math = require('mathjs')

AWS.config.update({ region: 'ap-southeast-1' });
var dynDoc = new AWS.DynamoDB.DocumentClient();

module.exports = {
    getAlertlevelRise,
    getAlertlevelFall,
    //getShadowState,
    setShadowState,
    addToDDB,
    composeSMS
};

function getAlertlevelRise(currWL, lastWL, riseLevels) {
    var alertLevel = 0;
    //
    var lvlBins = bs.rangeValue(riseLevels, lastWL, currWL);
    //var lvlIdxRange = bs.range(riseLevels, lastWL, currWL);
    // thrBins === undefined ||
    if (lvlBins.length > 0) {
        console.log("Thr crossing/touching on Rise, check for alert.");
        console.log("Rise Lvl Bins (" + lvlBins.length + "): ", lvlBins);
        // Both values are split across a threshold.
        var selectedLvlBin = lvlBins[lvlBins.length - 1];
        //if (lastWL == selectedLvlBin) {
        if (currWL == selectedLvlBin) {
            // When Rise, currWL exactly on Thr-level is an alert.
            // Ignore lastWL exactly on Thr-level.
            console.log("Rise, curr value just on Thr, no alerts.");
        }
        else {
            alertLevel = selectedLvlBin;
            console.log("One or more Lvl bins, threshold cross, alert.");
        }
        /*
        // TODO: Possible spike case.
        // A large jump, at least one complete threshold level. 
        if (lvlBins.length > 1) {
            console.log("Large jump, possible spike.");
        }
        */
    } else {
        console.log("Rise, no crossing of any Thr, both values within same range, no alert.");
    }

    // TODO: Handle critical level.
    return alertLevel;
}

function getAlertlevelFall(currWL, lastWL, delta, fallLevels) {
    var alertLevel = 0;
    // Apply a small fix to clearly separate boundary crossing and touching.
    var crossFix = 0.01;
    var isDeltaRegion = false;
    var correctedWL = currWL;
    var alertObj = {};

    var fallLevels1 = fallLevels.map(function (value) {
        return value - crossFix;
    });
    // Subtract delta (with crossFix) from each fall level.
    var fallLevels2 = fallLevels1.map(function (value) {
        return value - delta;
    });
    console.log("Fall Thresholds: ", fallLevels1, fallLevels2, delta);

    // Do a threshold match with original thresholds, without delta.
    // For fall, currWL is the lower range than lastWL.
    // Use modified thresholds as the BS algo treats touching the threshold  
    // same as crossing the threshold. 
    // Using mod-thr, just touching mod-thr is already crossing for original thr.
    var lvlBinsNoDelta = bs.rangeValue(fallLevels1, currWL, lastWL);
    //var lvlIdxRangeNoDelta = bs.range(fallLevels1, currWL, lastWL);
    // If no crossing, no further check or action is needed.
    if (lvlBinsNoDelta.length == 0) {
        console.log("Fall, both values within same range, no alerts.");
        alertLevel = 0;
    }
    else {
        // If there is crossing, check crossing with delta applied.
        var lvlBins = bs.rangeValue(fallLevels2, currWL, lastWL);
        //var lvlIdxRange = bs.range(fallLevels2, currWL, lastWL);
        console.log("Fall Lvl Bins: ", lvlBins, lvlBinsNoDelta);
        //
        if (lvlBins.length > 0) {
            // Even if multiple level cross, use lowest val for alert.
            alertLevel = lvlBins[0] + delta + crossFix;
            console.log("One or more Lvl bins, threshold cross, alert.");

        }
        // Check whether currWL within delta region, to help adjust wl.
        // If lesser Thr crossing with delta, currWL in delta region.
        if (lvlBinsNoDelta.length > lvlBins.length) {
            console.log("Delta region.");
            isDeltaRegion = true;
            // Note: wl can be down to 59.999, then moved back to 60.
            correctedWL = lvlBinsNoDelta[0] + crossFix;
        }
    }
    //
    alertObj = {
        alertLevel: alertLevel,
        isDeltaRegion: isDeltaRegion,
        correctedWL: correctedWL
    }
    // TODO: Handle critical level.
    return alertObj;
}


/*
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
*/

function setShadowState(iotdata, config, callback) {
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
            console.log("Error in setting Shadow.");
            callback(err);
        } else {
            console.log(data);
            //context.succeed('newStatus: ' + newStatus);
            callback(null, data);
        }
    });
}

function addToDDB(tableName, msg, callback) {
    /*
        var params = {
            TableName: tableName,
            Item: {
                HashKey: 'haskey',
                NumAttribute: 1,
                BoolAttribute: true,
                ListAttribute: [1, 'two', false],
                MapAttribute: { foo: 'bar' },
                NullAttribute: null
            }
        };
    */
    var params = {
        TableName: tableName,
        Item: msg
    };

    dynDoc.put(params, function (err, data) {
        if (err) {
            console.log(err);
            callback(err);
        }
        else {
            //console.log(data);
            callback(null, data);
        }
    });
}

//
function composeSMS(msg, alertLevel, wlRise, devState) {
    var timeNow = new Date();
    console.log(timeNow.getHours() + ":" + timeNow.getMinutes() + ":" + timeNow.getSeconds());
    var dt = moment(timeNow).utcOffset('+0800').format("YYYY-MM-DD HH:mm:ss");
    var alertLevelTxt = alertLevel.toString() + "%";
    if (alertLevel === 200) {
        alertLevelTxt = "Critical"
    }

    var lvlmtr = msg.wa / 100;
    var copeLevel = devState.cope_level;

    var wlmrl = devState.invert_level + lvlmtr;
    var cope_m = copeLevel - devState.invert_level
    var wlRiseTxt = "FALL";
    if (wlRise) {
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

/*
var getClosestValues = function(a, x) {
    var lo = -1, hi = a.length;
    while (hi - lo > 1) {
        var mid = Math.round((lo + hi)/2);
        if (a[mid] <= x) {
            lo = mid;
        } else {
            hi = mid;
        }
    }
    if (a[lo] == x) hi = lo;
    return [a[lo], a[hi]];
}
*/

