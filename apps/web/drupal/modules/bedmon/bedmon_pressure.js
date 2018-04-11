(function ($) {
  Drupal.behaviors.bedmon3 = {
    attach: function(context, settings) {
      console.log('Drupal attach, bedmon, pressure.');
      if (Drupal.settings.rt_pp)  {
        //
        var PMAX = 100;
        var pLevel = {};
        pLevel[0] = 0;
        pLevel[1] = 0;
        pLevel[2] = 0;
        pLevel[3] = 0;
        pLevel[4] = 0;
        pLevel[5] = 0;
	pLevel[6] = 0;
        //
        var basepath = Drupal.settings.basePath;
        var uid = Drupal.settings.rt_pp.uid;
        console.log('User ID from PHP=', uid);
        // Place a div name correcly.
        //$("#block-bedmon-bedmon3").append(pressure_grid);
        //$("#block-bedmon-bedmon").append("<p></p>");


        //var data = Drupal.settings.bedmon.data.data;
        //var title = Drupal.settings.bedmon.data.title;
        var title = 'Real Time values';
        // Place a div name correcly.

        // Make a request to server only if there are elements to display on screen.
        if(uid != -1) {
          var getPressure = (function() {
            console.log('bedmon, getPressure.');
            data_url = basepath + '?q=bedmon/getpp/' + uid;
            $.ajax({
                url: data_url,
                success: function(jsonData) {
                  console.log('data received from server: ', jsonData);
                  if(jsonData != null ) {
                    updateHtml(jsonData);
                  }
                },
                complete: function() {
                   console.log('complete, request again.');
                   setTimeout(getPressure, 2000);
                },
                beforeSend: function() {
                  // TODO:
                  console.log('Before ajax request.');
                  /*
                  $(document).ready(function () {
                    $(#status).attr("innerHTML","Loading....");
                  });
                  */
                },
                //error: function(xhr, status, error) {
                error: function() {
                  console.log('Error in ajax reply.');
                  //alert('Error loading ');
                }
            }); // ajax
          });
          // invoke first time.
          getPressure();
        }

        //
        function updateHtml(data) {
          for (var i in data) {
            var idx = 1 + eval(i); // i starts with 0.
            pLevel[i] = eval(data[i]);
            //var pRange = Math.ceil(pLevel[i]/PMAX);
            var pRange = Math.ceil(pLevel[i]/2);
            if(pRange > 5) { pRange =5; }
            var lBoxClass = "location-box";
            var lBoxDivId = "pp" + "l" + idx;
            // Modify the default class.
            lBoxClass = "col-xs-1 location-box-l" + pRange;
            var colnum= idx+1;
            /*
            // Map 1D array to 2D grid.
            if (i < 3) {
              lBoxDivId = "l" + "1" + colnum;
            } else {
              lBoxDivId = "l" + "2" + (idx -2);
            }
            */
            document.getElementById(lBoxDivId).className = lBoxClass;
          } // for each bed.
        } // updateHtml.
      } // bedmon2.
    } // attach
  } // behaviors
})(jQuery);
