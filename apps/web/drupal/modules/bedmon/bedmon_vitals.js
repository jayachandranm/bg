(function ($) {
  Drupal.behaviors.bedmon = {
    attach: function(context, settings) {
      console.log('hello from vitals');
      if (Drupal.settings.bedmon2)  {
        //

        /* 
         * Keep toggling the image to create the illusion of movement,
         * while the state is set as moving (by adding class to CSS).
         */
        function toggleImage(bednum) { 
          return function() {
            var occElem2mod = "occ-" + bednum.toString();
            /*
            var imgIds = $('#'+occElem2mod+" img").map(function() {
                              return this.id;
                        }).get();
            */
            var img = $('#'+occElem2mod).find("img").attr("src");
            //console.log("Changing image->", img);
            if(img.indexOf('occupied.png')!=-1) {
              $('#'+occElem2mod+" img").attr('src', 'sites/default/files/moving.png');
            }
            else {
              $('#'+occElem2mod+" img").attr('src', 'sites/default/files/occupied.png');
            }
            if( $('#'+occElem2mod).hasClass("moving")) {
              setTimeout(toggleImage(bednum),2000);
            }  
          }; 
        } 
        
        /* 
         * Convert time to the required format.
         */
        function timeConverter(UNIX_timestamp){
          //var a = new Date(UNIX_timestamp*1000);
          var a = new Date(UNIX_timestamp);
          var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
          var year = a.getFullYear();
          var month = months[a.getMonth()];
          var date = a.getDate();
          var hour = a.getHours();
          var min = a.getMinutes();
          var sec = a.getSeconds();
          var time = date + ' ' + month + ' ' + year + ' ' + hour + ':' + min + ':' + sec ;
          return time;
        }

        //var data = Drupal.settings.bedmon.data.data;
        //var title = Drupal.settings.bedmon.data.title;
        var basepath = Drupal.settings.basePath;
        var nid_list = Drupal.settings.bedmon2.nid_list;
        var chart1;
        console.log('Node ID list from PHP=', nid_list);
        var title = 'Real Time values';
        // Place a div name correcly.

        // Make a request to server only if there are elements to display on screen.
        if(nid_list != -1) {
          var requestData = (function() { 
            console.log('bedmon, requestData');
            var post_url = basepath + '?q=bedmon/vitals';
            $.ajax({
                url: post_url,
                type: 'POST',
                dataType: 'json',
                data: { nidList : nid_list },
                success: function(jsonData) {
                  console.log('data received from server: ', jsonData);
                  updateHtml(jsonData);
                },
                complete: function() {
                   console.log('complete, request again.');
                   setTimeout(requestData, 2000);
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
          requestData();
        }

        //
        function updateHtml(data) {
          for (var i in data) {
            var UserId = data[i].UserID;
            //
            var timeElem2mod = "time-" + UserId; //i;
            var movElem2mod = "mov-" + UserId;
            var occElem2mod = "occ-" + UserId;
            var respElem2mod = "resp-" + UserId;
            var pulseElem2mod = "pulse-" + UserId;
            //
            var uTime = eval(data[i].TimeP);
            // Timeout in millis.
            var TIMEOUT = 60000000;
            // Set default values.
            var respval = 0, pulseval = 0;
            var occuStatus = 0, movStatus = 0;
            if(uTime != -1) {
              respval = Math.round(data[i].Resp);
              pulseval = Math.round(data[i].Pulse);
              occuStatus = data[i].Occ;
              // TODO: test
              //occuStatus = 1;
              movStatus = data[i].Mov; 
              // TODO: test
              //movStatus = 8;
            } 
            //
            var now = new Date();
            var uTimeNow = now.getTime();
            var timediff = uTimeNow - uTime;
            var todayTime = now.getHours() + ":" + now.getMinutes() + ":" + now.getSeconds();
            $('#'+timeElem2mod).html(todayTime);
            //$('#'+timeElem2mod).html(timeConverter(uTime));
            //
            if (timediff > TIMEOUT) {
              $('#'+movElem2mod).html("Offline");
              //$('#'+movElem2mod).toggleClass("label label-default");
              $('#'+movElem2mod).removeClass().addClass("label label-default");
              $('#'+respElem2mod).html("--");
              $('#'+pulseElem2mod).html("--");
              //$('#'+occElem2mod+" img").attr('src', 'sites/default/files/unoccupied.png');
              $('#'+occElem2mod).removeClass("moving");
              $('#'+occElem2mod+ " img.bottom").src = 'sites/default/files/unoccupied.png';
              $('#'+timeElem2mod).html(timeConverter(uTime));
            } 
            else if (eval(occuStatus) > 0) {
              $('#'+occElem2mod+" img.bottom").attr('src', 'sites/default/files/occupied.png');
              if (eval(movStatus) < 6) {
                $('#'+movElem2mod).html("Resting!");
                $('#'+movElem2mod).removeClass().addClass("label label-info");
		if(respval < 0) {
                  $('#'+respElem2mod).html("--");
		} else {
                  $('#'+respElem2mod).html(respval);
		}
		if(pulseval < 0) {
                  $('#'+pulseElem2mod).html("--");
		} else {
                  $('#'+pulseElem2mod).html(pulseval);
		}
                $('#'+occElem2mod).removeClass("moving");
              }
              else if(eval(movStatus) > 5) {
                $('#'+respElem2mod).html("--");
                $('#'+pulseElem2mod).html("--");
                if(eval(movStatus) > 7) {
                  $('#'+movElem2mod).html("Restless!");
                  $('#'+movElem2mod).removeClass().addClass("label label-danger");
                }
                else {
                  $('#'+movElem2mod).html("Moving!");
                  $('#'+movElem2mod).removeClass().addClass("label label-warning");
                }
                if( ($('#'+occElem2mod).hasClass("moving")) == false) {
                  $('#'+occElem2mod).addClass("moving");
                  var movBed = toggleImage(UserId);
                  movBed();
                }
              } // movStatus
            } // occuStatus
            else { 
              //var now = new Date();
              //var todayTime = tnow.getHours() + ":" + tnow.getMinutes() + ":" + tnow.getSeconds();
              //$('#'+timeElem2mod).html(todayTime);
              $('#'+timeElem2mod).html(timeConverter(uTime));
              $('#'+movElem2mod).html("Out of bed!");
              $('#'+movElem2mod).removeClass().addClass("label label-primary");
              $('#'+respElem2mod).html("--");
              $('#'+pulseElem2mod).html("--");
              $('#'+occElem2mod).removeClass("moving");
              //$('#'+occElem2mod+ " img.bottom").src = 'sites/default/files/unoccupied.png';
              $('#'+occElem2mod+" img").attr('src', 'sites/default/files/unoccupied.png');
              //$('#'+occElem2mod+ " img").src = 'sites/default/files/unoccupied.png';
              console.log(occElem2mod);
            } // if occupied
          } // for each bed.
        } // updateHtml.
      } // bedmon2.
    } // attach
  } // behaviors
})(jQuery);

