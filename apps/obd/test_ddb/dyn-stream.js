var aws = require('aws-sdk');
var Readable = require('stream').Readable;  
var util = require('util');

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
  var params = {TableName: this._tablename, ReturnConsumedCapacity: 'NONE', Limit: '1'};

  // describe the table and write metadata to the backup
  dynamo.describeTable({TableName: this._tablename}, function(err, data) {
    if (err) console.log(err, err.stack);
    else {
      //console.log(data);
      table = data.Table
      // Write table metadata to first line
      //self.push(table);
      /*
      self.push(JSON.stringify(table));
      self.push("\n");
      self.push("\n");
      */
      // limit the the number or reads to match our capacity
      params.Limit = table.ProvisionedThroughput.ReadCapacityUnits
      
      self._scan(params);
    }
  });
};

DynStream.prototype._scan = function (params) {
  var self = this;
  // start streaminf table data
  dynDoc.scan(params, function (err, data) {
    if (err) console.log(err, err.stack);
    else {
      //console.log("LENGTH=", data.Items.length);
      for (var idx = 0; idx < data.Items.length; idx++) {
        self.push(data.Items[idx]);
        //data_stream.append(JSON.stringify(data.Items[idx]));
        //data_stream.append("\n");
        //self._count++;
        //self.push(JSON.stringify(data.Items[idx]));
        //self.push("\n");
      }

      if (typeof data.LastEvaluatedKey != "undefined") {
        params.ExclusiveStartKey = data.LastEvaluatedKey;
        //dynamo.scan(params, onScan);
        self._scan(params);
      }
      else {
        //data_stream.end()
        //console.log("END: ", self._count);
        self.push(null);
      }
    }
  });
};


