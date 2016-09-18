(function ($) {
    Drupal.behaviors.bgmap2 = {
        attach: function (context, settings) {
            console.log('JS attach, initialization.');
            // If trace array is set, happens inside trace block.
            if (Drupal.settings.trace) {
                // Globals, will get updated through datetime picker.
                var selectedStartDateVal = 0;
                var selectedStartTimeVal = 0;
                //
                var selectedEndDateVal = 0;
                var selectedEndTimeVal = 0;
                //
                // TODO: check this.
                var polylines = new Array();
                var latlngs = new Array();
                var sid_list = Drupal.settings.trace.sid_list;
                //var data = Drupal.settings.bgchart.data.data;
                console.log('Retrieving (trace) settings.');
                var basepath = Drupal.settings.basePath;
                //
                var title2 = 'GPS Trace on Map';
                $("#block-bgmap-trace").height(600);
                $("#show_map2").height(400);
                //
                var start = moment().subtract(1, 'days');
                var end = moment();
                startTime = start.valueOf();
                endTime = end.valueOf();
                $('input[name="daterange"]').daterangepicker({
                        timePicker: true,
                        timePickerIncrement: 30,
                        locale: {
                            format: 'MM/DD/YYYY h:mm A'
                        },
                        startDate: start,
                        endDate: end,
                        ranges: {
                            'Today': [moment().subtract(3, 'hours'), moment()],
                            'Yesterday': [moment().subtract(2, 'days'), moment().subtract(1, 'days')]
                        }
                    },
                    function (start, end, label) {
                        console.log('Apply datetime: ', start.format('x'), end.valueOf());
                        startTime = start.valueOf();
                        endTime = end.valueOf();
                        requestTraceData();
                    }
                );

                var map2 = new L.map('show_map2', {
                              fullscreenControl: true,
                              fullscreenControlOptions: {
                                position: 'topleft'
                              }
                           });
                // Default home location.
                var lat = 1.421, lng = 103.829;
                //center: [51.505, -0.09], zoom: 13
                map2.setView([lat, lng], 13);
                //
                var traceGeoJsonLayer = L.geoJson().addTo(map2);
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

                L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
                    attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                }).addTo(map2);

                // http://leafletjs.com/examples/geojson.html

                /*
                 * Real time updates.
                 */
                var requestTraceData = (function () {
                    map2.removeLayer(traceGeoJsonLayer);
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
                            traceGeoJsonLayer = L.geoJson().addTo(map2);
                            traceGeoJsonLayer.addData(jsonData);
                            //map2.fitBounds(latlngs);
                            //var polygon = L.polygon().addTo(map);
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
                }); // requestTraceData

                requestTraceData();
            } // if settings, trace.
        } // attach
    } // behaviors, bgmap
})
(jQuery);

                // Place a div name correcly.
                //$("#block-bgmap-trace").append("<div class='row'> <input class='form-control' class='pull-left' type='text' name='daterange' value='01/01/2015 1:30 PM - 01/01/2015 2:00 PM'> </div>");
                //$("#block-bgmap-trace").append("<div class='row' style='margin-top:1em' id='show_map2'>Map will display here.....</div>");

                            /*
                             for (var i = 0; i < jsonData.length; i++) {
                             latlngs.push([parseFloat(jsonData[i].lt), parseFloat(jsonData[i].lg)]);
                             }
                             console.log(latlngs);
                             //var test = JSON.stringify(latlngs);
                             //var test2 = [[1.46, 103.83], [1.45, 103.82], [1.43, 103.81]];
                             //console.log(test);
                             polylines = L.polyline(latlngs, { color: 'blue' });
                             polylines.addTo(map2);
                             */

                    /*
                     if (typeof polylines != "undefined") {
                     console.log("CLEAR TRACE.");
                     map2.removeLayer(polylines);
                     }
                     */

