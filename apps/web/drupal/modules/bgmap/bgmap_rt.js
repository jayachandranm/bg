(function ($) {
    Drupal.behaviors.bgmap = {
        attach: function (context, settings) {
            console.log('JS attach for RT, initialization.');
            if (Drupal.settings.rt) {
                // No context parameters are required.
                var sid_list = Drupal.settings.rt.sid_list;
                //var data = Drupal.settings.bgchart.data.data;
                var basepath = Drupal.settings.basePath;
                console.log('Retrieving bgmap settings.');
                //
                // TODO: Do this in a theme.
                $("#block-bgmap-rtsingle").height(500);
                $("#show_report").height(400);

/***  little hack starts here ***/
L.Map = L.Map.extend({
    openPopup: function(popup) {
        //        this.closePopup();  // just comment this
        this._popup = popup;

        return this.addLayer(popup).fire('popupopen', {
            popup: this._popup
        });
    }
}); 
/***  end of hack ***/

                var map = new L.map('show_report', {
                              fullscreenControl: true,
                              fullscreenControlOptions: {
                                position: 'topleft'
                              }
                           });
                // Default home location.
                var lat = 1.421, lng = 103.829;
                //center: [51.505, -0.09], zoom: 13
                map.setView([lat, lng], 13);
                //
                var rtGeoJsonLayer = L.geoJson().addTo(map);

                L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
                    attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                }).addTo(map);

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
                    console.log(sid_list);
                    var sid = sid_list[0];
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
                            var pop;
                            rtGeoJsonLayer = L.geoJson(jsonData, {
                                pointToLayer: function (feature, latlng) {
                                    map.panTo(latlng);
                                    //layer.bindPopup(feature.properties.title);
                                    return L.circleMarker(latlng, {
                                        // Will be overwritten by style function below.
                                        radius: 10,
                                    });
                                },
                                style: function (feature) {
                                    console.log(feature.properties.style);
                                    return feature.properties.style;
                                    //return {fillColor: "blue", color: "blue", fillOpacity: 0.5};
                                },
                                onEachFeature: function (feature, layer) {
                                    if (feature.properties && feature.properties.title) {
                                        var sid = feature.properties.title;
                                        var nodeurl = basepath + '?q=node/' + sid;
                                        var popContent = "<a href=" + nodeurl + ">" + sid + "</a>";
                                        pop = layer.bindPopup(popContent); //.openPopup();
                                        //layer.bindPopup(popContent).openOn(map);
                                        //map.addLayer(popContent);
                                    }
                                }
                            });
                            //rtGeoJsonLayer.addData(jsonData);
                            rtGeoJsonLayer.addTo(map);
                            // popup need map reference. Open only after adding the layer to map
                            pop.openPopup();
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

/*
var popup = L.popup()
    .setLatLng(latlng)
    .setContent(popContent)
    .openOn(map);
*/
/*
rtGeoJsonLayer.eachLayer(function(layer) {
  var popUp = layer._popup;
  // process popUp, maybe with popUp.setContent("something");
  //popUp.openPopup();
  popUp.setContent("Hello");
});
*/

                            /*
                             //mymarker = L.marker(currLtLng, { icon: carIcon_r }).addTo(map);
                             mymarker = markerList[vnum];
                             mymarker.setLatLng(currLtLng);
                             //var bounds = L.latLngBounds(southWest, northEast);
                             //map.fitBounds(bounds);
                             //map.fitBounds([[1,1],[2,2],[3,3]]);
                             var nodeurl = basepath + '?q=node/' + nid;
                             var popContent = "<a href=" + nodeurl + ">" + vnum + "</a>";
                             mymarker.bindPopup(popContent);
                             */
/*
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
*/
