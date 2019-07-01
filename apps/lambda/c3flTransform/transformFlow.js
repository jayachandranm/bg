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

var tablename = 'pubc3fl-ddb';

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
    if (sensorType == 1 || sensorType == 5) {
        var vl = msg.vl === undefined ? undefined : msg.vl/100;
        var wa = msg.wa === undefined ? undefined : msg.wa
    }
    else {
        var vl = msg.vl === undefined ? undefined : msg.vl/1000;
        var wa = msg.wa === undefined ? undefined : msg.wa/1000;
    }

    // TODO: test
    //wa = 1;

    var newmsg = {};
    newmsg.sid = sid;
    newmsg.ts = msg.ts;
    newmsg.ts_r = msg.ts_r;
    newmsg.ty = sensorType;
    //
    // Convert to appropriate scales.
    // TODO: temp, fix it.
    var rg_bl = (12.7 + Math.random()/10).toFixed(2);
    //newmsg.wa = wa;
    newmsg.fl = fl;
    newmsg.vl = vl;
    newmsg.snr = msg.snr === undefined ? undefined : msg.snr;
    newmsg.ss = msg.ss === undefined ? undefined : msg.ss;
    newmsg.sp = msg.sp === undefined ? undefined : msg.sp;
    if (sensorType == 1 || sensorType == 5) {
        newmsg.wt = msg.wt === undefined ? undefined : msg.wt.toFixed(5);
        newmsg.bl = msg.bl === undefined ? rg_bl : msg.bl;
        newmsg.bd = msg.bd === undefined ? undefined : msg.bd;
        newmsg.wp = msg.wp === undefined ? undefined : msg.wp;
    }
    else {
        newmsg.wt = msg.wt === undefined ? undefined : msg.wt/100;
        newmsg.bl = msg.bl === undefined ? rg_bl : msg.bl/100;
        newmsg.bd = msg.bd === undefined ? undefined : msg.bd/100;
        newmsg.wp = msg.wp === undefined ? undefined : msg.wp.toFixed(5);
    }
    newmsg.ra = msg.ra === undefined ? undefined : msg.ra/1000;
    newmsg.rt = msg.rt === undefined ? undefined : msg.rt;
    newmsg.rd = msg.rd === undefined ? undefined : msg.rd/1000;
    newmsg.wr = msg.wr === undefined ? undefined : msg.wr/10000;
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
        if (msg.md == 0) {
            var logMsg = sid + ": maintenance mode."
            console.log(logMsg, eventText);
            // TODO: tmp
            newmsg.md = "maintenance";
            //newmsg.md = undefined;
            // Continue to process rest of the data before writing to DDB.
            //addToDDBexit(tablename, newmsg, callback);
        }
        else if (msg.md == 1) {
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
            if (sensorType == 2) {
                wh = wa + offset;
            } else if (sensorType == 1 || sensorType == 5) {
                // SL500/ SL1500, wa already divided by 1000.
                var wa_mrl = wa; //wa/10;
                //wh = wa_mrl - invert;
                wh = newmsg.wp + offset;
                wh = wh.toFixed(5);
            } else if (sensorType == 3) {
                // TODO: delete, feet instead of meter.
                if(sid == 'WPD13') {
                    newmsg.wr = newmsg.wr * 0.3048
                }
                // Depth sensor.
                //console.log("calc wh, ", cope, offset, invert, newmsg.wr);
                wh = (cope - invert) + offset - newmsg.wr;
                wh = wh.toFixed(5);
                console.log(sid + " Radar, wh=", wh);
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
                //if (sensorType != 2) {
                if (sensorType == 1) { 
                    var logMsg = "Sensor Type is SL-500, adjust fl and write to DDB.";
                    console.log(logMsg);
                    // vl already divided by 100.
                    newmsg.vl = vl;
                    newmsg.fl = fl;
                    if(Math.abs(newmsg.vl) < 0.001) {
                        newmsg.fl = 0;
                    }
                    newmsg.vl = newmsg.vl.toFixed(3);
                    newmsg.fl = newmsg.fl.toFixed(3);
                    //newmsg.wp = msg.wp === undefined ? undefined : msg.wp/10000;
                    // TODO: temp
                    //newmsg.bl = rg_bl;
                    console.log("Updated msg=", newmsg);
                    addToDDBexit(tablename, newmsg, callback);
                    //context.success();
                    //callback(null, logMsg);
                }
                else if (sensorType == 5) {
                    var logMsg = "Sensor Type is SL-1500, adjust fl and write to DDB.";
                    console.log(logMsg);
                    // vl already divided by 100.
                    newmsg.vl = vl;
                    newmsg.fl = fl;
                    if(Math.abs(newmsg.vl) < 0.001) {
                        newmsg.fl = 0;
                    }
                    newmsg.vl = newmsg.vl.toFixed(3);
                    newmsg.fl = newmsg.fl.toFixed(3);
                    //newmsg.wp = msg.wp === undefined ? undefined : msg.wp/10000;
                    // TODO: temp
                    //newmsg.bl = rg_bl;
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
                        //
                        var h4 = devState.h4 === undefined ? 0 : Number(devState.h4);
                        var b4 = devState.b4 === undefined ? 0 : Number(devState.b4);
                        var w4 = devState.w4 === undefined ? 0 : Number(devState.w4);
                        var h5 = devState.h5 === undefined ? 0 : Number(devState.h5);
                        var b5 = devState.b5 === undefined ? 0 : Number(devState.b5);
                        var w5 = devState.w5 === undefined ? 0 : Number(devState.w5);
                        //var area_delta = devState.area_delta === undefined ? 0 : Number(devState.area_delta);
                        // Calculate flow area depending on water level.
                        var wArea = 0.0;
                        var wh_rel = 0.0;
                        if(wh <= h3) {
                            wh_rel = wh;
                            // b3 varies by height depending on current level.
                            var b3_cur = b3*wh_rel/h3;
                            wArea = ( b3_cur + w3 ) * wh;
                        }
                        else if (wh <= (h2+h3)) {
                            wh_rel = wh - h3;
                            var b2_cur = b2*wh_rel/h2;
                            wArea = (b3 + w3)*h3 + (b2_cur + w2)*wh_rel;
                        }
                        else if (wh <= (h1+h2+h3)) {
                            wh_rel = wh - (h2+h3);
                            var b1_cur = b1*wh_rel/h1;
                            wArea = (b3 + w3)*h3 
                            + (b2 + w2)*h2
                            + (b1_cur + w1) * wh_rel;
                        }
                        else if (wh <= (h1+h2+h3+h4)) {
                            wh_rel = wh - (h1+h2+h3);
                            var b4_cur = b4*wh_rel/h4;
                            wArea = (b3 + w3)*h3 
                            + (b2 + w2)*h2
                            + (b3 + w3)*h3
                            + (b4_cur + w4) * wh_rel;
                        }
                        else if (wh <= (h1+h2+h3+h4+h5)) {
                            wh_rel = wh - (h1+h2+h3+h4);
                            var b5_cur = b5*wh_rel/h5;
                            wArea = (b3 + w3)*h3 
                            + (b2 + w2)*h2
                            + (b3 + w3)*h3
                            + (b4 + w4)*h4
                            + (b5_cur + w5) * wh_rel;
                        }
                        //var cArea = b3 * h3 + w3 * h3 + b2 * h2 + w2 * h2 + b1 * h1 + w1 * h1 + area_delta;
                        newmsg.fl = vl * wArea;
                        newmsg.fl = newmsg.fl.toFixed(5);
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