(function ($) {
    Drupal.behaviors.bgmap3 = {
        attach: function (context, settings) {
            // If trace array is set, happens inside trace block.
            if (Drupal.settings.trace) {
                console.log('JS attach, trace_control.');
                L.Playback = L.Playback || {};
                L.Playback.Control = L.Control.extend({

  _html: 

'<div>' +
'Hellllllooooo Therere...' +
'</div>',


/*
'      <div class="navbar-inner">' +
'        <ul class="nav">' +
'          <li class="ctrl">' +
'            <a id="play-pause" href="#"><i id="play-pause-icon" class="fa fa-play fa-lg"></i></a>' +
'          </li>' +
'        </ul>' +
'        <ul class="nav pull-right">' +
'          <li>' +
'            <div id="time-slider"></div>' +
'          </li>' +
'          <li class="ctrl dropup">' +
'            <a id="speed-btn" data-toggle="dropdown" href="#"><i class="fa fa-dashboard fa-lg"></i> <span id="speed-icon-val" class="speed">1</span>x</a>' +
'            <div class="speed-menu dropdown-menu" role="menu" aria-labelledby="speed-btn">' +
'              <label>Playback<br/>Speed</label>' +
'              <input id="speed-input" class="span1 speed" type="text" value="1" />' +
'              <div id="speed-slider"></div>' +
'            </div>' +
'          </li>' +
'        </ul>' +
'      </div>' ,
*/

    options : {
        position : 'bottomleft'
    },

  initialize: function(playback) {
    this.playback = playback;
    //playback.addCallback(this._clockCallback);
  },

  onAdd: function(map) {
    var controlDiv = L.DomUtil.create('div');
    controlDiv.innerHTML = this._html;
    //$('#trace_map').after(html);
    //this._setup();

    // just an empty container
    // TODO: dont do this
    //return L.DomUtil.create('div');
    return controlDiv;
  },



                });

            } // if settings, trace.
        } // attach
    } // behaviors, bgmap
})
(jQuery);

/*
                // Globals, will get updated through datetime picker.
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
                // Restart trace on button press.
                $('#trc_restart').click( function(){
                    traceGeoJsonLayer.snakeIn();
                });
*/

