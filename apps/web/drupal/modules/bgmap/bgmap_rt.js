(function ($) {
    Drupal.behaviors.bgmap1 = {
        attach: function (context, settings) {
            console.log('JS attach for RT, initialization.');
            // TODO: Where is the most appropriate place for this code?
            // Depends on Drupal behaviors.
            $(document).ready(function() {
                $('#tbl-dashboard-view').DataTable({
                    "lengthChange": false
                });
            });
            //
            if (Drupal.settings.rt) {
                // No context parameters are required.
                var sid2vehmap = {};
                var veh_list = Drupal.settings.rt.veh_list;
                sid2vehmap = veh_list;
                var num_veh = veh_list.length;
                var sid_list = [];
                // ECMAScript 5 and later.
                sid_list = Object.keys(sid2vehmap);
                // For older versions of JS.
                /* 
                 for(var k in sid2vehmap) {
                 sid_list.push(k);
                 }
                 */
                //var data = Drupal.settings.bgchart.data.data;
                var basepath = Drupal.settings.basePath;
                console.log('Retrieving bgmap settings.');
                //
                // TODO: Do this in a theme.
                $("#block-bgmap-rtsingle").height(500);
                $("#rt_map").height(400);

                /***  little hack starts here ***/
                /* TODO: Changed in leaflet 1.0
                 L.Map = L.Map.extend({
                 openPopup: function(popup) {
                 //        this.closePopup();  // just comment this
                 this._popup = popup;

                 return this.addLayer(popup).fire('popupopen', {
                 popup: this._popup
                 });
                 }
                 });
                 */
                /***  end of hack ***/

                var map = new L.map('rt_map', {
                    fullscreenControl: true,
/*
                    fullscreenControlOptions: {
                        position: 'topleft'
                    }
*/
                });
                // Default home location.
                var lat = 1.421, lng = 103.829;
                //center: [51.505, -0.09], zoom: 13
                map.setView([lat, lng], 14);
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
                    //var sid = veh_list.sid;
                    filter['sidList'] = sid_list;
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
                            console.log('Received JSON for All Veh=', jsonData);
                            //console.log('Received JSON for RT Single=', JSON.stringify(jsonData));
                            //rtGeoJsonLayer = L.geoJson().addTo(map);
                            var pop;
                            rtGeoJsonLayer = L.geoJson(jsonData, {
                                pointToLayer: function (feature, latlng) {
                                    map.panTo(latlng);
                                    //layer.bindPopup(feature.properties.title);
                                    //return L.circleMarker(latlng, {
                                    var sid = feature.properties.title;
                                    var custom_color = sid2vehmap[sid].color;
                                    var options = {  
                                        icon: 'bus',  
                                        borderColor: custom_color, textColor: custom_color
                                    };
                                    //var options = {};
                                    return L.marker(latlng, {
                                        // Will be overwritten by style function below.
                                        icon: L.BeautifyIcon.icon(options),
                                        //radius: 10,
                                    });
                                },
                                style: function (feature) {
                                    //console.log(feature.properties.style);
                                    var style_rcvd = feature.properties.style;
                                    var sid = feature.properties.title;
                                    var custom_color = sid2vehmap[sid].color;
                                    style_rcvd.fillColor = custom_color;
                                    //console.log('New Style', style_rcvd);
                                    return style_rcvd;
                                    //return feature.properties.style;
                                    //return {fillColor: "blue", color: "blue", fillOpacity: 0.5};
                                },
                                onEachFeature: function (feature, layer) {
                                    // TODO: Check this condition.
                                    if (feature.properties && feature.properties.title) {
                                        var sid = feature.properties.title;
                                        var nid = sid2vehmap[sid].nid;
                                        var vnum = sid2vehmap[sid].vnum;
                                        var nodeurl = basepath + '?q=node/' + nid;
                                        var popContent = "<a href=" + nodeurl + ">" + vnum + "</a>";
                                        var popup = L.popup({
                                            closeButton: false,
                                            autoClose: false
                                            // className: 'popup'
                                        }).setContent(popContent);
                                        // TODO: have to be array of pops.
                                        pop = layer.bindPopup(popup);
                                        //pop = layer.bindPopup(popContent); //.openPopup();
                                        //layer.bindPopup(popContent).openOn(map);
                                        //map.addLayer(popContent);
                                    }
                                }
                            });
                            //rtGeoJsonLayer.addData(jsonData);
                            // TODO: if valid.
                            rtGeoJsonLayer.addTo(map);
                            // popup need map reference. Open only after adding the layer to map
                            // TODO: if valid. Enable multiple pops.
                            //pop.openPopup();
                            map.fitBounds(rtGeoJsonLayer.getBounds());
                            rtGeoJsonLayer.eachLayer(function(layer) {
                                layer.openPopup();
                                //var popUp = layer._popup;
                                // process popUp, maybe with popUp.setContent("something");
                                //popUp.openPopup();
                            });
                        },
                        complete: function () {
                            console.log('Ajax processing complete, call again after delay');
                            setTimeout(requestCurrentLoc, 20000);
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

