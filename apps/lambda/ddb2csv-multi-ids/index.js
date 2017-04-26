var backup = require('./ddb2s3-csv-multi-query');

exports.handler = function (event, context) {
  backup.backupTable(context);
};
