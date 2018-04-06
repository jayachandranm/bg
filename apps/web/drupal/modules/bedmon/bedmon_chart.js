(function ($) {
      Drupal.behaviors.bedmon = {
        attach: function(context, settings) {
          console.log('Attached bedmon, Chart JS.');
          if (Drupal.settings.bedmon)  {
            //if (true)  {
            //var data = Drupal.settings.bedmon.data.data;
            //var title = Drupal.settings.bedmon.data.title;
            console.log('Confirmed chart JS based on setting.');
            var basepath = Drupal.settings.basePath;
            var uid = Drupal.settings.bedmon.uid;
            var chart1, chart2;
            var title_p = 'Pulse rate';
            var title_r = 'Resp rate';
            // Place a div name correcly.
            $("#block-bedmon-bedmon").append("<div id='chart1'>Graph1 display here.....</div>");
            $("#block-bedmon-bedmon").append("<p></p>");
            $("#block-bedmon-bedmon").append("<div id='chart2'>Graph2 display here.....</div>");
            data_url = basepath + '?q=bedmon/get/' + uid;
            // For one week history data.
            data_url = data_url + '/1';
            console.log('urlpath=', data_url);

            Highcharts.setOptions({
              global: {
                useUTC: false
              }
            });

            $.getJSON(data_url, function (tsdata) {
              console.log('Retrieved data: ', tsdata);
              //console.log('Retrieved Pulse data: ', data[0].p);
              //chart1 = $('#chart1').highcharts({
              //chart1 = new Highcharts.StockChart({
              chart1 = $('#chart1').highcharts('StockChart', {
                chart: {
                  //renderTo: 'chart1',
                  //type: 'spline',
                  defaultSeriesType: 'spline',
                  events: { 
                    load: requestData
                  }
                },
                rangeSelector: {
                  buttons: [
                    {
                      count: 5,
                      type: 'minute',
                      text: '5M'
                    },
                    {
                      count: 1,
                      type: 'week',
                      text: '1W'
                    },
                    {
                      type: 'all',
                      text: 'All'
                    },
                  ],
                  inputEnabled: false,
                  selected: 0
                },
                title: {
                  text: title_p
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
                    text: 'Pulse Rate (BPM)'
                  }
                },
                tooltip: {
/*
                  formatter: function () {
                    return '<b>' + this.series.name + '</b><br/>' +
                        Highcharts.dateFormat('%Y-%m-%d %H:%M:%S', this.x) + '<br/>' +
                        Highcharts.numberFormat(this.y, 2);
                  }
*/
                  // http://api.highcharts.com/highstock/plotOptions.spline.tooltip 
		  turboThreshold: 0,
                  valueDecimals: 0
                //valueSuffix: '°C'
                },
/*
        series: [{
            name: 'Tokyo',
            data: [7.0, 6.9, 9.5, 14.5, 18.2, 21.5, 25.2, 26.5, 23.3, 18.3, 13.9, 9.6]
        }, {
            name: 'London',
            data: [3.9, 4.2, 5.7, 8.5, 11.9, 15.2, 17.0, 16.6, 14.2, 10.3, 6.6, 4.8]
        }]
*/
                series: [
                  {
                    name: 'Pulse rate',
                    //data: data[0].p
                    data: tsdata.p
                  }
                ]
              }); // highcharts
            }); //getjson

            // TODO: Same data is being fetched twice.
            $.getJSON(data_url, function (tsdata) {
              //console.log(tsdata.p);
              //chart2 = $('#chart2').highcharts({
              chart2 = new Highcharts.StockChart({
                chart: {
                  renderTo: 'chart2',
                  //type: 'spline',
                  defaultSeriesType: 'spline',
                  events: { 
                    load: requestData
                  }
                },
                rangeSelector: {
                  buttons: [
                    {
                      count: 5,
                      type: 'minute',
                      text: '5M'
                    },
                    {
                      count: 1,
                      type: 'week',
                      text: '1W'
                    },
                    {
                      type: 'all',
                      text: 'All'
                    },
                  ],
                  inputEnabled: false,
                  selected: 0
                },
                title: {
                  text: title_r
                },

                xAxis: {
                  type: 'datetime'
                },
                yAxis: {
                  title: {
                    text: 'Resp Rate (BPM)'
                  }
                },
                tooltip: {
/*
                  formatter: function () {
                    return '<b>' + this.series.name + '</b><br/>' +
                        Highcharts.dateFormat('%Y-%m-%d %H:%M:%S', this.x) + '<br/>' +
                        Highcharts.numberFormat(this.y, 2);
                  }
*/
                  //pointFormat: '<b>' + series.name + '</b><br/>' 
		  turboThreshold: 0,
                  valueDecimals: 0
                },
                series: [
                  {
                    name: 'Resp rate',
                    //data: data[0].r
                    data: tsdata.r
                  }
                ]
              }); // highcharts
            }); //getjson
            var requestData = (function() { 
              console.log('Ajax request for real time values.');
/* Disable real time updates.
              data_url = basepath + '?q=bedmon/get/' + uid;
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
*/
            });
          } // if settings
        } // attach
      } // behaviors
})(jQuery);

