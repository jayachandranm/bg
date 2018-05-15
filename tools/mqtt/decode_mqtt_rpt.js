var Parser = require('binary-parser').Parser;

module.exports.decodeRptMessage = decodeRptMessage;

var fiberFlags = new Parser()
    .bit1('fiber_no_update') 
    .bit1('fiber_error_1')  // Sagnac laser low power
    .bit1('fiber_error_2')  // Sagnac laser over power
    .bit1('fiber_error_3')  // MZ laser low power
    .bit1('fiber_error_4')  // MZ laser over power
    .bit3('reserved')

var nrliFlags = new Parser()
    .bit1('nrli_no_update')  // Only IR_H
    .bit1('nrli_error') // Only IR_H error
    .bit6('reserved')

var lssb1Flags = new Parser()
    .bit1('lssb_no_update')
    .bit1('lssb_human_no_update')
    .bit1('lssb_light_no_update')
    .bit1('lssb_spl_no_update')
    .bit1('lssb_co_no_update')
    .bit1('lssb_nh3_no_update')
    .bit1('lssb_misc_no_update')
    .bit1('sensor_error_irl')

var lssb2Flags = new Parser()
    .bit1('lssb_light_error')
    .bit1('lssb_spl_error')
    .bit1('lssb_co_error')
    .bit1('lssb_nh3_error')
    .bit1('lssb_distance_error')
    .bit1('lssb_temperature_error')
    .bit1('lssb_rh_error')
    .bit1('lssb_motion_error')

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

