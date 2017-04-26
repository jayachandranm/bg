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
  if (! options) options = {};
  options.objectMode = true;
  Readable.call(this, options);
}

util.inherits(DynStream, Readable);

DynStream.prototype._read = function read() {  
  console.log("******* _ read() ********");
  var self = this;
  if (this.connecting || this.ended) return;

  this.connecting = true;
 
  // create parameters hash for table scan
  //var params = {TableName: this._tablename, ReturnConsumedCapacity: 'NONE', Limit: '1'};

  // describe the table and write metadata to the backup
  dynamo.describeTable({TableName: this._tablename}, function(err, data) {
    if (err) console.log(err, err.stack);
    else {
      console.log(data);
      table = data.Table
      // Write table metadata to first line
      //self.push(table);
      // limit the the number or reads to match our capacity
      //params.Limit = table.ProvisionedThroughput.ReadCapacityUnits

      var params = {
        TableName: self._tablename,
        //IndexName: 'Index',
        KeyConditionExpression: 'obd_dev_id = :hkey and #ts BETWEEN :rkey_l AND :rkey_h',
        ExpressionAttributeValues: {
          ':hkey': sids[0],
          ':rkey_l': 1480565971000,
          ':rkey_h': 1480566618000
        },
        ExpressionAttributeNames: {
          '#ts': 'timestamp',
        },
      };
      
      //self._scan(params);
      function multiQuery() {
        console.log("Multi query..", self._count, self._sidSize);
        if(self._count < self._sidSize) {
          params.ExpressionAttributeValues = { ':hkey': sids[self._count], ':rkey_l': 1480565971000, ':rkey_h': 1480566618000 };
          self._query(params);
          self._count++;
          if(self._count < self._sidSize) {
            setTimeout(multiQuery, 1000);
          }
          else {
            self.ended = true;
            //self.push(null);
          }
        }
      }
      multiQuery();
    }
  });
};

DynStream.prototype._query = function (params) {
  var self = this;
  // start streaminf table data
  dynDoc.query(params, function (err, data) {
    if (err) console.log(err, err.stack);
    else {
      for (var idx = 0; idx < data.Items.length; idx++) {
        self.push(data.Items[idx]);
        //self._count++;
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
      if(self.ended) {
        console.log("ENDED");
        self.push(null);
      }
    }
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

