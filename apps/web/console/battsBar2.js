var chartData2 = []; // = generateChartData();
var attr = 'wl';

var chart2 = AmCharts.makeChart("chartdivbar2", {
    "type": "serial",
    "theme": "light",
    "marginRight": 80,
    "dataProvider": chartData2,
    "valueAxes": [{
        "position": "left",
        "gridColor": "#FFFFFF",
        "gridAlpha": 0.2,
        "dashLength": 0,
        "title": "Level"
    }],
    "gridAboveGraphs": true,
    "startDuration": 1,
    "graphs": [{
        "id": "g1",
        "balloonText": "[[category]]:<b>[[value]]</b></div>",
        "fillAlphas": 0.4,
        "lineAlpha": 0.2,
        "type": "column",
        "valueField": "value"
    }],
    "chartCursor": {
        "categoryBalloonEnabled": false,
        "cursorAlpha": 0,
        "zoomable": false
    },
    "categoryField": "sid",
    "categoryAxis": {
        "gridPosition": "start",
        "gridAlpha": 0,
        "tickPosition": "start",
        "tickLength": 20
    },
    "export": {
        "enabled": true
    }
});

function getData2( type ) {
  attr = type;
  var data_url2 = 'battsBarJson2.php?attr=' + attr;
  $.getJSON(data_url2, function (data) {
    console.log(data);
    chart2.dataProvider = data;
    chart2.validateData();
  });
}

getData2(attr);

// add click listener
chart2.addListener("clickGraphItem", handleClick2);

function handleClick2(event)
{
    sid = event.item.category;
    console.log(event.item.category + ": " + event.item.values.value);
    $("#sid").text(sid);
    getData(sid, attr);
}

chart2.addListener("dataUpdated", zoomChart2);
// when we apply theme, the dataUpdated event is fired even before we add listener, so
// we need to call zoomChart here
//zoomChart();
// this method is called when chart is first inited as we listen for "dataUpdated" event

function zoomChart2() {
    // different zoom methods can be used - zoomToIndexes, zoomToDates, zoomToCategoryValues
    console.log("zoom", chartData2);
    //chart.zoomToIndexes(chartData.length - 250, chartData.length - 100);
}

