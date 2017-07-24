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
  //var lastDayEnd = moment(lastMonthStart).endOf('day');
  //console.log(currMonthStart.format());
  //console.log(currMonthStart.valueOf());
  //self._start_t = start_t;
  //day_prefix = lastDayStart.format("MMDDYYYY");
  // TODO: temp.
  month_prefix = lastDayStart.format("MM-YYYY");
  //month_prefix = currMonthStart.format("MM-YYYY");
  console.log("Day to process..", month_prefix);
  //console.log("Number of sids..", sids.length);
  /*
  var archive = archiver('zip');
  archive.on('error', function(err) {
    throw err;
  });
  */
  var s3l = new aws.S3();
  var s3r = new aws.S3();
  //
  var prefix = folder_name + '/m' + month_prefix
  console.log("Prefix=", prefix);
  var params_l = {
    Bucket: bucket_name,
    //Delimiter: '/',
    Prefix: prefix
  }

  var log_filenames = [];
  //var buffnl = Buffer.from('\n');
  s3l.listObjectsV2(params_l, function (err, data) {
    //if(err) throw err;
    if(err) {
      console.log(err, err.stack);
      return err;
    }
    //console.log(data);
    //
    var combinedStream = CombinedStream.create();
    //
    var monthly_file = folder_name + '/log_' + month_prefix + '_sms.xls'
    var s3obj = new aws.S3(
     { params:
       { Bucket: bucket_name,
         Key: monthly_file
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

    data.Contents.forEach(function(fileobj, index) {
      console.log(fileobj.Key);
      //log_filenames.push(fileobj.Key);
      var params_r = {Bucket: bucket_name, Key: fileobj.Key};
      var stream = s3r.getObject(params_r).createReadStream();
      combinedStream.append(stream);
      //combinedStream.append(buffnl);
    });
    //console.log("Filename List: ", log_filenames);
  });
} // sidRawToCsv

module.exports.s3merge = s3merge;
