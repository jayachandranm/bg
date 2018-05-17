var Parser = require('binary-parser').Parser;

module.exports.decodeAlt1Message = decodeAlt1Message;

var alt1Message = new Parser()
//Parser.start()
.endianess('big')
.uint32('ts')
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
            case 9: retVal = "ventilation_malfunction"; break;
            case 10: retVal = "co_low_level"; break; // eg. smoking
            case 0xEF: retVal = "uncat"; break;
        }
        return retVal;
      }    
})
.uint8('set_reset')
.nest('sensor', {
    type: new Parser()
    .bit1('fiber')
    .bit1('nlri')  // Only IR_H
    .bit1('lssb')
})
/*
.choice('alert', {
    tag: 'type',
    choices: {
        1: "fight",
        2: "vandalism",
        3: "fallen_human",
        4: "liquid",
        5: "urine",
        6: "co",
        7: "fire",
        8: "light_malfunction",
        0xEF: "uncat"
    }
})
*/


function decodeAlt1Message(mqttData) {
    var dcMsg = alt1Message.parse(mqttData);
    //console.log(dcMsg);
    return dcMsg;
  }

