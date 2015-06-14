function GetURLParameter(sParam) {
    var sPageURL = window.location.search.substring(1);
    var sURLVariables = sPageURL.split('&');
    for (var i = 0; i < sURLVariables.length; i++) {
        var sParameterName = sURLVariables[i].split('=');
        if (sParameterName[0] == sParam) {
            return sParameterName[1];
        }
    }
}

function redirectUrl() {
    //userid = GetURLParameter('id');
    //time = GetURLParameter('t');
    //chart_url = 'summary.php';
    control_url = 'session-control.php';
    control_url_session = control_url + '?uid=' + userid + '&t=0';
    window.location = control_url_session;
}

$(function () {

    var chart1;
    var username=1;

    //username = <?php echo json_encode($user); ?>;
    //client_ip = <?php echo json_encode($ip); ?>;
    var userid = username;
    //console.log(userid + ':' + client_ip);

    Highcharts.setOptions({// This is for all plots, change Date axis to local timezone
        global: {
            useUTC: false
        }
    });

/*
    $(document).ready(function () {
        var requestProfileData = function () {
            //function requestProfileData() {
            //userid = GetURLParameter('id');
            //time = GetURLParameter('t');
            data_url = 'test-query.php';
            data_url_user = data_url; // + '?id=' + userid + '&t=' + time + '&v=tmpr';
            $.ajax({
                //url: 'ws_get_lastval.php?id=mjay',
                url: data_url_user,
                success: function (point) {
                    //var series = chart4.series[0], shift = series.data.length > 60;
                    // add the point
                    //chart4.series[0].addPoint(eval(point), true, shift);
                    //console.log(point);
                    document.getElementById("bio").innerHTML = point;

                    // call it again after 1s
                    //setTimeout(requestData(username), 1000);
                    //setTimeout(requestProfileData, 5000);
                },
                error: function (e) {
                    console.log('error1', e.message);
                },
                cache: false
            });
        }
        setInterval(requestProfileData, 1000);
    });
*/

    /**
     * Request data from the server, add it to the graph and set a timeout to request again
     */
    function requestLeq5mts() {
        //userid = GetURLParameter('id');
        //username = GetURLParameter('id');
        //time = GetURLParameter('t');
        time = 0;
        data_url = 'ws_get_lastval.php';
        data_url_user = data_url + '?uid=' + userid + '&t=' + time + '&v=noise';
        $.ajax({
            //url: 'ws_get_lastval.php?id=mjay',
            url: data_url_user,
            success: function (point) {
                var series = chart1.series[0],
                    shift = series.data.length > 60;
                //var series = chart1.series[0];
                // add the point
                if (eval(point[1]) > 0) {
                    //console.log(point[0], point[1]);
                    //series.addPoint([x, yr], true, true);
                    chart1.series[0].addPoint(eval(point), true, shift);
                    //chart1.series[0].addPoint([x, yr], true, true);
                    //document.getElementById("table").innerHTML = Math.floor(point[1]);
                }
                else {
                    //document.getElementById("table").innerHTML = 'NA';
                }

                // call it again after 1s
                //setTimeout(requestData(username), 1000);
                setTimeout(requestLeq5mts, 5000);
            },
            cache: false
        });
    }


    /*
     */
    //userid = GetURLParameter('id');
    //time = GetURLParameter('t');
    time = 0;

    data_url = 'ws_get_rangeofval.php';
    data_url_userr = data_url + '?uid=' + userid + '&t=' + time + '&v=noise';

    $.getJSON(data_url_userr, function (data) {
        // Create the chart
        //username = GetURLParameter('id');

        chart1 = new Highcharts.StockChart({
            chart: {
                renderTo: 'container1',
                /*zoomType: 'x'  */
                defaultSeriesType: 'spline',

                events: {
                    load: requestLeq5mts
                }

            },

            //$('#container1').highcharts('StockChart', {
            plotOptions: {
                series: {
                    marker: {
                        enabled: true
                    }
                }
            },

            rangeSelector: {
                buttons: [
                    {
                        count: 1,
                        type: 'minute',
                        text: '1M'
                    },
                    {
                        count: 5,
                        type: 'minute',
                        text: '5M'
                    },
                    {
                        type: 'all',
                        text: 'All'

                    }
                ],
                inputEnabled: false,
                selected: 0

                //enabled : false
            },

            title: {
                text: 'Realtime Leq15mts data'
            },

            exporting: {
                enabled: false
            },

            yAxis: {
                min: 5,
                max: 150,
                startOnTick: false,
                endOnTick: false,
                title: {
                    text: 'Noise Level (dBA)'
                },
            },

            scrollbar: {
                enabled: false
            },

            series: [
                {
                    name: 'Noise',
                    data: data,
                    tooltip: {
                        valueDecimals: 1
                    }
                }
            ]

        });
    });

});


