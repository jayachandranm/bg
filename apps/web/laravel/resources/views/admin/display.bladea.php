	<?php 
		$waterlever_mrl = isset($lastRawdata->waterlever_mrl)?($lastRawdata->waterlever_mrl):"N/A";
		$datetime = isset($lastRawdata->datetime)?($lastRawdata->datetime):date('Y-m-d H:i');
		$battery_voltage = isset($lastRawdata->battery_voltage)?($lastRawdata->battery_voltage):"N/A";
	?>
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
			background-color: #fff;
			padding:10px;
		}
		.marginh10 {
			margin: 10px 0;
		}
		.text-right{
			text-align: right;
		}
		</style>
	@endsection
	
	
	@section('content')
		
        <section class="content">
			<div class="row">
            <div class="col-lg-3 col-xs-6">
              <!-- small box -->
              <div class="small-box bg-aqua">
                <div class="inner">
                  <p>{{$waterlever_mrl}} mRL<sup style="font-size: 20px"></sup></p>
                  <p>Water Level</p>
                </div>
                <div class="icon">
                  <i class="ion ion-stats-bars"></i>
                </div>
              </div>
            </div><!-- ./col -->
            <div class="col-lg-3 col-xs-6">
              <!-- small box -->
              <div class="small-box bg-green">
                <div class="inner">
                  <p>{{date('d-m-Y H:i',strtotime($datetime))}}</p>
                  <p>Date & Time</p>
                </div>
                <div class="icon">
                  <i class="ion ion-clock"></i>
                </div>
              </div>
            </div><!-- ./col -->
            <div class="col-lg-3 col-xs-6">
              <!-- small box -->
              <div class="small-box bg-yellow">
                <div class="inner">
                  <p>{{$rateof_change}} mRL</p>
                  <p>Rate of Change</p>
                </div>
                <div class="icon">
                  <i class="ion ion-arrow-graph-up-right"></i>
                </div>
              </div>
            </div><!-- ./col -->
            <div class="col-lg-3 col-xs-6">
              <!-- small box -->
              <div class="small-box bg-red">
                <div class="inner">
                  <p>{{$battery_voltage}} V</p>
                  <p>Battery Voltage</p>
                </div>
                <div class="icon">
                  <i class="ion ion-battery-half"></i>
                </div>
              </div>
            </div><!-- ./col -->
			</div>
		</section>
		<div class="col-lg-12 chart-cnt">
			<form action="" method="post" >
				<input type="hidden" name="_token" value="{{ csrf_token() }}" />
				<div class="col-lg-12 txtright">
					<div class="col-lg-2 no-padding txtright">
						<span>Cope Level(mRl)</span><label>{{$station->copelevel}}</label>
					</div>
					<div class="col-lg-2 no-padding txtright">
						<span>Operation Level(mRl)</span><label>{{$station->operationlevel}}</label>
					</div>
					<div class="col-lg-2 no-padding txtright">
						<span>Invert Level(mRl)</span><label>{{$station->invertlevel}}</label>
					</div>
					<div class="col-lg-2 no-padding txtright">
						<span>Critical Level(mRl)</span><label>{{$station->criticallevel}}</label>
					</div>
				</div>
				<div id="info" style="height:45px;padding:5px 0;">	
					<div class="col-md-1 no-padding mtop10 txtright">
						<span>Station Name</span>
					</div>	
					<div class="col-md-3 no-padding mtop5">
						<select name="station_id" class="form-control station_id" required onchange="selectStation(this.value);" >
							<option value="">Select Station</option>
							@foreach($stations as $key=>$val)
							<option value="{{$val->id}}"  @if($val && $val->id==$station->id){{'selected'}} @endif >{{$val->station_name}}</option>
							@endforeach
						</select>
					</div>			
					<div class="col-md-6  no-padding">						
						<div class="nav-tabs-custom">
							<ul class="nav nav-tabs">
								<li class="active"><a href="#chartCnt" data-toggle="tab">Chart</a></li>
								<li><a href="#tableCnt" data-toggle="tab">Table</a></li>
								<li><a href="#stationLiveCnt" data-toggle="tab">Station Image</a></li>
							</ul>
						</div>
					</div>
				</div> <?php /* */ ?>
				<div class="col-md-12 marginh10">
					<div class="col-md-2 col-md-offset-2 text-right">
						<label>Date and time range:</label>
					</div>
					<div class="col-md-4">
						<div class="form-group">
							<div class="input-group">
								<div class="input-group-addon">
									<i class="fa fa-clock-o"></i>
								</div>
								<input type="text" class="form-control pull-right daterange" id="daterange" name="daterange" value="{{$daterange}}" readonly>
							</div>
						</div>
					</div>
					<div class="col-md-2 ">
						<input type="submit" name="submit" class="btn btn-success" value="Search"  />
					</div>
				</div>
				<div class="col-md-12  no-padding nav-tabs-custom">
					<div class="nav-tabs-custom">	
						<div class="tab-content">
							<div class="active tab-pane" id="chartCnt">
								
							</div>
							<div class="tab-pane" id="tableCnt">
								<div class="box-body">
									<table class="customTable table table-bordered table-striped">
										<thead>
										  <tr>
											<th>Date & Time</th>
											<th>Water Depth(m)</th>
											<th>Water Level(mRL)</th>
											<th>Rate of Change</th>
											<th>Status</th>
										  </tr>
										</thead>
										<tbody>
											
											@foreach($allRawdata as $key=>$val)
												<?php 	$statusText = ($val->maintenance_status==1)?('Running'):('Maintenance'); 
														$secondlastKey = ($key-1);
														if($secondlastKey<0){$secondlastKey=0;}
														$secondmrl = isset($allRawdata[$secondlastKey]->waterlever_mrl)?($allRawdata[$secondlastKey]->waterlever_mrl):0;
														$firstmrl = $val->waterlever_mrl;
														$rateof_change = $secondmrl-$firstmrl;
												?>
												<tr>
													<td>{{date('d-m-Y H:i',strtotime($val->datetime))}}</td>
													<td>{{$val->waterlevel_meter}}</td>
													<td>{{$val->waterlever_mrl}}</td>
													<td>{{$rateof_change}}</td>
													<td>{{$statusText}}</td>
												</tr>
											@endforeach
										</tbody>
									</table>
								</div>
							</div>
							<div class="tab-pane" id="stationLiveCnt">	
								@if($station->image)
									<img src="{{URL::to('public/stations/'.$station->image)}}" width="100%" height="100%" />
								@endif
							</div>
						</div>
					</div>
				</div>
			</form>
		</div>
	
	
		
			
	@endsection
	
	
	@section('js')
	<script src="https://code.highcharts.com/stock/highstock.js"></script>
	<script src="https://code.highcharts.com/modules/exporting.js"></script>
	<script>
	
		$(document).ready(function () {
			
			setInterval(function() {
				window.location.reload();
			}, 60000); 
		
			$('.customTable').DataTable({
				"paging": true,
				"lengthChange": true,
				"searching": true,
				"ordering": true,
				"sorting":[],
				"info": true,
				"autoWidth": false
			});
			$('#daterange').daterangepicker({
				timePicker: true, 
				timePickerIncrement: 1, 
				format: 'YYYY/MM/DD h:mm A',
			});
						
		});
		/* 
				$.getJSON('https://www.highcharts.com/samples/data/jsonp.php?filename=new-intraday.json&callback=?', function (data) {
					console.log(data);
					// create the chart
					Highcharts.stockChart('chartCnt', {


						title: {
							text: 'AAPL stock price by minute'
						},

						subtitle: {
							text: 'Using ordinal X axis'
						},

						xAxis: {
							gapGridLineWidth: 0
						},

						rangeSelector: {
							
							inputEnabled: false,

							buttons: [
							{
								type: 'day',
								count: 1,
								text: '1day'
							},{
								type: 'day',
								count: 3,
								text: '3d'
							}, {
								type: 'week',
								count: 1,
								text: '1w'
							},{
								type: 'week',
								count: 2,
								text: '2w'
							}, {
								type: 'month',
								count: 1,
								text: '1m'
							},{
								type: 'month',
								count: 2,
								text: '2m'
							}, {
								type: 'month',
								count: 6,
								text: '6m'
							}, {
								type: 'year',
								count: 1,
								text: '1y'
							}, {
								type: 'all',
								text: 'All'
							}],
							selected: 3
						},
						
						yAxis: {
						  plotLines: [{
								color: 'blue', // Color value
								dashStyle: 'solid', // Style of the plot line. Default to solid
								value: "{{$percentage50}}", // Value of where the line will appear
								width: 2, // Width of the line    
								label: {
									text: '50%'
								}
							  },{
								color: 'green', // Color value
								dashStyle: 'solid', // Style of the plot line. Default to solid
								value: "{{$percentage75}}", // Value of where the line will appear
								width: 2,  
								label: {
									text: '75%'
								}
							  }	,{
								color: 'yellow', // Color value
								dashStyle: 'solid', // Style of the plot line. Default to solid
								value: "{{$percentage90}}", // Value of where the line will appear
								width:  2,  
								label: {
									text: '90%'
								}     
							  }	,{
								color: 'red', // Color value
								dashStyle: 'solid', // Style of the plot line. Default to solid
								value: "{{$totalPercentage}}", // Value of where the line will appear
								width: 2,  
								label: {
									text: '100%'
								}
							  }	,{
								color: '#ef77c3', // Color value
								dashStyle: 'solid', // Style of the plot line. Default to solid
								value: "{{$station->criticallevel}}", // Value of where the line will appear
								width: 2,  
								label: {
									text: 'Critical Level'
								}
							  }					  
						  ]
						},


						series: [{
							name: 'AAPL',
							type: 'area',
							data: data,
							gapSize: 1,
							tooltip: {
								valueDecimals: 2
							},
							fillColor: {
								linearGradient: {
									x1: 0,
									y1: 0,
									x2: 0,
									y2: 1
								},
								stops: [
									[0, Highcharts.getOptions().colors[0]],
									[1, Highcharts.Color(Highcharts.getOptions().colors[0]).setOpacity(0).get('rgba')]
								]
							},
							threshold: null
						}]
					});
				});
		 */
		$(function(){	
		
			var formData = $('form').serialize();
			
			var url = "{{URL::to('get-chart-rawdata')}}";
			// var url = "https://www.highcharts.com/samples/data/jsonp.php?filename=large-dataset.json&callback=?";
			
			$.ajax({
				type: 'get',
				url: url,
				data: {
					"_token": "{{ csrf_token() }}",
					"daterange": $('.daterange').val(),
					"station_id": $('.station_id').val(),
				},
				success: function (data) {
					
					console.log(data);
					Highcharts.stockChart('chartCnt', {


						title: {
							text: 'AAPL stock price by minute'
						},

						subtitle: {
							text: 'Using ordinal X axis'
						},

						xAxis: {
							gapGridLineWidth: 0
						},

						rangeSelector: {
							
							inputEnabled: false,

							buttons: [
							{
								type: 'day',
								count: 1,
								text: '1day'
							},{
								type: 'day',
								count: 3,
								text: '3d'
							}, {
								type: 'week',
								count: 1,
								text: '1w'
							},{
								type: 'week',
								count: 2,
								text: '2w'
							}, {
								type: 'month',
								count: 1,
								text: '1m'
							},{
								type: 'month',
								count: 2,
								text: '2m'
							}, {
								type: 'month',
								count: 6,
								text: '6m'
							}, {
								type: 'year',
								count: 1,
								text: '1y'
							}, {
								type: 'all',
								text: 'All'
							}],
							selected: 3
						},
						exporting: {
						 enabled: false
						},
						credits: { enabled: false },
						yAxis: {
						  plotLines: [{
								color: 'blue', // Color value
								dashStyle: 'solid', // Style of the plot line. Default to solid
								value: "{{$percentage50}}", // Value of where the line will appear
								width: 2, // Width of the line    
								label: {
									text: '50%'
								}
							  },{
								color: 'green', // Color value
								dashStyle: 'solid', // Style of the plot line. Default to solid
								value: "{{$percentage75}}", // Value of where the line will appear
								width: 2,  
								label: {
									text: '75%'
								}
							  }	,{
								color: 'yellow', // Color value
								dashStyle: 'solid', // Style of the plot line. Default to solid
								value: "{{$percentage90}}", // Value of where the line will appear
								width:  2,  
								label: {
									text: '90%'
								}     
							  }	,{
								color: 'red', // Color value
								dashStyle: 'solid', // Style of the plot line. Default to solid
								value: "{{$totalPercentage}}", // Value of where the line will appear
								width: 2,  
								label: {
									text: '100%'
								}
							  }	,{
								color: '#ef77c3', // Color value
								dashStyle: 'solid', // Style of the plot line. Default to solid
								value: "{{$station->criticallevel}}", // Value of where the line will appear
								width: 2,  
								label: {
									text: 'Critical Level'
								}
							  }					  
						  ]
						},


						series: [{
							name: 'AAPL',
							type: 'area',
							data: data,
							gapSize: 5,
							tooltip: {
								valueDecimals: 2
							},
							fillColor: {
								linearGradient: {
									x1: 0,
									y1: 0,
									x2: 0,
									y2: 1
								},
								stops: [
									[0, Highcharts.getOptions().colors[0]],
									[1, Highcharts.Color(Highcharts.getOptions().colors[0]).setOpacity(0).get('rgba')]
								]
							},
							threshold: null
						}]
					});
				}
			});
		});
		
		
		function selectStation(id){
			if(parseInt(id)>0){
				window.location.href = "{{URL::to('display/')}}/"+id;
			}
			
		}
	</script>
	@endsection