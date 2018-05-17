var mysql = require('mysql');
//var config = require('./config');
var config = require('./config.json');


//module.exports.updateDB = updateDB;
module.exports.add2dbAlerts = add2dbAlerts;
module.exports.add2dbErrors = add2dbErrors;
module.exports.transformRptMsg = transformRptMsg;
module.exports.transformAlt2Msg = transformAlt2Msg;
module.exports.transformAlt1Msg = transformAlt1Msg;

var pool = mysql.createPool({
    connectionLimit: 10,
    host: config.mysql.host,
    user: config.mysql.user,
    password: config.mysql.pass,
    database: config.mysql.db
});

function transformRptMsg(rptMsg) {
    //
    var dcMsg = {}
    dcMsg['ts'] = rptMsg['ts'];
    dcMsg['sw_version'] = rptMsg['sw_version'];
    dcMsg['rpts'] = [];
    dcMsg['rpts']['fiber'] = [];
    dcMsg['rpts']['lssb'] = [];
    dcMsg['rpts']['nrli'] = [];
    //
    var rptSensorGroup = rptMsg['fiber'];
    var dcMsgSensorGroup = dcMsg['rpts']['fiber'];
    Object.keys(rptSensorGroup).forEach(function(key,index) {
        // key: the name of the object key
        // index: the ordinal position of the key within the object 
        element = rptSensorGroup[key];
        if((key != 'reserved') && (element === 1) ) {
            splitVals = key.split('_');
            dcMsgSensorGroup[splitVals[1]] = splitVals[2];
        }
    });
    //
    //
    rptSensorGroup = rptMsg['lssb1'];
    dcMsgSensorGroup = dcMsg['rpts']['lssb'];
    Object.keys(rptSensorGroup).forEach(function(key,index) {
        // key: the name of the object key
        // index: the ordinal position of the key within the object 
        element = rptSensorGroup[key];
        if((key != 'reserved') && (element === 1) ) {
            splitVals = key.split('_');
            // eg. lssb_human_update
            dcMsgSensorGroup[splitVals[1]] = splitVals[2];
        }
    });
    rptSensorGroup = rptMsg['lssb2'];
    dcMsgSensorGroup = dcMsg['rpts']['lssb'];
    Object.keys(rptSensorGroup).forEach(function(key,index) {
        // key: the name of the object key
        // index: the ordinal position of the key within the object 
        element = rptSensorGroup[key];
        if((key != 'reserved') && (element === 1) ) {
            splitVals = key.split('_');
            dcMsgSensorGroup[splitVals[1]] = splitVals[2];
        }
    });
    rptSensorGroup = rptMsg['nrli'];
    dcMsgSensorGroup = dcMsg['rpts']['nrli'];
    Object.keys(rptSensorGroup).forEach(function(key,index) {
        // key: the name of the object key
        // index: the ordinal position of the key within the object 
        element = rptSensorGroup[key];
        if((key != 'reserved') && (element === 1) ) {
            splitVals = key.split('_');
            dcMsgSensorGroup[splitVals[0]] = splitVals[1];
        }
    });
    console.log(dcMsg);
    return dcMsg;
}

function transformAlt2Msg(alt2Msg) {
    //
    var dcMsg = {}
    dcMsg['ts'] = alt2Msg['ts'];
    //dcMsg['sw_version'] = rptMsg['sw_version'];
    dcMsg['rpts'] = [];
    dcMsg['rpts']['fiber'] = [];
    dcMsg['rpts']['lssb'] = [];
    dcMsg['rpts']['nrli'] = [];
    //
    var errType = alt2Msg['type'];
    var dcMsgRpts = dcMsg['rpts'];
    splitVals = errType.split('_');
    //var group = errType[splitVals[0]];
    dcMsgRpts[splitVals[0]][splitVals[1]] = splitVals[2];
    console.log(dcMsg);
    return dcMsg;
}

function transformAlt1Msg(alt1Msg) {
    //
}

function add2dbAlerts(clientID, arrVals) {
    for (i = 0; i < arrVals.length; i++) {
        var testVals = arrVals[i];
        //

        var dt = testVals.date_time;
        var yr = '20' + dt.year;
        // NOTE: Month starts from 0.
        var utime = new Date(yr, dt.month - 1, dt.day, dt.hour, dt.minute, dt.second).getTime();
        //
        var dateNow = new Date();
        var currTimeMillis = Date.now();
        var offset = dateNow.getTimezoneOffset();
        //console.log(offset);
        var adjTime = utime + (8 * 60 * 60 * 1000);
        var datetime_db = new Date(adjTime).toISOString().slice(0, 19).replace('T', ' ');
        console.log("GPS time :", utime, "=>", datetime_db);

        pool.getConnection(function (err, connection) {
            // Use the connection
            connection.query('INSERT INTO alarms SET ?',
                {sid: clientID, timestamp: utime, datetime: datetime_db, longitude: LocLong, latitude: LocLat},
                function (err, result) {
                    connection.release();
                    if (err) throw err;

                    console.log(result.insertId);
                });
        });
    }
}

function add2dbErrors(clientID, arrVals) {}