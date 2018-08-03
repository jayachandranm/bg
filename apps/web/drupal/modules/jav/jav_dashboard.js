(function ($) {
    var lMap;
    var liftMap = {};
    var boundsFlag = true;

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
        console.log("Request lift status, ", jsonPost);
        var features = [];
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
                // Clear existing layers.
                lMap.eachLayer(function (layer) {
                    if (layer instanceof L.Marker) {
                        lMap.removeLayer(layer);
                    }
                });

                jsonData.forEach(function (row) {
                    //console.log('Row: ', row);
                    //let layer = lMap._layers[row.lift_id];
                    //let popC = layer.getPopup().getContent();
                    //
                    switch (row.st) {
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
                    features.push(latLng);
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
                    var marker = L.marker(latLng, { icon: myIcon });
                    pop = marker.bindPopup(popup);
                    // Skip healthy markers.
                    if (row.st != 0)
                        marker.addTo(lMap);
                });
                if (features.length != 0) {
                    var bounds = L.latLngBounds(features);
                    //console.log("Fit bounds");
                    if (boundsFlag)
                        lMap.fitBounds(bounds, { padding: [10, 10] }, { noMoveStart: true });
                }
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
        console.log('Request alert count, ', jsonPost);
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


    Drupal.behaviors.jav_dashboard = {
        attach: function (context, settings) {
            console.log('JS attach for Dashboard, initialization.');
            //
            if (settings.jav_dashboard) {
                // No context parameters are required.
                //var lidmap = {};
                console.log('Retrieving jav dashboard settings.');
                /*
                //var lMap = Drupal.settings.leaflet[0].lMap;
                var lMap = settings.leaflet[0].map;
                //var features = settings.leaflet[0].features;
                */
                var dev_list = Drupal.settings.jav_dashboard.dev_list;
                //lidmap = dev_list;
                //var num_dev = dev_list.length;
                Object.keys(dev_list).forEach(function (key, index) {
                    //console.log(this[key]);
                    if (key in liftMap) {
                        liftMap[key].fields = this[key];
                    } else {
                        liftMap[key] = { fields: this[key] };
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
                var basepath = settings.basePath;
                $(document).on('leaflet.map', function (e, map, lMap1) {
                    lMap = lMap1;
                    console.log("Binding handler for leaflet.");
                    //var numLayers = lMap._layers.length;
                    var bounds = lMap.bounds;
                    if(bounds.length > 0) {
                        lMap.fitBounds(bounds, { padding: [10, 10] }, { noMoveStart: true });
                    } 
                    else {
                        // If there are no selected lifts, set a default bound.
                        let lat = 1.340715, lng = 103.740547; // (blk 238)
                        lMap.setView([lat, lng], 12, {noMoveStart: true});
                    }                    
                    //var features = [];
                    lMap.eachLayer(function (layer) {
                        if (layer instanceof L.Marker) {
                            var popContent = layer.getPopup().getContent();
                            console.log(popContent);
                            let liftId = popContent;
                            //features.push(layer);
                            if (!(liftId in liftMap)) {
                                liftMap[liftId] = { latlng: layer.getLatLng() };
                            } else {
                                //
                                liftMap[liftId].latlng = layer.getLatLng();
                            }
                            lMap.removeLayer(layer);
                            //layer._leaflet_id = popContent;
                        }
                    });

                    lMap.on('zoomstart', function (e) {
                        if (e.hard) {
                            // moved by bounds
                            console.log("Moved by bounds.");
                        } else {
                            // moved by drag/keyboard
                            console.log("Zoom start.");
                            boundsFlag = false;
                        }
                    });

                    lMap.on('dragstart', function (e) {
                        if (e.hard) {
                            // moved by bounds
                            console.log("Moved by bounds.");
                        } else {
                            // moved by drag/keyboard
                            console.log("Zoom end.");
                            boundsFlag = false;
                        }
                    });

                    //
                    getLiftStatus(basepath, liftid_list);
                    setInterval(getLiftStatus, 30000, basepath, liftid_list);
                });
                // For the alert label display.
                requestEventCount(basepath);
                setInterval(requestEventCount, 30000, basepath);
            } // if settings, jav
        } // attach
    } // behaviors, jav
})(jQuery);

