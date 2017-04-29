var chartData = []; // = generateChartData();
//var chartData = generateChartData();

var data_url = 'test.php';

//var chartData = getData();
    /*
    "dataLoader": {
      "url": "test.php"
    },
    */
    //"theme": "patterns",

var chart = AmCharts.makeChart("chartdiv", {
    "type": "serial",
    "theme": "light",
    "marginRight": 80,
    "dataProvider": chartData,
    "valueAxes": [{
        "position": "left",
        "title": "Level visitors"
    }],
    "graphs": [{
        "id": "g1",
        "fillAlphas": 0.4,
        "valueField": "value",
         "balloonText": "<div style='margin:5px; font-size:19px;'>Level:<b>[[value]]</b></div>"
    }],
    "chartScrollbar": {
        "graph": "g1",
        "scrollbarHeight": 80,
        "backgroundAlpha": 0,
        "selectedBackgroundAlpha": 0.1,
        "selectedBackgroundColor": "#888888",
        "graphFillAlpha": 0,
        "graphLineAlpha": 0.5,
        "selectedGraphFillAlpha": 0,
        "selectedGraphLineAlpha": 1,
        "autoGridCount": true,
        "color": "#AAAAAA"
    },
    "chartCursor": {
        "categoryBalloonDateFormat": "JJ:NN, DD MMMM",
        "cursorPosition": "mouse"
    },
    "categoryField": "date",
    "categoryAxis": {
        "minPeriod": "mm",
        "parseDates": true
    },
    "valexport": {
        "enabled": true,
         "dateFormat": "YYYY-MM-DD HH:NN:SS"
    }
});

function getData() {
  $.getJSON(data_url, function (data) {
    //console.log(data);
    chart.dataProvider = data;
    chart.validateData();
  });
}

getData();

chart.addListener("dataUpdated", zoomChart);
// when we apply theme, the dataUpdated event is fired even before we add listener, so
// we need to call zoomChart here
//zoomChart();
// this method is called when chart is first inited as we listen for "dataUpdated" event

function zoomChart() {
    // different zoom methods can be used - zoomToIndexes, zoomToDates, zoomToCategoryValues
    console.log("zoom", chartData);
    //chart.zoomToIndexes(chartData.length - 250, chartData.length - 100);
}

