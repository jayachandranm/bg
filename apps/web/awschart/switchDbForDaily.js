// let's generate two sets of data: one daily and one monthly

data_url = 'test.php';

var dailyData;

$.getJSON(data_url, function (data) {
  console.log(data);
  dailyData = data;
})

var chart = AmCharts.makeChart( "chartdiv", {
  "type": "serial",
  //"dataDateFormat": "YYYY-MM-DD",
  "valueAxes": [ {
    "axisAlpha": 0,
    "position": "left"
  } ],
  "graphs": [ {
    "id": "g1",
    "bullet": "round",
    "bulletBorderAlpha": 1,
    "bulletColor": "#FFFFFF",
    "bulletSize": 5,
    "hideBulletsCount": 50,
    "lineThickness": 2,
    "useLineColorForBulletBorder": true,
    "valueField": "value"
  } ],
  "chartScrollbar": {
    "graph": "g1",
    "scrollbarHeight": 30,
    "updateOnReleaseOnly": true
  },
  "chartCursor": {
    "cursorPosition": "mouse",
    "pan": true
  },
  "categoryField": "date",
  "categoryAxis": {
    "parseDates": true,
    "dashLength": 1,
    "minorGridEnabled": true,
    // let's start with the monthly data
    "minPeriod": "MM",
    "position": "top"
  },
  "zoomOutOnDataUpdate": false,
  "dataProvider": monthlyData,
  "listeners": [ {
    "event": "init",
    "method": function( event ) {
      event.chart.ignoreZoomEvent = true;
    }
  }, {
    "event": "zoomed",
    "method": function( event ) {

      // get chart
      var chart = event.chart;

      // ignore this event?
      if ( chart.ignoreZoomEvent ) {
        chart.ignoreZoomEvent = false;
        return;
      }

      // calculate the length of selected period in days
      var timeDiff = Math.abs( event.endDate.getTime() - event.startDate.getTime() );
      var diffDays = Math.ceil( timeDiff / ( 1000 * 3600 * 24 ) );

      // determine which period to use
      // if more than 90 days selected - use monthly data
      // otherwise use daily
      var usePeriod = diffDays > 90 ? 'MM' : 'DD';

      // check if we're already using that period
      // ignore if we do
      if ( chart.categoryAxis.minPeriod == usePeriod )
        return;

      // now let's update the dataProvider
      if ( 'MM' == usePeriod )
        chart.dataProvider = monthlyData;
      else
        chart.dataProvider = dailyData;

      // set appropriate dataProvider, minPeriod and update the chart
      chart.ignoreZoomEvent = true;
      chart.categoryAxis.minPeriod = usePeriod;
      chart.lastZoomEvent = event;
      chart.validateData();
    }
  }, {
    "event": "dataUpdated",
    "method": function( event ) {

      // get chart
      var chart = event.chart;

      // reset to the same zoom as it was before data update
      if ( chart.lastZoomEvent !== undefined ) {
        chart.ignoreZoomEvent = true;
        chart.zoomToDates( chart.lastZoomEvent.startDate, chart.lastZoomEvent.endDate );
      }
    }
  } ]
} );
