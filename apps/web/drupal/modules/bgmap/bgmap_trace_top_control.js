(function ($) {
    Drupal.behaviors.bgmap4 = {
        attach: function (context, settings) {
            // If trace array is set, happens inside trace block.
            if (Drupal.settings.trace) {
                console.log('JS attach, trace_top_control.');
                L.Control.Calendar = L.Control.extend({

                    _html: //'<div class="row">' +
                    '    <div class="col-md-6 tr-cal">' +
                    '        <div class="form-group has-feedback">' +
                    '        <div class="input-group">' +
                    '            <span class="input-group-btn">' +
                    '                <button id="trc_restart" type="button" class="btn btn-default">' +
                    '                    <span class="glyphicon glyphicon-repeat" aria-hidden="true"></span>' +
                    '                </button> ' +
                    '            </span> ' +
                    '            <span class="input-group-btn">' +
                    '                <button type="button" id="trc_play" class="btn btn-default">' +
                    '                    <span id="trc_play_icon" class="glyphicon glyphicon-play" aria-hidden="true"></span>' +
                    '                </button> ' +
                    '            </span> ' +
                    '            <input class="form-control" class="pull-left" type="text" name="daterange"' +
                    '                   value="01/01/2015 1:30 PM - 01/01/2015 2:00 PM">' +
                    '        </div> <!-- input-group -->' +
                    '        <span class="form-control-feedback glyphicon glyphicon-calendar"></span>' +
                    '        </div> <!-- form-group -->' +
                    '    </div>',
//'</div>' ,

                    options: {
                        position: 'horizcentertop'
                    },

                    initialize: function () {
                        //this._callback = callback;
                        //playback.addCallback(this._clockCallback);
                    },

                    onAdd: function (map) {
                        var controlDiv = L.DomUtil.create('div', 'row');
                        //var controlDiv = L.DomUtil.create('div', 'col-md-6');
                        controlDiv.innerHTML = this._html;
                        //var stop = L.DomEvent.stopPropagation;
                        L.DomEvent.disableClickPropagation(controlDiv);
                        //this.setup();

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

                    onRemove: function (map) {
                    },


                    setup: function () {
                        //var self = this;
                        var start = moment().subtract(1, 'days');
                        var end = moment();
                        startTime = start.valueOf();
                        endTime = end.valueOf();
                        //
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
                                BGMAP.requestTraceData(startTime, endTime);
                            }
                        );
                    },

                });

                L.control.calendar = function () {
                    return new L.Control.Calendar();
                }

            } // if settings, trace.
        } // attach
    } // behaviors, bgmap
})
(jQuery);

