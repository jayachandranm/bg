var aws = require('aws-sdk');
var stream = require('stream');
var DynStream = require('./dyn-stream');
var CSVTransform = require('./transform-stream');
//var MyStream = require('json2csv-stream');
var zlib = require('zlib');

var dateFormat = require('dateformat');
var ts = dateFormat(new Date(), "mmddyyyy-HHMMss")

function backupTable(tablename) {
//function backupTable(tablename, callback) {
  //console.log("backup..");
  var table_name = 'pubc5wl-ddb';
  var bucket_name = 'pubc5wl';
  var folder_name = 'daily_report';
  var data_stream = DynStream(table_name);
  var gzip = zlib.createGzip();
  var csv = CSVTransform();
  //var parser = new MyStream();

  // body will contain the compressed content to ship to s3
  //var body = data_stream.pipe(csv).pipe(process.stdout);
  var body = data_stream.pipe(csv).pipe(gzip);

  var s3obj = new aws.S3({params: {Bucket: bucket_name, Key: folder_name + '/' + table_name + '-' + ts + '.xls.gz'}});
  s3obj.upload({Body: body}).
    on('httpUploadProgress', function(evt) {
      console.log(evt);
    }).
    send(function(err, data) { console.log(err, data); });
    //send(function(err, data) { console.log(err, data); callback(); });
}

//backupTable('OBDTable_mmmYYYY');
module.exports.backupTable = backupTable;
