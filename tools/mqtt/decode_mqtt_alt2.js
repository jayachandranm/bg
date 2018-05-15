var Parser = require('binary-parser').Parser;

module.exports.decodeAlt2Message = decodeAlt2Message;

var alt1Message = new Parser()
//Parser.start()
.endianess('little')
.uint16('ts')
.uint8('type', {
    formatter: function(val) {
        var retVal = "uncat";
        switch(val) {
            case 1: retVal = "fiber_no_update"; break;
            case 2: retVal = "nrli_no_update"; break; // Only IR_H
            case 3: retVal = "lssb_human_no_update"; break;
            case 4: retVal = "lssb_light_no_update"; break;
            case 5: retVal = "lssb_spl_no_update"; break;
            case 6: retVal = "lssb_co_no_update"; break;
            case 7: retVal = "lssb_nh3_no_update"; break;
            case 8: retVal = "lssb_misc_no_update"; break;
            case 10: retVal = "fiber_error_1"; break; // Sagnac low power.
            case 11: retVal = "fiber_error_2"; break; // Sagnac over power.
            case 12: retVal = "fiber_error_3"; break;  // MZ low power.
            case 12: retVal = "fiber_error_4"; break;  // MZ over power.
            case 20: retVal = "nrli_error"; break;   // Only IR_H
            case 30: retVal = "lssb_irl_error"; break;
            case 31: retVal = "lssb_light_error"; break;
            case 32: retVal = "lssb_spl_error"; break;
            case 33: retVal = "lssb_co_error"; break;
            case 34: retVal = "lssb_nh3_error"; break;
            case 35: retVal = "lssb_distance_error"; break;
            case 36: retVal = "lssb_temperature_error"; break;
            case 37: retVal = "lssb_rh_error"; break;
            case 38: retVal = "lssb_motion_error"; break;
            }
        return retVal;
      }        
})
/*
.choice("alert", {
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
*/
function decodeAlt2Message(mqttData) {
    var dcMsg = alt2Message.parse(mqttData);
    //console.log(dcMsg);
    return dcMsg;
  }


