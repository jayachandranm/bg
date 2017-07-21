var aws = require('aws-sdk');
var stream = require('stream');
//var MyStream = require('json2csv-stream');
//var zlib = require('zlib');
var fs = require('fs');
//var dateFormat = require('dateformat');
var moment = require('moment');
//var archiver = require('archiver');
var CombinedStream = require('combined-stream2');
//var sids_j = require('./station-ids.json');
var config = require('./config.json');

//var sids = sids_j.stations;


function s3merge(context) {
  //function backupTable(tablename, callback) {
  //console.log("backup..");
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
  //console.log("Number of sids..", sids.length);
  /*
  var archive = archiver('zip');
  archive.on('error', function(err) {
    throw err;
  });
  */
  //
  var combinedStream = CombinedStream.create();
  //
  var s3obj = new aws.S3(
   { params:
     { Bucket: bucket_name,
       Key: folder_name + '/merge/' + file_dt_tag + 'sms.xls'
     }
   }
  );
  //
  s3obj.upload({Body: combinedStream}).
  on('httpUploadProgress', function(evt) {
    console.log(evt);
  }).
  send(function(err, data) {
    console.log(err, data);
  });

  var count = 0;
  //
  var s3 = new aws.S3();
  //
  function getMultiFileStream(callback) {
      //var sid = sids[count];
      count++;
      console.log("Processing, CWS001+CWS002");
      var file1 = folder_name + '/' + "CWS001-06152017-020028-sms.log";
      var file2 = folder_name + '/' + "CWS002-06082017-082125-sms.log";
      //
      var params = {Bucket: bucket_name, Key: file1};
      var stream1, stream2;
      stream1 = s3.getObject(params).createReadStream();
      var params = {Bucket: bucket_name, Key: file2};
      stream2 = s3.getObject(params).createReadStream();
      /*
      try {
        stream1 = s3.getObject(params).createReadStream();
      } catch(error) {
        // Catching NoSuchKey & StreamContentLengthMismatch
      }
      */
      //var filename = sid + '_' + file_dt_tag + '.xls';
      //var abs_filename = folder_name + '/' + file_dt_tag + '/' + filename;
      //console.log("Filename=", abs_filename);
      buffnl = Buffer.from('\n');
      //archive.append(stream1, { name: filename });
      combinedStream.append(stream1);
      combinedStream.append(buffnl);
      combinedStream.append(stream2);
      //send(function(err, data) { console.log(err, data); callback(); });
      //setTimeout(getMultiFileStream, config.pause);
  } // getMultiFileStream
  getMultiFileStream();
} // sidRawToCsv

module.exports.s3merge = s3merge;
