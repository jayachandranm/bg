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

            function getMntStatus(baseurl, liftid_list) {
                var basepath = baseurl;
                var post_url = basepath + '?q=jav/get/mntstatus';
                //var postDataList = {};
                //var elems = [];
                var postData = {};
                postData['liftIds'] = liftid_list;
                //postData['msg_type'] = 'event_clear';
                //postData['sType'] = stype;
                var jsonPost = JSON.stringify(postData);
                console.log(jsonPost);
                $.ajax({
                    url: post_url,
                    type: 'POST',
                    dataType: 'json',
                    //data: jsonPost,
                    data: { jsonPost: jsonPost },
                    success: function (jsonData) {
                        console.log('Received data.', jsonData);
                        jsonData.forEach(function(row){
                           let b_id = "#maintenance-" + row.lift_id;
                           let alert_id = "#liftalert-" + row.lift_id;
                           $(b_id).text('Switch to Operational');
                           $(b_id).addClass('mnt');
                           $(b_id).removeClass('btn-primary');
                           $(b_id).addClass('btn-info');
                           $(alert_id).addClass('alert alert-warning');
                           $(alert_id).text('The lift is in maintenance mode.');
                        });
                    },
                    complete: function () {
                        console.log('Ajax processing complete.');
                    },
                    error: function (xhr, status, error) {
                        //error: function () {
                        //alert('Error loading ');
                        console.log('Error: Ajax response', xhr, status, error);
                    }
                }); // ajax
            }

            function enableButton(css_id, alert_id, type) {
                if (type == 'maintenance') {
                    $(css_id).removeClass('disabled');
                    if ($(css_id).hasClass('mnt')) {
                        console.log("Switch operational button..");
                        $(css_id).removeClass('btn-primary');
                        $(css_id).addClass('btn-info');
                        $(css_id).text('Switch to Operational');
                        $(alert_id).addClass('alert alert-warning');
                        $(alert_id).text('The lift is in maintenance mode.');
                    } else {
                        console.log("Switch to maintenance button..");
                        $(css_id).removeClass('btn-info');
                        $(css_id).addClass('btn-primary');
                        $(css_id).text('Switch to Maintenance');
                        $(alert_id).removeClass('alert alert-warning');
                        $(alert_id).text('');
                    }
                }
                else {
                    console.log("Enable button..");
                    $(css_id).removeClass('disabled');
                }
            }

            //
            if (Drupal.settings.jav_lift) {
                // No context parameters are required.
                var sidmap = {};
                console.log('Retrieving jav settings.');
                var liftIds = Drupal.settings.jav_lift.lift_ids;
                //var liftId;
                //console.log(liftId);
                var sid_list = [];
                // ECMAScript 5 and later.
                //sid_list = Object.keys(sidmap);
                var basepath = Drupal.settings.basePath;
                // Update maintenance buttons based on current status of lifts.
                getMntStatus(basepath, liftIds);
                //
                $('.rst_light').click(function (e) {
                    var b_id = '#' + e.currentTarget.id;
                    $(b_id).addClass('disabled');
                    liftId = $(b_id).parent().attr('id');
                    var alert_id = '#liftalert-' + liftId;
                    updateSensor(basepath, liftId, 'lighting');
                    setTimeout(enableButton, 1000, b_id, alert_id, 'light');
                });
                $('.rst_vent').click(function (e) {
                    var b_id = '#' + e.currentTarget.id;
                    $(b_id).addClass('disabled');
                    liftId = $(b_id).parent().attr('id');
                    var alert_id = '#liftalert-' + liftId;
                    updateSensor(basepath, liftId, 'ventilation');
                    setTimeout(enableButton, 1000, b_id, alert_id, 'vent');
                });
                $('.restart').click(function (e) {
                    var b_id = '#' + e.currentTarget.id;
                    $(b_id).addClass('disabled');
                    liftId = $(b_id).parent().attr('id');
                    var alert_id = '#liftalert-' + liftId;
                    updateSensor(basepath, liftId, 'reboot');
                    setTimeout(enableButton, 1000, b_id, alert_id, 'restart');
                });
                $('.maintenance').click(function (e) {
                    var b_id = '#' + e.currentTarget.id;
                    $(b_id).addClass('disabled');
                    liftId = $(b_id).parent().attr('id');
                    var alert_id = '#liftalert-' + liftId;
                    if ($(b_id).hasClass('mnt')) {
                        updateSensor(basepath, liftId, 'operational');
                        $(b_id).removeClass('mnt');
                    } else {
                        $(b_id).addClass('mnt');
                        updateSensor(basepath, liftId, 'maintenance');
                    }
                    setTimeout(enableButton, 1000, b_id, alert_id, 'maintenance');
                });
            } // if settings, jav
        } // attach

    } // behaviors, jav
})(jQuery);

