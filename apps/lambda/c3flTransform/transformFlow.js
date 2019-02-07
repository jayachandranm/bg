//console.log('Loading function');
// Load the AWS SDK
var AWS = require("aws-sdk");
//var http = require('http');
var https = require('https');
//var sync_request = require('sync-request');
var utils = require('./utils');
var config = require('./config.json');
var dateFormat = require('dateformat');
var moment = require('moment');

var iotdata = new AWS.IotData({ endpoint: config.endpointAddress, region: 'ap-southeast-1' });

AWS.config.update({ region: 'ap-southeast-1' });
var dynDoc = new AWS.DynamoDB.DocumentClient();
var parse = AWS.DynamoDB.Converter.output;

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
    console.log("Msg:", msg);

    var sid = msg.sid;
    //var thingName = sid;
    var sensorType = Number(msg.ty);
    var ts_unix = msg.ts;
    var ts_r = msg.ts_r;
    // TODO: Check default value.
    // TODO: For now all values are received as string.
    // TODO: test.
    var fl = msg.fl === undefined ? undefined : Number(msg.fl);
    var vl = msg.vl === undefined ? undefined : Number(msg.vl);
    var wa = msg.wa === undefined ? undefined : Number(msg.wa);

    // TODO: test
    //wa = 1;

    var newmsg = {};
    newmsg.sid = sid;
    newmsg.ts = ts_unix;
    newmsg.ty = sensorType;
    newmsg.ts_r = msg.ts_r;
    //
    // Convert to appropriate scales.
    //newmsg.wa = wa;
    newmsg.vl = vl;
    newmsg.wt = msg.wt === undefined ? undefined : Number(msg.wt);
    newmsg.snr = msg.snr === undefined ? undefined : Number(msg.snr);
    newmsg.ss = msg.ss === undefined ? undefined : Number(msg.ss);
    newmsg.sp = msg.sp === undefined ? undefined : Number(msg.sp);
    newmsg.bl = msg.bl === undefined ? undefined : Number(msg.bl);
    newmsg.bd = msg.bd === undefined ? undefined : Number(msg.bd);
    newmsg.ra = msg.ra === undefined ? undefined : Number(msg.ra);
    newmsg.rt = msg.rt === undefined ? undefined : Number(msg.rt);
    newmsg.rd = msg.rd === undefined ? undefined : Number(msg.rd);
    newmsg.wr = msg.wr === undefined ? undefined : Number(msg.wr);

    /*
    if(!sid.includes("TST")) {
        console.log("Not TEST device, ignore.")
        return;
    }
    */

    // If md is defined, keep it in the DDB, else no field in the DDB.
    //if (msg.hasOwnProperty(md) ) { // && msg.md !== null) {
    //if (typeof (msg.md) !== 'undefined') { // && msg.md !== null) {
    var md = msg.md === undefined ? '0' : msg.md;
    if (md !== '0') {
        var logMsg = "Maintenance mode."
        console.log(logMsg, eventText);
        newmsg.md = "maintenance";
        // Continue to process rest of the data before writing to DDB.
        //addToDDBexit(tablename, newmsg, callback);
    }

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
            console.log('Shadow: ' + JSON.stringify(jsonPayload, null, 2));
            devState = jsonPayload.state.reported;
            var offset = devState.offset === undefined ? 0 : devState.offset;
            var cope = devState.cope_level === undefined ? 0 : devState.cope_level;
            var invert = devState.invert_level === undefined ? 0 : devState.invert_level;

            var wh = 0;
            if (sensorType == 1 || sensorType == 2) {
                wh = wa + offset;
            } else if (sensorType == 3) {
                // Depth sensor.
                wh = cope + offset - newmsg.wr;
            }
            else {
                // Rain sensor.
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
                        var h1 = devState.h1 === undefined ? 0 : devState.h1;
                        var b1 = devState.b1 === undefined ? 0 : devState.b1;
                        var w1 = devState.w1 === undefined ? 0 : devState.w1;
                        var h2 = devState.h2 === undefined ? 0 : devState.h2;
                        var b2 = devState.b2 === undefined ? 0 : devState.b2;
                        var w2 = devState.w2 === undefined ? 0 : devState.w2;
                        var h3 = devState.h3 === undefined ? 0 : devState.h3;
                        var b3 = devState.b3 === undefined ? 0 : devState.b3;
                        var w3 = devState.w3 === undefined ? 0 : devState.w3;
                        //
                        if (wh <= h2) {
                            h1 = 0;
                        }
                        if (wh <= h3) {
                            h2 = 0;
                        }
                        // if wh < h3, wa = 0, already handled before this condition.
                        var cArea = b3 * h3 + w3 * h3 + b2 * h2 + w2 * h2 + b1 * h1 + w1 * h1;
                        newmsg.fl = vl * cArea;
                        // Flow value might have been updated.
                        console.log("Updated msg=", newmsg);
                        addToDDBexit(tablename, newmsg, callback);
                    }
                } // if st=2, else..
            } // if fl sensor.
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