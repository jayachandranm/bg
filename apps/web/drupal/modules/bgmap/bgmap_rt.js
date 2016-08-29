(function ($) {
    Drupal.behaviors.bgmap = {
        attach: function (context, settings) {
            console.log('JS attach, initialization.');
            if (Drupal.settings.rt) {
                // No context parameters are required.
                var sid = Drupal.settings.rt.sid;
                //var data = Drupal.settings.bgchart.data.data;
                var basepath = Drupal.settings.basePath;
                console.log('Retrieving bgmap settings.');
                //
                var title = 'Real Time Map';
                // Place a div name correcly.
                //$("#block-bgmap-rtsingle").append("<div id='show_report'>Map will display here.....</div>");
                $("#block-bgmap-rtsingle").height(500);
                $("#show_report").height(400);

                var lat = 1.421, lng = 103.829;
                //center: [51.505, -0.09], zoom: 13
                var map = L.map('show_report').setView([lat, lng], 13);
                var rtGeoJsonLayer = L.geoJson().addTo(map);

                L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
                    attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                }).addTo(map);

                // http://leafletjs.com/examples/geojson.html
                // add a marker in the given location, attach some popup content to it and open the popup
                var markerList = {};
                //var markers = new Array();

                var carIcon_b = L.icon({
                    iconUrl: 'sites/default/files/car_blue.png',
                    //shadowUrl: 'sites/default/car.png',

                    iconSize: [32, 37], // size of the icon
                    //shadowSize:   [50, 64], // size of the shadow
                    // point of the icon which will correspond to marker's location
                    // Fix: http://gis.stackexchange.com/questions/179734/leaflet-customer-marker-changes-position-with-scale
                    //iconAnchor: [22, 94],
                    shadowAnchor: [4, 62],  // the same for the shadow
                    popupAnchor: [-3, -76] // point from which the popup should open relative to the iconAnchor
                });

                var carIcon_r = L.icon({
                    iconUrl: 'sites/default/files/car_red.png',
                    //shadowUrl: 'sites/default/car.png',

                    iconSize: [32, 37],
                    //shadowSize:   [50, 64],
                    // Fix: http://gis.stackexchange.com/questions/179734/leaflet-customer-marker-changes-position-with-scale
                    //iconAnchor: [22, 94],
                    shadowAnchor: [4, 62],
                    popupAnchor: [-3, -76]
                });

                /*
                 * Real time updates.
                 */
                var requestCurrentLoc = (function () {
                    console.log('RT: Ajax call.');
                    //post_url = basepath + '?q=bgmap/geoj/' + 'rt';
                    post_url = basepath + '?q=bgmap/geoj';
                    var postData = {};
                    postData['reqtype'] = 'rt';
                    var filter = {};
                    filter['sidList'] = [sid];
                    filter['start'] = -1;
                    filter['end'] = -1; // or current time.
                    postData['filter'] = filter;
                    jsonPost = JSON.stringify(postData);
                    console.log(jsonPost);
                    map.removeLayer(rtGeoJsonLayer);
                    $.ajax({
                        url: post_url,
                        type: 'POST',
                        dataType: 'json',
                        //data: jsonPost,
                        data: {jsonPost: jsonPost},
                        success: function (jsonData) {
                            //console.log('Received JSON for All Veh=', jsonData);
                            console.log('Received JSON for RT Single=', JSON.stringify(jsonData));
                            //rtGeoJsonLayer = L.geoJson().addTo(map);
                            rtGeoJsonLayer = L.geoJson(jsonData, {
                                pointToLayer: function (feature, latlng) {
                                    map.panTo(latlng);
                                    return L.circleMarker(latlng, {
                                        radius: 8,
                                        fillColor: "#ff7800",
                                        color: "#000",
                                        weight: 1,
                                        opacity: 1,
                                        fillOpacity: 0.8
                                    });
                                },
                                style: function (feature) {
                                    return feature.properties.style;
                                },
                                onEachFeature: function (feature, layer) {
                                    layer.bindPopup(feature.properties.title);
                                }
                            });
                            //rtGeoJsonLayer.addData(jsonData);
                            rtGeoJsonLayer.addTo(map);
                            /*
                             for (var i = 0; i < jsonData.length; i++) {
                             var newlt = jsonData[i].lt;
                             var newlg = jsonData[i].lg;
                             var nid = jsonData[i].nid;
                             var vnum = jsonData[i].vnum;
                             var mymarker;
                             var currLtLng = L.latLng(newlt, newlg);
                             //console.log(newlg, newlt, nid, vnum);
                             if (nid == -1) {
                             // delete the entry corresponding to this vnum, that page does not exist.
                             // TODO:
                             }
                             if (!(vnum in markerList)) {
                             console.log('marker not found in the list.');
                             //mymarker = L.marker([newlg, newlt], {icon: carIcon_r}).addTo(map);
                             //mymarker = L.marker(currLtLng, { icon: carIcon_r }).addTo(map);
                             mymarker = L.marker(currLtLng).addTo(map);
                             markerList[vnum] = mymarker;
                             } else {
                             console.log('marker found, update, lt first.', newlt, newlg);
                             mymarker = markerList[vnum];
                             //markers[i].setLatLng([newlg, newlt]);
                             //mymarker.setLatLng([newlg, newlt]);
                             mymarker.setLatLng(currLtLng);
                             //var bounds = L.latLngBounds(southWest, northEast);
                             //map.fitBounds(bounds);
                             //map.fitBounds([[1,1],[2,2],[3,3]]);
                             map.panTo(currLtLng);
                             }
                             var nodeurl = basepath + '?q=node/' + nid;
                             var popContent = "<a href=" + nodeurl + ">" + vnum + "</a>";
                             mymarker.bindPopup(popContent);
                             }
                             */
                        },
                        complete: function () {
                            console.log('Ajax processing complete, call again after delay');
                            setTimeout(requestCurrentLoc, 5000);
                        },
                        error: function (xhr, status, error) {
                            //error: function () {
                            //alert('Error loading ');
                            console.log('Error: Ajax response', xhr, status, error);
                        }
                    }); // ajax
                }); // requestData
                requestCurrentLoc();
            } // if settings, bgmap
        } // attach
    } // behaviors, bgmap
})(jQuery);
