	
	@extends('admin.layoutwlsummary')
	
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
			color: #000000;
			font-weight: 900;
			font-size:12px;
		}
		</style>
	@endsection
	
	
	@section('content')
			<div class="col-md-12 box-header with-border">
				<h3 class="col-md-6">
					WL (summary > 50%)
					<div class="clear"></div>
				</h3>	
				<h3 class="col-md-6">
					{{date('d-m-Y H:i')}}
					<div class="clear"></div>
				</h3>				
			</div>
			
			<div class="col-md-12 main-cnt">
				@if( $s1->station_id==0 && $s2->station_id==0 && $s3->station_id==0 && $s4->station_id==0 )
						<h3>No Station Available!</h3>
						<br/><br/><br/><br/><br/><br/><br/><br/><br/><br/>
				@endif
				
				@if($s1->station_id>0)
				<div class="@if($totalCount=1 || $totalCount==3) col-md-6 @else col-md-6 @endif chart">
					<div id="chartCnt1">
									
					</div>
					<div  class="col-md-6">
						<p><label>Cope Level: {{$s1->copelevel}}</label></p>
						<p><label>Invert Level: {{$s1->invertlevel}}</label></p>
						<p><label>Operation Level: {{$s1->operationlevel}}</label></p>
					</div>
					<div  class="col-md-6">
						<p><label>Max: {{$s1->max}}</label></p>
						<p><label>Min: {{$s1->min}}</label></p>
						<p><label>Current Water Level: {{$s1->waterlever_mrl}}</label></p>
					</div>
				</div>
				@endif
				@if($s2->station_id>0)
				<div class="@if($totalCount=1 || $totalCount==3) col-md-6 @else col-md-6 @endif chart">
					<div id="chartCnt2">
									
					</div>
					<div  class="col-md-6">
						<p><label>Cope Level: {{$s2->copelevel}}</label></p>
						<p><label>Invert Level: {{$s2->invertlevel}}</label></p>
						<p><label>Operation Level: {{$s2->operationlevel}}</label></p>
					</div>
					<div  class="col-md-6">
						<p><label>Max: {{$s2->max}}</label></p>
						<p><label>Min: {{$s2->min}}</label></p>
						<p><label>Current Water Level: {{$s2->waterlever_mrl}}</label></p>
					</div>
				</div>
				@endif
				@if($s3->station_id>0)
				<div class="@if($totalCount=1 || $totalCount==3) col-md-6 @else col-md-6 @endif chart">
					<div id="chartCnt3">
									
					</div>
					<div  class="col-md-6">
						<p><label>Cope Level: {{$s3->copelevel}}</label></p>
						<p><label>Invert Level: {{$s3->invertlevel}}</label></p>
						<p><label>Operation Level: {{$s3->operationlevel}}</label></p>
					</div>
					<div  class="col-md-6">
						<p><label>Max: {{$s3->max}}</label></p>
						<p><label>Min: {{$s3->min}}</label></p>
						<p><label>Current Water Level: {{$s3->waterlever_mrl}}</label></p>
					</div>
				</div>
				@endif
				@if($s4->station_id>0)
				<div class="@if($totalCount=1 || $totalCount==3) col-md-6 @else col-md-6 @endif chart">
					<div id="chartCnt4">
									
					</div>
					<div  class="col-md-6">
						<p><label>Cope Level: {{$s4->copelevel}}</label></p>
						<p><label>Invert Level: {{$s4->invertlevel}}</label></p>
						<p><label>Operation Level: {{$s4->operationlevel}}</label></p>
					</div>
					<div  class="col-md-6">
						<p><label>Max: {{$s4->max}}</label></p>
						<p><label>Min: {{$s4->min}}</label></p>
						<p><label>Current Water Level: {{$s4->waterlever_mrl}}</label></p>
					</div>
				</div>
				@endif
			</div>
			<div class="col-md-12 box-header with-border">
				<h3 class="col-md-6">
					&nbsp;
					<div class="clear"></div>
				</h3>	
				<h3 class="col-md-6">
					&nbsp;
					<div class="clear"></div>
				</h3>				
			</div>
			
	@endsection
	
	
	@section('js')
	<script>
			
		$(function(){	
		
			Highcharts.setOptions({
				global: {
					useUTC: false
				}, 
				lang:{
					rangeSelectorZoom: ''
				}
			});
			var url = "{{URL::to('get-dashboard-rawdata')}}";
			
			
			@if($s1->station_id>0)
			
				$.ajax({
					type: 'post',
					url: url,
					data: {
						"_token": "{{ csrf_token() }}",
						"station_id": "{{$s1->station_id}}",
					},
					success: function (data) {
						
						// console.log(data);
						
						Highcharts.stockChart('chartCnt1', {

							chart: {
								zoomType: 'x'
							},
							title: {
								text: "{{$s1->stationID.' - '.$s1->name}}"
							},

							subtitle: {
								text: ''
							},

							xAxis: {
								gapGridLineWidth: 0
							},
							
							yAxis: {
							  plotLines: [{
									color: 'blue', // Color value
									dashStyle: 'solid', // Style of the plot line. Default to solid
									value: "{{$s1->percentage50}}", // Value of where the line will appear
									width: 2, // Width of the line    
									label: {
										text: '50%'
									}
								  },{
									color: 'green', // Color value
									dashStyle: 'solid', // Style of the plot line. Default to solid
									value: "{{$s1->percentage75}}", // Value of where the line will appear
									width: 2,  
									label: {
										text: '75%'
									}
								  }	,{
									color: 'yellow', // Color value
									dashStyle: 'solid', // Style of the plot line. Default to solid
									value: "{{$s1->percentage90}}", // Value of where the line will appear
									width:  2,  
									label: {
										text: '90%'
									}     
								  }	,{
									color: 'red', // Color value
									dashStyle: 'solid', // Style of the plot line. Default to solid
									value: "{{$s1->totalPercentage}}", // Value of where the line will appear
									width: 2,  
									label: {
										text: '100%'
									}
								  }	,{
									color: '#ef77c3', // Color value
									dashStyle: 'solid', // Style of the plot line. Default to solid
									value: "{{$s1->criticallevel}}", // Value of where the line will appear
									width: 2,  
									label: {
										text: 'Critical Level'
									}
								  }					  
							  ],
							  
							  max:{{$s1->ymax}}
							},
							scrollbar: {
								enabled: false
							},
							navigator: 
							{
								enabled: false
							},

							rangeSelector: {
								
								inputEnabled: false,

								buttons: [{
								type: 'all',
								text: 'Reset'
							}]
							},
							
							tooltip: {
								formatter: function() {
									console.log(this);
									return  '<b>Water Level:' + (this.y).toFixed(2) +' mRL</b><br/>Datetime:' +
										Highcharts.dateFormat('%A %e-%b -%Y %H:%M',new Date(this.x));
								}
							},
							exporting: {
							 enabled: false
							},
							credits: { enabled: false },
							series: [{
								name: 'Water Level',
								data: data,
								tooltip: {
									valueDecimals: 2
								}
							}]
						});
						
					}
				});
			@endif
			@if($s2->station_id>0)
				$.ajax({
					type: 'post',
					url: url,
					data: {
						"_token": "{{ csrf_token() }}",
						"station_id": "{{$s2->station_id}}",
					},
					success: function (data) {
						
						console.log(data);
						
						Highcharts.stockChart('chartCnt2', {
							chart: {
								zoomType: 'x'
							},

							title: {
								text: "{{$s2->stationID.' - '.$s2->name}}"
							},

							subtitle: {
								text: ''
							},

							xAxis: {
								gapGridLineWidth: 0
							},
							
							tooltip: {
								formatter: function() {
									console.log(this);
									return  '<b>Water Level:' + (this.y).toFixed(2) +' mRL</b><br/>Datetime:' +
										Highcharts.dateFormat('%A %e-%b -%Y %H:%M',new Date(this.x));
								}
							},
							yAxis: {
							  plotLines: [{
									color: 'blue', // Color value
									dashStyle: 'solid', // Style of the plot line. Default to solid
									value: "{{$s2->percentage50}}", // Value of where the line will appear
									width: 2, // Width of the line    
									label: {
										text: '50%'
									}
								  },{
									color: 'green', // Color value
									dashStyle: 'solid', // Style of the plot line. Default to solid
									value: "{{$s2->percentage75}}", // Value of where the line will appear
									width: 2,  
									label: {
										text: '75%'
									}
								  }	,{
									color: 'yellow', // Color value
									dashStyle: 'solid', // Style of the plot line. Default to solid
									value: "{{$s2->percentage90}}", // Value of where the line will appear
									width:  2,  
									label: {
										text: '90%'
									}     
								  }	,{
									color: 'red', // Color value
									dashStyle: 'solid', // Style of the plot line. Default to solid
									value: "{{$s2->totalPercentage}}", // Value of where the line will appear
									width: 2,  
									label: {
										text: '100%'
									}
								  }	,{
									color: '#ef77c3', // Color value
									dashStyle: 'solid', // Style of the plot line. Default to solid
									value: "{{$s2->criticallevel}}", // Value of where the line will appear
									width: 2,  
									label: {
										text: 'Critical Level'
									}
								  }					  
							  ],
							  
							  max:{{$s2->ymax}}
							},
							
							scrollbar: {
								enabled: false
							},
							navigator: 
							{
								enabled: false
							},

							
							rangeSelector: {
								
								inputEnabled: false,
								buttons: [{
								type: 'all',
								text: 'Reset'
							}]
							},
							
							exporting: {
							 enabled: false
							},
							credits: { enabled: false },
							series: [{
								name: 'Water Level',
								data: data,
								tooltip: {
									valueDecimals: 2
								}
							}]
						});
						
					}
				});
			@endif
			@if($s3->station_id>0)
				
				$.ajax({
					type: 'post',
					url: url,
					data: {
						"_token": "{{ csrf_token() }}",
						"station_id": "{{$s3->station_id}}",
					},
					success: function (data) {
						
						console.log(data);
						
						Highcharts.stockChart('chartCnt3', {
							chart: {
								zoomType: 'x'
							},

							title: {
								text: "{{$s3->stationID.' - '.$s3->name}}"
							},

							subtitle: {
								text: ''
							},

							xAxis: {
								gapGridLineWidth: 0
							},
							
							tooltip: {
								formatter: function() {
									console.log(this);
									return  '<b>Water Level:' + (this.y).toFixed(2) +' mRL</b><br/>Datetime:' +
										Highcharts.dateFormat('%A %e-%b -%Y %H:%M',new Date(this.x));
								}
							},
							yAxis: {
							  plotLines: [{
									color: 'blue', // Color value
									dashStyle: 'solid', // Style of the plot line. Default to solid
									value: "{{$s3->percentage50}}", // Value of where the line will appear
									width: 2, // Width of the line    
									label: {
										text: '50%'
									}
								  },{
									color: 'green', // Color value
									dashStyle: 'solid', // Style of the plot line. Default to solid
									value: "{{$s3->percentage75}}", // Value of where the line will appear
									width: 2,  
									label: {
										text: '75%'
									}
								  }	,{
									color: 'yellow', // Color value
									dashStyle: 'solid', // Style of the plot line. Default to solid
									value: "{{$s3->percentage90}}", // Value of where the line will appear
									width:  2,  
									label: {
										text: '90%'
									}     
								  }	,{
									color: 'red', // Color value
									dashStyle: 'solid', // Style of the plot line. Default to solid
									value: "{{$s3->totalPercentage}}", // Value of where the line will appear
									width: 2,  
									label: {
										text: '100%'
									}
								  }	,{
									color: '#ef77c3', // Color value
									dashStyle: 'solid', // Style of the plot line. Default to solid
									value: "{{$s3->criticallevel}}", // Value of where the line will appear
									width: 2,  
									label: {
										text: 'Critical Level'
									}
								  }					  
							  ],
							  
							  max:{{$s3->ymax}}
							},
							
							exporting: {
							 enabled: false
							},
							credits: { enabled: false },
							
							scrollbar: {
								enabled: false
							},
							navigator: 
							{
								enabled: false
							},
							
							rangeSelector: {
								
								inputEnabled: false,
								buttons: [{
								type: 'all',
								text: 'Reset'
							}]
							},
							
							series: [{
								name: 'Water Level',
								data: data,
								tooltip: {
									valueDecimals: 2
								}
							}]
						});
						
					}
				});
			@endif
			@if($s4->station_id>0)			
				$.ajax({
					type: 'post',
					url: url,
					data: {
						"_token": "{{ csrf_token() }}",
						"station_id": "{{$s4->station_id}}",
					},
					success: function (data) {
						
						console.log(data);
						
						Highcharts.stockChart('chartCnt4', {

							chart: {
								zoomType: 'x'
							},
							title: {
								text: "{{$s4->stationID.' - '.$s4->name}}"
							},

							subtitle: {
								text: ''
							},

							xAxis: {
								gapGridLineWidth: 0
							},
							
							tooltip: {
								formatter: function() {
									console.log(this);
									return  '<b>Water Level:' + (this.y).toFixed(2) +' mRL</b><br/>Datetime:' +
										Highcharts.dateFormat('%A %e-%b -%Y %H:%M',new Date(this.x));
								}
							},
							yAxis: {
							  plotLines: [{
									color: 'blue', // Color value
									dashStyle: 'solid', // Style of the plot line. Default to solid
									value: "{{$s3->percentage50}}", // Value of where the line will appear
									width: 2, // Width of the line    
									label: {
										text: '50%'
									}
								  },{
									color: 'green', // Color value
									dashStyle: 'solid', // Style of the plot line. Default to solid
									value: "{{$s3->percentage75}}", // Value of where the line will appear
									width: 2,  
									label: {
										text: '75%'
									}
								  }	,{
									color: 'yellow', // Color value
									dashStyle: 'solid', // Style of the plot line. Default to solid
									value: "{{$s3->percentage90}}", // Value of where the line will appear
									width:  2,  
									label: {
										text: '90%'
									}     
								  }	,{
									color: 'red', // Color value
									dashStyle: 'solid', // Style of the plot line. Default to solid
									value: "{{$s3->totalPercentage}}", // Value of where the line will appear
									width: 2,  
									label: {
										text: '100%'
									}
								  }	,{
									color: '#ef77c3', // Color value
									dashStyle: 'solid', // Style of the plot line. Default to solid
									value: "{{$s3->criticallevel}}", // Value of where the line will appear
									width: 2,  
									label: {
										text: 'Critical Level'
									}
								  }					  
							  ],
							  
							  max:{{$s4->ymax}}
							},
							
							exporting: {
							 enabled: false
							},
							credits: { enabled: false },
							
							scrollbar: {
								enabled: false
							},
							navigator: 
							{
								enabled: false
							},
							
							rangeSelector: {
								
								inputEnabled: false,
								buttons: [{
								type: 'all',
								text: 'Reset'
							}]
							},
							
							series: [{
								name: 'Water Level',
								data: data,
								tooltip: {
									valueDecimals: 2
								}
							}]
						});
						
					}
				}); 
			@endif
			
			
			
		});
	</script>
	@endsection