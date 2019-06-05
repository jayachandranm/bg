var aws = require('aws-sdk');
var stream = require('stream');
//var MyStream = require('json2csv-stream');
//var dateFormat = require('dateformat');
var moment = require('moment');
//var archiver = require('archiver');
//var sids_json = require('./station-B-ids.json');
var config = require('./config_flow.json');

var iotdata = new aws.IotData({ endpoint: config.endpointAddress, region: 'ap-southeast-1' });

//var sids; //sids_json.stations;
//var devs_state;

var table_name = config.table;
var bucket_name = config.bucket;
var folder_name = config.folder;
var dev_state_file = config.dev_file;
//
var iot_folder_name = config.folder_iot;

exports.handler = function (event, context) {
  //
  console.log("Loading..");
  //
  // moment().local();
  //var ts = dateFormat(new Date(), "mmddyyyy-HHMMss");
  var currMonthStart = moment().utcOffset('+0800').startOf('month');
  var lastMonthStart = moment(currMonthStart).subtract(1, 'months');
  var lastMonthEnd = moment(lastMonthStart).endOf('month');
  //console.log(currMonthStart.format(), lastMonthStart.format(), lastMonthEnd.format());
  //console.log(currMonthStart.valueOf(), lastMonthStart.valueOf(), lastMonthEnd.valueOf())
  var end_t = lastMonthEnd.valueOf();
  var start_t = lastMonthStart.valueOf();
  //self._start_t = start_t;
  var file_dt_tag = lastMonthStart.format("YYYYMM");
  console.log("Start/end times..", start_t, end_t, file_dt_tag);
  //
  //
  var s3obj = new aws.S3(
    {
      params:
      {
        Bucket: bucket_name,
        Key: folder_name + '/' + file_dt_tag + '_flow0.zip'
      }
    }
  );
  //

  //
  var s3dev = new aws.S3();
  var params_dev =
  {
    Bucket: bucket_name,
    Key: iot_folder_name + '/' + dev_state_file
  };

  s3dev.getObject(params_dev, function (err, data) {
    var fileContents = data.Body.toString();
    devs_state = JSON.parse(fileContents);
    var dev_state_by_sids = devs_state.dev_state;
    var sids = Object.keys(dev_state_by_sids);
    //console.log(sids);
    //
    processSids(sids, function (err, data) {
      if (err) {
        context.fail(err);
        console.log("Error while processing sids.", err);
      }
      else {
        console.log("processed all sids, start writing to S3");
      }
    });
  });
}


const processSids = function (sids, callback) {
  let count = 0;
  let downList = [];

  // loop function
  function nextSid() {
    //const x = data[i++];
    const sid = sids[count];
    count += 1;
    console.log("Processing, ", sid);
    if (!sid) {
      return callback(null, downList);
    }

    var params = {
      TableName: table_name,
      //IndexName: 'Index',
      KeyConditionExpression: 'sid = :hkey and #ts BETWEEN :rkey_l AND :rkey_h',
      ExpressionAttributeValues: {
        ':hkey': self._sid,
        ':rkey_l': self._start_t,
        ':rkey_h': self._end_t
      },
      ExpressionAttributeNames: {
        '#ts': 'ts',
      },
      ScanIndexForward: true,
    };

    return findDownEntries(sid, params, downList, (err, data) => {
      //sum += data;
      nextSid();
    });
  }
  // starts looping
  nextSid(); 
}


const findDownEntries = function (sid, params, callback) {
  var devState;
  iotdata.getThingShadow({
    thingName: sid
  }, function (err, data) {
    if (err) {
      context.fail(err);
      console.log("Error in getting Shadow.", err);
    } else {
      var jsonPayload = JSON.parse(data.payload);
      //console.log('Shadow: ' + JSON.stringify(jsonPayload, null, 2));
      devState = jsonPayload.state.reported;

      var filename = sid + '_' + file_dt_tag + '.csv';
      //send(function(err, data) { console.log(err, data); callback(); });
      //setTimeout(getMultiFileStream, config.pause);
      dynDoc.query(params, function (err, data) {
        if (err) {
          console.log(err, err.stack);
          //callback(err);
        }
        else {
          for (var idx = 0; idx < data.Items.length; idx++) {
            var record = data.Items[idx];
            //var dt_local = moment(record.ts).utcOffset('+0800').format("DD-MMM-YYYY HH:mm:ss");
            var dt_local = moment(record.ts).utcOffset('+0800').format("YYYY-MM-DD HH:mm");
            record.dt = dt_local;

            var record_csv = dt_local + ',' + record.ra.toString() + ',' + record.md;
            self.push(record_csv);
          }
          //
          if (typeof data.LastEvaluatedKey != "undefined") {
            params.ExclusiveStartKey = data.LastEvaluatedKey;
            //dynamo.scan(params, onScan);
            // TODO: Check this. 
            findDownEntries(sid, params, callback);
          }
          else {
            //data_stream.end()
            //self.push(null);
            callback(null, downList);
          }

        } // else (no_err)
      }); //dynDoc.query

    }
  }); // getThingShadow
  // TODO: Will the function wait for callbacks before return?
}
