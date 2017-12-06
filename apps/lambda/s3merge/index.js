var s3merge = require('./s3merge');

exports.handler = function (event, context) {
  //
  console.log("Loading..");
  s3merge.s3merge(context);
};
