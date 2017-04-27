var aws = require('aws-sdk');
//var stream = require('stream');
//var Dyno = require('dyno');
//var CSVTransform = require('./transform-stream');
//var zlib = require('zlib');
var sids = require('./station-ids.json')

//var dateFormat = require('dateformat');
//var ts = dateFormat(new Date(), "mmddyyyy-HHMMss")

aws.config.update({ region: 'ap-southeast-1' });
//dynamo = new aws.DynamoDB();
dynDocClient = new aws.DynamoDB.DocumentClient();


var count = 0;
var sidSize = sids.length;

var tablename = 'OBDTable_mmmYYYY';

      var params = {
        TableName: tablename,
        //IndexName: 'Index',
        KeyConditionExpression: 'obd_dev_id = :hkey and #ts BETWEEN :rkey_l AND :rkey_h',
        ExpressionAttributeValues: {
          ':hkey': sids[0],
          ':rkey_l': 1480565971000,
          ':rkey_h': 1480566618000
        },
        ExpressionAttributeNames: {
          '#ts': 'timestamp',
        },
      };

      function updateDailyTrend() {
        //console.log("Multi query..", self._count, self._sidSize, "===============");
        if(count < sidSize) {
          params.ExpressionAttributeValues = { ':hkey': sids[count], ':rkey_l': 1480565971000, ':rkey_h': 1480566618000 };
          trend4sid(params, function(err, data){
            // if err..
            // if data..
            //var avgVal = data;
            var item = data;
            item.device_id = sids[count];
            addtoTrendTable(item, function(err){
              count++;
              setTimeout(updateDailyTrend, 1000);
            });
          });
        }
      }


var trend4sid = function (params, callback) {
  // start streaminf table data
  var sum = 0.0;
  dynDocClient.query(params, function (err, data) {
    var numItems = data.Items.length;
    if (err) {
      console.log(err, err.stack);
      callback(err);
    }
    else {
      //console.log(data.Items[0].gps_data);
      for (var idx = 0; idx < data.Items.length; idx++) {
        var item = data.Items[idx];
        var lat = item.gps_data.latitude;
        sum = sum + lat;
        //self._count++;
      }
      var timestamp = data.Items[data.Items.length - 1].timestamp;
      var avg = sum / numItems;
      var item = { "timestamp": timestamp, "avg": avg };
      callback(null, item);
    }
  });
};
     
var addtoTrendTable = function (item, callback) {
  var tablename = 'IoTTestDynDB';
  var params = {
    TableName:tablename,
    Item: item
/*
    Item:{
        "year": year,
        "title": title,
        "info":{
            "plot": "Nothing happens at all.",
            "rating": 0
        }
    }
*/
  };

  dynDocClient.put(params, function(err, data) {
    if (err) {
        console.error("Unable to add item. Error JSON:", JSON.stringify(err, null, 2));
        callback(err);
    } else {
        console.log("Added item:", JSON.stringify(data, null, 2));
        callback();
    }
  });
}

updateDailyTrend();

module.exports.updateDailyTrend = updateDailyTrend;


