var mysql = require('mysql');
var config = require('./config');
//var config = require('./config.json');


//module.exports.updateDB = updateDB;
module.exports.add2dbAlerts = add2dbAlerts;
module.exports.add2dbErrors = add2dbErrors;
module.exports.transformRptMsg = transformRptMsg;
module.exports.transformAlt2Msg = transformAlt2Msg;
module.exports.transformAlt1Msg = transformAlt1Msg;
module.exports.getSubsList = getSubsList;
module.exports.updateRemarks = updateRemarks;


var pool = mysql.createPool({
    connectionLimit: 100,
    waitForConnections: false,
    host: config.mysql.dbhost,
    user: config.mysql.dbuser,
    password: config.mysql.dbpass,
    database: config.mysql.db
});

function transformRptMsg(rptMsg) {
    //
    var dcMsg = {}
    dcMsg['ts'] = rptMsg['ts'];
    dcMsg['sw_version'] = rptMsg['sw_version'];
    dcMsg['msg_type'] = 'err_rpt';
    dcMsg['rpts'] = {};
    dcMsg['rpts']['fiber'] = {};
    dcMsg['rpts']['lssb'] = {};
    dcMsg['rpts']['nrli'] = {};
    // Set a flag in the message if no errors were reported.
    var all_healthy = true;
    //
    // By default set all sensors to healthy. Used for reseting any sensors 
    //   that are currently in error state.
    var fiber_subs = ['fiber'];
    var lssb_subs = ['irl', 'misc', 'nh3', 'co', 'spl', 'light', 'human', 'motion', 'rh', 'temperature', 'distance'];
    var nrli_subs = ['nrli']
    //
    var rptSensorGroup = rptMsg['fiber'];
    var dcMsgSensorGroup = dcMsg['rpts']['fiber'];
    Object.keys(rptSensorGroup).forEach(function (key, index) {
        // key: the name of the object key
        // index: the ordinal position of the key within the object 
        // eg. fiber_fiber_noupdate, fiber_fiber_error4
        element = rptSensorGroup[key];
        if ((key != 'reserved') && (element === 1)) {
            all_healthy = false;
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
            all_healthy = false;
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
            all_healthy = false;
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
            all_healthy = false;
            splitVals = key.split('_');
            if (!dcMsgSensorGroup[splitVals[1]]) {
                dcMsgSensorGroup[splitVals[1]] = [];
            }
            dcMsgSensorGroup[splitVals[1]].push(splitVals[2]);
        }
    });
    //console.log(dcMsg);
    if (all_healthy) {
        dcMsg['no_errors'] = true;
    } else {
        dcMsg['no_errors'] = false;
    }
    console.log(JSON.stringify(dcMsg, null, 4));
    return dcMsg;
}

function transformAlt2Msg(alt2Msg) {
    //
    var dcMsg = {}
    dcMsg['ts'] = alt2Msg['ts'];
    //dcMsg['sw_version'] = rptMsg['sw_version'];
    dcMsg['msg_type'] = 'err_event';
    dcMsg['rpts'] = [];
    dcMsg['rpts']['fiber'] = {};
    dcMsg['rpts']['lssb'] = {};
    dcMsg['rpts']['nrli'] = {};
    //
    var errType = alt2Msg['type'];
    var dcMsgRpts = dcMsg['rpts'];
    // eg. lssb_nh3_noupdate
    var splitVals = errType.split('_');
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
    console.log("DB, requesting connection from pool for event insert.");
    pool.getConnection(function (err, connection) {
        // Use the connection
        if (err) {
            console.log("DB connection error: ", err);
        }
        else {
            console.log("Got DB pool.");
            var uTime = dcMsg['ts'] * 1000;
            var liftEvent = dcMsg['type'];
            var srcSensorGroup = dcMsg['sensor'];
            var sGroup = "";
            var isSet = dcMsg['set_reset'];
            var msgType = 'lift_event';
            var eventRemarks = '';
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
                { lift_id: liftId, ts: uTime, date_time: datetime_db, msg_type: msgType, sensor_group: sGroup, is_set: isSet, value: liftEvent, remarks: eventRemarks },
                function (err, result) {
                    if (err) {
                        //throw err;
                        console.log("DB insert error: ", err);
                    } else {
                        console.log("DB insert success, id = ", result.insertId);
                        connection.release();
                    }
                });
        }
    });
}

function add2dbErrors(liftId, dcMsg) {
    console.log("DB, requesting connection from pool for error insert.");
    pool.getConnection(function (err, connection) {
        // Use the connection
        if (err) {
            console.log("DB connection error: ", err);
        }
        else {
            console.log("DB received pool.");
            // Check for maintenance status.
            var queryString = 'SELECT * FROM sensor_status WHERE lift_id = ? ORDER BY ts DESC LIMIT 1';
            connection.query(queryString, [liftId], function (err, rows, fields) {
                if (err) throw err;

                var mode = '';
                // Expecting only a single row.
                for (var i in rows) {
                    mode = rows[i].remarks;
                }
                // err_event, err_rpt
                var errorRemarks = mode;
                var msgType = dcMsg['msg_type'];
                var allHealthy = dcMsg['no_errors'];
                //
                var uTime = dcMsg['ts'] * 1000;
                //
                var dateNow = new Date();
                var currTimeMillis = Date.now();
                var offset = dateNow.getTimezoneOffset();
                //console.log(offset);
                var adjTime = uTime + (8 * 60 * 60 * 1000);
                var datetime_db = new Date(adjTime).toISOString().slice(0, 19).replace('T', ' ');
                console.log("Event time :", uTime, "=>", datetime_db);
                if (allHealthy) {
                    var sGroupAll = 'all';
                    var sensorAll = 'all';
                    var healthy = 'healthy';
                    connection.query('INSERT INTO sensor_status SET ?',
                        { lift_id: liftId, ts: uTime, date_time: datetime_db, msg_type: msgType, sensor_group: sGroupAll, sensor: sensorAll, value: healthy, remarks: errorRemarks },
                        function (err, result) {
                            if (err) {
                                //throw err;
                                console.log("DB insert error: ", err);
                            } else {
                                console.log("DB insert success, id = ", result.insertId);
                                // Only one insert for this case.
                                connection.release();
                            }
                        });
                } else {
                    let operations = [];
                    // For each sensor_group,
                    Object.keys(dcMsg['rpts']).forEach(function (key, index) {
                        var sGroup = key;
                        var element = dcMsg['rpts'][key];
                        // For each sensor,
                        Object.keys(element).forEach(function (key2, index) {
                            var sensor = key2;
                            var error_list = element[key2];
                            error_list.forEach((sensor_error, index) => {
                                /*
                                if (sensor_error === 'noupdate') {
                                    msgType = 'timeout';
                                }
                                */
                                console.log(msgType, sGroup, sensor, sensor_error);
                                operations.push(new Promise((resolve, reject) => {
                                    connection.query('INSERT INTO sensor_status SET ?',
                                        { lift_id: liftId, ts: uTime, date_time: datetime_db, msg_type: msgType, sensor_group: sGroup, sensor: sensor, value: sensor_error, remarks: errorRemarks },
                                        function (err, result) {
                                            // TODO: Release connection only after multiple insert is completed.
                                            //connection.release();
                                            if (err) {
                                                //throw err;
                                                console.log("DB insert error: ", err);
                                                reject(err);
                                            } else {
                                                console.log("DB insert success, id = ", result.insertId);
                                                resolve();
                                            }
                                        }
                                    );
                                }));
                            });
                        });
                    });
                    Promise.all(operations).then(() => {
                        console.log("All DB insert completed. Release connection.");
                        connection.release();
                    });
                } // if all healthy
            });

        }
    });
}

function updateRemarks(liftId, mode) {
    console.log("DB, requesting connection from pool for error insert.");
    pool.getConnection(function (err, connection) {
        // Use the connection
        if (err) {
            console.log("DB connection error: ", err);
        }
        else {
            // err_event, err_rpt
            // Read most recent row.
            var dateNow = new Date();
            var uTime = Date.now();
            var offset = dateNow.getTimezoneOffset();
            //console.log(offset);
            var adjTime = uTime + (8 * 60 * 60 * 1000);
            var datetime_db = new Date(adjTime).toISOString().slice(0, 19).replace('T', ' ');
            console.log("Event time :", uTime, "=>", datetime_db);

            var queryString = 'SELECT * FROM sensor_status WHERE lift_id = ? ORDER BY ts DESC LIMIT 1';
            connection.query(queryString, [liftId], function (err, rows, fields) {
                if (err) throw err;

                // Defaults.
                var msgType = 'mnt_status';
                var sGroupAll = 'all';
                var sensorAll = 'all';
                var healthy = 'healthy';

                // There will be only one entry max or null.
                // In case of rpt, there can be multiple errors for same timestamp.
                //   Will duplicate one of those messages.
                for (var i in rows) {
                    //liftId = rows[i].lift_id;
                    //uTime = rows[i].ts;
                    //datetime_db = rows[i].date_time;
                    msgType = rows[i].msg_type;
                    sGroupAll = rows[i].sensor_group;
                    sensorAll = rows[i].sensor;
                    healthy = rows[i].value;
                    //errorRemarks = mode;
                }
                // Add new row, with new time, keeping rest of the values
                //       and new status in remarks.
                connection.query('INSERT INTO sensor_status SET ?',
                    { lift_id: liftId, ts: uTime, date_time: datetime_db, msg_type: msgType, sensor_group: sGroupAll, sensor: sensorAll, value: healthy, remarks: mode },
                    function (err, result) {
                        if (err) {
                            //throw err;
                            console.log("DB insert error: ", err);
                        } else {
                            console.log("DB insert success, id = ", result.insertId);
                            // Only one insert for this case.
                            connection.release();
                        }
                    });
            });
        }
    });
}


function getSubsList(liftId, callback) {
    var smsSubsList = "";
    var liftAddress = "";
    pool.getConnection(function (err, connection) {
        var queryString = 'SELECT * FROM contact_list WHERE lift_id = ? ORDER BY ts DESC LIMIT 1';
        connection.query(queryString, [liftId], function (err, rows, fields) {
            if (err) throw err;

            // Expecting only a single row.
            for (var i in rows) {
                smsSubsList = rows[i].sms_list;
                liftAddress = rows[i].lift_address;
                //console.log('SMS List row: ', smsSubsList);
                //smsSubsList = smsSubsList + smsList;
                //smsSubsList = smsList;
                //liftAddress = addr;
            }
            callback(null, smsSubsList, liftAddress);
        });
    });
}
