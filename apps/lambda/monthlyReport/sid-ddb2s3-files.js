var aws = require('aws-sdk');
var stream = require('stream');
//var MyStream = require('json2csv-stream');
var zlib = require('zlib');
var dateFormat = require('dateformat');
var moment = require('moment');
var DynStream = require('./dyn-stream');
var CSVTransform = require('./transform-stream');
var sids_j = require('./station-ids.json');
var config = require('./config.json');

var iotdata = new aws.IotData({endpoint: config.endpointAddress, region: 'ap-southeast-1'});

var sids = sids_j.stations;

var ts = dateFormat(new Date(), "mmddyyyy-HHMMss");

function sidRawToCsv_files(context) {
  //function backupTable(tablename, callback) {
  //console.log("backup..");
  var table_name = 'pubc5wl-ddb';
  var bucket_name = 'pubc5wl';
  var folder_name = 'monthly_report';
  //
  // moment().local();
  var currMonthStart = moment().utcOffset('+0800').startOf('month');
  var lastMonthStart = moment(currMonthStart).subtract(1, 'months');
  var lastMonthEnd = moment(lastMonthStart).endOf('month');
  //console.log(currMonthStart.format(), lastMonthStart.format(), lastMonthEnd.format());
  //console.log(currMonthStart.valueOf(), lastMonthStart.valueOf(), lastMonthEnd.valueOf())
  end_t = lastMonthEnd.valueOf();
  start_t = lastMonthStart.valueOf();
  //self._start_t = start_t;
  file_dt_tag = lastMonthStart.format("MM-YYYY");
  console.log("Start/end times..", start_t, end_t, file_dt_tag);
  console.log("Number of sids..", sids.length);
  // TODO: Report error and exit, if there is an error in processing.
  var count = 0;
  function streamToS3() {
    //if(count < sids.length) {
    if(count < 2) {
      var sid = sids[count];
      count++;
      console.log("Processing, ", sid);
      var devState;
      iotdata.getThingShadow({
        thingName: thingName
      }, function (err, data) {
        if (err) {
          context.fail(err);
          console.log("Error in getting Shadow.", err);
        } else {
          var jsonPayload = JSON.parse(data.payload);
          console.log('Shadow: ' + JSON.stringify(jsonPayload, null, 2));
          devState = jsonPayload.state.reported;
          var data_stream = DynStream(table_name, sid, devState, start_t, end_t);
          var gzip = zlib.createGzip();
          var csv = CSVTransform();
          //var parser = new MyStream();

          // body will contain the compressed content to ship to s3
          //var body = data_stream.pipe(csv).pipe(process.stdout);
          var body = data_stream.pipe(csv).pipe(gzip);

          var filename = sid + '_' + file_dt_tag + '.xls.gz';
          var abs_filename = folder_name + '/' + file_dt_tag + '/' + filename;
          console.log("Filename=", abs_filename);

          var s3obj = new aws.S3(
            { params:
              { Bucket: bucket_name,
                Key: abs_filename
              }
            }
          );
          s3obj.upload({Body: body}).
          on('httpUploadProgress', function(evt) {
            console.log(evt);
          }).
          send(function(err, data) {
            console.log(err, data);
          });
          //send(function(err, data) { console.log(err, data); callback(); });
          setTimeout(streamToS3, 500);
        } // else, iot shadow_no_err
      }); // getThingShadow
    }// if count
  } // streamToS3
  streamToS3();
} // sidRawToCsv

module.exports.sidRawToCsv_files = sidRawToCsv_files;
