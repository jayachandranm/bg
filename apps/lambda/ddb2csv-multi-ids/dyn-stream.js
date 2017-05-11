var aws = require('aws-sdk');
var Readable = require('stream').Readable;  
var util = require('util');
var sids = require('./station-ids.json')

aws.config.update({ region: 'ap-southeast-1' });
dynamo = new aws.DynamoDB();
dynDoc = new aws.DynamoDB.DocumentClient();

module.exports = DynStream;

function DynStream(tablename, options) {  
  if (! (this instanceof DynStream)) return new DynStream(tablename, options);
  this._tablename = tablename;
  this.connecting = false;
  this.ended  = false;
  this._count = 0;
  this._sidSize = sids.length;
  this._end_t = 0;
  this._start_t = 0;
  if (! options) options = {};
  options.objectMode = true;
  Readable.call(this, options);
}

util.inherits(DynStream, Readable);

DynStream.prototype._read = function read() {  
  //console.log("******* _ read() ********");
  var self = this;
  if (this.connecting || this.ended) return;

  this.connecting = true;
 
  // create parameters hash for table scan
  //var params = {TableName: this._tablename, ReturnConsumedCapacity: 'NONE', Limit: '1'};

  // describe the table and write metadata to the backup
  dynamo.describeTable({TableName: this._tablename}, function(err, data) {
    if (err) console.log(err, err.stack);
    else {
      //console.log(data);
      table = data.Table
      // Write table metadata to first line
      //self.push(table);
  //var fields = ['timestamp', 'gps_data.latitude', 'gps_data.longitude', 'obd_dev_id'];
      // Create one dummy row of data, where the values goes for title.
      var title = { sid: 'STATION-ID', ts: 'DATE-TIME', raw: 'WATER-LVL(cm)', wl: 'WATER-LVL(%)', md: 'STATUS' }
      self.push(title);
      // limit the the number or reads to match our capacity
      //params.Limit = table.ProvisionedThroughput.ReadCapacityUnits

      //self._scan(params);
      var d = new Date(); 
      //d.setHours(0,0,0,0);
      var end_t = d.getTime();
      self._end_t = end_t;
      d.setDate(d.getDate() - 1);
      var start_t = d.getTime();
      self._start_t = start_t;
      console.log("Start/end times..", start_t, end_t);

      var params = {
        TableName: self._tablename,
        //IndexName: 'Index',
        KeyConditionExpression: 'sid = :hkey and #ts BETWEEN :rkey_l AND :rkey_h',
        ExpressionAttributeValues: {
          ':hkey': sids[0],
          ':rkey_l': self._start_t,
          ':rkey_h': self._end_t
        },
        ExpressionAttributeNames: {
          '#ts': 'ts',
        },
      };
      
      function multiQuery() {
        //console.log("Multi query..", self._count, self._sidSize, "===============");
        if(self._count < self._sidSize) {
          params.ExpressionAttributeValues = { ':hkey': sids[self._count], ':rkey_l': self._start_t, ':rkey_h': self._end_t };
          self._query(params, function(err){
            self._count++;
            setTimeout(multiQuery, 1000);
          });
        }
        else {
          //console.log("ENDED");
          self.ended = true;
          self.push(null);
        }
      }
      multiQuery();
    }
  });
};

DynStream.prototype._query = function (params, callback) {
  var self = this;
  // start streaminf table data
  dynDoc.query(params, function (err, data) {
    if (err) {
      console.log(err, err.stack);
      callback(err);
    }
    else {
      for (var idx = 0; idx < data.Items.length; idx++) {
        self.push(data.Items[idx]);
        //self._count++;
      }
      callback();
    }
     
/*
      if (typeof data.LastEvaluatedKey != "undefined") {
        params.ExclusiveStartKey = data.LastEvaluatedKey;
        //dynamo.scan(params, onScan);
        self._scan(params);
      }
      else {
        //data_stream.end()
        self.push(null);
      }
*/
  });
};

DynStream.prototype._scan = function (params) {
  var self = this;
  // start streaminf table data
  dynDoc.scan(params, function (err, data) {
    if (err) console.log(err, err.stack);
    else {
      for (var idx = 0; idx < data.Items.length; idx++) {
        self.push(data.Items[idx]);
        //self._count++;
      }

      if (typeof data.LastEvaluatedKey != "undefined") {
        params.ExclusiveStartKey = data.LastEvaluatedKey;
        //dynamo.scan(params, onScan);
        self._scan(params);
      }
      else {
        //data_stream.end()
        self.push(null);
      }
    }
  });
};

