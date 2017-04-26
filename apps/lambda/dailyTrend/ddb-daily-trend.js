var aws = require('aws-sdk');
//var stream = require('stream');
//var Dyno = require('dyno');
//var CSVTransform = require('./transform-stream');
//var zlib = require('zlib');
var sids = require('./station-ids.json')

var dateFormat = require('dateformat');
var ts = dateFormat(new Date(), "mmddyyyy-HHMMss")

aws.config.update({ region: 'ap-southeast-1' });
//dynamo = new aws.DynamoDB();
dynDoc = new aws.DynamoDB.DocumentClient();


var count = 0;
var sidSize = sids.length;

      function multiQuery() {
        //console.log("Multi query..", self._count, self._sidSize, "===============");
        if(count < sidSize) {
          params.ExpressionAttributeValues = { ':hkey': sids[count], ':rkey_l': 1480565971000, ':rkey_h': 1480566618000 };
          queryOne(params, function(err, data){
            // if err..
            // if data..
            var val = data;
            addtoTrendTable(val, function(err, data){
              count++;
              setTimeout(multiQuery, 1000);
            });
          });
        }
      }


var queryOne = function (params, callback) {
  // start streaminf table data
  var sum = 0.0;
  dynDoc.query(params, function (err, data) {
    var numItems = data.Items.length;
    if (err) {
      console.log(err, err.stack);
      callback(err);
    }
    else {
      for (var idx = 0; idx < data.Items.length; idx++) {
        var item = data.Items[idx];
        var lat = item.gps_item.latitude;
        sum = sum + lat;
        //self._count++;
      }
      var avg = sum / numItems;
      callback(avg);
    }
  });
};
     




/*
  var dyno = Dyno({
    table: 'OBDTable_mmmYYYY',
    region: 'ap-southeast-1',
    //endpoint: 'http://localhost:4567'
  });
*/
//exports.handler = function (event, context) {
function backupTable(context) {
//function backupTable(tablename, callback) {
  var tablename = 'OBDTable_mmmYYYY';

  //var data_stream = dyno.scanStream();

  var params = {
    //TableName: 'Table',
    //IndexName: 'Index',
    KeyConditionExpression: 'obd_dev_id = :hkey and #ts BETWEEN :rkey_l AND :rkey_h',
    ExpressionAttributeValues: {
      ':hkey': '213EP2016000570',
      ':rkey_l': 1480565971000,
      ':rkey_h': 1480566618000
    },
    ExpressionAttributeNames: {
      '#ts': 'timestamp',
    },
  };



  // body will contain the compressed content to ship to s3
  //var body = data_stream.pipe(process.stdout);

    //send(function(err, data) { console.log(err, data); callback(); });
} //function backupTable
//};

module.exports.backupTable = backupTable;

