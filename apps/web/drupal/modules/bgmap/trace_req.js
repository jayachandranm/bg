(function ($) {
    Drupal.behaviors.bgmap5 = {
        attach: function (context, settings) {
            console.log('JS attach, initialization.');
            // If trace array is set, happens inside trace block.
            if (Drupal.settings.trace) {

                var TraceReq = {
                    // If trace array is set, happens inside trace block.
                    //
                    //var playback = null;
                    startTime: 0,
                    endTime: 0,
                    // TODO: check this.
                    init: function () {
                        var start = moment().subtract(1, 'days');
                        var end = moment();
                        startTime = start.valueOf();
                        endTime = end.valueOf();
                        //
                        var date = new Date();
                        // Current time. Will be overwritten by datepicker.
                        // Set by start time be default to start of previous day.
                        date.setHours(0);
                        date.setMinutes(0);
                        date.setSeconds(0);
                        var startTimeOfDay = date.getTime();
                        var endTime = startTimeOfDay;
                        // From 2 days back.
                        var startTime = endTime - (3600 * 24 * 2 * 1000);
                        console.log('Initial start time: ', startTimeOfDay);
                    },


                    // http://leafletjs.com/examples/geojson.html

                    /*
                     * Real time updates.
                     */
                    requestTraceData: (function () {
                        var _jsonData;
                        // Clear the array before getting new values.
                        latlngs.length = 0;
                        console.log('Trace: Ajax call: ', startTime, endTime);
                        var postData = {};
                        postData['reqtype'] = 'trc';
                        var filter = {};
                        console.log(sid_list);
                        var sid = sid_list[0];
                        filter['sidList'] = [sid];
                        filter['start'] = startTime;
                        filter['end'] = endTime; // or current time.
                        postData['filter'] = filter;
                        jsonPost = JSON.stringify(postData);
                        //post_url = basepath + '?q=bgmap/geoj/' + 'trc';
                        post_url = basepath + '?q=bgmap/geoj';
                        //console.log(post_url, jsonPost);
                        $.ajax({
                            url: post_url,
                            type: 'POST',
                            dataType: 'json',
                            data: {jsonPost: jsonPost},
                            //data: {test : 123 },
                            success: function (jsonData) {
                                console.log('Received JSON for Trace=', jsonData);
                                //console.log('Received JSON for Trace=', JSON.stringify(jsonData));
                                // Initialize custom control
                                //map2.fitBounds(latlngs);
                                //var polygon = L.polygon().addTo(map);
                                _jsonData = jsonData;
                            },
                            complete: function () {
                                //setTimeout(requestTraceData, 2000);
                            },
                            //error: function(xhr, status, error) {
                            error: function (xhr, status, error) {
                                console.log("Error in Ajax call", xhr, status, error);
                                //alert('Error loading ');
                            }
                        }); // ajax
                        return _jsonData;
                    }), // requestTraceData

                } // Class
            } // if settings, trace.
        } // attach
    } // behaviors, bgmap
})
(jQuery);

