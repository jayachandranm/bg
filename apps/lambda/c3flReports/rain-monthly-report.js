var aws = require('aws-sdk');
var stream = require('stream');
//var MyStream = require('json2csv-stream');
var zlib = require('zlib');
//var dateFormat = require('dateformat');
var moment = require('moment');
var archiver = require('archiver');
var DynStream = require('./rain-dyn-stream');
var CSVTransform = require('./rain-transform-stream');
//var sids_json = require('./station-B-ids.json');
var config = require('./config_rain.json');

var iotdata = new aws.IotData({ endpoint: config.endpointAddress, region: 'ap-southeast-1' });

var sids; //sids_json.stations;
var devs_state;

exports.handler = function(event, context) {
  //
  console.log("Loading..");
  sidRawToCsv(context);
};

function sidRawToCsv(context) {
  //function backupTable(tablename, callback) {
  //console.log("backup..");
  var table_name = config.table;
  var bucket_name = config.bucket;
  var folder_name = config.folder;
  var dev_state_file = config.dev_file;
  //
  var iot_folder_name = config.folder_iot;
  var batch = config.batch;
  var rel_month = config.rel_month;

  //
  // moment().local();
  //var ts = dateFormat(new Date(), "mmddyyyy-HHMMss");
  //var currMonthStart = moment().utcOffset('+0800').startOf('month');
  var monthStart = moment().utcOffset('+0800').startOf('month').subtract(rel_month, 'months');
  //var currMonthStart = moment().utcOffset('+0800').startOf('month').subtract(3, 'months').add(10, 'days');
  //var monthStart = moment(currMonthStart).subtract(1, 'months');
  var monthEnd = moment(monthStart).endOf('month');
  //console.log(currMonthStart.format(), lastMonthStart.format(), lastMonthEnd.format());
  //console.log(currMonthStart.valueOf(), lastMonthStart.valueOf(), lastMonthEnd.valueOf())
  var end_t = monthEnd.valueOf();
  var start_month_t = monthStart.valueOf();
  //self._start_t = start_t;
  var file_dt_tag = monthStart.format("YYYYMM");
  console.log("Start/end times..", start_month_t, end_t, file_dt_tag);
  //
  var archive = archiver('zip');
  archive.on('error', function(err) {
    throw err;
  });
  //
  var s3obj = new aws.S3({
    params: {
      Bucket: bucket_name,
      Key: folder_name + '/' + file_dt_tag + '_rain0.zip'
    }
  });
  //
  s3obj.upload({ Body: archive }).
  on('httpUploadProgress', function(evt) {
    console.log(evt);
  }).
  send(function(err, data) {
    console.log(err, data);
  });

  //
  var s3dev = new aws.S3();
  var params_dev = {
    Bucket: bucket_name,
    Key: iot_folder_name + '/' + dev_state_file
  };

  s3dev.getObject(params_dev, function(err, data) {
    var fileContents = data.Body.toString();
    devs_state = JSON.parse(fileContents);
    var dev_b_state_by_sids = devs_state.dev_state;
    sids = Object.keys(dev_b_state_by_sids);
    //console.log(sids);
    //
    getMultiFileStream(sids);
  });


  var count = 0;

  function getMultiFileStream(callback) {
    // sids defined as global, so that the variable is available for,
    // repeated call  of this function.
    if (count < sids.length) {
      var sid = sids[count];
      count++;
      console.log("Processing, ", sid);

      var comms_date = devs_state.dev_state[sid].comms_dt;

      var comms_dt_str = comms_date + " 0:00 +0800";
      // Take D+1 wrt commissioning date.
      var comms_dt = moment(comms_dt_str, 'DD-MM-YYYY HH:mm Z').add(1, 'days');
      var comms_utime = comms_dt.valueOf();

      var start_t = start_month_t;
      if (comms_utime > start_t) {
        console.log("Comms_utime, month_st: ", sid, comms_utime, start_t);
        start_t = comms_utime;
      }

      // If the commissioning date is later than end of this month, just skip the CSV for this station.
      if (start_t < end_t) {

        var devState;
        iotdata.getThingShadow({
          thingName: sid
        }, function(err, data) {
          if (err) {
            context.fail(err);
            console.log("Error in getting Shadow.", err);
          }
          else {
            var jsonPayload = JSON.parse(data.payload);
            //console.log('Shadow: ' + JSON.stringify(jsonPayload, null, 2));
            devState = jsonPayload.state.reported;
            var cl = devs_state.dev_state[sid].critical_level;
            devState.critical_level = cl;
            // Station name.
            var loc_id = devs_state.dev_state[sid].sn;
            devState.loc_id = loc_id;
            var data_stream = DynStream(table_name, sid, devState, start_t, end_t);
            //var gzip = zlib.createGzip();
            var csv = CSVTransform();

            // body will contain the stream content to ship to s3
            //var body = data_stream.pipe(csv).pipe(process.stdout);
            //var body = data_stream.pipe(csv).pipe(gzip);
            var body = data_stream.pipe(csv);

            var filename = sid + '_' + file_dt_tag + '.csv';
            //var abs_filename = folder_name + '/' + file_dt_tag + '/' + filename;
            //console.log("Filename=", abs_filename);
            archive.append(body, { name: filename });
            //send(function(err, data) { console.log(err, data); callback(); });
            setTimeout(getMultiFileStream, config.pause);
          }
        }); // getThingShadow
      } // if start_t lt end_t
      else {
        console.log("Commissioning date is after this month, skip sid and process next, ", sid);
        setTimeout(getMultiFileStream, config.pause);
      }

    } // if count
    else {
      console.log("All stations processed.");
      archive.finalize();
    }
  } // getMultiFileStream
  //getMultiFileStream();
} // sidRawToCsv

module.exports.sidRawToCsv = sidRawToCsv;
