(function ($) {
    Drupal.behaviors.bgmap2 = {
        attach: function (context, settings) {
            console.log('JS attach, initialization.');
            // If trace array is set, happens inside trace block.
            if (Drupal.settings.trace) {
                //
                //var playback = null;
                // TODO: check this.
                var sid_list = Drupal.settings.trace.sid_list;
                var trace_anim = Drupal.settings.trace.trace_anim;
                var custom_color = Drupal.settings.trace.color;
                //var data = Drupal.settings.bgchart.data.data;
                console.log('Retrieving (trace) settings. trace_anim=', trace_anim);
                var basepath = Drupal.settings.basePath;
                //
                var title2 = 'GPS Trace on Map';
                $("#block-bgmap-trace").height(600);
                $("#trace_map").height(400);
                //
                var start = moment().subtract(1, 'days');
                var end = moment();
                startTime = start.valueOf();
                endTime = end.valueOf();
/*
                var date = new Date(); date.setHours(0); date.setMinutes(0); date.setSeconds(0);
                var endTime = date.getTime();
*/
                //
                /*
                 var map2 = new L.map('trace_map', {
                 fullscreenControl: true,
                 fullscreenControlOptions: {
                 position: 'topleft'
                 }
                 });
                 */
                var map2 = new L.map('trace_map', {
                    //fullscreenControl: true,
                    fullscreenControl: {
                        pseudoFullscreen: false
                    }
                });

                // Create additional Control placeholders
                function addControlPlaceholders(map) {
                    var corners = map._controlCorners,
                        l = 'leaflet-',
                        container = map._controlContainer;

                    function createCorner(vSide, hSide) {
                        //var className = l + vSide + ' ' + l + hSide;
                        // TODO: The control in the center is given larger size, keept it generic.
                        // TODO: If the element itself can be expanded, this option is not needed.
                        var className = 'col-xs-6 ' + l + vSide + ' ' + l + hSide;

                        corners[vSide + hSide] = L.DomUtil.create('div', className, container);
                    }

                    createCorner('horizcenter', 'top');
                    createCorner('horizcenter', 'bottom');
                }

                addControlPlaceholders(map2);

                var jsonData = Local.requestTraceData();

                //L.control.calendar(this).addTo(map);
                calControl = new L.Control.Calendar(Local);
                calControl.addTo(map2);
                calControl.setup();

                $('#trc_play').addClass('disabled');

                // Default home location.
                var lat = 1.421, lng = 103.829;
                //center: [51.505, -0.09], zoom: 13
                map2.setView([lat, lng], 13);
                L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
                    attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                }).addTo(map2);
                //
                var traceGeoJsonLayer = L.geoJson().addTo(map2);
                var playbackControl;
                var playback;

                // Restart trace on button press.
                $('#trc_restart').click(function () {
                    traceGeoJsonLayer.snakeIn();
                });

                var clearData = function () {
                    map2.removeLayer(traceGeoJsonLayer);
                    if ((playbackControl != undefined) && (playbackControl != null)) {
                        //playbackControl.removeFrom(map2);
                        map2.removeControl(playbackControl);
                        playbackControl = null;
                    }
                    if ((playback != undefined) && (playback != null)) {
                        playback.destroy();
                        playback = null;
                    }
                    if (!$('#trc_play').hasClass('disabled')) {
                        $('#trc_play').addClass('disabled');
                    }
                }
                // http://leafletjs.com/examples/geojson.html

                /*
                 * Real time updates.
                 */
                console.log('Received JSON for Trace=', jsonData);
                //console.log('Received JSON for Trace=', JSON.stringify(jsonData));
                traceGeoJsonLayer = L.geoJson().addTo(map2);
                traceGeoJsonLayer.addData(jsonData);
                if (trace_anim) {
                    traceGeoJsonLayer.snakeIn();
                }
                if (jsonData.features.length > 0) {
                    var playBackData = jsonData.features[0];
                    playBackData.geometry.type = "MultiPoint";
                    var color = playBackData.properties["line-color"];
                    console.log('Mod JSON for Playback=', playBackData, color);
                    // Initialize playback
                    if ($('#trc_play').hasClass('disabled')) {
                        $('#trc_play').removeClass('disabled');
                    }
                    var playbackOptions = {
                        playControl: false,
                        dateControl: false,
                        sliderControl: false,
                        tracksLayer: false,
                        orientIcons: false,
                        marker: function (featureData) {
                            var options = {
                                icon: 'bus',
                                borderColor: custom_color, textColor: custom_color
                            };
                            return {
                                icon: L.BeautifyIcon.icon(options)
                            };
                        }
                    };
                    //playback.setData(playBackData);
                    playback = new L.Playback(map2, playBackData, null, playbackOptions);
                    // TODO: Provide external control for speed.
                    playback.setSpeed(100);
                    playbackControl = new L.Playback.Control(playback);
                    playbackControl.addTo(map2);
                    playbackControl.setup();
                }

                requestTraceData();

                $('#trc_play').click(function () {
                    if ((playback != undefined) && (playback != null)) {
                        if (playback.isPlaying() === false) {
                            playback.start();
                            $('#trc_play_icon').toggleClass('glyphicon-play').toggleClass('glyphicon-pause');
                        } else {
                            playback.stop();
                            $('#trc_play_icon').toggleClass('glyphicon-pause').toggleClass('glyphicon-play');
                        }
                    }
                });
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
