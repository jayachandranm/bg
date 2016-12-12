(function ($) {
    Drupal.behaviors.bgmap3 = {
        attach: function (context, settings) {
            // If trace array is set, happens inside trace block.
            if (Drupal.settings.trace) {
                console.log('JS attach, trace_control.');
                var isSliding = false;
                L.Playback = L.Playback || {};
                L.Playback.Control = L.Control.extend({

  _html: 
//'<div style="width:500px; background-color:darkslategray";>' +
'<input type="text" id="example_id" name="example_name" value="" />' ,
//'</div>',


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
        position : 'horizcenterbottom'
        //position : 'bottomright'
//map2.zoomControl.setPosition('horizcenterbottom');
    },

  initialize: function(playback) {
    this.playback = playback;
    playback.addCallback(this._clockCallback);
  },

  onAdd: function(map) {
    var controlDiv = L.DomUtil.create('div', 'tr-slider');
/*
    this._slider = L.DomUtil.create('input', 'example_id', controlDiv);
    this._slider.type = 'text';
    this._slider.id = 'example_id';
    this._slider.name = 'example_name';
    this._slider.value = '';
*/
    //_slider = this._html;
    controlDiv.innerHTML = this._html;
    //$("#example_id").ionRangeSlider();
    //$('#trace_map').after(html);
    //var stop = L.DomEvent.stopPropagation;
    L.DomEvent.disableClickPropagation(controlDiv);
    this._setup();

/*
        L.DomEvent
        .on(this._slider, 'click', stop)
        .on(this._slider, 'mousedown', stop)
        .on(this._slider, 'dblclick', stop)
        .on(this._slider, 'click', L.DomEvent.preventDefault)
        //.on(this._slider, 'mousemove', L.DomEvent.preventDefault)
        .on(this._slider, 'change', onSliderChange, this)
        .on(this._slider, 'mousemove', onSliderChange, this);           

        function onSliderChange(e) {
            //var val = Number(e.target.value);
            //playback.setCursor(val);
        }
*/

    // just an empty container
    // TODO: dont do this
    //return L.DomUtil.create('div');
    return controlDiv;
  },


_setup: function() {
    var self = this;
    var playback = this.playback;
    //playback.addCallback(this._clockCallback);

    var minVal = playback.getStartTime();
    var maxVal = playback.getEndTime();
    var stepLen = playback.getTickLen();
    var currVal = playback.getTime();
    
    var st = moment(minVal).format("X"); 
    var ed = moment(maxVal).format("X"); 
    var trSlider = $("#example_id").ionRangeSlider({
    min: st,
    max: ed,
    from: currVal,
    type: 'single',
    grid: true,
    keyboard: true,
    //grid_num: 10,
    prettify: function (num) {
        return moment(num, "X").format("lll");
    },
    onUpdate: function (data) {
        //console.log("onUpdate", data);
    },
    onChange: function (data) {
        //console.log("onChange", data.from);
        isSliding = true;
        playback.setCursor(data.from * 1000);
    },
});
},
 
_clockCallback: function(ms) {
    //$('#cursor-date').html(L.Playback.Util.DateStr(ms));
    //$('#cursor-time').html(L.Playback.Util.TimeStr(ms));
    //$('#time-slider').slider('value', ms);
    var slider = $("#example_id").data("ionRangeSlider");
    var val = moment(ms).format("X"); 
    //console.log("Callback, playback moved:", ms);
    if(!isSliding) {
      //console.log("Not due to slider, but play button press:");
slider.update({
    from: val,
});
}
  isSliding = false;
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

