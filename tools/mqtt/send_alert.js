var request = require('request');

module.exports.sendAlert = sendAlert;

function sendAlert(liftId, dcMsg) {
  var headers = {
    'Content-Type':     'application/x-www-form-urlencoded'
  }

  api_url = 'https://www.commzgate.net/gateway/SendMsg';

  userId = 'user';
  pass = 'pass';
  mobile = '1234';
  //
  liftEvent = dcMsg['type'];
  msg = liftEvent + ' event from ' + liftId;
  
  var options = {
    url: api_url,
    method: 'POST',
    headers: headers,
    form: {'ID': userId, 'Password': pass, 'Mobile' : mobile, 'Type' : 'A', 'Message' : msg}
  } 
  //
  request(options, function (error, response, body) {
    if (!error && response.statusCode == 200) {
        // Print out the response body
        console.log(body)
    }
  })
}
