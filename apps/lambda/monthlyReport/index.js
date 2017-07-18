var ddb2s3 = require('./sid-ddb2s3');

exports.handler = function (event, context) {
  //
  ddb2s3.sidRawToCsv(context);
};
