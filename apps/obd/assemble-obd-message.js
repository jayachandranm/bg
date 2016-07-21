var Concentrate = require("concentrate/index");

var crc16 = require('crc-itu').crc16;

module.exports.loginReply = loginReply;
module.exports.heartBeatReply = heartBeatReply;

var c = Concentrate();

function loginReply(dcMsg) {
    var devID = dcMsg.dev_id;
    var dataToDev = c.uint16le('0x4040')
    .uint16le('0x29')
    .uint8('0x03')
    .string(devID, 'hex')
    .uint16be('0x9001')
    .uint32le('0xffffffff')
    .uint16('0x0')
    .uint32le('1395277770') // TODO: send current time.
    .copy();

    var crcReply = crc16(dataToDev.result());

    console.log(crcReply.toString(16));

    var dataToDev2 = c.uint16(crcReply)
    .uint16('0x0a0d')
    .result();

    console.log(dataToDev2);
    c.reset();
    return dataToDev2;
}



// Heart Beat.
function heartBeatReply(dcMsg) {
    var devID = dcMsg.dev_id;
    var dataToDev = c.uint16le('0x4040')
    .uint16le('0x1F')
    .uint8('0x03')
    .string(devID, 'hex')
    .uint16be('0x9003')
    .copy();

    var crcReply = crc16(dataToDev.result());

    console.log(crcReply.toString(16));

    var dataToDev2 = c.uint16(crcReply)
    .uint16('0x0a0d')
    .result();

    c.reset();
    return dataToDev2;
}
