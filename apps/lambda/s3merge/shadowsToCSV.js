var aws = require('aws-sdk');
var stream = require('stream');
//var MyStream = require('json2csv-stream');
//var zlib = require('zlib');
var fs = require('fs');
//var dateFormat = require('dateformat');
//var moment = require('moment');
//var archiver = require('archiver');
var CombinedStream = require('combined-stream2');
//var sids_j = require('./station-ids.json');
var config = require('./config.json');

var bucket_name = config.bucket;
var dev_state_file = config.dev_file;
var iot_folder_name = config.folder_iot;

var iotdata = new aws.IotData({endpoint: config.endpointAddress, region: 'ap-southeast-1'});


function shadowsToCSV(context) {
    //function backupTable(tablename, callback) {
    //console.log("backup..");
    //var bucket_name = config.bucket;
    var folder_name = config.folder;
    var buffcomma = Buffer.from(',');
    var buffnl = Buffer.from('\n');
    //
    // moment().local();
    var s3l = new aws.S3();
    var s3r = new aws.S3();
    //
    //console.log(data);
    //
    var rep_file = folder_name + '/reports/shadows_all.xls';
/*
    var combinedStream = CombinedStream.create();
    //
    var s3obj = new aws.S3(
        {
            params: {
                Bucket: bucket_name,
                Key: rep_file
            }
        }
    );
    //
    s3obj.upload({Body: combinedStream}).on('httpUploadProgress', function (evt) {
        console.log(evt);
    }).send(function (err, data) {
        console.log(err, data);
    });
*/
    //
    
    var count = 0;
    var heading = 'sid, cope, invert, calib_m, calib_c, offset, delta, spike_th';
    storeInS3('ATITLE', heading);

    var s3dev = new aws.S3();
    var params_dev =
       { Bucket: bucket_name,
         Key: iot_folder_name + '/' + dev_state_file
       };
    
    var sids; // sids_j.stations;
    s3dev.getObject(params_dev, function(err, data) {
        var fileContents = data.Body.toString();
        devs_b_state = JSON.parse(fileContents);
        var dev_b_state_by_sids = devs_b_state.dev_state;
        sids = Object.keys(dev_b_state_by_sids);
        var listSize = sids.length;
        console.log("List size: ", listSize);    
        //console.log(sids);
        sids.forEach(function (sid, index) {
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
                    var cl = devState.cope_level;
                    var il = devState.invert_level;
                    var cm = devState.calibration_m;
                    var cc = devState.calibration_c;
                    var oo = devState.offset_o;
                    var dl = devState.delta;
                    var st = devState.spike_threshold;
            var line = sid + ',' + cl + ',' + il + ',' + cm + ',' + cc + ',' + oo + ',' + dl 
                    + ',' + st + '\n';
            console.log("Line: ", line);
                    storeInS3(sid, line);
                    //combinedStream.append(buffcope);
                    //combinedStream.append(buffcomma);
                    //combinedStream.append(buffnl);
                }
            }); // shadow fn.
        }); //foreach sid
    });
    
} // shadowsToCSV

function storeInS3(sid, msg) {
  var bucket_name = 'pubc5wl';
  var folder_name = 'sms_log';
  var s3_key = folder_name + '/reports/shadows/' + sid + '.csv';
  console.log('Report filename: ', s3_key);
  var params = {
     Bucket : bucket_name,
     Key : s3_key,
     Body : msg
  }
  var s3 = new aws.S3();
  s3.putObject(params, function(err, data) {
    if (err) 
      console.log(err, err.stack); // an error occurred
    else
      console.log(data);           // successful response
    });
}

module.exports.shadowsToCSV = shadowsToCSV;
