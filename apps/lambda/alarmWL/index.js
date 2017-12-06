var process = require('./processWLSmsExt');

exports.handler = function (event, context, callback) {
    process.processWL(event, context);
    //callback("Daily trend updated.")
    callback(null, "WL processed.");
};
