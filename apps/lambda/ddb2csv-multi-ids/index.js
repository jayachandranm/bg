var backup = require('./ddb2s3-csv-all');

exports.handler = function (event, context) {
  //
  backup.backupTable(context);
};
