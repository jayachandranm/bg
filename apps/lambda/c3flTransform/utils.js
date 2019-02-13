// Load the AWS SDK
var AWS = require("aws-sdk");
//var moment = require('moment');
//var math = require('mathjs')

AWS.config.update({ region: 'ap-southeast-1' });
var dynDoc = new AWS.DynamoDB.DocumentClient();

module.exports = {
    //getShadowState,
    setShadowState
    //addToDDB
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

