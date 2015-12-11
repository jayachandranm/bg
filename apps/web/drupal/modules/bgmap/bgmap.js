(function ($) {
  Drupal.behaviors.bgmap = {
    attach: function(context, settings) {
      console.log('JS attach, initialization.');
      if (Drupal.settings.bgmap)  {
        // No context parameters are required.
        //var sid = Drupal.settings.bgmap.sid;
        //var data = Drupal.settings.bgchart.data.data;
        var basepath = Drupal.settings.basePath;
        console.log('Retrieving settings.');
        //
        var title = 'Real Time Map';
        // Place a div name correcly.
        $("#block-bgmap-bgmap").append("<div id='show_report'>Map will display here.....</div>");
        $("#block-bgmap-bgmap").height(500);
        $("#show_report").height(400);

        //data_url = basepath + '?q=bgchart/get/' + sid;
        data_url = basepath + '?q=bgchart/get/' + 'car';
        var lng = 1.421, lat = 103.829;
        //center: [51.505, -0.09], zoom: 13
        var map = L.map('show_report').setView([lng, lat], 13);

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

       /*
        * Real time updates.
        */
        var requestData = (function() {
          console.log('Ajax call.');
          data_url = basepath + '?q=bgmap/get/' + 'car';
          $.ajax({
            url: data_url,
            success: function(jsonData) {
              //console.log('Received JSON=', jsonData);
              for(var i=0; i<jsonData.length; i++) {
                var newlg = jsonData[i].lg;
                var newlt = jsonData[i].lt;
                var nid = jsonData[i].nid;
                var vnum = jsonData[i].vnum;
                var mymarker;
                console.log(newlg, newlt, nid, vnum);
                if(!(vnum in markerList)) {
                  console.log('marker not found in the list.');
                  mymarker = L.marker([newlg, newlt], {icon: carIcon_r}).addTo(map);
                  markerList[vnum] =  mymarker;
                } else {
                  console.log('marker found, update.');
                  mymarker = markerList[vnum];
                  //markers[i].setLatLng([newlg, newlt]);
                  mymarker.setLatLng([newlg, newlt]);
                }
                var nodeurl = basepath + '?q=node/' + nid;
                var popContent = "<a href=" + nodeurl + ">" + vnum +"</a>";
                mymarker.bindPopup(popContent);
              }
            },
            complete: function() {
              setTimeout(requestData, 2000);
            },
            //error: function(xhr, status, error) {
            error: function() {
              alert('Error loading ');
            }
          }); // ajax
        }); // requestData

        requestData();
      } // attach
    } // behaviors
  }
})(jQuery);
