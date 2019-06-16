var aws = require('aws-sdk');
var stream = require('stream');
var streamify = require('stream-array');
//var MyStream = require('json2csv-stream');
const { Transform } = require('json2csv');
//var dateFormat = require('dateformat');
var moment = require('moment');
//var os = require('os');
//var archiver = require('archiver');
//var sids_json = require('./station-B-ids.json');
var config = require('./config_flow.json');

var iotdata = new aws.IotData({ endpoint: config.endpointAddress, region: 'ap-southeast-1' });
var dynDoc = new aws.DynamoDB.DocumentClient();

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
  /*
  var body = data_stream.pipe(csv).pipe(gzip);
  var s3obj = new aws.S3({params: {Bucket: bucket_name, Key: folder_name + '/' + table_name + '-' + ts + '.xls.gz'}});
  s3obj.upload({Body: body}).
    on('httpUploadProgress', function(evt) {
      console.log(evt);
    }).
    send(function(err, data) { console.log(err, data); });
    */
  //
  var s3dev = new aws.S3();
  var params_dev =
  {
    Bucket: bucket_name,
    Key: iot_folder_name + '/' + dev_state_file
  };

  s3dev.getObject(params_dev, function (err, data) {
    if (err) {
      console.log("Error in S3 read of dev state.")
    }
    else {
      var fileContents = data.Body.toString();
      var devs_state = JSON.parse(fileContents);
      var dev_state_by_sids = devs_state.dev_state;
      var sids = Object.keys(dev_state_by_sids);
      //console.log(sids);
      //

      const fields = ['sid', 'loc', 'st', 'et', 'remarks', 'dur_days', 'dur_hrs', 'dur_mts'];
      const opts = { fields };
      //const transformOpts = { highWaterMark: 16384, encoding: 'utf-8' };
      const transformOpts = { objectMode: true };
       
      //const input = createReadStream(inputPath, { encoding: 'utf8' });
      //const output = createWriteStream(outputPath, { encoding: 'utf8' });
      const json2csv = new Transform(opts, transformOpts);

      processSids(sids, start_t, end_t, function (err, data) {
        if (err) {
          context.fail(err);
          console.log("Error while processing sids.", err);
        }
        else {
          console.log("processed all sids, start writing to S3");
          var dtfile = folder_name + '/' + file_dt_tag + '_downtime.csv';
          console.log(data.length);
          console.log(data);

          //input = streamify(['1', '2', '3', os.EOL])
          const input = streamify(data);
          //var s3obj = new aws.S3({params: { Bucket: bucket_name, Key: dtfile}});
          var s3obj = new aws.S3();
          const processor = input.pipe(json2csv).pipe(uploadFromStream(s3obj, bucket_name, dtfile));
          //        
        }
      });
    }
  });
} // handler


const processSids = function (sids, start_t, end_t, callback) {
  let count = 0;
  let downList = [];

  // loop function
  function nextSid() {
    //const x = data[i++];
    const sid = sids[count];
    count += 10;
    console.log("Processing, ", sid);
    if (!sid) {
      return callback(null, downList);
    }

    var params = {
      TableName: table_name,
      //IndexName: 'Index',
      KeyConditionExpression: 'sid = :hkey and #ts BETWEEN :rkey_l AND :rkey_h',
      ExpressionAttributeValues: {
        ':hkey': sid,
        ':rkey_l': start_t,
        ':rkey_h': end_t
      },
      ExpressionAttributeNames: {
        '#ts': 'ts',
      },
      ScanIndexForward: true,
    };

    return findDownEntries(sid, params, downList, (err, data) => {
      //sum += data;
      if (err) {
        context.fail(err);
        console.log("Error while processing down Entries.", err);
      }
      else {
        // TODO: append to downList?
        downList = data;
      }
      nextSid();
    });
  }
  // starts looping
  nextSid();
}


const findDownEntries = function (sid, params, downList, callback) {
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
      //console.log('2. Shadow: ');
      devState = jsonPayload.state.reported;

      dynDoc.query(params, function (err, data) {
        if (err) {
          console.log(err, err.stack);
          callback(err);
        }
        else {
          var last_ts = -1;
          var last_bl = -1;
          var data_err_started = false;
          var data_err_st = -1;
          for (var idx = 0; idx < data.Items.length; idx++) {
            var record = data.Items[idx];
            //var dt_local = moment(record.ts).utcOffset('+0800').format("DD-MMM-YYYY HH:mm:ss");
            // If no records for more than 30mts, add to the list.
            if (last_ts > 0 && Math.abs(record.ts - last_ts) > 30 * 60 * 1000) {
              var down_record = {}
              var dt_end = moment(record.ts).utcOffset('+0800').format("YYYY-MM-DD HH:mm");
              var dt_start = moment(last_ts).utcOffset('+0800').format("YYYY-MM-DD HH:mm");
              down_record.sid = sid;
              var loc = devState.location;
              down_record.loc = loc;
              down_record.st = dt_start;
              down_record.et = dt_end;
              down_record.remarks = "DL failure.";
              // In minutes
              var dur_secs = (record.ts - last_ts)/1000;
              var dur_days = (dur_secs / 86400).toFixed(2);
              down_record.dur_days = dur_days;
              var dur_hrs = (dur_secs / 3600).toFixed(2);
              down_record.dur_hrs = dur_hrs;
              //
              var dur_trunc_hrs = Math.trunc(dur_hrs);
              var dur_mts = Math.round(dur_secs / 60);
              var bal_mts = dur_mts - (dur_trunc_hrs * 60);
              down_record.dur_mts = bal_mts;
              //
              downList.push(down_record);
            }
            // If bl=0, data error. Just changed from non-zero to zero, start of error.
            if ((!data_err_started) && (record.bl == 0)) {
              //
              data_err_started = true;
              var data_err_st = record.ts;
            }
            // 
            if (data_err_started && (record.bl > 0)) {
              var down_record = {}
              var dt_end = moment(record.ts).utcOffset('+0800').format("YYYY-MM-DD HH:mm");
              var dt_start = moment(data_err_st).utcOffset('+0800').format("YYYY-MM-DD HH:mm");
              down_record.sid = sid;
              var loc = devState.location;
              down_record.loc = loc;
              down_record.st = dt_start;
              down_record.et = dt_end;
              down_record.reason = "Data error.";
              //
              var dur_secs = (record.ts - last_ts)/1000;
              var dur_mts = Math.round(dur_secs / 60);
              down_record.du_mts = dur_mts;
              var dur_days = (dur_secs / 86400).toFixed(2);
              down_record.dur_days = dur_days;
              var dur_hrs = (dur_secs / 3600).toFixed(2);
              down_record.dur_hrs = dur_hrs;
              //
              data_err_started = false; 
              //downList.push(down_record);
            }

            last_ts = record.ts;
            last_bl = record.bl;
          }
          //
          if (typeof data.LastEvaluatedKey != "undefined") {
            params.ExclusiveStartKey = data.LastEvaluatedKey;
            // TODO: Check this. 
            //console.log('DDB, not all record in single query.');
            findDownEntries(sid, params, downList, callback);
          }
          else {
            console.log("4. Finished processing, ", sid);
            callback(null, downList);
          }

        } // else (no_err)
      }); //dynDoc.query

    }
  }); // getThingShadow
  // TODO: Will the function wait for callbacks before return?
}

//inputStream.pipe(uploadFromStream(s3));
function uploadFromStream(s3, BUCKET, KEY) {
  var pass = new stream.PassThrough();

  var params = {Bucket: BUCKET, Key: KEY, Body: pass};
  s3.upload(params, function(err, data) {
    console.log(err, data);
  });

  return pass;
}
