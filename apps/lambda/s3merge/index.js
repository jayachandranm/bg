var s3merge = require('./s3merge_daily');

exports.handler = function (event, context) {
  //
  console.log("Loading..");
  s3merge.s3merge_daily(context);
};
