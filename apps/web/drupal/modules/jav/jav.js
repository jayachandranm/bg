(function ($) {

    $(document).ready(function () {
        'use strict';
        $.fn.dataTable.moment('D-MMM-YY HH:mm');
        var datepickerDefaults = {
            showTodayButton: true,
            showClear: true
        };
        var sort_table = $('#sort-table').DataTable({
            "dom": 'Bfrtip',
            columnDefs: [{
                orderable: false,
                className: 'select-checkbox',
                targets: 0
            }],
            //select: true,
            select: {
                style: 'os',
                selector: 'td:first-child'
            },
            buttons: [
                {
                    extend: 'selected',
                    text: 'Clear Alert',
                    key: 'c',
                    action: function (e, dt, node, config) {
                        var rows = dt.rows({ selected: true }).count();
                        var rowvals = dt.rows({ selected: true }).data();
                        console.log(rowvals);
                        var withRemark = $('#remark_check').is(":checked");
                        if (withRemark) {
                            bootbox.prompt(
                                {
                                    size: "small",
                                    title: "Enter remarks.",
                                    inputType: "textarea",
                                    callback: function (result) {
                                        console.log(result);
                                        if (result) {
                                            dt.row('.selected').remove().draw(false);
                                            updateServer(rowvals[0]);
                                        }
                                    }
                                });
                        }
                        else {
                            dt.row('.selected').remove().draw(false);
                            updateServer(rowvals[0]);
                        }

                        //alert( 'There are '+rows+'(s) selected in the table' );
                    }
                }
            ],
            /*
                buttons: [
                    'copy', 'excel', 'pdf'
                ],
            */
            order: [[1, "desc"]],
        }); // sort_table.
        //sort_table.buttons().container().appendTo( '#clear_button' );
        var data = sort_table.rows().data();
        console.log('The table has ' + data.length + ' records');
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
    }); // documentReady

    function updateServer(row) {
        var basepath = 'http://13.250.193.153/jav/';
        var post_url = basepath + '?q=jav/update/event';
        var postData = {};
        postData['ts'] = moment().valueOf();
        postData['lift_id'] = '99';
        postData['msg_type'] = 'event_clear';
        postData['sensor_group'] = 'manual';
        postData['event'] = row[5];
        var jsonPost = JSON.stringify(postData);
        console.log(jsonPost);
        $.ajax({
            url: post_url,
            type: 'POST',
            dataType: 'json',
            //data: jsonPost,
            data: { jsonPost: jsonPost },
            success: function (jsonData) {
                console.log('Received JSON for Ajax =', jsonData);
            },
            complete: function () {
                console.log('Ajax processing complete, call again after delay');
                //setTimeout(requestCurrent, 15000);
            },
            error: function (xhr, status, error) {
                //error: function () {
                //alert('Error loading ');
                console.log('Error: Ajax response', xhr, status, error);
            }
        }); // ajax
    }

})(jQuery);

