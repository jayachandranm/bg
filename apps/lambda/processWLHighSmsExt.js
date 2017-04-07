    console.log('Loading function');
    // Load the AWS SDK
    var AWS = require("aws-sdk");
    
    // Set up the code to call when the Lambda function is invoked
    exports.handler = (event, context, callback) => {
        // Load the message passed into the Lambda function into a JSON object 
        var eventText = JSON.stringify(event, null, 2);
        // Log a message to the console, you can view this text in the Monitoring tab in the Lambda console or in the CloudWatch Logs console
        console.log("Received event:", eventText);
        
        // May have to use history by accessing Shadow, or have a period of silence after an alert.
        var alertCondition = true;        

        if(alertCondition) {
        var messageText = msgSMS(event);
        
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
        sns.listSubscriptionsByTopic(params2, function(err, data) {
            if (err) 
                console.log(err, err.stack); // an error occurred
            else {
                console.log(data.Subscriptions[0].Endpoint);           // successful response
                console.log(data.Subscriptions[1].Endpoint);
            }
        });
        // TODO: Use the subscriber list to send SMS through external vendor.
        } // if

        //
        function msgSMS(event) { 
            // Create a string extracting the click type and serial number from the message sent by the AWS IoT button
            var messageText = "Received  " + event.timestamp + " message from button ID: " + event.serialNumber;
            // Write the string to the console
            console.log("Message to send: " + messageText);
            return messageText;
        }
    };
