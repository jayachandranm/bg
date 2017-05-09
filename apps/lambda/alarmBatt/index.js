var process = require('./processBattLow');

exports.handler = function (event, context, callback) {
    process.processBattLow(event, context);
    //callback("Daily trend updated.")
};
