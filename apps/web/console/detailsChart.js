var chartData = []; // = generateChartData();

var chart = AmCharts.makeChart("chartdiv", {
    "type": "serial",
    "theme": "light",
    "marginRight": 80,
    "dataProvider": chartData,
    "valueAxes": [{
        "position": "left",
        "title": "Level",
        "guides": [{
           "fillAlpha": 0.20,
           "fillColor": "#CC0000",
           "value": 90,
           "toValue": 95
        },{
           "value": 75,
           "lineColor": "#CC0000",
           "lineAlpha": 1,
           "dashLength": 2,
            "inside": true,
            "labelRotation": 90,
            "label": "75% level"
        }]
    }],

    "graphs": [{
        "id": "g1",
        "fillAlphas": 0.4,
        "valueField": "value",
         "balloonText": "<div style='margin:5px; font-size:19px;'>Level:<b>[[value]]</b></div>"
    }],
    "chartScrollbar": {
        "graph": "g1",
        "scrollbarHeight": 40,
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

function getData(selectedSid, selectedType) {
  var sid = selectedSid;
  var type = selectedType;
  var data_url = 'detailsJson.php?sid=' + sid + '&type=' + type;
  console.log(data_url);
  $.getJSON(data_url, function (data) {
    //console.log(data);
    chart.dataProvider = data;
    chart.validateData();
  });
}

//getData("CWS001", "wl");
getData("WHKC206", "bl");

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

