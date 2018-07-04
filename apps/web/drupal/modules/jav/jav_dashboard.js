(function ($) {
    Drupal.behaviors.jav_dashboard = {
        attach: function (context, settings) {
            console.log('JS attach for Dashboard, initialization.');
            // TODO: Where is the most appropriate place for this code?
            // Depends on Drupal behaviors.
            //
            function requestEventCount(baseurl) {
                var basepath = baseurl;
                var post_url = basepath + '?q=jav/get/eventcount';
                //var postDataList = {};
                //var elems = [];
                    var postData = {};
                    postData['ts'] = moment().valueOf();
                    //postData['msg_type'] = 'event_clear';
                    postData['sensor_group'] = 'manual';
                var jsonPost = JSON.stringify(postData);
                console.log(jsonPost);
                $.ajax({
                    url: post_url,
                    type: 'POST',
                    dataType: 'json',
                    //data: jsonPost,
                    data: { jsonPost: jsonPost },
                    success: function (jsonData) {
                        console.log('Received JSON for Ajax =', jsonData.unack_count);
                        $("#alert-badge").text(jsonData.unack_count);
                    },
                    complete: function () {
                        console.log('Ajax processing complete, call again after delay');
                        //setTimeout(requestCurrent, 15000);
                    },
                    error: function (xhr, status, error) {
                        //error: function () {
                        //alert('Error loading ');
                        console.log('Error: Ajax response', xhr, status, error);
                    }
                }); // ajax
            }
        
            //
            if (Drupal.settings.jav_dashboard) {
                // No context parameters are required.
                var sidmap = {};
                var dev_list = Drupal.settings.jav_dashboard.dev_list;
                sid2devmap = dev_list;
                var num_dev = dev_list.length;
                var sid_list = [];
                // ECMAScript 5 and later.
                //sid_list = Object.keys(sidmap);
                var basepath = Drupal.settings.basePath;
                console.log('Retrieving jav settings.');
                //
                /*
                 * Real time updates.
                 */
                //$.fn.dataTable.moment('D-MMM-YY HH:mm');
                //alerts_table.buttons().container().appendTo( '#clear_button' );
                //var data = alerts_table.rows().data();
                //console.log('The table has ' + data.length + ' records');
                var requestCurrentData = (function () {
                }); // requestData
                //requestCurrentData();
                requestEventCount(basepath);
            } // if settings, jav
        } // attach
    } // behaviors, jav
})(jQuery);

