var aws = require('aws-sdk');
var stream = require('stream');
var DynStream = require('./dyn-stream');
var CSVTransform = require('./transform-stream');
//var MyStream = require('json2csv-stream');
var zlib = require('zlib');
var dateFormat = require('dateformat');
var sids_j = require('./station-ids.json')

var sids = sids_j.stations;

var ts = dateFormat(new Date(), "mmddyyyy-HHMMss")

function sidRawToCsv(tablename) {
//function backupTable(tablename, callback) {
  //console.log("backup..");
  var table_name = 'pubc5wl-ddb';
  var bucket_name = 'pubc5wl';
  var folder_name = 'monthly_report';
  //
  var d = new Date(); 
  //d.setHours(0,0,0,0);
  var end_t = d.getTime();
  //self._end_t = end_t;
  d.setDate(d.getDate() - 1);
  var start_t = d.getTime();
  //self._start_t = start_t;
  console.log("Start/end times..", start_t, end_t);

  //	
  sids.forEach(function(sid){
    var data_stream = DynStream(table_name, sid, start_t, end_t);
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
}

//backupTable('OBDTable_mmmYYYY');
module.exports.backupTable = backupTable;
