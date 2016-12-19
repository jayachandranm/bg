(function ($) {
    function Local() {
        /*
         * Real time updates.
         */
        function requestTraceData(sid, startTime, endTime) {
            var _jsonData;
            // Clear the array before getting new values.
            latlngs.length = 0;
            console.log('Trace: Ajax call: ', startTime, endTime);
            var postData = {};
            postData['reqtype'] = 'trc';
            var filter = {};
            console.log(sid_list);
            var sid = sid_list[0];
            filter['sidList'] = [sid];
            filter['start'] = startTime;
            filter['end'] = endTime; // or current time.
            postData['filter'] = filter;
            jsonPost = JSON.stringify(postData);
            //post_url = basepath + '?q=bgmap/geoj/' + 'trc';
            post_url = basepath + '?q=bgmap/geoj';
            //console.log(post_url, jsonPost);
            $.ajax({
                url: post_url,
                type: 'POST',
                dataType: 'json',
                data: {jsonPost: jsonPost},
                //data: {test : 123 },
                success: function (jsonData) {
                    console.log('Received JSON for Trace=', jsonData);
                    //console.log('Received JSON for Trace=', JSON.stringify(jsonData));
                    // Initialize custom control
                    //map2.fitBounds(latlngs);
                    //var polygon = L.polygon().addTo(map);
                    _jsonData = jsonData;
                },
                complete: function () {
                    //setTimeout(requestTraceData, 2000);
                },
                //error: function(xhr, status, error) {
                error: function (xhr, status, error) {
                    console.log("Error in Ajax call", xhr, status, error);
                    //alert('Error loading ');
                }
            }); // ajax
            return _jsonData;
        } // requestTraceData

    } // Local
})
(jQuery);

