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
            case 1: retVal = "fight"; break;
            case 2: retVal = "vandalism"; break;
            case 3: retVal = "fallen_human"; break;
            case 4: retVal = "liquid"; break;
            case 5: retVal = "urine"; break;
            case 6: retVal = "co"; break;
            case 7: retVal = "fire"; break;
            case 8: retVal = "light_malfunction"; break;
            case 10: "error_1_fiber"; break;
            case 11: "error_2_fiber"; break;
            case 12: "error_3_fiber"; break;
            case 20: "error_nrli"; break;
            case 30: "error_irl"; break;
            case 31: "error_light"; break;
            case 32: "error_spl"; break;
            case 33: "error_co"; break;
            case 34: "error_nh3"; break;
            case 35: "error_distance"; break;
            case 36: "error_temperature"; break;
            case 37: "error_rh"; break;
            case 38: "error_motion"; break;
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


