var aws = require('aws-sdk');
var stream = require('stream');
//var MyStream = require('json2csv-stream');
var zlib = require('zlib');
var dateFormat = require('dateformat');
var moment = require('moment');
var archiver = require('archiver');
var DynStream = require('./dyn-stream');
var CSVTransform = require('./transform-stream');
var sids_j = require('./station-ids.json');

var sids = sids_j.stations;

var ts = dateFormat(new Date(), "mmddyyyy-HHMMss");

function sidRawToCsv(context) {
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
  //
  var archive = archiver('zip');
  var s3obj = new aws.S3(
   { params:
     { Bucket: bucket_name,
       Key: folder_name + '/' + 'test.zip'
     }
   }
  );
  s3obj.upload({Body: archive}).
  on('httpUploadProgress', function(evt) {
    console.log(evt);
  }).
  send(function(err, data) {
    console.log(err, data);
  });

  var count = 0;
  function streamToS3(callback) {
    if(count < sids.length) {
      var sid = sids[count];
      count++;
      console.log("Processing, ", sid);
      var data_stream = DynStream(table_name, sid, start_t, end_t);
      var gzip = zlib.createGzip();
      var csv = CSVTransform();
      //var parser = new MyStream();

      // body will contain the compressed content to ship to s3
      //var body = data_stream.pipe(csv).pipe(process.stdout);
      var body = data_stream.pipe(csv).pipe(gzip);

      var abs_filename = folder_name + '/' + file_dt_tag + '/' + sid + '_' + file_dt_tag + '.xls.gz';
      console.log("Filename=", abs_filename);
      var rel_filename = sid + '_' + file_dt_tag + '.xls.gz';
      archive.append(body, { name: rel_filename });
      //send(function(err, data) { console.log(err, data); callback(); });
      setTimeout(streamToS3, 500);
    }// if count
    else{
      console.log("All stations processed.");;
    }
  } // streamToS3
  streamToS3();
} // sidRawToCsv

module.exports.sidRawToCsv = sidRawToCsv;
