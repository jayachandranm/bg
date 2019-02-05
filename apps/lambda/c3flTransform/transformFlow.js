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

    var sid = msg.sid;
    //var thingName = sid;
    var flSType = msg.ty;
    var ts_unix = msg.ts;
    var ts_r = msg.ts_r;
    // TODO: Check default value.
    var fl = msg.fl === undefined ? 0 : msg.fl;
    var vl = msg.vl === undefined ? 0 : msg.vl;
    var wa = msg.wa === undefined ? 0 : msg.wa;

    console.log("Msg:", msg);
    /*
    if(!sid.includes("TST")) {
        console.log("Not TEST device, ignore.")
        return;
    }
    */


    /*
    // If md is defined, do nothing, just return.
    //if (msg.hasOwnProperty(md) ) { // && msg.md !== null) {
    if (typeof (msg.md) !== 'undefined') { // && msg.md !== null) {
        var logMsg = "Either maintenance or spike. Recieved Record: "
        console.log(logMsg, eventText);
        addToDDBexit(tablename, msg, logMsg, callback);
        // TODO: Needed?
        return;
    }
    */

    // Modify fl as required.
    if (flSType != 2) {
        var logMsg = "Sensor Type is not 2, nothing to transform, write to DDB.";
        console.log(logMsg);
        //context.success();
        //callback(null, logMsg);
    }
    else if (wa == 0) {
        var logMsg = "Water level 0, nothing to transform, write to DDB.";
        console.log(logMsg);
    } else {
        //let name = event.name === undefined ? 'you' : event.name;
        var devState;
        //
        iotdata.getThingShadow({
            thingName: sid
        }, function (err, data) {
            if (err) {
                context.fail(err);
                console.log("Error in getting Shadow.", err);
            } else {
                var jsonPayload = JSON.parse(data.payload);
                console.log('Shadow: ' + JSON.stringify(jsonPayload, null, 2));
                devState = jsonPayload.state.reported;
                var offset = devState.offset === undefined ? 0 : devState.offset;
                var wh = wa + offset;
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
                    msg.fl = vl * cArea;
                }
            }
        }); // getThingShadow
    } // if 

    console.log("Updated msg=", msg);
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

    // Write modified msg to DDB.
    //function addToDDB(tableName, msg, callback) {
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
    //}
}