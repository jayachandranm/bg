var ddb2s3 = require('./sid-ddb2s3');

exports.handler = function (event, context) {
  //
  console.log("Loading..");
  ddb2s3.sidRawToCsv(context);
};
