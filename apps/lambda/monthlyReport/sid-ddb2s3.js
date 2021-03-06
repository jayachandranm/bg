var aws = require('aws-sdk');
var stream = require('stream');
//var MyStream = require('json2csv-stream');
var zlib = require('zlib');
//var dateFormat = require('dateformat');
var moment = require('moment');
var archiver = require('archiver');
var DynStream = require('./dyn-stream');
var CSVTransform = require('./transform-stream');
var sids_j = require('./station-ids.json');
var config = require('./config.json');

var iotdata = new aws.IotData({endpoint: config.endpointAddress, region: 'ap-southeast-1'});

var sids = sids_j.stations;

function sidRawToCsv(context) {
  //function backupTable(tablename, callback) {
  //console.log("backup..");
  var table_name = config.table;
  var bucket_name = config.bucket;
  var folder_name = config.folder;
  //
  // moment().local();
  //var ts = dateFormat(new Date(), "mmddyyyy-HHMMss");
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
  //
  var archive = archiver('zip');
  archive.on('error', function(err) {
    throw err;
  });
  //
  var s3obj = new aws.S3(
   { params:
     { Bucket: bucket_name,
       Key: folder_name + '/' + file_dt_tag + '.zip'
     }
   }
  );
  //
  s3obj.upload({Body: archive}).
  on('httpUploadProgress', function(evt) {
    console.log(evt);
  }).
  send(function(err, data) {
    console.log(err, data);
  });

  var count = 0;
  function getMultiFileStream(callback) {
    if(count < sids.length) {
      var sid = sids[count];
      count++;
      console.log("Processing, ", sid);
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
          var data_stream = DynStream(table_name, sid, devState, start_t, end_t);
          var gzip = zlib.createGzip();
          var csv = CSVTransform();

          // body will contain the stream content to ship to s3
          //var body = data_stream.pipe(csv).pipe(process.stdout);
          //var body = data_stream.pipe(csv).pipe(gzip);
          var body = data_stream.pipe(csv);

          var filename = sid + '_' + file_dt_tag + '.xls';
          //var abs_filename = folder_name + '/' + file_dt_tag + '/' + filename;
          //console.log("Filename=", abs_filename);
          archive.append(body, { name: filename });
          //send(function(err, data) { console.log(err, data); callback(); });
          setTimeout(getMultiFileStream, config.pause);
        }
      }); // getThingShadow
    }// if count
    else{
      console.log("All stations processed.");
      archive.finalize();
    }
  } // getMultiFileStream
  getMultiFileStream();
} // sidRawToCsv

module.exports.sidRawToCsv = sidRawToCsv;
