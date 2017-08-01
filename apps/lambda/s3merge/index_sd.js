var s3merge = require('./shadowsToCSV');

exports.handler = function (event, context) {
  //
  console.log("Loading..");
  s3merge.shadowsToCSV(context);
};
