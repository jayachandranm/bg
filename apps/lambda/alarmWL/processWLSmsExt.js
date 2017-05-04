console.log('Loading function');
// Load the AWS SDK
var AWS = require("aws-sdk");
var http = require('http');
var utils = require('./wlAlertUtils');
var config = require('./config.json');

var iotdata = new AWS.IotData({endpoint: config.endpointAddress});

module.exports.processWL = processWL;

// Set up the code to call when the Lambda function is invoked
//exports.handler = (event, context, callback) => {
var processWL = function(event, context) {
    // Load the message passed into the Lambda function into a JSON object
    var eventText = JSON.stringify(event, null, 2);
    // Log a message to the console, you can view this text in the Monitoring tab in the Lambda console or in the CloudWatch Logs console
    console.log("Received event:", eventText);

    var currWL = event.wl;
    var lastWL = event.history.wl_1;

    var alertLevel = 0;
    var wlRise = true;
    if (currWL > lastWL) {
        wlRise = true;
        alertLevel = utils.getAlertlevelRise();
    }

    if (currWL < lastWL) {
        wlRise = false;
        alertLevel = utils.getAlertlevelFall();
    }

    // May have to use history by accessing Shadow.
    if (alertLevel) {
        // Make sure that thing name is same as station id.
        //config.thingName = event.station_id;
        config.thingName = event.sid;
        var devState = utils.getShadowState(config);
        //
        var messageText = utils.composeSMS(event, alertLevel, wlRise, devState);

        // Create an SNS object
        var sns = new AWS.SNS();

        var topic = config.snsTopicArn + ":" + event.station_id;
        // Populate the parameters for the publish operation
        // - Message : the text of the message to send
        // - TopicArn : the ARN of the Amazon SNS topic to which you want to publish 
        var params2 = {
		TopicArn: config.snsTopicArn + ":" + "MyIoTTestTopic"
            //NextToken: 'STRING_VALUE'
        };
        var subscriberList = new Array();
        sns.listSubscriptionsByTopic(params2, function (err, data) {
            if (err)
                console.log(err, err.stack); // an error occurred
            else {
                console.log(data.Subscriptions[0].Endpoint);           // successful response
                console.log(data.Subscriptions[1].Endpoint);
                for (var i = 0; i < data.Subscriptions.length; i++ )
                {
                    subscriberList.push(data.Subscriptions[i].Endpoint)
                }
            }
        });
        // TODO: Use the subscriber list to send SMS through external vendor.

        sendMsg(messageText, subscriberList);

    } // if
//
}


    function sendMsg(msg, subsList) {
        var user = 'TODO';
        var pass = 'TODO';
        var sms_from = 'BluGraph';
        // Create a comma separared list of numbers. (max=10?)
        var phoneList = document.write(subsList.join(", "));
        //
        var sms_server = 'gateway80.onewaysms.sg';
        var path1 = "/api2.aspx?apiusername=" + user + "&apipassword=" + pass;
        var path2 = "&message=" + encodeURI(msg) + "&languagetype=1";

        /*
         var options = {
         host: 'requestb.in',
         path: '/rfyb1wrf',
         method: 'POST'
         };
         */

        callback = function (response) {
            var str = '';

            //another chunk of data has been recieved, so append it to `str`
            response.on('data', function (chunk) {
                str += chunk;
            });

            //the whole response has been recieved, so we just print it out here
            response.on('end', function () {
                console.log(str);
                // TODO: If error, write to S3?
            });
        }

        for (i = 0; i < subsList.length; i++) {
            var path3 = "&senderid=" + encodeURI(sms_from).
            "&mobileno=" + encodeURI(subsList[i]);
            var options = {
                host: sms_server,
                path: path1 + path2 + path3,
                //method: 'POST'
            };
            var req = http.request(options, callback);
        }
        /*
         req.write("hello world!");
         req.end();
         */
    }

