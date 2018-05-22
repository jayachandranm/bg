var Parser = require('binary-parser').Parser;

module.exports.decodeRptMessage = decodeRptMessage;

var fiberFlags = new Parser()
    .endianess('big')
    .bit3('reserved')
    .bit1('fiber_fiber_error4')  // MZ laser over power
    .bit1('fiber_fiber_error3')  // MZ laser low power
    .bit1('fiber_fiber_error2')  // Sagnac laser over power
    .bit1('fiber_fiber_error1')  // Sagnac laser low power
    .bit1('fiber_fiber_noupdate') 

var nrliFlags = new Parser()
    .endianess('big')
    .bit6('reserved')
    .bit1('nrli_nrli_error') // Only IR_H error
    .bit1('nrli_nrli_noupdate')  // Only IR_H

var lssb1Flags = new Parser()
    .endianess('big')
    .bit1('reserved')
    .bit1('lssb_irl_error')
    .bit1('lssb_misc_noupdate')
    .bit1('lssb_nh3_noupdate')
    .bit1('lssb_co_noupdate')
    .bit1('lssb_spl_noupdate')
    .bit1('lssb_light_noupdate')
    .bit1('lssb_human_noupdate')
    //.bit1('lssb_all_noupdate')

var lssb2Flags = new Parser()
    .endianess('big')
    .bit1('lssb_motion_error')
    .bit1('lssb_rh_error')
    .bit1('lssb_temperature_error')
    .bit1('lssb_distance_error')
    .bit1('lssb_nh3_error')
    .bit1('lssb_co_error')
    .bit1('lssb_spl_error')
    .bit1('lssb_light_error')

var rptMessage = new Parser()
    //Parser.start()
    .endianess('big')
    .uint32('ts')
    .nest('fiber', {
        type: fiberFlags
    })
    .nest('nrli', { // IR_H
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
    //console.log(JSON.stringify(dcMsg, null, 4));
    return dcMsg;
  }

