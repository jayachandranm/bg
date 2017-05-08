    console.log('Loading function');
    // Load the AWS SDK
    var AWS = require("aws-sdk");
    
    // Set up the code to call when the Lambda function is invoked
    exports.handler = (event, context, callback) => {
        // Load the message passed into the Lambda function into a JSON object 
        var eventText = JSON.stringify(event, null, 2);
        // Log a message to the console, you can view this text in the Monitoring tab in the Lambda console or in the CloudWatch Logs console
        console.log("Received event:", eventText);
	//  
        var thingName = event.sid;
        var battLevel = event.bl;
 
        // May have to use history by accessing Shadow, or have a period of silence after an alert.
	// get shadow
        // if battery level < 80 and shadow batt_status = high, send alert.
	    // set shadow batt_status = medium.
	// if batt_level < 60 and shadow batt_status = med, send alert.
	    // set shadow batt_status = low.
        // From device, when batt_level > 70, if batt_status = low, set to medium.
	// From device, when batt_level > 90, if batt_statu = low/medium, set to high.
        var alertCondition = false;        
        var devState;
        iotdata.getThingShadow({
            thingName: thingName
        }, function (err, data) {
            if (err) {
                context.fail(err);
                console.log("Error in getting Shadow.", err);
            } else {
                var jsonPayload = JSON.parse(data.payload);
                console.log('Shadow: ' + jsonPayload);
                //console.log('status: ' + status);
                devState = jsonPayload.state.reported;
		var battState = devState.battery_status;    
		//if((battLevel < config.warn_1) && (battState === "high")) {
		if((battLevel < 80) && (battState === "high")) {
                    var messageText = composeSMS(msg, "medium", devState);
		    sendSMS(messageText);
		    setShadowState("medium");
		}
		if((battLevel < 60) && ((battState === "medium") || (battState === "high"))) {
                    var messageText = composeSMS(msg, "low", devState);
		    sendSMS(messageText);
		    setShadowState("low");
            } // else
        }); // getThingShadow


        function sendSMS(messageText) {
        
        // Create an SNS object
        var sns = new AWS.SNS();
        
        var topic = "arn:aws:sns:ap-southeast-1:658774400218:maintenance" //+ event.station_id;
        // Populate the parameters for the publish operation
        // - Message : the text of the message to send
        // - TopicArn : the ARN of the Amazon SNS topic to which you want to publish 
        var params = {
            Message: messageText,
            TopicArn: topic
         };
         sns.publish(params, context.done);
         } // if

        //
        function composeSMS(msg, alertLevel, devState) { 
            // Create a string extracting the click type and serial number from the message sent by the AWS IoT button
            var messageText = "Battery Level=" + msg.bl 
			+ " from Station: " + msg.sid 
			+ " at time: " + msg.ts;
            // Write the string to the console
            console.log("Message to send: " + messageText);
            return messageText;
        }
    };
