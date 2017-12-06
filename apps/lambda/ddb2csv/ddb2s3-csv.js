var aws = require('aws-sdk');
var stream = require('stream');
var Dyno = require('dyno');
var CSVTransform = require('./transform-stream');
var zlib = require('zlib');

var dateFormat = require('dateformat');
var ts = dateFormat(new Date(), "mmddyyyy-HHMMss")

  var dyno = Dyno({
    table: 'OBDTable_mmmYYYY',
    region: 'ap-southeast-1',
    //endpoint: 'http://localhost:4567'
  });

//exports.handler = function (event, context) {
function backupTable(context) {
//function backupTable(tablename, callback) {
  var tablename = 'OBDTable_mmmYYYY';

  //var data_stream = dyno.scanStream();

  var params = {
    //TableName: 'Table',
    //IndexName: 'Index',
    KeyConditionExpression: 'obd_dev_id = :hkey and #ts BETWEEN :rkey_l AND :rkey_h',
    ExpressionAttributeValues: {
      ':hkey': '213EP2016000570',
      ':rkey_l': 1480565971000,
      ':rkey_h': 1480566618000
    },
    ExpressionAttributeNames: {
      '#ts': 'timestamp',
    },
  };

  var data_stream = dyno.queryStream(params);

  var gzip = zlib.createGzip();
  var csv = CSVTransform();

  // body will contain the compressed content to ship to s3
  //var body = data_stream.pipe(process.stdout);
  var body = data_stream.pipe(csv).pipe(gzip);

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

