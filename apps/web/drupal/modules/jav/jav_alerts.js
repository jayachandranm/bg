(function ($) {
    Drupal.behaviors.jav_alerts = {
        attach: function (context, settings) {
            console.log('JS attach for Alerts, initialization.');
            // TODO: Where is the most appropriate place for this code?
            // Depends on Drupal behaviors.
            //
            function updateServer(baseurl, row, remarks) {
                var basepath = baseurl;
                var post_url = basepath + '?q=jav/update/event';
                var postData = {};
                postData['ts'] = moment().valueOf();
                postData['lift_id'] = row[2];
                postData['msg_type'] = 'event_clear';
                postData['sensor_group'] = 'manual';
                postData['event'] = row[5];
                postData['remarks'] = remarks;
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
        
            //
            if (Drupal.settings.jav_alerts) {
                // No context parameters are required.
                var sidmap = {};
                var dev_list = Drupal.settings.jav_alerts.dev_list;
                sid2devmap = dev_list;
                var num_dev = dev_list.length;
                var sid_list = [];
                // ECMAScript 5 and later.
                //sid_list = Object.keys(sidmap);
                var basepath = Drupal.settings.basePath;
                console.log('Retrieving jav settings.');
                //
                /*
                 * Real time updates.
                 */
                var alerts_table = $('#alerts-table').DataTable({
                    "dom": 'Bfrtip',
                    columnDefs: [{
                        orderable: false,
                        className: 'select-checkbox',
                        targets: 0
                    }],
                    //select: true,
                    select: {
                        style: 'multi',
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
                                                    var remarks = result;
                                                    updateServer(basepath, rowvals[0], remarks);
                                                }
                                            }
                                        });
                                }
                                else {
                                    dt.row('.selected').remove().draw(false);
                                    var remarks = "";
                                    updateServer(basepath, rowvals[0], remarks);
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
                }); // alerts_table.
                //alerts_table.buttons().container().appendTo( '#clear_button' );
                var data = alerts_table.rows().data();
                console.log('The table has ' + data.length + ' records');
                var requestCurrentData = (function () {
                }); // requestData
                requestCurrentData();
            } // if settings, jav
        } // attach
    } // behaviors, jav
})(jQuery);

