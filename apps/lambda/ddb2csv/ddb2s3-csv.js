var aws = require('aws-sdk');
var stream = require('stream');
var Dyno = require('dyno');
//var assert = require('assert');
var CSVTransform = require('./transform-stream');
//var MyStream = require('json2csv-stream');
var zlib = require('zlib');
//var async = require('async');

var dateFormat = require('dateformat');
var ts = dateFormat(new Date(), "mmddyyyy-HHMMss")

  var dyno = Dyno({
    table: 'OBDTable_mmmYYYY',
    region: 'ap-southeast-1',
    //endpoint: 'http://localhost:4567'
  });

//exports.handler = function (event, context) {
//function backupTable(tablename) {
function backupTable(context) {
//function backupTable(tablename, callback) {
  //var data_stream = new ReadableStream();//new stream.Readable();
  //var data_stream = new DynStream(tablename);
  var tablename = 'OBDTable_mmmYYYY';
  var data_stream = dyno.scanStream();
  var gzip = zlib.createGzip();
  var csv = CSVTransform();
  //var parser = new MyStream();

  // body will contain the compressed content to ship to s3
  //var body = data_stream.pipe(gzip);
  //var body = data_stream.pipe(process.stdout);
  //var body = data_stream.pipe(csv).pipe(process.stdout);
  var body = data_stream.pipe(csv).pipe(gzip);
  //var body = data_stream.pipe(csv);
  //var body = data_stream.pipe(parser).pipe(process.stdout);
  //var body = data_stream;

  var s3obj = new aws.S3({params: {Bucket: 'abhcs-hello-ddb', Key: tablename + '/' + tablename + '-' + ts + '.xls.gz'}});
  s3obj.upload({Body: body}).
    on('httpUploadProgress', function(evt) {
      console.log(evt);
    }).
    send(function(err, data) { console.log(err, data); });
    //send(function(err, data) { console.log(err, data); callback(); });
} //function backupTable
//};

module.exports.backupTable = backupTable;

//function backupAll(context) {
/*
function backupAll() {
  dynamo.listTables({}, function(err, data) {
    if (err) console.log(err, err.stack); // an error occurred
    else {
      async.each(data.TableNames, function(table, callback) {
        console.log('Backing up ' + table);
        backupTable(table, callback);
      }, function(err){
        if( err ) {
          console.log('A table failed to process');
        } else {
          console.log('All tables have been processed successfully');
        }
        //context.done(err);
      });
    }
  });
}
*/

//backupAll();
//backupTable('OBDTable_mmmYYYY');

//module.exports.backupAll = backupAll;
