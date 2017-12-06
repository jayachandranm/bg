var BGMAP = (function (me, $, Drupal, undefined) {
//(function ($) {
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
                    '            <input class="form-control pull-left" type="text" id="daterange" name="daterange"' +
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
                        this._controlDiv = controlDiv;
                        // This option will not stop event propagation from the calendar itself,
                        // but only from the input element. The calendar div is created by JS separately.
                        L.DomEvent.disableClickPropagation(this._controlDiv);
                        //var controlDiv = L.DomUtil.create('div', 'col-md-6');
                        this._controlDiv.innerHTML = this._html;
                        //var stop = L.DomEvent.stopPropagation;
                        //this.setup();

/*
                         L.DomEvent
                         .on(controlDiv, 'click', stop)
                         .on(controlDiv, 'mousedown', stop)
                         .on(controlDiv, 'dblclick', stop)
                         .on(controlDiv, 'click', L.DomEvent.preventDefault)
                         //.on(this._slider, 'mousemove', L.DomEvent.preventDefault)
                         .on(controlDiv, 'change', onSliderChange, this)
                         .on(controlDiv, 'mousemove', onSliderChange, this);
*/

                        return this._controlDiv;
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
                                parentEl: '#trace_map',
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
                                console.log('Apply datetime: ', start.format('x'), end.valueOf(), label);
                                startTime = start.valueOf();
                                endTime = end.valueOf();
                                me.requestTraceData(startTime, endTime);
                            }
                        );
                        //L.DomEvent.disableClickPropagation(this._controlDiv);
                        //L.DomEvent.disableClickPropagation('daterangepicker');
/*
                        $('.daterangepicker').click(function (event) {
                            console.log("Stop event propagation, ", event.type);
                            //var _parent = $('.daterangepicker').parent();
                            //event.preventDefault();
                            event.stopPropagation();
                        });
                        $('.daterangepicker').dblclick(function (event) {
                            //event.preventDefault();
                            if(! event.isPropagationStopped()) {
                                console.log("Stop event propagation, ", event.type);
                                event.stopPropagation();
                            }
                        });
                        $('.daterangepicker').mousedown(function (event) {
                            console.log("Stop event propagation, ", event.type);
                            //event.preventDefault();
                            event.stopPropagation();
                        });
*/
                        //var testDiv = L.DomUtil.get('.daterangepicker');
                        //L.DomEvent.on(this._controlDiv, 'click', L.DomEvent.stopPropagation);

                    },

                });

                L.control.calendar = function () {
                    return new L.Control.Calendar();
                }

            } // if settings, trace.
        } // attach
    } // behaviors, bgmap
    return me;
})
//(jQuery);
(BGMAP || {}, jQuery, Drupal);

