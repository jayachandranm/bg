var s3merge = require('./s3merge_reports');

exports.handler = function (event, context) {
  //
  console.log("Loading..");
  s3merge.s3merge_reports(context);
};
