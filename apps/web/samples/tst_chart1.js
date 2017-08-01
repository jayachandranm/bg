$(function () {
  
  var last_ts = 0;
  var chart1;

  Highcharts.setOptions({
    global: {
      useUTC: false
    }
  });

  function getRecent() {
    var et = (new Date()).getTime(); // current time
    //et = 1501577699;
    var st = last_ts;
    //st = 1501571699;
    qurl = 'tst_chart2.php?st=' + st + '&et=' + et;
    console.log(qurl);
    $.ajax({
      url: qurl,
      type: 'GET',
      error: function() {
        console.log('An error occurred in Ajax call.');
      },
      success: function(jjdata) {
        jVal = JSON.parse(jjdata);
        if(jVal) {
          console.log(jVal, jVal.length);
          for(var i=0; i< jVal.length; i++) {
            console.log("Add one point..");
            point = jVal[i];
            x = point[0];
            y = point[1];
            // Assumes that the ts values are in ASC order.
            last_ts = y;
            var series = chart1.series[0];
            series.addPoint([x, y], true, true);
          }
        }
      }
    });
    setTimeout(getRecent, 5000);
  }

  // Create the chart
  $.getJSON('tst_chart1.php', function(jdata) {
    var size = jdata.length;
    last_ts = jdata[size-1][0];
    console.log("Last ts: ", last_ts);
    chart1 = Highcharts.stockChart('container', {
      chart: {
        events: {
          load: getRecent
        }
      },

      rangeSelector: {
        buttons: [{
          count: 1,
          type: 'minute',
          text: '1M'
        }, {
          count: 5,
          type: 'minute',
          text: '5M'
        }, {
          type: 'all',
          text: 'All'
        }],
        inputEnabled: false,
        selected: 0
      },

      title: {
        text: 'Live random data'
      },

      exporting: {
        enabled: false
      },

      series: [{
        name: 'Random data',
        data: jdata
      }]
    });
  });
});
