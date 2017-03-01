var AWS = require("aws-sdk");
var fs = require('fs');

module.exports.add2dyndb = add2dyndb;
module.exports.add2dyndbBatch = add2dyndbBatch;

AWS.config.update({
    region: "ap-southeast-1",
    endpoint: "https://dynamodb.ap-southeast-1.amazonaws.com"
});

var docClient = new AWS.DynamoDB.DocumentClient();
var table = "OBDTable_mmmYYYY";


function add2dyndb(obdID, statData, gpsItem, arrAlarms) {
    //
    var items = {};
    items["obd_dev_id"] = obdID;
    if (statData != null) {
        items["stat_data"] = statData;
        items["timestamp"] = statData.utc_time * 1000;
    }
    if (gpsItem != null) {
        // If GPS available, overwrite sample time with GPS time.
        items["timestamp"] = getUnixTime(gpsItem.date_time);
        items["gps_data"] = getGpsJson(gpsItem);
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
        //"stat_data":  stat_data == null ? null : stat_data,
    };

    //console.log(params);
    docClient.put(params, function (err, data) {
        if (err) {
            console.error("Unable to add movie", ". Error JSON:", JSON.stringify(err, null, 2));
        } else {
            //console.log("PutItem succeeded:");
        }
    });

}

function add2dyndbBatch(obdID, arrGPS, arrRPM) {
    //
    if (arrGPS != null) {
        // Skip the last item.
        var numItems4db = arrGPS.length - 1;
        for (i = 0; i < numItems4db; i++) {
            var items = {};
            items["obd_dev_id"] = obdID;
            var gpsItem = arrGPS[i];
            items["timestamp"] = getUnixTime(gpsItem.date_time);
            items["gps_data"] = getGpsJson(gpsItem);

            var params = {
                TableName: table,
                Item: items
            };

            // TODO: Use batch mode to push all data in single call.
            //console.log(params);
            docClient.put(params, function (err, data) {
                if (err) {
                    console.error("Unable to add movie", ". Error JSON:", JSON.stringify(err, null, 2));
                } else {
                    //console.log("PutItem succeeded:");
                }
            });

        }
    }
    // TODO: Push RPM values.
}

function getGpsJson(gpsItem) {
    var gpsJson = {};
    var Long = gpsItem.longitude / 3600000;
    var Lat = gpsItem.latitude / 3600000;
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

