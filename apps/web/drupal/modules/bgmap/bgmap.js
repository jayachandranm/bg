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
        $("#block-bgmap-bgmap").append("<div id='show_report'>Map will display here.....</div>");
        $("#block-bgmap-bgmap").height(500);
        $("#show_report").height(400);

        var lat = 1.421, lng = 103.829;
        //center: [51.505, -0.09], zoom: 13
        var map = L.map('show_report').setView([lat, lng], 15);

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
          console.log('Bgmap: Ajax call.');
          post_url = basepath + '?q=bgmap/geoj/' + 'rt';
          var filter = {};
          filter['nidList'] = sid;
          filter['start'] = -1;
          filter['end'] = -1; // or current time.
          jsonFilter = JSON.stringify(filter);
          console.log(jsonFilter);
          $.ajax({
            url: post_url,
            type: 'POST',
            dataType: 'json',
            data: jsonFilter,
            success: function (jsonData) {
              console.log('Received JSON for All Veh=', jsonData);
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
            },
            complete: function () {
              console.log('Ajax processing complete, call again after delay');
              setTimeout(requestCurrentLoc, 2000);
            },
            //error: function(xhr, status, error) {
            error: function () {
              //alert('Error loading ');
              console.log('Error: Ajax response');
            }
          }); // ajax
        }); // requestData
        requestCurrentLoc();
      } // if settings, bgmap
      // If trace array is set, happens inside trace block.
      if (Drupal.settings.trace) {
        // Globals, will get updated through datetime picker.
        var selectedStartDateVal = 0;
        var selectedStartTimeVal = 0;
        //
        var selectedEndDateVal = 0;
        var selectedEndTimeVal = 0;
        //
        // TODO: check this.
        var polylines = new Array();
        var latlngs = new Array();
        var sid = Drupal.settings.trace.sid;
        //var data = Drupal.settings.bgchart.data.data;
        console.log('Retrieving (trace) settings.');
        var basepath = Drupal.settings.basePath;
        //
        var title2 = 'GPS Trace on Map';
        // Place a div name correcly.
        $("#block-bgmap-trace").append("<div class='row'> <input class='form-control' class='pull-left' type='text' name='daterange' value='01/01/2015 1:30 PM - 01/01/2015 2:00 PM'> </div>");
        $("#block-bgmap-trace").append("<div class='row' style='margin-top:1em' id='show_map2'>Map will display here.....</div>");
        $("#block-bgmap-trace").height(600);
        $("#show_map2").height(400);
        //
        var start = moment().subtract(1, 'days');
        var end = moment();
        startTime = start.valueOf();
        endTime = end.valueOf();
        $('input[name="daterange"]').daterangepicker({
          timePicker: true,
          timePickerIncrement: 30,
          locale: {
            format: 'MM/DD/YYYY h:mm A'
          },
          startDate: start,
          endDate: end,
          ranges: {
            'Today': [moment().subtract(3, 'hours'), moment()],
            'Yesterday': [moment().subtract(2, 'days'), moment().subtract(1, 'days')]
          }
        },
        function(start, end, label) {
          console.log('Apply datetime: ', start.format('x'), end.valueOf());
          startTime = start.valueOf();
          endTime = end.valueOf();
          requestTraceData();
        }
      );

      var lat = 1.421, lng = 103.829;
      //center: [51.505, -0.09], zoom: 13
      var map2 = L.map('show_map2').setView([lat, lng], 13);
      var date = new Date();
      // Current time. Will be overwritten by datepicker.
      // Set by start time be default to start of previous day.
      date.setHours(0);
      date.setMinutes(0);
      date.setSeconds(0);
      var startTimeOfDay = date.getTime();
      var endTime = startTimeOfDay;
      // From 2 days back.
      var startTime = endTime - (3600 * 24 * 2 * 1000);
      console.log('Initial start time: ', startTimeOfDay);

      L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(map2);

      // http://leafletjs.com/examples/geojson.html

      /*
      * Real time updates.
      */
      var requestTraceData = (function () {
        if (typeof polylines != "undefined") {
          console.log("CLEAR TRACE.");
          map2.removeLayer(polylines);
        }
        // Clear the array before getting new values.
        latlngs.length = 0;
        console.log('Trace: Ajax call: ', startTime, endTime);
        var filter = {};
        filter['sidList'] = sid;
        filter['start'] = startTime;
        filter['end'] = endTime; // or current time.
        jsonFilter = JSON.stringify(filter);
        console.log(jsonFilter);
        post_url = basepath + '?q=bgmap/getgeoj/' + 'trc';
        /*
                 + sid + '/'
                 + startTime + '/'
                 + endTime;
        */
        $.ajax({
          url: post_url,
          type: 'POST',
          dataType: 'json',
          data: jsonFilter,
          success: function (jsonData) {
            console.log('Received JSON for Trace=', jsonData);
            for (var i = 0; i < jsonData.length; i++) {
              latlngs.push([parseFloat(jsonData[i].lt), parseFloat(jsonData[i].lg)]);
            }
            console.log(latlngs);
            //var test = JSON.stringify(latlngs);
            //var test2 = [[1.46, 103.83], [1.45, 103.82], [1.43, 103.81]];
            //console.log(test);
            polylines = L.polyline(latlngs, { color: 'blue' });
            polylines.addTo(map2);
            //map2.fitBounds(latlngs);
            //var polygon = L.polygon().addTo(map);
          },
          complete: function () {
            //setTimeout(requestTraceData, 2000);
          },
          //error: function(xhr, status, error) {
          error: function () {
            alert('Error loading ');
          }
        }); // ajax
      }); // requestTraceData

      requestTraceData();
    } // if settings, trace.
  } // attach
} // behaviors, bgmap
})(jQuery);
