(function ($) {
    var lMap;
    var liftMap = {};
    $(document).bind('leaflet.map', function (e, map, lMap1) {
        lMap = lMap1;
        console.log("Inside leaflet bind");
        let lat = 1.421, lng = 103.829;
        lMap.setView([lat, lng], 14, {noMoveStart: true});
        var markerLayers = lMap._layer;
        var features = [];
        lMap.eachLayer(function(layer) {
            console.log("Found layer 1");
            if(layer instanceof L.Marker) {
                var popContent = layer.getPopup().getContent();
                console.log(popContent);
                let liftId = popContent;
                features.push(layer);
                if(! (liftId in liftMap)) {
                    liftMap[liftId] = {latlng: layer.getLatLng()};
                } else {
                    //
                    liftMap[liftId].latlng = layer.getLatLng();
                }
                lMap.removeLayer(layer);
                //layer._leaflet_id = popContent;
            }
        });
        console.log('hello');
    });

    Drupal.behaviors.jav_dashboard = {
        attach: function (context, settings) {
            console.log('JS attach for Dashboard, initialization.');
            // TODO: Where is the most appropriate place for this code?
            // Depends on Drupal behaviors.
            //
            function requestEventCount(baseurl) {
                var basepath = baseurl;
                var post_url = basepath + '?q=jav/get/eventcount';
                //var postDataList = {};
                //var elems = [];
                    var postData = {};
                    postData['ts'] = moment().valueOf();
                    //postData['msg_type'] = 'event_clear';
                    postData['sensor_group'] = 'manual';
                var jsonPost = JSON.stringify(postData);
                console.log(jsonPost);
                $.ajax({
                    url: post_url,
                    type: 'POST',
                    dataType: 'json',
                    //data: jsonPost,
                    data: { jsonPost: jsonPost },
                    success: function (jsonData) {
                        console.log('Received JSON for Ajax =', jsonData.unack_count);
                        $("#alert-badge").text(jsonData.unack_count);
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

            function getLiftStatus(baseurl, liftid_list) {            
                var basepath = baseurl;
                var post_url = basepath + '?q=jav/get/liftstatus/filtered';
                //var postDataList = {};
                //var elems = [];
                var postData = {};
                postData['liftIds'] = liftid_list;
                //postData['msg_type'] = 'event_clear';
                //postData['sType'] = stype;
                var jsonPost = JSON.stringify(postData);
                console.log(jsonPost);
                $.ajax({
                    url: post_url,
                    type: 'POST',
                    dataType: 'json',
                    //data: jsonPost,
                    data: { jsonPost: jsonPost },
                    success: function (jsonData) {
                        console.log('Received data.', jsonData);
                        var statusMsg = 'Healthy';
                        var iconBgColor = '#3cb521';
                        jsonData.forEach(function(row){
                            console.log('Row: ', row);
                            //let layer = lMap._layers[row.lift_id];
                            //let popC = layer.getPopup().getContent();
                            //
                            //const myCustomColour = '#583470';
                            switch (row.status_code) {
                                case 0:
                                    statusMsg = 'Healthy';
                                    iconBgColor = '#3cb521';
                                    break;
                                case 1:
                                    statusMsg = 'Event';
                                    iconBgColor = '#cd0200';
                                    break;
                                case 2:
                                    statusMsg = 'Error';
                                    iconBgColor = '#b94a48';
                                    break;
                                case 3:
                                    statusMsg = 'Event+Error';
                                    iconBgColor = '#cd0200';
                                    break;
                                case 4:
                                    statusMsg = 'Timeout';
                                    iconBgColor = '#999999';
                                    break;
                                case 5:
                                    statusMsg = 'Maintenance';
                                    iconBgColor = '#666';
                                    break;
                            }

                            const markerHtmlStyles = `
                            background-color: ${iconBgColor};
                            width: 3rem;
                            height: 3rem;
                            display: block;
                            left: -1.5rem;
                            top: -1.5rem;
                            position: relative;
                            border-radius: 3rem 3rem 0;
                            transform: rotate(45deg);
                            border: 1px solid #FFFFFF`;

                            const myIcon = L.divIcon({
                            className: "my-custom-pin",
                            iconAnchor: [0, 24],
                            labelAnchor: [-6, 0],
                            popupAnchor: [0, -36],
                            html: `<span style="${markerHtmlStyles}" />`
                            });
                            //
                            //
                            var latLng = liftMap[row.lift_id].latlng;
                            //console.log(latLng);
                            var fields = liftMap[row.lift_id].fields;
                            let loc = fields.loc;
                            let url = fields.url;
                            var popContent = "<a href=" + url + ">" + row.lift_id + "</a>"
                                    + "<br>" + loc + "<br>" + statusMsg;
                            var popup = L.popup({
                                //closeButton: false,
                                autoClose: false
                                // className: 'popup'
                            }).setContent(popContent);
                            // TODO: have to be array of pops.
                            //
                            var marker = L.marker(latLng, {icon: myIcon});
                            pop = marker.bindPopup(popup);
                            marker.addTo(lMap);
                            
                        });
                    },
                    complete: function () {
                        console.log('Ajax processing complete.');
                    },
                    error: function (xhr, status, error) {
                        //error: function () {
                        //alert('Error loading ');
                        console.log('Error: Ajax response', xhr, status, error);
                    }
                }); // ajax
            }
        
            //
            if (Drupal.settings.jav_dashboard) {
                // No context parameters are required.
                //var lidmap = {};
                console.log('Retrieving jav dashboard settings.');
                var dev_list = Drupal.settings.jav_dashboard.dev_list;
                //lidmap = dev_list;
                //var num_dev = dev_list.length;
                Object.keys(dev_list).forEach(function(key, index) {
                    console.log(this[key]);
                    if(key in liftMap) {
                        liftMap[key].fields = this[key];
                    } else {
                        liftMap[key] = {fields: this[key]};
                    }
                  }, dev_list);
                  /*
                  array.forEach((value, index, self) => {
                    console.log(value, index, self)
                  })
                  */                    
                var liftid_list = [];
                // ECMAScript 5 and later.
                liftid_list = Object.keys(dev_list);
                var basepath = Drupal.settings.basePath;
                //
                /*
                 * Real time updates.
                 */
                //$.fn.dataTable.moment('D-MMM-YY HH:mm');
                //alerts_table.buttons().container().appendTo( '#clear_button' );
                //var data = alerts_table.rows().data();
                //console.log('The table has ' + data.length + ' records');
                var requestCurrentData = (function () {
                }); // requestData
                //requestCurrentData();
                getLiftStatus(basepath, liftid_list);
                requestEventCount(basepath);
            } // if settings, jav
        } // attach
    } // behaviors, jav
})(jQuery);

