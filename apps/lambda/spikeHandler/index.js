var process = require('./processSpike');

exports.handler = function (event, context, callback) {
    process.processSpike(event, context);
    //callback("Daily trend updated.")
};
