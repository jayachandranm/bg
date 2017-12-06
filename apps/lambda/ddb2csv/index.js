var backup = require('./ddb2s3-csv');

exports.handler = function (event, context) {
  backup.backupTable(context);
};
