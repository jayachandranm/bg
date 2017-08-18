var chartData1 = []; // = generateChartData();
var attr = 'wl';

var chart1 = AmCharts.makeChart("chartdivbar", {
    "type": "serial",
    "theme": "light",
    "marginRight": 80,
    "dataProvider": chartData1,
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
        "alphaField": "alpha",
        "dashLengthField": "dashLength",
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

function getData1(type) {
  attr = type;
  var data_url1 = 'battsBarJson.php?attr=' + attr;
  console.log(data_url1);
  $.getJSON(data_url1, function (data) {
    console.log(data);
    chart1.dataProvider = data;
    chart1.validateData();
  });
}

getData1(attr);

// add click listener
chart1.addListener("clickGraphItem", handleClick1);

function handleClick1(event)
{
    sid = event.item.category;
    console.log(event.item.category + ": " + event.item.values.value);
    $("#sid").text(sid);
    getData(sid, attr);
}

chart1.addListener("dataUpdated", zoomChart1);
// when we apply theme, the dataUpdated event is fired even before we add listener, so
// we need to call zoomChart here
//zoomChart();
// this method is called when chart is first inited as we listen for "dataUpdated" event

function zoomChart1() {
    // different zoom methods can be used - zoomToIndexes, zoomToDates, zoomToCategoryValues
    console.log("zoom", chartData1);
    //chart.zoomToIndexes(chartData.length - 250, chartData.length - 100);
}

