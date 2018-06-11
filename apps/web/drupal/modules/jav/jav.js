(function ($) {

    $(document).ready(function () {
        'use strict';
        var datepickerDefaults = {
            showTodayButton: true,
            showClear: true
        };
        $('#sort-table').DataTable({
                "order": [[0, "desc"]]
              });
        $('#tbl-dashboard-view').DataTable({
                "order": [[0, "desc"]]
              });
        $('#status-12345AB').html("Fiber err.");
        /*
               .yadcf([{
                    column_number: 0,
                    select_type: 'chosen'
                });
        */
        //$('#ack-12345AB').html("Test");
        $(".ack").click(function (event) {
            //alert( "Handler for .click() called." );
            console.log($(this).data('id'));
            console.log(event.target.id);
            $("#" + event.target.id).addClass("disabled");
            //alert(event.target.id);
        });
    });
})(jQuery);

