	
	@extends('admin.layout')
	
	@section('css')
		<style>
		.nav-tabs-custom {
			margin-bottom: 0px;
			background: none;
		}
		.nav-tabs-custom>ul.nav-tabs{
			float:right;
		}
		.mtop10{
			margin-top:10px;
		}
		.mtop5{
			margin-top:5px;
		}
		.txtright{
			text-align: right;
			right: 5px;
		}
		.content{
			min-height:0;
		}
		.small-box .icon {
			top: -22px;
		}
		.weight7{
			font-weight: 700;
		}
		.chart-cnt{
			background-color: #ddd;
			padding:10px;
		}
		.marginh10 {
			margin: 10px 0;
		}
		.text-right{
			text-align: right;
		}
		.chart {
			padding: 10px;
			margin: 10px 0;
		}
		.content-wrapper{
			min-height: auto !important;
		}
		.chart p {
			margin: 0;
		}
		.chart p label {
			color: #ff0000;
		}
		</style>
	@endsection
	
	
	@section('content')
		
	   <section class="content-header">	
			<h1>
				Dashboard
			</h1>			
        </section>
		<section class="content">
			<div class="row">
				<!-- left column -->
				<div class="col-md-12">	
				  <!-- general form elements -->
					<div class="box box-primary">
						<div class="box-header with-border">
							<h3 class="box-title">Current Station Status</h3>
						</div>
						<div id="chartCnt">
								
						</div>
					</div>
				</div>
				<div class="col-md-12">	
					<div class="box-body">
						<table class="customTable table table-bordered table-striped">
							<thead>
								<tr>
									<th>Total</th>
									<th>0% - 75%</th>
									<th>76% - 90%</th>
									<th>91% - 100%</th>
									<th>>100%</th>
									<th>Maintenance</th>
								</tr>
							</thead>
							<tbody>
								<tr>
									@foreach($data as $val)
									<td>{{$val}}</td>
									@endforeach
								</tr>
							</tbody>
						</table>
					</div>
					
				</div>
			</div>
		</section>
	
	
		
			
	@endsection
	
	
	@section('js')
	<script src="https://code.highcharts.com/stock/highstock.js"></script>
	<script src="https://code.highcharts.com/modules/exporting.js"></script>
	<script>
	
		$(function(){
			chartrefresh();			
			setInterval(function() {
				location.reload();
			}, 60000); 
			 
		});
		
		var chartrefresh = function(){
			Highcharts.chart('chartCnt', {
				chart: {
					type: 'column'
				},
				title: {
					text: 'Station Status'
				},
				subtitle: {
					text: ''
				},
				xAxis: {
					categories: [
						'Total',
						'0% - 75% ',
						'76% - 90% ',
						'91% - 100% ',
						'>100%',
						'Maintenance'
					],
					crosshair: true
				},
				yAxis: {
					min: 0,
					allowDecimals: false,
					title: {
						text: 'Count '
					}
				},
				tooltip: {
					headerFormat: '<span style="font-size:10px">{point.key}</span><table>',
					pointFormat: '<tr><td style="color:{series.color};padding:0">{series.name}: </td>' +
						'<td style="padding:0"><b>{point.y} </b></td></tr>',
					footerFormat: '</table>',
					shared: true,
					useHTML: true
				},
				plotOptions: {
					column: {
						pointPadding: 0.2,
						borderWidth: 0
					}					
				},
				exporting: { enabled: false },
				credits: { enabled: false },
				series: [
					{
						name: 'Number of Stations',
						data: <?php echo json_encode($datas); ?>

					}
				]
			});
		}
	</script>
	@endsection