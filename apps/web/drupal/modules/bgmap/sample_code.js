(function($){
  //Drupal.behaviors.maps = {
  Drupal.behaviors.bgmap = {
    attach:function (context, settings) {

      // Add legends to each leaflet map instance in Drupal's settings array
      $(settings.leaflet).each(function() {
        // Get the map object from the current iteration
        var map = this.lMap;
        console.log('this.lMap', map);
        // Get the geojson
        var basePath = settings.customSettings.basePath;
        var geoJsonFile = basePath + '/data/geoJASONshort_fixed.geojson';
        $.getJSON(geoJsonFile, function(data) {
          console.log('DATA!!!', data);
          var geojson = L.geoJson(data, {
            style: function (feature) {
              return {color: feature.properties.color};
            },
            onEachFeature: function (feature, layer) {
              //console.log(feature.properties.market);
              layer.bindPopup(feature.properties.market);
            }
          });
          geojson.addTo(map);
        });

        // Footer Copyright
        //L.tileLayer('https://{s}.tile.osm.org/{z}/{x}/{y}.png', {
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          //attribution: '&copy; <a href="https://osm.org/copyright">OpenStreetMap</a> contributors'
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          //attribution: 'Test Overlay'
        }).addTo(map);

        // turn off scrollWheel zooming
        map.scrollWheelZoom.disable();

      }); //$(settings.leaflet).each(function()
    }//attach:function (context, settings)
  };//Drupal.behaviors.maps
})(jQuery);


/*
 var popup = L.popup()
 .setLatLng(latlng)
 .setContent(popContent)
 .openOn(map);
 */
/*
 var options = {
 icon: 'bus',
 borderColor: '#b3334f',
 textColor: '#b3334f'
 };
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

// Place a div name correcly.
//$("#block-bgmap-trace").append("<div class='row'> <input class='form-control' class='pull-left' type='text' name='daterange' value='01/01/2015 1:30 PM - 01/01/2015 2:00 PM'> </div>");
//$("#block-bgmap-trace").append("<div class='row' style='margin-top:1em' id='show_map2'>Map will display here.....</div>");

/*
 for (var i = 0; i < jsonData.length; i++) {
 latlngs.push([parseFloat(jsonData[i].lt), parseFloat(jsonData[i].lg)]);
 }
 console.log(latlngs);
 //var test = JSON.stringify(latlngs);
 //var test2 = [[1.46, 103.83], [1.45, 103.82], [1.43, 103.81]];
 //console.log(test);
 polylines = L.polyline(latlngs, { color: 'blue' });
 polylines.addTo(map2);
 */

/*
 if (typeof polylines != "undefined") {
 console.log("CLEAR TRACE.");
 map2.removeLayer(polylines);
 }
 */
