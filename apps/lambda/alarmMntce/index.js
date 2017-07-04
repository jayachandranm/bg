var process = require('./processMntce');

exports.handler = function (event, context, callback) {
    process.processMntce(event, context);
    //callback("Daily trend updated.")
};
