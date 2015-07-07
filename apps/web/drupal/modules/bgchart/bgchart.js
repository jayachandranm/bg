(function ($) {
        Drupal.behaviors.bgchart = {
          attach: function(context, settings) {
          console.log('hello');
          if (Drupal.settings.bgchart)  {
          //if (true)  {
            //var data = Drupal.settings.bgchart.data.data;
            //var title = Drupal.settings.bgchart.data.title;
            var basepath = Drupal.settings.basePath;
            var sid = Drupal.settings.bgchart.sid;
            var chart1;
            console.log('helloi222');
            var title = 'Leq5mts Real Time';
            // Place a div name correcly.
            $("#block-bgchart-bgchart").append("<div id='show_report'>Graph will display here.....</div>");
           data_url = basepath + '?q=bgchart/get/' + sid;

Highcharts.setOptions({
            global: {
                useUTC: false
            }
        });


          $.getJSON(data_url, function (data) {
                  chart1 = $('#show_report').highcharts({
                      chart: {
                          type: 'spline',
                          events: { 
                            load: requestData
                          }
                      },
                      title: {
                          text: title
                      },
                      subtitle: {
                          text: ''
                      },

        xAxis: {
            //categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
            //    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
            type: 'datetime'
        },
        yAxis: {
            title: {
                text: 'Temperature (°C)'
            },
            plotLines: [{
                value: 0,
                width: 1,
                color: '#808080'
            }]
        },
        tooltip: {
              formatter: function () {
                    return '<b>' + this.series.name + '</b><br/>' +
                        Highcharts.dateFormat('%Y-%m-%d %H:%M:%S', this.x) + '<br/>' +
                        Highcharts.numberFormat(this.y, 2);
                }
            //valueSuffix: '°C'
        },
/*
        series: [{
            name: 'Tokyo',
            data: [7.0, 6.9, 9.5, 14.5, 18.2, 21.5, 25.2, 26.5, 23.3, 18.3, 13.9, 9.6]
        }, {
            name: 'New York',
            data: [-0.2, 0.8, 5.7, 11.3, 17.0, 22.0, 24.8, 24.1, 20.1, 14.1, 8.6, 2.5]
        }, {
            name: 'Berlin',
            data: [-0.9, 0.6, 3.5, 8.4, 13.5, 17.0, 18.6, 17.9, 14.3, 9.0, 3.9, 1.0]
        }, {
            name: 'London',
            data: [3.9, 4.2, 5.7, 8.5, 11.9, 15.2, 17.0, 16.6, 14.2, 10.3, 6.6, 4.8]
        }]
*/
           series: [
                {
                    name: 'Test',
                    data: data
                }
            ]

                  }); // highcharts
               }); //getjson
             } // if

           var requestData = (function() { 
            console.log('helloo3333');
            data_url = basepath + '?q=bgchart/get/' + sid;
            $.ajax({
              url: data_url,
              success: function(jsonData) {
                console.log(jsonData);
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
          } // attach

        } // behaviors
})(jQuery);

