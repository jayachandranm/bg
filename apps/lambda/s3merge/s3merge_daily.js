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

function s3merge_daily(context) {
  //function backupTable(tablename, callback) {
  //console.log("backup..");
  var bucket_name = config.bucket;
  var folder_name = config.folder;
  //
  // moment().local();
  //var ts = dateFormat(new Date(), "mmddyyyy-HHMMss");
  var currDayStart = moment().utcOffset('+0800').startOf('day');
  var lastDayStart = moment(currMonthStart).subtract(1, 'days');
  //var lastDayEnd = moment(lastMonthStart).endOf('day');
  //console.log(currMonthStart.format());
  //console.log(currMonthStart.valueOf());
  end_t = lastMonthEnd.valueOf();
  start_t = lastMonthStart.valueOf();
  //self._start_t = start_t;
  day_prefix = lastDayStart.format("DD-MM-YYYY");
  month_prefix = lastDayStart.format("MM-YYYY");
  console.log("Day to process..", day_prefix);
  //console.log("Number of sids..", sids.length);
  /*
  var archive = archiver('zip');
  archive.on('error', function(err) {
    throw err;
  });
  */
  var params = {
    Bucket: bucket_name,
    Delimiter: '/',
    Prefix: folder_name + '/' + day_prefix
  }

  s3.listObjects(params, function (err, data) {
    if(err)throw err;
    console.log(data);
  });
  //
  var combinedStream = CombinedStream.create();
  //
  var s3obj = new aws.S3(
   { params:
     { Bucket: bucket_name,
       Key: folder_name + '/' + month_prefix + '/daily-sms.xls'
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
      buffnl = Buffer.from('\n');
      //archive.append(stream1, { name: filename });
      combinedStream.append(stream1);
      combinedStream.append(buffnl);
      combinedStream.append(stream2);
      //send(function(err, data) { console.log(err, data); callback(); });
      //setTimeout(getMultiFileStream, config.pause);
  } // getMultiFileStream
  //getMultiFileStream();
} // sidRawToCsv

module.exports.s3merge = s3merge;
