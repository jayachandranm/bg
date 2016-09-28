var Concentrate = require("concentrate/index");

var crc16 = require('crc-itu').crc16;

module.exports.loginReply = loginReply;
module.exports.heartBeatReply = heartBeatReply;
module.exports.alarmConfirmation = alarmConfirmation;

var c = Concentrate();

function loginReply(dcMsg) {
    var devID = dcMsg.dev_id;
    var currTime = Date.now() / 1000 | 0;
    console.log('Server time: ', currTime);
    var dataToDev = c.uint16le('0x4040')
    .uint16le('0x29')
    .uint8('0x03')
    .string(devID, 'hex')
    .uint16be('0x9001')
    .uint32le('0xffffffff')
    .uint16('0x0')
    .uint32le(currTime) 
    .copy();

    var crcReply = crc16(dataToDev.result());

    //console.log(crcReply.toString(16));

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

    //console.log(crcReply.toString(16));

    var dataToDev2 = c.uint16(crcReply)
    .uint16('0x0a0d')
    .result();

    c.reset();
    return dataToDev2;
}

function setMessage(dcMsg) {
  // 0x2001
  // TODO: Genereate the number based on some logic.
  var cmdSeq = 12345;
  // TODO: Fix these.
  var msgSize = '0x1F';
  var devID = '0x32320000000000000000000000';
  var tlvCount = '11';
  //
  var dataToDev = c.uint16le('0x4040')
  .uint16le(msgSize)
  .uint8('0x03')
  .string(devID, 'hex')
  .uint16be('0x2001')
  .uint16le(cmdSeq)
  .uint8(tlvCount)
  // TODO: TLV array.
  .copy();

  var crcReply = crc16(dataToDev.result());
  var dataToDev2 = c.uint16(crcReply)
  .uint16('0x0a0d')
  .result();
  //
  c.reset();
  return dataToDev2;
}

function queryMessage(dcMsg) {
  // 0x2002
}

function locationQuery(dcMsg) {
  // 0x3001
}

function clearDTC(dcMsg) {
  // 0x3002
}

function restoreFactorySettings(dcMsg) {
  // 0x3003
}

function sendTextInfo(dcMsg) {
  // TODO: Two type codes.
  // 0x3006, 0xB006
}

function alarmConfirmation(dcMsg) {
  // 0xC007
    var devID = dcMsg.dev_id;
    var alarm_seq_num = dcMsg.payload.alarm_seq_num;
    var dataToDev = c.uint16le('0x4040')
    .uint16le('0x23')
    .uint8('0x03')
    .string(devID, 'hex')
    .uint16be('0xC007')
    .uint32le(alarm_seq_num, 'hex')
    .copy();

    var crcReply = crc16(dataToDev.result());

    //console.log(crcReply.toString(16));

    var dataToDev2 = c.uint16(crcReply)
    .uint16('0x0a0d')
    .result();

    c.reset();
    return dataToDev2;
}

function driverIdConfirmation(dcMsg) {
  // 0xC00C
}

function updateNotification(dcMsg) {
  // 0x5001
}

function updateMessage(dcMsg) {
  // 0x5002
}

function agpsMessage(dcMsg) {
  // 0x5102
}
