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
            var img = document.getElementById(occElem2mod).src;
            //console.log("Changing image->", bednum);
            if(img.indexOf('occupied.png')!=-1) {
              document.getElementById(occElem2mod).src = 'sites/default/files/moving.png';
            }
            else {
              document.getElementById(occElem2mod).src = 'sites/default/files/occupied.png';
            }
            if( $('#'+occElem2mod).hasClass("moving")) {
              setTimeout(toggleImage(bednum),1000);
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
        //var jsonList = {};
        //jsonList['nidlist'] = nid_list;
        var chart1;
        console.log('Node ID list from PHP=', nid_list);
        var title = 'Real Time values';
        // Place a div name correcly.
        var requestData = (function() { 
          console.log('bedmon, requestData');
          var post_url = basepath + '?q=bedmon/vitals';
          //var post_data = "&nidlist="+nid_list;
          //var post_data = JSON.stringify(jsonList);//+nid_list;
          //console.log('JSON POST data=', post_data);
          $.ajax({
              url: post_url,
              type: 'POST',
              dataType: 'json',
              //data: post_data,
              //data: { 'nidlist' : 22, 'example_token' : 55 }, 
              //data: post,
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
            // Set default values.
            var respval = 0, pulseval = 0;
            var occuStatus = 0, movStatus = 0;
            if(uTime != -1) {
              respval = Math.round(data[i].Resp);
              pulseval = Math.round(data[i].Pulse);
              occuStatus = data[i].Occ;
              // TODO: test
              occuStatus = 1;
              movStatus = data[i].Mov; 
              // TODO: test
              //movStatus = 8;
            } 
            //
            $('#'+timeElem2mod).html(timeConverter(uTime));
            var tnow = new Date().getTime();
            var timediff = tnow - uTime;
/*
            if (timediff > 300000) { 
              occuStatus = 0;
            }
*/
            //
            if (eval(occuStatus) > 0) {
              if (eval(movStatus) < 6) {
                $('#'+movElem2mod).html("Resting!");
                //$('#'+movElem2mod).toggleClass("label label-info");
                $('#'+movElem2mod).removeClass().addClass("label label-info");
                $('#'+respElem2mod).html(respval);
                $('#'+pulseElem2mod).html(pulseval);
                //lastStatusMoving[eval(i)] = false;
                $('#'+occElem2mod).removeClass("moving");
                //document.getElementById(occElem2mod).src = 'sites/default/files/occupied.png';
                $('#'+occElem2mod).attr('src', 'sites/default/files/occupied.png');
              }
              else if(eval(movStatus) > 5) {
                if(eval(movStatus) > 7) {
                  $('#'+movElem2mod).html("Restless!");
                  //$('#'+movElem2mod).toggleClass("label label-danger");
                  $('#'+movElem2mod).removeClass().addClass("label label-danger");
                }
                else {
                  $('#'+movElem2mod).html("Moving!");
                  //$('#'+movElem2mod).toggleClass("label label-warning");
                  $('#'+movElem2mod).removeClass().addClass("label label-warning");
                }
                $('#'+respElem2mod).html("--");
                $('#'+pulseElem2mod).html("--");
/*
                if(lastStatusMoving[eval(i)] == false) {
                  lastStatusMoving[eval(i)] = true;
                  //var movBed = toggleImage(i);
                  //movBed();
                }
*/
                if( ($('#'+occElem2mod).hasClass("moving")) == false) {
                  $('#'+occElem2mod).addClass("moving");
                  var movBed = toggleImage(UserId);
                  movBed();
                }
              } // movStatus
            } // occuStatus
            else { 
              var todayTime = "0:0:0"; // now.getHours() + ":" + now.getMinutes() + ":" + now.getSeconds();
              $('#'+timeElem2mod).html(todayTime);
              $('#'+movElem2mod).html("Out of bed!");
              //$('#'+movElem2mod).toggleClass("label label-primary");
              $('#'+movElem2mod).removeClass().addClass("label label-primary");
              $('#'+respElem2mod).html("--");
              $('#'+pulseElem2mod).html("--");
              //lastStatusMoving[eval(i)] = false;
              $('#'+occElem2mod).removeClass("moving");
              //document.getElementById(occElem2mod).src = 'images/unoccupied.png';
              $('#'+occElem2mod).src = 'sites/default/files/unoccupied.png';
            } // if occupied
/*
            if (timediff > 300000) {
              $('#'+movElem2mod).html("Check system.");
              //$('#'+movElem2mod).toggleClass("label label-default");
              $('#'+movElem2mod).removeClass().addClass("label label-default");
            }
*/
          } // for each bed.
        } // updateHtml.
      } // bedmon2.
    } // attach
  } // behaviors
})(jQuery);

