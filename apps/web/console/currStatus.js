$(function() {

var chartData1 = []; // = generateChartData();
var chartData2 = []; 
var attr = 'bl';

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
        "colorField": "color",
        "customBulletField": "bullet",
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
        "alphaField": "alpha",
        "dashLengthField": "dashLength",
        "colorField": "color",
        "customBulletField": "bullet",
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

//function updateDataAllDev(chart, list, type) {
function updateDataAllDev(list, type) {
  attr = type;
  var data_url = 'status_alldev_json.php?list=' + list + '&attr=' + attr;
  console.log(data_url);
  $.getJSON(data_url, function (data) {
    var chart = chart1;
    if(list === "list2") {
      chart = chart2;
    }
    //console.log(data);
    chart.dataProvider = data;
    chart.validateData();
  });
}

updateDataAllDev("list1", attr);
updateDataAllDev("list2", attr);

// add click listener
chart1.addListener("clickGraphItem", handleClick);
chart2.addListener("clickGraphItem", handleClick);

function handleClick(event)
{
    sid = event.item.category;
    console.log(event.item.category + ": " + event.item.values.value);
    $("#sid").text(sid);
    getData(sid, attr);
}

chart1.addListener("dataUpdated", zoomChart);
chart2.addListener("dataUpdated", zoomChart);
// when we apply theme, the dataUpdated event is fired even before we add listener, so
// we need to call zoomChart here
//zoomChart();
// this method is called when chart is first inited as we listen for "dataUpdated" event

function zoomChart() {
    // different zoom methods can be used - zoomToIndexes, zoomToDates, zoomToCategoryValues
    //console.log("zoom", chartData1);
    //chart.zoomToIndexes(chartData.length - 250, chartData.length - 100);
}

  $('.select-val').on('change', function(){
    var selected = $(this).find("option:selected").val();
    console.log(selected);
    updateDataAllDev("list1", selected); 
    updateDataAllDev("list2", selected);
    //getData2(selected);
    getData("WHKC206", selected);
  });

  $('#na').on('change', function(){
    //alert($(this).prop('checked'));
    console.log("Change event: " + this.id);
    // If true, show diff color for some elements in the graph.
    // If false, change to default.
  });

  $('#md').on('change', function(){
    //alert($(this).prop('checked'));
    console.log("Change event: " + this.id);
    // If true, show diff color for some elements in the graph.
    // If false, change to default.
  });
});

