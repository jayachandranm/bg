var Transform = require('stream').Transform;
var inherits = require('util').inherits;
var json2csv = require('json2csv');
//var jsonexport = require('jsonexport');

module.exports = CSVTransform;

function CSVTransform(options) {
  if ( ! (this instanceof CSVTransform))
    return new CSVTransform(options);

  if (! options) options = {};
  options.objectMode = true;
  Transform.call(this, options);
}

inherits(CSVTransform, Transform);

CSVTransform.prototype._transform = function transform(JSONrecord, encoding, callback) {
  var self = this;
  //console.log("transform", JSONrecord);
  //var fields = ['timestamp', 'gps_data.latitude', 'gps_data.longitude', 'obd_dev_id'];
  var fields = ['sid', 'ts', 'raw', 'wl', 'md'];
  var csv = json2csv({ data: JSONrecord, fields: fields, hasCSVColumnTitle: false, del: "\t" });
  //var csv = json2csv({ data: JSONrecord, fields: fields, hasCSVColumnTitle: false, del: "," });
  this.push(csv);
  this.push("\n");
  callback();
};
