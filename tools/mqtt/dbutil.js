var mysql = require('mysql');
//var config = require('./config');
var config = require('./config.json');


//module.exports.updateDB = updateDB;
module.exports.add2dbAlerts = add2dbAlerts;
module.exports.add2dbErrors = add2dbErrors;
module.exports.transformRptMsg = transformRptMsg;
module.exports.transformAlt2Msg = transformAlt2Msg;
module.exports.transformAlt1Msg = transformAlt1Msg;
module.exports.getSubsList = getSubsList;


var pool = mysql.createPool({
    connectionLimit: 10,
    host: 'localhost',
    user: 'jav',
    password: 'hdb%jav$1',
    database: 'jav_data'
});

function transformRptMsg(rptMsg) {
    //
    var dcMsg = {}
    dcMsg['ts'] = rptMsg['ts'];
    dcMsg['sw_version'] = rptMsg['sw_version'];
    dcMsg['rpts'] = {};
    dcMsg['rpts']['fiber'] = {};
    dcMsg['rpts']['lssb'] = {};
    dcMsg['rpts']['nrli'] = {};
    //
    var rptSensorGroup = rptMsg['fiber'];
    var dcMsgSensorGroup = dcMsg['rpts']['fiber'];
    Object.keys(rptSensorGroup).forEach(function (key, index) {
        // key: the name of the object key
        // index: the ordinal position of the key within the object 
        // eg. fiber_fiber_noupdate, fiber_fiber_error4
        element = rptSensorGroup[key];
        if ((key != 'reserved') && (element === 1)) {
            splitVals = key.split('_');
            if (!dcMsgSensorGroup[splitVals[1]]) {
                dcMsgSensorGroup[splitVals[1]] = [];
            }
            dcMsgSensorGroup[splitVals[1]].push(splitVals[2]);
        }
    });
    //
    //
    rptSensorGroup = rptMsg['lssb1'];
    dcMsgSensorGroup = dcMsg['rpts']['lssb'];
    Object.keys(rptSensorGroup).forEach(function (key, index) {
        // key: the name of the object key
        // index: the ordinal position of the key within the object 
        // eg. lssb_human_noupdate
        element = rptSensorGroup[key];
        if ((key != 'reserved') && (element === 1)) {
            splitVals = key.split('_');
            // eg. lssb_human_update
            if (!dcMsgSensorGroup[splitVals[1]]) {
                dcMsgSensorGroup[splitVals[1]] = [];
            }
            dcMsgSensorGroup[splitVals[1]].push(splitVals[2]);
        }
    });
    rptSensorGroup = rptMsg['lssb2'];
    dcMsgSensorGroup = dcMsg['rpts']['lssb'];
    Object.keys(rptSensorGroup).forEach(function (key, index) {
        // key: the name of the object key
        // index: the ordinal position of the key within the object 
        element = rptSensorGroup[key];
        if ((key != 'reserved') && (element === 1)) {
            splitVals = key.split('_');
            if (!dcMsgSensorGroup[splitVals[1]]) {
                dcMsgSensorGroup[splitVals[1]] = [];
            }
            dcMsgSensorGroup[splitVals[1]].push(splitVals[2]);
        }
    });
    rptSensorGroup = rptMsg['nrli'];
    dcMsgSensorGroup = dcMsg['rpts']['nrli'];
    Object.keys(rptSensorGroup).forEach(function (key, index) {
        // key: the name of the object key
        // index: the ordinal position of the key within the object 
        element = rptSensorGroup[key];
        if ((key != 'reserved') && (element === 1)) {
            splitVals = key.split('_');
            if (!dcMsgSensorGroup[splitVals[1]]) {
                dcMsgSensorGroup[splitVals[1]] = [];
            }
            dcMsgSensorGroup[splitVals[1]].push(splitVals[2]);
        }
    });
    //console.log(dcMsg);
    console.log(JSON.stringify(dcMsg, null, 4));
    return dcMsg;
}

function transformAlt2Msg(alt2Msg) {
    //
    var dcMsg = {}
    dcMsg['ts'] = alt2Msg['ts'];
    //dcMsg['sw_version'] = rptMsg['sw_version'];
    dcMsg['rpts'] = [];
    dcMsg['rpts']['fiber'] = {};
    dcMsg['rpts']['lssb'] = {};
    dcMsg['rpts']['nrli'] = {};
    //
    var errType = alt2Msg['type'];
    var dcMsgRpts = dcMsg['rpts'];
    // eg. lssb_nh3_noupdate
    splitVals = errType.split('_');
    //var group = errType[splitVals[0]];
    //dcMsgRpts[splitVals[0]][splitVals[1]] = splitVals[2];
    if (!dcMsgRpts[splitVals[0]][splitVals[1]]) {
        dcMsgRpts[splitVals[0]][splitVals[1]] = [];
    }
    dcMsgRpts[splitVals[0]][splitVals[1]].push(splitVals[2]);
    console.log(dcMsg);
    return dcMsg;
}

function transformAlt1Msg(alt1Msg) {
    //
}

function add2dbAlerts(liftId, dcMsg) {
    pool.getConnection(function (err, connection) {
        // Use the connection
        if (err) {
            console.log("DB connection error: ", err);
        }
        else {
            console.log("user: ", config.mysql.user)
            var uTime = dcMsg['ts'] * 1000;
            var liftEvent = dcMsg['type'];
            var srcSensorGroup = dcMsg['sensor'];
            var sGroup = "";
            var isSet = dcMsg['set_reset'];
            var msgType = 'event';
            Object.keys(srcSensorGroup).forEach(function (key, index) {
                var elementVal = srcSensorGroup[key];
                if (elementVal === 1) {
                    sGroup = sGroup + ',' + key;
                }
            });
            //
            var dateNow = new Date();
            var currTimeMillis = Date.now();
            var offset = dateNow.getTimezoneOffset();
            //console.log(offset);
            var adjTime = uTime + (8 * 60 * 60 * 1000);
            var datetime_db = new Date(adjTime).toISOString().slice(0, 19).replace('T', ' ');
            console.log("Event time :", uTime, "=>", datetime_db);

            connection.query('INSERT INTO lift_events SET ?',
                { lift_id: liftId, ts: uTime, date_time: datetime_db, msg_type: msgType, sensor_group: sGroup, is_set: isSet, value: liftEvent },
                function (err, result) {
                    connection.release();
                    if (err) {
                        throw err;
                    }
                    console.log(result.insertId);
                });
        }
    });
}

function add2dbErrors(liftId, dcMsg) {
    pool.getConnection(function (err, connection) {
        // Use the connection
        if (err) {
            console.log("DB connection error: ", err);
        }
        else {
            var uTime = dcMsg['ts'] * 1000;
            //
            var dateNow = new Date();
            var currTimeMillis = Date.now();
            var offset = dateNow.getTimezoneOffset();
            //console.log(offset);
            var adjTime = uTime + (8 * 60 * 60 * 1000);
            var datetime_db = new Date(adjTime).toISOString().slice(0, 19).replace('T', ' ');
            console.log("Event time :", uTime, "=>", datetime_db);
            // For each sensor_group,
            Object.keys(dcMsg['rpts']).forEach(function (key, index) {
                sGroup = key;
                element = dcMsg['rpts'][key];
                // For each sensor,
                Object.keys(element).forEach(function (key2, index) {
                    sensor = key2;
                    error_list = element[key2];
                    error_list.forEach((sensor_error, index) => {
                        msgType = 'error';
                        if (sensor_error === 'noupdate') {
                            msgType = 'timeout';
                        }
                        console.log(msgType, sGroup, sensor, sensor_error);
                        connection.query('INSERT INTO sensor_status SET ?',
                            { lift_id: liftId, ts: uTime, date_time: datetime_db, msg_type: msgType, sensor_group: sGroup, sensor: sensor, value: sensor_error },
                            function (err, result) {
                                // TODO: Release connection only after multiple insert is completed.
                                //connection.release();
                                if (err)
                                    throw err;
                                console.log(result.insertId);
                            });
                    });
                });
            });
        }
    });
}

function getSubsList(liftId, callback) {
    var smsSubsList = "";
    pool.getConnection(function (err, connection) {
        var queryString = 'SELECT * FROM contact_list WHERE lift_id = ? ORDER BY tid DESC LIMIT 1';
        connection.query(queryString, [liftId], function(err, rows, fields) {
            if (err) throw err;
         
            for (var i in rows) {
                smsList = rows[i].sms_list;
                console.log('SMS List row: ', smsList);
                smsSubsList = smsSubsList + smsList;
            }
            callback(null, smsSubsList);
        });
    });
}
