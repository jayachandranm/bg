(function ($) {

    $(document).ready(function () {
        'use strict';
        $.fn.dataTable.moment('D-MMM-YY HH:mm');
        var datepickerDefaults = {
            showTodayButton: true,
            showClear: true
        };
        $('#tbl-dashboard-view').DataTable({
            "order": [[0, "desc"]]
        });
        $('#list-events-table').DataTable({
            "order": [[0, "desc"]]
        });
        $('#sensor-status-table').DataTable({
            "order": [[0, "desc"]]
        });
        //$('#status-12345AB').html("Fiber err.");
        //$('#ack-12345AB').html("Test");
        $(".ack").click(function (event) {
            //alert( "Handler for .click() called." );
            console.log($(this).data('id'));
            console.log(event.target.id);
            $("#" + event.target.id).addClass("disabled");
            //alert(event.target.id);
        });
    }); // documentReady

})(jQuery);

