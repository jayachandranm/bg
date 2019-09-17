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
//var config = require('./config_rain.json');
//var config = require('./config_rlevel.json');

var iotdata = new aws.IotData({ endpoint: config.endpointAddress, region: 'ap-southeast-1' });
var dynDoc = new aws.DynamoDB.DocumentClient();

//var sids; //sids_json.stations;
//var devs_state;

var table_name = config.table;
var bucket_name = config.bucket;
var folder_name = config.folder;
var dev_state_file = config.dev_file;
var iot_folder_name = config.folder_iot;
var rel_month = config.rel_month;
var batch = config.batch;

// Declared global.
var dev_state_by_sids;

// Global. Because of multiple calls of same function for DDB access. Init outside the function.
var total_down_mts;

exports.handler = function (event, context) {
  //
  console.log("Loading..");
  //
  // moment().local();
  //var ts = dateFormat(new Date(), "mmddyyyy-HHMMss");
  //var currMonthStart = moment().utcOffset('+0800').startOf('month').subtract(3, 'months').add(10, 'days');
  var monthStart = moment().utcOffset('+0800').startOf('month').subtract(rel_month, 'months');
  var monthEnd = moment(monthStart).endOf('month');
  //console.log(currMonthStart.format(), lastMonthStart.format(), lastMonthEnd.format());
  //console.log(currMonthStart.valueOf(), lastMonthStart.valueOf(), lastMonthEnd.valueOf())
  var end_t = monthEnd.valueOf();
  var start_t = monthStart.valueOf();
  //self._start_t = start_t;
  var file_dt_tag = monthStart.format("YYYYMM");
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
  var params_dev = {
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
      //var dev_state_by_sids = devs_state.dev_state;
      dev_state_by_sids = devs_state.dev_state;
      //var sids = Object.keys(dev_state_by_sids);
      //console.log(sids);
      //

      var dev_state_arr = Object.keys(dev_state_by_sids)
        .map(c => ({ key: c, value: dev_state_by_sids[c] }))
        .sort((a, b) => (compareSN(a.value.sn, b.value.sn)) ? 1 : -1);

      const fields = ['sid', 'loc', 'st', 'et', 'remarks', 'dur_days', 'dur_hrs',
        'dur_trunc_hrs', 'dur_mts', 'dur_txt',
        'total_days', 'total_hrs', 'total_tr_hrs', 'total_mts', 'total_txt'
      ];
      const opts = { fields, header: false };
      //const transformOpts = { highWaterMark: 16384, encoding: 'utf-8' };
      const transformOpts = { objectMode: true };

      //const input = createReadStream(inputPath, { encoding: 'utf8' });
      //const output = createWriteStream(outputPath, { encoding: 'utf8' });
      const json2csv = new Transform(opts, transformOpts);
      
      processStations(dev_state_arr, start_t, end_t, function (err, data) {
      //processSids(sids, start_t, end_t, function (err, data) {
        if (err) {
          context.fail(err);
          console.log("Error while processing sids.", err);
        }
        else {
          console.log("processed all sids, start writing to S3");
          var dtfile = folder_name + '/' + file_dt_tag + '_downtime.csv';
          //console.log(data.length);
          //console.log(data);

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

// To order by Station Name.
function compareSN(sn1, sn2) {
  var letter2NumPos = 2;
  // If flow station, eg F23, only one letter before number.
  // Otherwise two letters, eg. RG23, RL23.
  if(dev_state_file === "flow_stations.json") {
    letter2NumPos = 1;
  }
  var snum1 = Number(sn1.slice(letter2NumPos));
  var snum2 = Number(sn2.slice(letter2NumPos));
  return (snum1 > snum2);
}

const processStations = function (dev_state_arr, start_t, end_t, callback) {
  let count = 0;
  let downList = [];

  downList = addHeader(downList);

  // loop function
  function nextStation() {
    //const x = data[i++];
    const dev_state = dev_state_arr[count];
    //console.log("dev_state value", dev_state.value);
    if (!dev_state) {
      return callback(null, downList);
    }
    const sid = dev_state.key;
    count += 1;
    console.log("Processing, ", sid);

    // Reinitialize adjusted start time for each station.
    //var start_t = start_month_t;
    var start_t_adj = start_t;

    // Update start time for the station based on commissioning date.
    var comms_date = dev_state.value.comms_dt;
    //console.log("comms_date", comms_date);

    var comms_dt_str = comms_date + " 0:00 +0800";
    // Take D+1 wrt commissioning date.
    var comms_dt = moment(comms_dt_str, 'DD-MM-YYYY HH:mm Z').add(1, 'days');
    var comms_utime = comms_dt.valueOf();
    //console.log("Comms_utime, month_st: ", sid, comms_utime, start_t);

    if (comms_utime > start_t) {
      console.log("Comms_utime, month_st: ", sid, comms_utime, start_t);
      start_t_adj = comms_utime;
    }

    var params = {
      TableName: table_name,
      //IndexName: 'Index',
      KeyConditionExpression: 'sid = :hkey and #ts BETWEEN :rkey_l AND :rkey_h',
      ExpressionAttributeValues: {
        ':hkey': sid,
        ':rkey_l': start_t_adj,
        ':rkey_h': end_t
      },
      ExpressionAttributeNames: {
        '#ts': 'ts',
      },
      ScanIndexForward: true,
    };

    total_down_mts = 0;
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
      nextStation();
    });
  }
  // starts looping
  nextStation();

  /*
  dev_state_arr.forEach(function(dev_state) {
    //console.log(dev_state);
    // Slower processing. forEach will move to next element before completing.
    //findDownEntries(...);
  }); // foreach.
  */
}

const findDownEntries = function (sid, params, downList, callback) {
  var devState;

  // TODO: Check this one level before.
  let start_t = params.ExpressionAttributeValues[':rkey_l'];
  let end_t = params.ExpressionAttributeValues[':rkey_h'];
  //console.log("param_keys", sid, start_t, end_t);
  
  if(start_t > end_t) {
    // Nothing to process, return the empty downList.
    console.log("Not_available, ", sid, start_t, end_t);
    callback(null, downList);
    return;
  }

  var loc_id = sid;
  if (dev_state_by_sids) {
    loc_id = dev_state_by_sids[sid].sn;
  }

  iotdata.getThingShadow({
    thingName: sid
  }, function (err, data) {
    if (err) {
      context.fail(err);
      console.log("Error in getting Shadow.", err);
    }
    else {
      var jsonPayload = JSON.parse(data.payload);
      //console.log('Shadow: ' + JSON.stringify(jsonPayload, null, 2));
      //console.log('2. Shadow: ');
      devState = jsonPayload.state.reported;
      // Add the location id (eg F11) to the devState object.
      devState.loc_id = loc_id;
      
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

          // If no records found, the station is down for the whole duration.
          if(data.Items.length == 0) {
            addDownRecord(downList, devState, start_t, end_t, 0, "gap");
          }

          for (var idx = 0; idx < data.Items.length; idx++) {
            var record = data.Items[idx];
            //var dt_local = moment(record.ts).utcOffset('+0800').format("DD-MMM-YYYY HH:mm:ss");

            // Expected rate is 3mts for rain and reservoir.
            var max_period = 4 * 60; // in secs
            // -- Only for Flow stations.
            if (dev_state_file === "flow_stations.json") {
              var wh = record.wh;
              var cope = devState.cope_level;
              var invert = devState.invert_level;
              var total_height = cope - invert;
              var ratio = wh * 100 / total_height;
              // If level < 50%, expected sampling is 10mts, else 1mts. Add 2mts extra.
              max_period = 12 * 60; // in secs
              if (ratio > 50) {
                max_period = 2 * 60;
              }
            }
            // -- end flow stations.

            // If no records for more than max_period, add to the list.
            if (last_ts > 0 && Math.abs(record.ts - last_ts) > max_period * 1000) {
              // If there was ongoing invalid records, end that event.
              // The end time of previous event will be start time of data gap.
              // TODO: End any ongoing event, not valid when there is data gap.
              if(data_err_started) {
                addDownRecord(downList, devState, data_err_st, last_ts, max_period, "invalid");
                data_err_started = false;
              }
              addDownRecord(downList, devState, last_ts, record.ts, 0, "gap");
            }
            // If very low bl, data error. Just changed from normal to very low, start of error.
            if ((!data_err_started) && (record.bl <= 8)) {
              //
              data_err_started = true;
              var data_err_st = record.ts;
            }
            // 
            if (data_err_started && (record.bl > 8)) {
              addDownRecord(downList, devState, data_err_st, record.ts, max_period, "invalid");
              data_err_started = false;
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
            console.log("Finished processing, ", sid, " : total=", total_down_mts);

            // Add cumulative if downtime is non-zero.
            if (total_down_mts > 0) {
              var down_record = {}

              down_record.sid = loc_id;
              down_record.loc = '';
              down_record.st = '';
              down_record.et = '';
              down_record.remarks = "Cumulative";

              down_record.dur_days = '';
              down_record.dur_hrs = '';
              down_record.dur_trunc_hrs = '';
              down_record.dur_mts = '';
              down_record.dur_txt = '';

              var total_days = (total_down_mts / 1440).toFixed(2);
              var total_hrs = (total_down_mts / 60).toFixed(2);

              var total_trunc_hrs = Math.trunc(total_hrs);
              //var dur_mts = Math.round(dur_secs / 60);
              //
              var total_bal_mts = total_down_mts - (total_trunc_hrs * 60);

              down_record.total_days = total_days;
              down_record.total_hrs = total_hrs;
              down_record.total_tr_hrs = total_trunc_hrs;
              down_record.total_mts = total_bal_mts;
              down_record.total_txt = total_trunc_hrs.toString() + 'h ' + total_bal_mts.toString() + 'min';;

              downList.push(down_record);
            }

            callback(null, downList);
          }

        } // else (no_err)
      }); //dynDoc.query

    }
  }); // getThingShadow
  // TODO: Will the function wait for callbacks before return?
}

function addDownRecord(downList, devState, ts_err_st, ts_record, max_period, errType) {
  var down_record = {}
  var dt_end = moment(ts_record).utcOffset('+0800').format("YYYY-MM-DD HH:mm");
  var dt_start = moment(ts_err_st).utcOffset('+0800').format("YYYY-MM-DD HH:mm");
  //down_record.sid = sid;
  down_record.sid = devState.loc_id;
  down_record.loc = devState.location;
  down_record.st = dt_start;
  down_record.et = dt_end;
  if(errType == "invalid") {
    down_record.remarks = "Invalid data";
  }
  else if(errType == "gap") {
    down_record.remarks = "Data gap";
  }
  //
  var dur_secs = (ts_record - ts_err_st) / 1000;
  var dur_mts = Math.round(dur_secs / 60);
  //
  if (dur_secs > max_period) {
    total_down_mts += dur_mts;
    console.log("2. Total down time, incr: ", total_down_mts)
    //
    //down_record.du_mts = dur_mts;
    var dur_days = (dur_secs / 86400).toFixed(2);
    down_record.dur_days = dur_days;
    var dur_hrs = (dur_secs / 3600).toFixed(2);
    down_record.dur_hrs = dur_hrs;

    var dur_trunc_hrs = Math.trunc(dur_hrs);
    var dur_mts = Math.round(dur_secs / 60);
    //
    var bal_mts = dur_mts - (dur_trunc_hrs * 60);
    down_record.dur_trunc_hrs = dur_trunc_hrs;
    down_record.dur_mts = bal_mts;
    down_record.dur_txt = dur_trunc_hrs.toString() + 'h ' + bal_mts.toString() + 'min';

    //
    down_record.total_days = '';
    down_record.total_hrs = '';
    down_record.total_tr_hrs = '';
    down_record.total_mts = '';
    down_record.total_txt = '';
    //
    downList.push(down_record);
  }
  return downList;
}

function addHeader(downList) {
  var down_record = {}
  var dt_end = "End";
  var dt_start = "Start";
  down_record.sid = "Station ID";
  down_record.loc = "Location";
  down_record.st = dt_start;
  down_record.et = dt_end;
  down_record.remarks = "Remarks";
  //
  down_record.dur_days = "Duration (days)";
  down_record.dur_hrs = "Duration (hrs)";

  down_record.dur_trunc_hrs = "Durarion (hrs+mins)";
  down_record.dur_mts = "";
  down_record.dur_txt = "Durarion (hrs+mins)";

  //
  var data_err_started = false;
  //
  down_record.total_days = 'Duration (days)';
  down_record.total_hrs = 'Duration (hrs)';
  down_record.total_tr_hrs = 'Durarion (hrs+mins)';
  down_record.total_mts = '';
  down_record.total_txt = 'Durarion (hrs+mins)';
  //
  downList.push(down_record);
  return downList;
}

//inputStream.pipe(uploadFromStream(s3));
function uploadFromStream(s3, BUCKET, KEY) {
  var pass = new stream.PassThrough();

  var params = { Bucket: BUCKET, Key: KEY, Body: pass };
  s3.upload(params, function (err, data) {
    console.log(err, data);
  });

  return pass;
}
