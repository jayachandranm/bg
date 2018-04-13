(function ($) {

/* Custom filtering function which will search data in column four between two values */
$.fn.dataTable.ext.search.push(
    function( settings, data, dataIndex ) {
        var min = parseInt( $('#min').val(), 10 );
        var max = parseInt( $('#max').val(), 10 );
        var age = parseFloat( data[3] ) || 0; // use data for the age column
 
        if ( ( isNaN( min ) && isNaN( max ) ) ||
             ( isNaN( min ) && age <= max ) ||
             ( min <= age   && isNaN( max ) ) ||
             ( min <= age   && age <= max ) )
        {
            return true;
        }
        return false;
    }
);

    $(document).ready(function() {
        'use strict';
        var datepickerDefaults = {
		showTodayButton: true,
		showClear: true
	};
        $('#sort-table').DataTable();
        $('#tbl-dashboard-view').DataTable();
        $('#status-12345AB').html("Unhealthy");
/*
       .yadcf([{
            column_number: 0,
            select_type: 'chosen'
        });
*/
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

