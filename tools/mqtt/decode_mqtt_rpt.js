var Parser = require('binary-parser').Parser;

module.exports.decodeRptMessage = decodeRptMessage;

var fiberFlags = new Parser()
    .bit1('no_update')
    .bit1('error_1')
    .bit1('error_2')
    .bit1('error_3')
    .bit4('reserved')

var nrliFlags = new Parser()
    .bit1('no_update')
    .bit1('sensor_error')
    .bit6('reserved')

var lssb1Flags = new Parser()
    .bit1('no_update')
    .bit1('no_update_human')
    .bit1('no_update_light')
    .bit1('no_update_spl')
    .bit1('no_update_co')
    .bit1('no_update_nh3')
    .bit1('no_update_misc')
    .bit1('sensor_error_irl')

var lssb2Flags = new Parser()
    .bit1('sensor_error_light')
    .bit1('sensor_error_spl')
    .bit1('sensor_error_co')
    .bit1('sensor_error_nh3')
    .bit1('sensor_error_distance')
    .bit1('sensor_error_temperature')
    .bit1('sensor_error_rh')
    .bit1('sensor_error_motion')

var rptMessage = new Parser()
    //Parser.start()
    .endianess('little')
    .uint16('ts')
    .nest('fiber', {
        type: fiberFlags
    })
    .nest('nrli', {
        type: nrliFlags
    })
    .nest('lssb1', {
        type: lssb1Flags
    })
    .nest('lssb2', {
        type: lssb2Flags
    })
    .uint16('sw_version')


function decodeRptMessage(mqttData) {
    var dcMsg = rptMessage.parse(mqttData);
    //console.log(dcMsg);
    return dcMsg;
  }

