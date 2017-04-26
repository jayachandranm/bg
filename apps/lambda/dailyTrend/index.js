var process = require('./ddb-daily-trend');

exports.handler = function (event, context) {
  process.processDaily(context);
};
