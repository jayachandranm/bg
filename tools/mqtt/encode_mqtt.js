var Concentrate = require("concentrate/index");

module.exports.rptReply = rptReply;
module.exports.alt1Reply = alt1Reply;
module.exports.alt2Reply = alt2Reply;
module.exports.updateTime = updateTime;
module.exports.encodeReset = encodeReset;

var c = Concentrate();

function rptReply(dcMsg) {
    var currTime = Date.now() / 1000 | 0;
    console.log('Rpt reply, Server time: ', currTime);
    var dataToDev = c.uint8('0x3A')
    //.copy();
    .result();

    //console.log(dataToDev);
    c.reset();
    return dataToDev;
}

function alt1Reply(dcMsg) {
    var currTime = Date.now() / 1000 | 0;
    console.log('Alt-1 reply, Server time: ', currTime);
    var dataToDev = c.uint8('0x3B')
    .uint8(dcMsg.set_reset)
    .result();

    //console.log(dataToDev);
    c.reset();
    return dataToDev;
}

function alt2Reply(dcMsg) {
    var currTime = Date.now() / 1000 | 0;
    console.log('Alt-2 reply, Server time: ', currTime);
    var dataToDev = c.uint8('0x3B')
    .uint8(dcMsg.set_reset)
    .result();

    //console.log(dataToDev);
    c.reset();
    return dataToDev;
}

function updateTime(dcMsg) {
    var currTime = Date.now() / 1000 | 0;
    console.log('Update DC Time, Server time: ', currTime);
    var dataToDev = c.uint8('0x3D')
    .uint16be(currTime)
    .result();

    //console.log(dataToDev);
    c.reset();
    return dataToDev;
}

function encodeReset(sensorType) {
    //var currTime = Date.now() / 1000 | 0;
    // Default sensor, 0x00.
    var dataToDev = c.uint8('0x3F')
        .uint8('0x00')
        .result();
    switch (sensorType) {
        case 'lighting':
            console.log('Reset lighting.');
            c.reset();
            dataToDev = c.uint8('0x3F')
                .uint8('0x08')
                .result();
            break;
        case 'ventilation':
            console.log('Reset ventilation.');
            c.reset();
            dataToDev = c.uint8('0x3F')
                .uint8('0x09')
                .result();
            break;
        case 'reboot':
            console.log('Reboot.');
            c.reset();
            dataToDev = c.uint8('0x39')
                .uint8('0x00')
                .result();
            break;
        case 'maintenance':
            console.log('Switch to maintenance.');
            c.reset();
            dataToDev = c.uint8('0x39')
                .uint8('0x01')
                .result();
            break;
        case 'operational':
            console.log('Switch to operation.');
            c.reset();
            dataToDev = c.uint8('0x39')
                .uint8('0x02')
                .result();
            break;
    }

    //console.log(dataToDev);
    c.reset();
    return dataToDev;
}
