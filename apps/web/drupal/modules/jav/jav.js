(function ($) {
    $(document).ready(function() {
        $('#sort-table').DataTable();
        $('#tbl-dashboard-view').DataTable();
        $('#status-12345AB').html("Unhealthy");
                //'copy', 'csv', 'excel', 'pdf', 'print'
        $('#reports-table').DataTable({
            dom: 'Bfrtip',
            buttons: [
                'pdf', 'excel', 'print'
            ]
        });
        //$('#ack-12345AB').html("Test");
    $(".ack").click(function(event) {
        //alert( "Handler for .click() called." );
        console.log($(this).data('id'));
        console.log(event.target.id);
        $("#" + event.target.id).addClass("disabled");
        //alert(event.target.id);
    });
    });
})(jQuery);

