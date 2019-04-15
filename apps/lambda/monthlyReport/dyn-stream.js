var aws = require('aws-sdk');
var moment = require('moment');
var Readable = require('stream').Readable;
var util = require('util');

aws.config.update({ region: 'ap-southeast-1' });
dynamo = new aws.DynamoDB();
dynDoc = new aws.DynamoDB.DocumentClient();

//

module.exports = DynStream;

function DynStream(tablename, sid, config, devState, devs_s3_state, start_t, end_t, options) {
  if (!(this instanceof DynStream)) {
    return new DynStream(tablename, sid, devState, start_t, end_t, options);
  }
  //console.log(tablename, sid, devState.location, start_t, end_t);
  this._tablename = tablename;
  this.connecting = false;
  this.ended = false;
  this._count = 0;
  //this._sidSize = sids.length;
  this._sid = sid;
  this._config = config;
  this._dev_state = devState;
  this._dev_s3_state = devs_s3_state;
  this._end_t = end_t;
  this._start_t = start_t;
  if (!options) options = {};
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
  dynamo.describeTable({ TableName: this._tablename }, function (err, data) {
    if (err) {
      console.log(err, err.stack);
    }
    else {
      //console.log(data);
      //console.log(self._sid, self._start_t, self._end_t);
      table = data.Table;
      // Write table metadata to first line
      //self.push(table);
      // Create one dummy row of data, where the values goes for title.
      //var title = { sid: 'STATION-ID', ts: 'DATE-TIME', wa: 'WATER-LVL(cm)', md: 'STATUS' }
      var station_name_flag = self._config.station_name_flag;
      var alias = devs_s3_state.dev_state[sid].alias;
      var sid = self._sid;
      var st_name = alias;
      if(station_name_flag == "SID") {
        st_name = sid;
      }
      var loc = self._dev_state.location;
      var inv_lvl = self._dev_state.invert_level;
      var op_lvl = (inv_lvl + (self._dev_state.offset_o / 100)).toFixed(3);
      inv_lvl = inv_lvl.toFixed(3);
      var cl = (self._dev_state.critical_level).toFixed(3);
      var desc = { dt: "Station ID: ", wa: st_name, mrl: '', md: '' }
      self.push(desc);
      var desc = { dt: "Station Name: ", wa: loc, mrl: '', md: '' }
      self.push(desc);
      desc = "";
      self.push(desc);
      var desc = { dt: "Critical level ", wa: cl, mrl: "mRL", md: '' }
      self.push(desc);
      var desc = { dt: "Cope/Soffit level ", wa: cl, mrl: "mRL", md: '' }
      self.push(desc);
      var desc = { dt: "Sensor level ", wa: op_lvl, mrl:  "mRL", md: '' }
      self.push(desc);
      var desc = { dt: "Invert level ", wa: inv_lvl, mrl:  "mRL", md: '' }
      self.push(desc);
      desc = "";
      self.push(desc);
      var title = { dt: 'DATE TIME', wa: 'WATER DEPTH(m)', mrl: 'WATER LEVEL(mRL)', roc: 'RATE OF CHANGE (m/min)', md: 'STATUS' }
      self.push(title);
      // limit the the number or reads to match our capacity
      //params.Limit = table.ProvisionedThroughput.ReadCapacityUnits
      console.log(st_name, self._start_t, self._end_t);
      // Query using sid and not alias.
      var params = {
        TableName: self._tablename,
        //IndexName: 'Index',
        KeyConditionExpression: 'sid = :hkey and #ts BETWEEN :rkey_l AND :rkey_h',
        ExpressionAttributeValues: {
          ':hkey': self._sid,
          ':rkey_l': self._start_t,
          ':rkey_h': self._end_t
        },
        ExpressionAttributeNames: {
          '#ts': 'ts',
        },
        ScanIndexForward: true,
      };
      //
      self._query(params);
    } // else (no_err)
  }); //describeTable
}; // read

DynStream.prototype._query = function (params) {
  var self = this;
  // start streaminf table data
  var last_ts = -1;
  var last_wa = -1;
  var roc = 0;
  dynDoc.query(params, function (err, data) {
    if (err) {
      console.log(err, err.stack);
      //callback(err);
    }
    else {
      for (var idx = 0; idx < data.Items.length; idx++) {
        var record = data.Items[idx];
        //var dt_local = moment(record.ts).utcOffset('+0800').format("DD-MMM-YYYY HH:mm:ss");
        var dt_local = moment(record.ts).utcOffset('+0800').format("DD/MM/YYYY HH:mm");
        record.wa = record.wa / 100; 
        var offset = self._dev_state.offset_o / 100;
        if (record.wa <= (0.08 + offset)) {
          record.wa = offset;
        }
        record.mrl = record.wa + self._dev_state.invert_level;
        record.dt = dt_local;
        if (last_ts != -1) {
          var wa_diff = record.wa - last_wa;
          var ts_diff_mts = (record.ts - last_ts) / 60000;
          roc = wa_diff / ts_diff_mts;
        }
        last_ts = record.ts;
        last_wa = record.wa;
        
        if (typeof (record.md) == 'undefined') {
          record.md = "Normal";
        }
        else if ( record.md === 'maintenance') {
          record.md = "Maintenance";
        }
        record.wa = (record.wa).toFixed(3);
        record.mrl = (record.mrl).toFixed(3)
        record.roc = roc.toFixed(2);
        //self.push(data.Items[idx]);
        self.push(record);
        //self._count++;
      }
      //
      if (typeof data.LastEvaluatedKey != "undefined") {
        params.ExclusiveStartKey = data.LastEvaluatedKey;
        //dynamo.scan(params, onScan);
        self._query(params);
      }
      else {
        //data_stream.end()
        self.push(null);
      }

    } // else (no_err)
  }); //dynDoc.query
}; //_query

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
