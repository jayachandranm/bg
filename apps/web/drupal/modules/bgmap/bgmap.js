(function ($) {
    Drupal.behaviors.bgmap = {
        attach: function (context, settings) {
            console.log('JS attach, initialization.');
            if (Drupal.settings.bgmap) {
                // No context parameters are required.
                //var sid = Drupal.settings.bgmap.sid;
                //var data = Drupal.settings.bgchart.data.data;
                var basepath = Drupal.settings.basePath;
                console.log('Retrieving bgmap settings.');
                //
                var title = 'Real Time Map';
                // Place a div name correcly.
                $("#block-bgmap-bgmap").append("<div id='show_report'>Map will display here.....</div>");
                $("#block-bgmap-bgmap").height(500);
                $("#show_report").height(400);

                var lat = 1.421, lng = 103.829;
                //center: [51.505, -0.09], zoom: 13
                var map = L.map('show_report').setView([lat, lng], 15);

                L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
                    attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                }).addTo(map);

                // http://leafletjs.com/examples/geojson.html
                // add a marker in the given location, attach some popup content to it and open the popup
                var markerList = {};
                //var markers = new Array();

                var carIcon_b = L.icon({
                    iconUrl: 'sites/default/files/car_blue.png',
                    //shadowUrl: 'sites/default/car.png',

                    iconSize: [32, 37], // size of the icon
                    //shadowSize:   [50, 64], // size of the shadow
                    iconAnchor: [22, 94], // point of the icon which will correspond to marker's location
                    shadowAnchor: [4, 62],  // the same for the shadow
                    popupAnchor: [-3, -76] // point from which the popup should open relative to the iconAnchor
                });

                var carIcon_r = L.icon({
                    iconUrl: 'sites/default/files/car_red.png',
                    //shadowUrl: 'sites/default/car.png',

                    iconSize: [32, 37], // size of the icon
                    //shadowSize:   [50, 64], // size of the shadow
                    iconAnchor: [22, 94], // point of the icon which will correspond to marker's location
                    shadowAnchor: [4, 62],  // the same for the shadow
                    popupAnchor: [-3, -76] // point from which the popup should open relative to the iconAnchor
                });

                /*
                 * Real time updates.
                 */
                var requestAllData = (function () {
                    console.log('Bgmap: Ajax call.');
                    data_url = basepath + '?q=bgmap/get/' + 'car';
                    $.ajax({
                        url: data_url,
                        success: function (jsonData) {
                            console.log('Received JSON for All Veh=', jsonData);
                            for (var i = 0; i < jsonData.length; i++) {
                                var newlt = jsonData[i].lt;
                                var newlg = jsonData[i].lg;
                                var nid = jsonData[i].nid;
                                var vnum = jsonData[i].vnum;
                                var mymarker;
                                var currLtLng = L.latLng(newlt, newlg);
                                //console.log(newlg, newlt, nid, vnum);
                                if (nid == -1) {
                                    // delete the entry corresponding to this vnum, that page does not exist.
                                    // TODO:
                                }
                                if (!(vnum in markerList)) {
                                    console.log('marker not found in the list.');
                                    //mymarker = L.marker([newlg, newlt], {icon: carIcon_r}).addTo(map);
                                    mymarker = L.marker(currLtLng, { icon: carIcon_r }).addTo(map);
                                    markerList[vnum] = mymarker;
                                } else {
                                    console.log('marker found, update, lt first.', newlt, newlg);
                                    mymarker = markerList[vnum];
                                    //markers[i].setLatLng([newlg, newlt]);
                                    //mymarker.setLatLng([newlg, newlt]);
                                    mymarker.setLatLng(currLtLng);
                                    //var bounds = L.latLngBounds(southWest, northEast);
                                    //map.fitBounds(bounds);
                                    //map.fitBounds([[1,1],[2,2],[3,3]]);
                                    map.panTo(currLtLng);
                                }
                                var nodeurl = basepath + '?q=node/' + nid;
                                var popContent = "<a href=" + nodeurl + ">" + vnum + "</a>";
                                mymarker.bindPopup(popContent);
                            }
                        },
                        complete: function () {
                            console.log('Ajax processing complete, call again after delay');
                            setTimeout(requestAllData, 50000);
                        },
                        //error: function(xhr, status, error) {
                        error: function () {
                            //alert('Error loading ');
                            console.log('Error: Ajax response');
                        }
                    }); // ajax
                }); // requestData
                requestAllData();
            } // if settings, bgmap
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
                var sid = Drupal.settings.trace.sid;
                //var data = Drupal.settings.bgchart.data.data;
                console.log('Retrieving (trace) settings.');
                var basepath = Drupal.settings.basePath;
                //
                var title2 = 'GPS Trace on Map';
                // Place a div name correcly.
                $("#block-bgmap-trace").append("From: <input class='datepicker_s' type='text'/>");
                $("#block-bgmap-trace").append("<input style='margin-right:5em' class='timepicker_s' type='text'/>");
                $("#block-bgmap-trace").append("To: <input class='datepicker_e' type='text'/>");
                $("#block-bgmap-trace").append("<input style='margin-right:5em' class='timepicker_e' type='text'/>");
                $("#block-bgmap-trace").append("<button id='rangeSubmit' class='btn btn-default' type='submit'>Trace</button>");
                $("#block-bgmap-trace").append("<div style='margin-top:1em' id='show_map2'>Map will display here.....</div>");
                //$("#block-bgmap-trace").append("<div class='col-md-4 col-md-offset-2' id='dtp1'> <input type='text' id='config-demo' class='form-control'></div>");
                $("#block-bgmap-trace").height(600);
                $("#show_map2").height(400);

                data_url = basepath + '?q=bgmap/getgeoj/' + sid;
                var lat = 1.421, lng = 103.829;
                //center: [51.505, -0.09], zoom: 13
                //var map = L.map('show_report2').setView([lng, lat], 13);
                var map2 = L.map('show_map2').setView([lat, lng], 13);
                //$('input[name="date_range_picker2"]').daterangepicker();
                //$('input[name="daterange"]').daterangepicker();
                //$('#config-demo').daterangepicker();
                //$('#dtp1').datetimepicker();
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
                /*
                                var $input_ds = $('.datepicker_s').pickadate();
                                //var picker = $input.pickadate('picker');
                                var picker = $input_ds.pickadate('picker');
                                //picker.set('select', [date.getFullYear(), date.getMonth() + 1, date.getDate()]);
                                picker.set('select', [date.getFullYear(), date.getMonth(), date.getDate() -1]);
                                var prevDayStartTime = startTimeOfDay - (60*60*24*1000) 
                                console.log('Prev day start time: ', prevDayStartTime);
                                picker.on({
                                    open: function () {
                                        console.log('Opened up!')
                                    },
                                    set: function (thingSet) {
                                        console.log('Set stuff:', thingSet.select)
                                        // Override the default day.
                                        selectedStartDateVal = thingSet.select;
                                    }
                                });
                */

                var $input_ds = $('.datepicker_s').pickadate({
                    onStart: function () {
                        console.log('Hello there :)');
                        this.set('select', [date.getFullYear(), date.getMonth(), date.getDate() - 1]);
                    },
                    onRender: function () {
                        console.log('Whoa.. rendered anew');
                    },
                    onOpen: function () {
                        console.log('Opened up');
                    },
                    onClose: function () {
                        console.log('Closed now');
                    },
                    onStop: function () {
                        console.log('See ya.');
                    },
                    onSet: function (context) {
                        console.log('Just set stuff:', context.select);
                        selectedStartDateVal = context.select;
                    }
                });

                var $input_ts = $('.timepicker_s').pickatime({
                    onStart: function () {
                        console.log('Started time picker');
                        this.set('select', 0);
                    },
                    onOpen: function () {
                        console.log('Opened up');
                    },
                    onSet: function (context) {
                        console.log('Retrieved minutes: ', context);
                        selectedStartTimeVal = context.select * 60 * 1000;
                        console.log('Calculated Total Time: ', selectedStartDateVal + selectedStartTimeVal);
                    }
                });

                var $input_de = $('.datepicker_e').pickadate({
                    onStart: function () {
                        console.log('Hello there :)');
                        // Set end date as 00:00am today.
                        this.set('select', [date.getFullYear(), date.getMonth(), date.getDate()]);
                    },
                    onRender: function () {
                        console.log('Whoa.. rendered anew');
                    },
                    onOpen: function () {
                        console.log('Opened up');
                    },
                    onClose: function () {
                        console.log('Closed now');
                    },
                    onStop: function () {
                        console.log('See ya.');
                    },
                    onSet: function (context) {
                        console.log('Just set stuff:', context.select);
                        selectedEndDateVal = context.select;
                    }
                });

                var $input_te = $('.timepicker_e').pickatime({
                    onStart: function () {
                        console.log('Started time picker');
                        this.set('select', 0);
                    },
                    onOpen: function () {
                        console.log('Opened up');
                    },
                    onSet: function (context) {
                        console.log('Retrieved minutes: ', context);
                        selectedEndTimeVal = context.select * 60 * 1000;
                        console.log('Calculated Total Time: ', selectedEndDateVal + selectedEndTimeVal);
                    }
                });

                $('#rangeSubmit').on('click', function (e) {
                    console.log("Button Clicked.");
                    //Override the range values.
                    // TODO: take care of partial selections.
                    startTime = selectedStartDateVal + selectedStartTimeVal;
                    endTime = selectedEndDateVal + selectedEndTimeVal;
                    console.log(startTime, endTime, polylines);
                    requestTraceData();
                })
                console.log('Selected start time=', selectedStartDateVal + selectedStartTimeVal);
                //var picker2 = $input.pickatime('picker2');
                /*
                 picker2.on({
                 open: function() {
                 console.log('Opened up time!')
                 },
                 set: function(thingSet) {
                 console.log('Set time:', thingSet.select)
                 }
                 })
                 */
                //console.log('picker', picker, picker2);

                L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
                    attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                }).addTo(map2);

                // http://leafletjs.com/examples/geojson.html

                /*
                 * Real time updates.
                 */
                var requestTraceData = (function () {
                    console.log('Trace: Ajax call: ', startTime, endTime);
                    if (typeof polylines != "undefined") {
                        console.log("CLEAR TRACE.");
                        map2.removeLayer(polylines);
                    }
                    // Clear the array before getting new values.
                    latlngs.length = 0;
                    data_url = basepath + '?q=bgmap/getgeoj/' + sid + '/' + startTime + '/' + endTime;
                    $.ajax({
                        url: data_url,
                        success: function (jsonData) {
                            console.log('Received JSON for Trace=', jsonData);
                            for (var i = 0; i < jsonData.length; i++) {
                                latlngs.push([parseFloat(jsonData[i].lt), parseFloat(jsonData[i].lg)]);
                                //latlngs[i][0] = 111; //jsonData.latitude;
                                //latlngs[i][1] = 222; //jsonData.longitude;
                            }
                            console.log(latlngs);
                            //var test = JSON.stringify(latlngs);
                            //var test2 = [[1.46, 103.83], [1.45, 103.82], [1.43, 103.81]];
                            //console.log(test);
                            polylines = L.polyline(latlngs, { color: 'blue' });
                            polylines.addTo(map2);
                            //map2.fitBounds(latlngs);
                            //var polygon = L.polygon().addTo(map);
                        },
                        complete: function () {
                            //setTimeout(requestTraceData, 2000);
                        },
                        //error: function(xhr, status, error) {
                        error: function () {
                            alert('Error loading ');
                        }
                    }); // ajax
                }); // requestTraceData

                requestTraceData();
            } // if settings, trace.
        } // attach
    } // behaviors, bgmap
})(jQuery);
