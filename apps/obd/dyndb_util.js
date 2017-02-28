var AWS = require("aws-sdk");
var fs = require('fs');

module.exports.add2dyndb = add2dyndb;
module.exports.add2dyndbBatch = add2dyndbBatch;

AWS.config.update({
    region: "ap-southeast-1",
    endpoint: "https://dynamodb.ap-southeast-1.amazonaws.com"
});

var docClient = new AWS.DynamoDB.DocumentClient();

console.log("Pushing data into DynamoDB. Please wait.");

function add2dyndb(obdID, statData, arrGPS, arrRPM, arrAlarms) {
    //
    var table = "OBDTable_mmmYYYY";

    var items = {};
    items["obd_dev_id"] = obdID;
    if (statData != null) {
        items["stat_data"] = statData;
        items["timestamp"] = statData.utc_time;
    }
    if (arrGPS != null) {
        var gpsVals;
        if (arrGPS.length == 1) {
            // If only one GPS item, everything goes in one row.
            gpsVals = arrGPS[0];
        } else if (arrGPS.length > 1) {
            // When there are multiple GPS items, the last entry maps to stat_data
            // Update rest of the items in a separate loop.
            gpsVals = arrGPS[arrGPS.length - 1];
        }
        // If GPS available, overwrite sample time with GPS time.
        items["timestamp"] = getUnixTime(gpsVals.date_time);
        items["gps_data"] = getGpsJson(gpsVals);
    }
    if (arrAlarms != null) {
        var alarms = {};
        for (i = 0; i < arrAlarmVals.length; i++) {
            var alarmVals = arrAlarmVals[i];
            var alarmType = alarmVals.alarm_type;

            console.log("Alarm type: ", alarmType);
            if (alarmType == 0x06) {
                alarms["waiting"] = 1;
            }
        }
        items["alarms_data"] = alarms;
    }

    var params = {
        TableName: table,
        Item: items
    };

    /*
     var params = {
     TableName: table,
     Item: {
     "obd_dev_id":  obdID,
     "timestamp": timestamp,
     //"stat_data":  stat_data == null ? null : stat_data,
     "info":  {
     "longitude": 123.456,
     "latitude": 456.123
     }
     }
     };
     */

    docClient.put(params, function (err, data) {
        if (err) {
            console.error("Unable to add movie", ". Error JSON:", JSON.stringify(err, null, 2));
        } else {
            console.log("PutItem succeeded:");
        }
    });

}

function add2dyndbBatch(obdID, arrGPS, arrRPM) {
}

function getGpsJson(gpsData) {
    var gpsJson = {};
    var Long = gpsVals.longitude / 3600000;
    var Lat = gpsVals.latitude / 3600000;
    gpsJson["longitude"] = Long;
    gpsJson["latitude"] = Lat;
    gpsJson["speed"] = 0;
    gpsJson["direction"] = 0;
    return gpsJson;
}

function getUnixTime(dateTime) {
    var dt = dateTime;
    var yr = '20' + dt.year;
    // NOTE: Month starts from 0.
    var utime = new Date(yr, dt.month - 1, dt.day, dt.hour, dt.minute, dt.second).getTime();
    return utime;
}

function getDbDateTime(utime) {
    var dateNow = new Date();
    var currTimeMillis = Date.now();
    var offset = dateNow.getTimezoneOffset();
    //console.log(offset);
    var adjTime = utime + (8 * 60 * 60 * 1000);
    var datetime_db = new Date(adjTime).toISOString().slice(0, 19).replace('T', ' ');
    return datetime_db;
}

