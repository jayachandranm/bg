(function ($) {
    Drupal.behaviors.jav_lift = {
        attach: function (context, settings) {
            console.log('JS attach for Lift pages, initialization.');
            // TODO: Where is the most appropriate place for this code?
            // Depends on Drupal behaviors.
            //
            function updateSensor(baseurl, liftid, stype) {
                var basepath = baseurl;
                var post_url = basepath + '?q=jav/update/sensor';
                //var postDataList = {};
                //var elems = [];
                var postData = {};
                postData['liftId'] = liftid;
                //postData['msg_type'] = 'event_clear';
                postData['sType'] = stype;
                var jsonPost = JSON.stringify(postData);
                console.log(jsonPost);
                $.ajax({
                    url: post_url,
                    type: 'POST',
                    dataType: 'json',
                    //data: jsonPost,
                    data: { jsonPost: jsonPost },
                    success: function (jsonData) {
                        console.log('Published sensor reset.');
                        //$("#alert-badge").text(jsonData.unack_count);
                    },
                    complete: function () {
                        console.log('Ajax processing complete.');
                        //setTimeout(requestCurrent, 15000);
                    },
                    error: function (xhr, status, error) {
                        //error: function () {
                        //alert('Error loading ');
                        console.log('Error: Ajax response', xhr, status, error);
                    }
                }); // ajax
            }

            function enableButton(type) {
                if(type == 'light') {
                    console.log("Enable light button..");
                    $('#rst_light').removeClass('disabled');
                } 
                else if(type == 'vent') {
                    console.log("Enable vent button..");
                    $('#rst_vent').removeClass('disabled');
                }
            }

            //
            if (Drupal.settings.jav_lift) {
                // No context parameters are required.
                var sidmap = {};
                console.log('Retrieving jav settings.');
                var liftId = Drupal.settings.jav_lift.lift_id;
                console.log(liftId);
                var sid_list = [];
                // ECMAScript 5 and later.
                //sid_list = Object.keys(sidmap);
                var basepath = Drupal.settings.basePath;
                //
                $('#rst_light').click(function () {
                    $('#rst_light').addClass('disabled');
                    updateSensor(basepath, liftId, 'lighting');
                    setTimeout(enableButton, 1000, 'light');
                });
                $('#rst_vent').click(function () {
                    $('#rst_vent').addClass('disabled');
                    updateSensor(basepath, liftId, 'ventilation');
                    setTimeout(enableButton, 1000, 'vent');
                });
            } // if settings, jav
        } // attach

    } // behaviors, jav
})(jQuery);

