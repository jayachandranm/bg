var Concentrate = require("concentrate/index");

module.exports.rptReply = rptReply;
module.exports.alt1Reply = alt1Reply;
module.exports.alt2Reply = alt2Reply;
module.exports.updateTime = updateTime;

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
    .uint16(currTime)
    .result();

    //console.log(dataToDev);
    c.reset();
    return dataToDev;
}
