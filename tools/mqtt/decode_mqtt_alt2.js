var Parser = require('binary-parser').Parser;

module.exports.decodeAlt2Message = decodeAlt2Message;

function decodeAlt2Message(mqttData) {
    var dcMsg = alt2Message.parse(mqttData);
    //console.log(dcMsg);
    return dcMsg;
  }

  var alt1Message = new Parser()
    //Parser.start()
    .endianess('little')
    .uint16('ts')
    .uint8('type').choice("alert", {
        tag: 'type',
        choices: {
            1: "no_update_fiber",
            2: "no_update_nrli",
            3: "no_update_lssb_human",
            4: "no_update_lssb_light",
            5: "no_update_lssb_spl",
            6: "no_update_lssb_co",
            7: "no_update_lssb_nh3",
            8: "no_update_lssb_misc",
            10: "error_1_fiber",
            11: "error_2_fiber",
            12: "error_3_fiber",
            20: "error_nrli",
            30: "error_irl",
            31: "error_light",
            32: "error_spl",
            33: "error_co",
            34: "error_nh3",
            35: "error_distance",
            36: "error_temperature",
            37: "error_rh",
            38: "error_motion"
        }
    })

