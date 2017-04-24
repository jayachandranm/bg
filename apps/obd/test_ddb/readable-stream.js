//------------------------------------------------------------------
// Dependencies

var Stream = require('stream')
  , util   = require('util');

//------------------------------------------------------------------
// ReadableStream class

util.inherits(ReadableStream, Stream.Readable);

function ReadableStream (options) {
  this._data = '';
  if (! options) options = {};
  options.objectMode = false;
  Stream.Readable.call(this, options);
}

ReadableStream.prototype._read = function(n) {
  console.log("readable stream", this._data);
  var ret = this.push(this._data);
  this._data = '';
  return ret;
};

ReadableStream.prototype.append = function(data) {
  this._data = data;
  this.push(this._data);
  //this.read(0);
};

ReadableStream.prototype.end = function() {
  this.push(null);
};

//------------------------------------------------------------------
// Exports

module.exports = ReadableStream
