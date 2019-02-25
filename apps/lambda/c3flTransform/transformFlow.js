//console.log('Loading function');
// Load the AWS SDK
var AWS = require("aws-sdk");
//var http = require('http');
//var https = require('https');
//var sync_request = require('sync-request');
var utils = require('./utils');
var config = require('./config.json');
//var dateFormat = require('dateformat');
//var moment = require('moment');

var iotdata = new AWS.IotData({ endpoint: config.endpointAddress, region: 'ap-southeast-1' });

AWS.config.update({ region: 'ap-southeast-1' });
var dynDoc = new AWS.DynamoDB.DocumentClient();
//var parse = AWS.DynamoDB.Converter.output;

// Create an SNS object
var sns = new AWS.SNS({ region: 'ap-southeast-1' });

var tablename = 'pubc3flow-ddb';

//module.exports.transformFlow = transformFlow;
exports.handler = function (event, context, callback) {
    transformFlow(event, context, callback);
    //callback(null, "WL processed.");
};

//exports.handler = (event, context, callback) => {
function transformFlow(event, context, callback) {
    // Load the message passed into the Lambda function into a JSON object
    var msg = event;
    var eventText = JSON.stringify(msg, null, 2);
    //console.log("Received msg from device:", eventText);
    console.log("MQTT msg:", eventText);

    var sid = msg.sid;
    var ts = msg.ts;
    // If date is before Jan'2015 or after Jan'2025, ignore.
    // To handle time received in ts_r for stored data (converted to ts in Rule).
    if (ts < 1420045261000 || ts > 1735664461000) {
        var logMsg = "ts out of range, ignore data."
        console.log(sid + ": error, " + logMsg);
        callback(logMsg);
        return;
    }
    //var thingName = sid;
    var sensorType = msg.ty;
    // TODO: Check default value.
    // TODO: For now all values are received as string.
    // TODO: test.
    var fl = msg.fl === undefined ? undefined : msg.fl;
    var vl = msg.vl === undefined ? undefined : msg.vl / 1000;
    var wa = msg.wa === undefined ? undefined : msg.wa / 10000;

    // TODO: test
    //wa = 1;

    var newmsg = {};
    newmsg.sid = sid;
    newmsg.ts = msg.ts;
    newmsg.ts_r = msg.ts_r;
    newmsg.ty = sensorType;
    //
    // Convert to appropriate scales.
    //newmsg.wa = wa;
    newmsg.vl = vl;
    newmsg.wt = msg.wt === undefined ? undefined : msg.wt / 100;
    newmsg.snr = msg.snr === undefined ? undefined : msg.snr;
    newmsg.ss = msg.ss === undefined ? undefined : msg.ss;
    newmsg.sp = msg.sp === undefined ? undefined : msg.sp;
    newmsg.bl = msg.bl === undefined ? undefined : msg.bl / 100;
    newmsg.bd = msg.bd === undefined ? undefined : msg.bd / 100;
    newmsg.ra = msg.ra === undefined ? undefined : msg.ra / 1000;
    newmsg.rt = msg.rt === undefined ? undefined : msg.rt;
    newmsg.rd = msg.rd === undefined ? undefined : msg.rd / 1000;
    newmsg.wr = msg.wr === undefined ? undefined : msg.wr / 10000;
    //
    newmsg.err = msg.err === undefined ? undefined : msg.err;

    /*
    if(!sid.includes("TST")) {
        console.log("Not TEST device, ignore.")
        return;
    }
    */

    // If md is defined, keep it in the DDB, else no field in the DDB.
    //if (msg.hasOwnProperty(md) ) { // && msg.md !== null) {
    //var md = msg.md === undefined ? undefined : msg.md;
    if (typeof (msg.md) !== 'undefined') { // && msg.md !== null) {
        if (msg.md == 1) {
            var logMsg = sid + ": maintenance mode."
            console.log(logMsg, eventText);
            newmsg.md = "maintenance";
            // Continue to process rest of the data before writing to DDB.
            //addToDDBexit(tablename, newmsg, callback);
        }
        else if (msg.md == 0) {
            newmsg.md = undefined;
        }
    }

    var ddb_params = {
        TableName: tablename,
        KeyConditionExpression: 'sid = :hkey',
        ExpressionAttributeValues: {
            ':hkey': sid
        },
        ScanIndexForward: false,
        Limit: 1,
    };

    var record_0;
    var ts_0 = -1;
    console.log("Get previous record from DDB.");
    dynDoc.query(ddb_params, function (err, data) {
        if (err) {
            console.log(err, err.stack);
            // Something wrong with DDB, will not try to write the new msg.
            callback(err);
        }
        else {
            //record_1 = data.Items[0]; 
            try {
                record_0 = data.Items[0];
                ts_0 = record_0.ts;
            }
            catch (ex) {
                console.log(sid + ex.message + "No previous record.");
            }
            //console.log("Prev record: ", JSON.stringify(record_0, null, 2));
            console.log(sid + ": prev ts: ", ts_0);
        }
    });

    // TODO: Adjust sampling rate.
    var ts_diff = ts - ts_0;

    //let name = event.name === undefined ? 'you' : event.name;
    var devState;
    iotdata.getThingShadow({
        thingName: sid
    }, function (err, data) {
        if (err) {
            context.fail(err);
            console.log("Error in getting Shadow.", err);
        } else {
            // TODO: check that shadow is not empty.
            var jsonPayload = JSON.parse(data.payload);
            console.log(sid + ' shadow: ' + JSON.stringify(jsonPayload, null, 2));
            devState = jsonPayload.state.reported;
            var offset = devState.offset === undefined ? 0 : Number(devState.offset);
            var cope = devState.cope_level === undefined ? 0 : Number(devState.cope_level);
            var invert = devState.invert_level === undefined ? 0 : Number(devState.invert_level);

            var wh = 0;
            if (sensorType == 1 || sensorType == 2) {
                wh = wa + offset;
            } else if (sensorType == 3) {
                // Depth sensor.
                //console.log("calc wh, ", cope, offset, invert, newmsg.wr);
                wh = cope + offset - invert - newmsg.wr;
                console.log("Radar, wh=", wh);
            }
            else {
                // Rain sensor.
                //console.log("Other type, wh=", wh);
                wh = undefined;
            }
            //
            newmsg.wh = wh;

            // If fl is defined,
            // TODO: handle wa undefined.
            if (typeof (fl) !== 'undefined') {
                // Modify fl as required.
                if (sensorType != 2) {
                    var logMsg = "Sensor Type is not 2, nothing to transform, write to DDB.";
                    console.log(logMsg);
                    console.log("Updated msg=", newmsg);
                    addToDDBexit(tablename, newmsg, callback);
                    //context.success();
                    //callback(null, logMsg);
                }
                else if (wa == 0) {
                    var logMsg = "Water level 0, set fl to 0, write to DDB.";
                    console.log(logMsg);
                    newmsg.fl = 0;
                    console.log("Updated msg=", newmsg);
                    addToDDBexit(tablename, newmsg, callback);
                } else {
                    //
                    //var ct = devState.ct === undefined ? "generic" : devState.ct;
                    if (devState.ct === undefined || devState.ct === "generic") {
                        var h1 = devState.h1 === undefined ? 0 : Number(devState.h1);
                        var b1 = devState.b1 === undefined ? 0 : Number(devState.b1);
                        var w1 = devState.w1 === undefined ? 0 : Number(devState.w1);
                        var h2 = devState.h2 === undefined ? 0 : Number(devState.h2);
                        var b2 = devState.b2 === undefined ? 0 : Number(devState.b2);
                        var w2 = devState.w2 === undefined ? 0 : Number(devState.w2);
                        var h3 = devState.h3 === undefined ? 0 : Number(devState.h3);
                        var b3 = devState.b3 === undefined ? 0 : Number(devState.b3);
                        var w3 = devState.w3 === undefined ? 0 : Number(devState.w3);
                        var area_delta = devState.area_delta === undefined ? 0 : Number(devState.area_delta);
                        //
                        if (wh <= h2) {
                            h1 = 0;
                        }
                        if (wh <= h3) {
                            h2 = 0;
                        }
                        // if wh < h3, wa = 0, already handled before this condition.
                        var cArea = b3 * h3 + w3 * h3 + b2 * h2 + w2 * h2 + b1 * h1 + w1 * h1 + area_delta;
                        newmsg.fl = vl * cArea;
                        // Flow value might have been updated.
                        console.log("Updated msg=", newmsg);
                        addToDDBexit(tablename, newmsg, callback);
                    }
                } // if st=2, else..
            } // if fl sensor.
            else {
                console.log("No fl to process, just add message to DDB.");
                // TODO: Fix this.
                newmsg.wr = newmsg.wh;
                console.log("Updated msg=", newmsg);
                addToDDBexit(tablename, newmsg, callback);
            }
        } // if shadow success
    }); // getThingShadow
} // transformFlow


function addToDDBexit(tablename, msg, callback) {
    var params = {
        TableName: tablename,
        Item: msg
    };

    dynDoc.put(params, function (err, data) {
        if (err) {
            var logMsg = "Error writing to DDB."
            console.log(logMsg);
            console.log(err);
            callback(err);
        }
        else {
            //console.log(data);
            var logMsg = "Added new msg to DDB."
            console.log(logMsg);
            callback(null, data);
        }
    });
}