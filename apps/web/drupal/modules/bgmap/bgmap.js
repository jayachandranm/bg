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
            console.log('helloi222');
            var title = 'map Real Time';
            // Place a div name correcly.
            $("#block-bgmap-bgmap").append("<div id='show_report'>Graph will display here.....</div>");
            $("#block-bgmap-bgmap").height(500);
            $("#show_report").height(400);
            
           data_url = basepath + '?q=bgchart/get/' + sid;
           // leaflet
           //var map = L.map('show_report').setView([51.505, -0.09], 13);
           var lng = 1.421;
           var lat = 103.829;
           //center: [51.505, -0.09], zoom: 13
           var map = L.map('show_report').setView([lng, lat], 13);

           L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
            }).addTo(map);

           // add a marker in the given location, attach some popup content to it and open the popup
           var marker1 = L.marker([lng, lat]).addTo(map)
               .bindPopup('A pretty CSS3 popup. <br> Easily customizable.')
               .openPopup();

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
                marker1.setLatLng([newlng, newlat]);
              },
              complete: function() {
                 setTimeout(requestData, 2000);
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

