console.log('Loading function');
// Load the AWS SDK
var AWS = require("aws-sdk");
var http = require('http');

var config = {
    "thingName": 'hello_mpro',
    "endpointAddress": "a30p3ekg9epqya.iot.ap-southeast-1.amazonaws.com"
}
var iotdata = new AWS.IotData({endpoint: config.endpointAddress});

// Set up the code to call when the Lambda function is invoked
exports.handler = (event, context, callback) => {
    // Load the message passed into the Lambda function into a JSON object
    var eventText = JSON.stringify(event, null, 2);
    // Log a message to the console, you can view this text in the Monitoring tab in the Lambda console or in the CloudWatch Logs console
    console.log("Received event:", eventText);

    var devState = getShadowState(config);
    // May have to use history by accessing Shadow, or have a period of silence after an alert.
    var alertCondition = true;

    if (alertCondition) {
        var messageText = msgSMS(event, devState);

        // Create an SNS object
        var sns = new AWS.SNS();

        var topic = "arn:aws:sns:ap-southeast-1:658774400218:" + event.station_id;
        // Populate the parameters for the publish operation
        // - Message : the text of the message to send
        // - TopicArn : the ARN of the Amazon SNS topic to which you want to publish 
        var params2 = {
            TopicArn: "arn:aws:sns:ap-southeast-1:658774400218:MyIoTTestTopic"
            //NextToken: 'STRING_VALUE'
        };
        var subscriberList;
        sns.listSubscriptionsByTopic(params2, function (err, data) {
            if (err)
                console.log(err, err.stack); // an error occurred
            else {
                console.log(data.Subscriptions[0].Endpoint);           // successful response
                console.log(data.Subscriptions[1].Endpoint);
            }
        });
        // TODO: Use the subscriber list to send SMS through external vendor.

        sendMsg(messageText, subsList);

    } // if

    function getShadowState(config) {
        var currDevState;
        iotdata.getThingShadow({
            thingName: config.thingName
        }, function (err, data) {
            if (err) {
                context.fail(err);
            } else {
                console.log(data);
                var jsonPayload = JSON.parse(data.payload);
                var status = jsonPayload.state.reported.location;
                console.log('status: ' + status);
                currDevState = data;
            }
        });
        return currDevState;
    }

    function setShadowState(config) {
        var newStatus = "5 battery rd";
        var update = {
            "state": {
                "desired": {
                    "location": newStatus
                }
            }
        };
        iotdata.updateThingShadow({
            payload: JSON.stringify(update),
            thingName: config.thingName
        }, function (err, data) {
            if (err) {
                context.fail(err);
            } else {
                console.log(data);
                context.succeed('newStatus: ' + newStatus);
            }
        });
    }

    function sendMsg(msg, subsList) {
        var options = {
            host: 'requestb.in',
            path: '/rfyb1wrf',
            method: 'POST'
        };

        callback = function (response) {
            var str = '';

            //another chunk of data has been recieved, so append it to `str`
            response.on('data', function (chunk) {
                str += chunk;
            });

            //the whole response has been recieved, so we just print it out here
            response.on('end', function () {
                console.log(str);
            });
        }

        var req = http.request(options, callback);
        req.write("hello world!");
        req.end();
    }

    //
    function msgSMS(event) {
        // Create a string extracting the click type and serial number from the message sent by the AWS IoT button
        var messageText = "Received  " + event.timestamp + " message from button ID: " + event.serialNumber;
        // Write the string to the console
        console.log("Message to send: " + messageText);
        return messageText;
    }
};
