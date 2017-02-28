var AWS = require("aws-sdk");
var fs = require('fs');

//module.exports.add2dbGPS = add2dbGPS;

AWS.config.update({
    region: "ap-southeast-1",
    endpoint: "https://dynamodb.ap-southeast-1.amazonaws.com"
});

var docClient = new AWS.DynamoDB.DocumentClient();

console.log("Pushing data into DynamoDB. Please wait.");

function add2dyndb(obdID, timestamp, statData, arrGPS, arrRPM, arrAlarms) {

var table = "OBDTable_mmmYYYY";

    var items = {};
    items["obd_dev_id"] = obdID;
    items["timestamp"] = timestamp;
    if(statData != null) {
      items["stat_data"] = statData;
    }
    if(arrGPS != null) {
      if(arrGPS.length == 1) {
        // If only one GPS item, everything goes in one row.
        items["gps_data"] = arrGPS[0];
      } else if(arrGPS.length > 1) { 
        // When there are multiple GPS items, the last entry maps to stat_data
        // Update rest of the items in a separate loop.
        items["gps_data"] = arrGPS[arrGPS.length-1];
      }
      if(arrAlarms != null) {
        var alarms = {};
  for (i = 0; i < arrAlarmVals.length; i++) { 
    var alarmVals = arrAlarmVals[i];
    var alarmType = alarmVals.alarm_type;
  
    console.log("Alarm type: ", alarmType);
    if(alarmType == 0x06) {
      alarms["waiting"] = 1;
    }
 }
        items["alarms_data"] = alarms;
      }
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

    docClient.put(params, function(err, data) {
       if (err) {
           console.error("Unable to add movie", ". Error JSON:", JSON.stringify(err, null, 2));
       } else {
           console.log("PutItem succeeded:");
       }
    });
}
