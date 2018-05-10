
/*
     var msg = {
     sid: sid,
     wl: currWL,
     wa: msg_0.wa.N,
     ts: ts_unix
     };
     */

    // If md does not exist in the message, this lambda will not be called.
    // If md is set and md =0, this lambda may be called.
    /*
     if(typeof msg.md !== 'undefined' && msg.md !== null) {
     if(msg.md !== 0 ) {
     // Do send alerts, if md is non-zero.
     return;
     }
     }
     */
    
                                /*
                             var lastWA = record_1.wa;
                             var currWA = msg.wa;
                             var diffWA = currWA - lastWA;
                             var lastTS = record_1.ts;
                             var currTS = msg.ts;
                             var diffTS = (currTS - lastTS) / 1000;
                             var riseRate = diffWA / diffTS;
                             console.log("spike2, diffTS=", diffTS, ", diffWA=", diffWA, ", riseRate=", riseRate);
                             if(riseRate > 2) {
                             // Set dev to maintenance mode.
                             var config_mnt = {
                             mode : "maintenance",
                             thingName : msg.sid;
                             };
                             setShadowState(iotdata, config_mnt);
                             // Return without sending SMS.
                             // TODO: Make sure that function returns only after completing above operation.
                             return;
                             }
                             */


                                 /*
     var s3obj = new aws.S3(params);
     s3obj.upload({Body: body}).
     on('httpUploadProgress', function(evt) {
     console.log(evt);
     }).
     send(function(err, data) { console.log(err, data); });
     */

         // Create a string extracting the click type and serial number from the message sent by the AWS IoT button
    //var dt = new Date(msg.ts);
    // 2017-04-13 10:21:39
    //var options = {};
    //options.timeZone = 'SG'; // UTC
    //options.timeZoneName = 'short';
    // date.toLocaleString();
    // moment().local() may not work as the AWS server may not be in SG timezone.

        // moment (Date); 
    //var dt = moment(msg.ts).utcOffset('+0800').format("YYYY-MM-DD HH:mm:ss"); 
    //dt.format("YYYY-MM-DD hh:mm:ss");
