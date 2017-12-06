var process = require('./ddb-daily-trend');

exports.handler = function (event, context, callback) {
    process.updateDailyTrend(context);
    //callback("Daily trend updated.")
};
