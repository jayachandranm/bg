// Load the AWS SDK
var AWS = require("aws-sdk");
var moment = require('moment');
var bs = require('binarysearch');
//var math = require('mathjs')

AWS.config.update({region: 'ap-southeast-1'});
dynDoc = new AWS.DynamoDB.DocumentClient();


module.exports = {
    getAlertlevelRise,
    getAlertlevelFall,
    //getShadowState,
    setShadowState,
    composeSMS
};

function getAlertlevelRise(currWL, lastWL, riseLevels) {
    var alertLevel = 0;
    //
    var lvlBins = bs.rangeValue(riseLevels, lastWL, currWL);
    var lvlIdxRange = bs.range(riseLevels, lastWL, currWL);
    // thrBins === undefined ||
    alertLevel = getAlertLevel(lvlBins, lastWL, true);
    // TODO: Handle critical level.
    return alertLevel;
}

function getAlertlevelFall(currWL, lastWL, delta, fallLevels) {
    var alertObj = {};
    var alertLevel = 0;
    var isDeltaRegion = false;
    var correctedWL = currWL;

    // Subtract delta from each fall level.
    var fallLevels2 = fallLevels.map( function(value) { 
        return value - delta; 
    });
    // Here currWL is the lower range than lastWL.
    var lvlBins = bs.rangeValue(fallLevels2, currWL, lastWL);
    var lvlIdxRange = bs.range(fallLevels2, currWL, lastWL);
    //
    // Check whether within delta region, to help adjust wl.
    // Do a threshold match with original thresholds, without delta.
    var lvlBinsNoDelta = bs.rangeValue(fallLevels, currWL, lastWL);
    var lvlIdxRangeNoDelta = bs.range(fallLevels, currWL, lastWL);
    if(lvlBinsNoDelta.length > lvlBins.length) {
        // The fall value is within a delta region.
        isDeltaRegion = true;
        correctedWL = lvlBinsNoDelta[0];
    }
    //
    alertLevel = getAlertLevel(lvlBins, lastWL, false);
    alertObj = {
        "alertLevel" : alertLevel,
        "isDeltaRegion" : isDeltaRegion,
        "correctedWL" : correctedWL
    }
    // TODO: Handle critical level.
    //return alertLevel;
    return alertObj;
}

function getAlertLevel(lvlBins, lastWL, isRise) {
    var alertLevel = 0;
    if (lvlBins.length == 0) {
        // Neither value is within the range of interest. alertLevel remains 0.
        console.log("No Lvl bins, both values within same range, no alerts.");
    }
    if (lvlBins.length == 1) {
        // Either both values are split across a threshold.
        // OR at least one of the values is exactly at the threshold.
        if(lastWL == lvlBins[0]) {
            // Whether Rise or Fall, in this case the bs detected value is lastWL.
            console.log("Single Lvl bin, but last value exactly on Thr, no alerts.");
        } 
        else {
            alertLevel = lvlBins[0];
            console.log("Single Lvl bin, threshold cross, create alert.");
        }
    }
    if (lvlBins.length > 1) {
        // A large jump, at least one complete threshold level. Mark this as alert and handle separately.
        console.log("Large jump, at least one complete threshold range, set alert.");
        if(isRise) {
            alertLevel = lvlBins[lvlBins.length - 1];
            // TODO: Possible spike case.
        } else {
            // For fall select the lower range value for threshold.
            alertLevel = lvlBins[0];
        }
    }
    return alertLevel;
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

    var params = {
        TableName: 'Table',
        Item: {
            HashKey: 'haskey',
            NumAttribute: 1,
            BoolAttribute: true,
            ListAttribute: [1, 'two', false],
            MapAttribute: { foo: 'bar' },
            NullAttribute: null
        }
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
    if(alertLevel === 200) {
        alertLevelTxt = "Critical"
    }

    var lvlmtr = msg.wa/100;
    var copeLevel = devState.cope_level;
    
    var wlmrl = devState.invert_level + lvlmtr;
    var cope_m = copeLevel - devState.invert_level
    var wlRiseTxt = "FALL";
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

