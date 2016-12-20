var BGMAP = (function (me, $, Drupal, undefined) {
    var sid_list;
    var trace_anim;
    var custom_color;
    var map2;
    var traceGeoJsonLayer;
    var playbackControl;
    var playback;
    var basepath;
    //
    me.requestTraceData = function requestTraceData(startTime, endTime) {
        //
        resetTraceNControls();
        //
        // Clear the array before getting new values.
        console.log('Trace: Ajax call: ', startTime, endTime);
        var postData = {};
        postData['reqtype'] = 'trc';
        var filter = {};
        console.log(sid_list);
        // Only one element expected in the list.
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
                if (trace_anim) {
                    traceGeoJsonLayer.snakeIn();
                }
                if (jsonData.features.length > 0) {
                    var playBackData = jsonData.features[0];
                    playBackData.geometry.type = "MultiPoint";
                    var color = playBackData.properties["line-color"];
                    console.log('Mod JSON for Playback=', playBackData, color);
                    // Initialize playback
                    if($('#trc_play').hasClass('disabled')) {
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
                    // TODO: check this, overwrite plaback?
                    playback = new L.Playback(map2, playBackData, null, playbackOptions);
                    // TODO: Provide external control for speed.
                    playback.setSpeed(100);
                    // TODO: check this, overwrite playbackControl?
                    playbackControl = new L.Playback.Control(playback);
                    playbackControl.addTo(map2);
                    playbackControl.setup();
                }
                // Initialize custom control
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
    }
    var resetTraceNControls = function () {
        if ((traceGeoJsonLayer != undefined) && (traceGeoJsonLayer != null)) {
            map2.removeLayer(traceGeoJsonLayer);
        }
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

    function init(context, settings) {
        //
        // TODO: check this.
        sid_list = Drupal.settings.trace.sid_list;
        trace_anim = Drupal.settings.trace.trace_anim;
        custom_color = Drupal.settings.trace.color;
        //var data = Drupal.settings.bgchart.data.data;
        console.log('Retrieving (trace) settings. trace_anim=', trace_anim);
        basepath = Drupal.settings.basePath;
        //
        var title2 = 'GPS Trace on Map';
        $("#block-bgmap-trace").height(600);
        $("#trace_map").height(400);
        //
        var start = moment().subtract(1, 'days');
        var end = moment();
        var startTime = start.valueOf();
        var endTime = end.valueOf();
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
        map2 = new L.map('trace_map', {
            //fullscreenControl: true,
            fullscreenControl: {
                pseudoFullscreen: false
            }
        });

        // Default home location.
        var lat = 1.421, lng = 103.829;
        //center: [51.505, -0.09], zoom: 13
        map2.setView([lat, lng], 13);
        L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map2);

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

        //L.control.calendar(this).addTo(map);
        calControl = new L.Control.Calendar();
        calControl.addTo(map2);
        calControl.setup();

        $('#trc_play').addClass('disabled');

        //
        // http://leafletjs.com/examples/geojson.html

        // Restart trace on button press.
        $('#trc_restart').click(function () {
            traceGeoJsonLayer.snakeIn();
        });

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

        me.requestTraceData(startTime, endTime);
    }

    Drupal.behaviors.bgmap2 = {
        attach: function (context, settings) {
            console.log('JS attach, initialization.');
            // If trace array is set, happens inside trace block.
            if (Drupal.settings.trace) {
                //
                //var playback = null;
                init(context, settings);
            } // if settings, trace.
        } // attach
    } // behaviors, bgmap
    
    return me;
})
(BGMAP || {}, jQuery, Drupal);

