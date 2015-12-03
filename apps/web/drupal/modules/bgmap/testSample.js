(function($){
Drupal.behaviors.maps = {
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
        L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
          attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
          //attribution: 'Test Overlay'
        }).addTo(map);  

        // turn off scrollWheel zooming
        map.scrollWheelZoom.disable();
        
      }); //$(settings.leaflet).each(function()
    }//attach:function (context, settings)
  };//Drupal.behaviors.maps
})(jQuery);
