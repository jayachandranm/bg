var process = require('./processWLSmsExt');

exports.handler = function (event, context, callback) {
    process.processWL(event, context, callback);
    //callback(null, "WL processed.");
};
