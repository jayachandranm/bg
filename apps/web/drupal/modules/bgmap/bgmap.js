(function ($) {
        Drupal.behaviors.bgmap = {
          attach: function(context, settings) {
          console.log('hello');
          if (Drupal.settings.bgmap)  {
          //if (true)  {
            //var data = Drupal.settings.bgchart.data.data;
            //var title = Drupal.settings.bgchart.data.title;
            var basepath = Drupal.settings.basePath;
            var sid = Drupal.settings.bgmap.sid;
            //var chart1;
            console.log('helloi222', sid);
            var title = 'map Real Time';
            // Place a div name correcly.
            $("#block-bgmap-bgmap").append("<div id='show_report'>Graph will display here.....</div>");
            $("#block-bgmap-bgmap").height(500);
            $("#show_report").height(400);
            
           data_url = basepath + '?q=bgchart/get/' + sid;
           // leaflet
           //var map = L.map('show_report').setView([51.505, -0.09], 13);
           var lng = 1.421;//-104.05; // 1.421;
           var lat = 103.829;//48.99; //103.829;
           //center: [51.505, -0.09], zoom: 13
           var map = L.map('show_report').setView([lng, lat], 13);

           L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
            }).addTo(map);

/*
var states = [{
    "type": "Feature",
    "properties": {"party": "Republican"},
    "geometry": {
        "type": "Polygon",
        "coordinates": [[
            [-104.05, 48.99],
            [-97.22,  48.98],
            [-96.58,  45.94],
            [-104.03, 45.94],
            [-104.05, 48.99]
        ]]
    }
}, {
    "type": "Feature",
    "properties": {"party": "Democrat"},
    "geometry": {
        "type": "Polygon",
        "coordinates": [[
            [-109.05, 41.00],
            [-102.06, 40.99],
            [-102.03, 36.99],
            [-109.04, 36.99],
            [-109.05, 41.00]
        ]]
    }
}];

L.geoJson(states, {
    style: function(feature) {
        switch (feature.properties.party) {
            case 'Republican': return {color: "#ff0000"};
            case 'Democrat':   return {color: "#0000ff"};
        }
    }
}).addTo(map);
*/


           // add a marker in the given location, attach some popup content to it and open the popup
           var markers = new Array();

var carIcon_b = L.icon({
    iconUrl: 'sites/default/files/car_blue.png',
    //shadowUrl: 'sites/default/car.png',

    iconSize:     [32, 37], // size of the icon
    //shadowSize:   [50, 64], // size of the shadow
    iconAnchor:   [22, 94], // point of the icon which will correspond to marker's location
    shadowAnchor: [4, 62],  // the same for the shadow
    popupAnchor:  [-3, -76] // point from which the popup should open relative to the iconAnchor
});

var carIcon_r = L.icon({
    iconUrl: 'sites/default/files/car_red.png',
    //shadowUrl: 'sites/default/car.png',

    iconSize:     [32, 37], // size of the icon
    //shadowSize:   [50, 64], // size of the shadow
    iconAnchor:   [22, 94], // point of the icon which will correspond to marker's location
    shadowAnchor: [4, 62],  // the same for the shadow
    popupAnchor:  [-3, -76] // point from which the popup should open relative to the iconAnchor
});

           var sid = 1;
           var nid=2;
           var nodeurl = basepath + '?q=node/' + nid;
	   var popContent = "vId=" + sid + ", <br> veh1.";
           markers[0] = L.marker([lng, lat], {icon: carIcon_b}).addTo(map)
               .bindPopup(popContent);
               //.openPopup();
           sid=2;
	   popContent = "vId=" + sid + ", <br> <a href=" + nodeurl + ">veh2</a>";
           markers[1] = L.marker([lng-0.02, lat+0.02], {icon: carIcon_r}).addTo(map)
               .bindPopup(popContent);
               //.openPopup();

           var requestData = (function() { 
            console.log('helloo3333');
            data_url = basepath + '?q=bgmap/get/' + sid;
            $.ajax({
              url: data_url,
              success: function(jsonData) {
                console.log(jsonData);
                test_rand = Math.random()/100; 
                var newlng = lng + test_rand;
                var newlat = lat + test_rand;
                markers[0].setLatLng([newlng, newlat]);
                test_rand = Math.random()/100; 
                markers[1].setLatLng([newlng-test_rand, newlat+test_rand]);
              },
              complete: function() {
                 //setTimeout(requestData, 2000);
              },
              //error: function(xhr, status, error) {
              error: function() {
                alert('Error loading ');
              }
            }); // ajax

          });

          requestData();

          } // attach
        } // behaviors
    }
})(jQuery);

