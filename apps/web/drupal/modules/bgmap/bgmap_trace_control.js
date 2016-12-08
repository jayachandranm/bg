(function ($) {
    Drupal.behaviors.bgmap3 = {
        attach: function (context, settings) {
            console.log('JS attach, trace_control.');
            // If trace array is set, happens inside trace block.
            if (Drupal.settings.trace) {
                L.Playback = L.Playback || {};
                L.Playback.SliderControl = L.Control.extend({

_html2:
'  <div>' +
'            <input type="text" id="example_id" name="example_name" value="">' +
'            </input>' +
'  </div>' ,
    options : {
        position : 'bottomleft'
    },
    initialize : function (playback) {
        this.playback = playback;
    },
    onAdd : function (map) {
        var html = this._html2;
    $('#trace_map').after(html);
        $("#example_id").ionRangeSlider();
        //return html;
    return L.DomUtil.create('div');
    },


                });
                //
/*
                L.Playback.PlayControl = L.Control.extend({
                    _html: 
'<footer>' +
'  <div>' +
'            <span class="input-group-btn">' +
'                <button type="button" class="btn btn-default">' +
'                    <span id="trc_play" class="glyphicon glyphicon-play" aria-hidden="true"></span>'+
'                </button>' +
'            </span>' +
'  </div>' +
'</footer>', 

initialize: function(playback) {
    this.playback = playback;
    playback.addCallback(this._clockCallback);
  },

  onAdd: function(map) {
    var html = this._html;
    $('#trace_map').after(html);
    //this._setup();

    // just an empty container
    // TODO: dont do this
    return L.DomUtil.create('div');
  },

_setup: function() {
    var self = this;
    var playback = this.playback;
    $('#play-pause').click(function() {
      if (playback.isPlaying() === false) {
        playback.start();
        $('#play-pause-icon').removeClass('fa-play');
        $('#play-pause-icon').addClass('fa-pause');
      } else {
        playback.stop();
        $('#play-pause-icon').removeClass('fa-pause');
        $('#play-pause-icon').addClass('fa-play');
      }
    });
  },

_clockCallback: function(ms) {
    //$('#cursor-date').html(L.Playback.Util.DateStr(ms));
    //$('#cursor-time').html(L.Playback.Util.TimeStr(ms));
    //$('#time-slider').slider('value', ms);
  },



                });
*/
/*
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
                var trace_anim = Drupal.settings.trace.trace_anim;
                //var data = Drupal.settings.bgchart.data.data;
                console.log('Retrieving (trace) settings. trace_anim=', trace_anim);
                var basepath = Drupal.settings.basePath;
                //
                var start = moment().subtract(1, 'days');
                var end = moment();
                startTime = start.valueOf();
                endTime = end.valueOf();
                //
                $('#trc_play').click( function(){
                    $('#trc_play').toggleClass('glyphicon-play').toggleClass('glyphicon-pause');
                });
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

                // Restart trace on button press.
                $('#trc_restart').click( function(){
                    traceGeoJsonLayer.snakeIn();
                });
*/

            } // if settings, trace.
        } // attach
    } // behaviors, bgmap
})
(jQuery);


