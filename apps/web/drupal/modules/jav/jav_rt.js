(function ($) {
    Drupal.behaviors.jav1 = {
        attach: function (context, settings) {
            console.log('JS attach for RT, initialization.');
            // TODO: Where is the most appropriate place for this code?
            // Depends on Drupal behaviors.
            $(document).ready(function () {
                $('#tbl-dashboard-view').DataTable({
                    "lengthChange": false
                });
            });
            //
            if (Drupal.settings.rt) {
                // No context parameters are required.
                var sid2vehmap = {};
                var dev_list = Drupal.settings.rt.dev_list;
                sid2devmap = dev_list;
                var num_dev = dev_list.length;
                var sid_list = [];
                // ECMAScript 5 and later.
                sid_list = Object.keys(sid2devhmap);
                // For older versions of JS.
                /* 
                 for(var k in sid2devmap) {
                 sid_list.push(k);
                 }
                 */
                //var data = Drupal.settings.bgchart.data.data;
                var basepath = Drupal.settings.basePath;
                console.log('Retrieving jav settings.');
                //
                // TODO: Do this in a theme.
                $("#block-jav-rtsingle").height(500);
                $("#rt_map").height(400);

                /*
                 * Real time updates.
                 */
                var requestCurrentData = (function () {
                }); // requestData
                requestCurrentData();
            } // if settings, jav
        } // attach
    } // behaviors, jav
})(jQuery);

