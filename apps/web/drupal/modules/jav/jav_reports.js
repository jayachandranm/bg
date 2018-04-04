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
        //'copy', 'csv', 'excel', 'pdf', 'print'
        var myTable = $('#reports-table').DataTable({
            dom: 'Bfrtip',
            stateSave: true,
            buttons: [
                'pdf', 'excel', 'print'
            ]
        });
        yadcf.init(myTable, [
    { column_number : 0,
      filter_container_id: 'external_filter_container_0'
    },
    { 
        column_number : 1,
        filter_container_id: 'external_filter_container_1',
        filter_type: "auto_complete",
        text_data_delimiter: ","
    },
    {
        column_number : 2, 
        filter_container_id: 'external_filter_container_2',
        filter_type: 'range_date',
        datepicker_type: 'bootstrap-datetimepicker',
        //date_format: 'YYYY-MM-DD',
        date_format: 'DD-MM-YYYY',
        filter_plugin_options: datepickerDefaults
    },
    {
        column_number : 4,
        filter_container_id: 'external_filter_container_3'
    },
    {
        column_number : 5,
        filter_container_id: 'external_filter_container_4'
    }],
    //{ externally_triggered: true} 
    );
});
})(jQuery);

