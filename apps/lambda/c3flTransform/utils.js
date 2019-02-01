// Load the AWS SDK
var AWS = require("aws-sdk");
var moment = require('moment');
var bs = require('binarysearch');
//var math = require('mathjs')

AWS.config.update({ region: 'ap-southeast-1' });
var dynDoc = new AWS.DynamoDB.DocumentClient();

module.exports = {
    //getShadowState,
    setShadowState,
    addToDDB,
    composeSMS
};



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

