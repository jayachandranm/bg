var Parser = require('binary-parser').Parser;

module.exports.decodeAlt1Message = decodeAlt1Message;

function decodeAlt1Message(mqttData) {
    var dcMsg = alt1Message.parse(mqttData);
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
            1: "fight",
            2: "vandalism",
            3: "fallen_human",
            4: "liquid",
            5: "urine",
            6: "CO",
            7: "fire",
            8: "light_malfunction",
            0xEF: "uncat"
        }
    })
    .uint8('set_reset')
    .nest('sensor', {
        type: new Parser()
        .bit1('fiber')
        .bit1('nlri')
        .bit1('lssb')
    })

