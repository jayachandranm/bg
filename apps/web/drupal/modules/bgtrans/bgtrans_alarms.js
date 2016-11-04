(function ($) {
    Drupal.behaviors.bgtrans = {
        attach: function (context, settings) {
            console.log('JS attach for Alarms, initialization.');
            if (Drupal.settings.alarms) {
                // No context parameters are required.
                var sid2vehmap = {};
                var veh_list = Drupal.settings.alarms.veh_list;
                sid2vehmap = veh_list;
                var num_veh = veh_list.length;
                var sid_list = [];
                // ECMAScript 5 and later.
                sid_list = Object.keys(sid2vehmap);
                // For older versions of JS.
                /* 
                for(var k in sid2vehmap) {
                    sid_list.push(k);
                }
                */
                //var data = Drupal.settings.bgchart.data.data;
                var basepath = Drupal.settings.basePath;
                console.log('Retrieving bgtrans settings.');
                //
                // TODO: Do this in a theme.
                $("#block-bgtrans-alarms").height(500);
                //$("#rt_alarms").height(400);


                /*
                 * Real time updates.
                 */
                var requestCurrentAlarms = (function () {
                    console.log('Alarms: Ajax call.');
                    //post_url = basepath + '?q=bgtrans/geoj/' + 'rt';
                    post_url = basepath + '?q=bgtrans/get/alarms';
                    var postData = {};
                    postData['reqtype'] = 'alarms_rt';
                    var filter = {};
                    console.log(sid_list);
                    //var sid = veh_list.sid;
                    filter['sidList'] = sid_list;
                    var timenow = (new Date()).getTime();
                    filter['start'] = timenow - (1*60*60*1000);
                    filter['end'] = timenow; // or current time.
                    postData['filter'] = filter;
                    jsonPost = JSON.stringify(postData);
                    console.log(jsonPost);
                    // Remove current table?
                    $.ajax({
                        url: post_url,
                        type: 'POST',
                        dataType: 'json',
                        //data: jsonPost,
                        data: {jsonPost: jsonPost},
                        success: function (jsonData) {
                            //console.log('Received JSON for All Veh=', jsonData);
                            console.log('Received JSON for Alarms=', JSON.stringify(jsonData));
                            var jsonObj = jsonData; //JSON.parse(jsonData);
                            var ul = $("<ul>");
                            for(var i = 0, l = jsonObj.length; i < l; ++i) {
                                ul.append("<li>" + jsonObj[i][1] + "</li>");
                            }
                            //$("#rt_alarms").append(ul); 
                            $("#rt_alarms").html(ul); 
                        },
                        complete: function () {
                            console.log('Ajax processing complete, call again after delay');
                            setTimeout(requestCurrentAlarms, 5000);
                        },
                        error: function (xhr, status, error) {
                            //error: function () {
                            //alert('Error loading ');
                            console.log('Error: Ajax response', xhr, status, error);
                        }
                    }); // ajax
                }); // requestData
                requestCurrentAlarms();
            } // if settings, bgtrans
        } // attach
    } // behaviors, bgtrans
})(jQuery);


