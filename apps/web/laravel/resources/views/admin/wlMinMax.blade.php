
	@extends('admin.layout')
	
	@section('css')
		<style>		
		</style>
	@endsection
	
	
	@section('content')
	
		<section class="content-header">	
			<h1>
				Water Level Min Max Values
			</h1>
			<ol class="breadcrumb">
				<li class="active"><i class="fa fa-edit"></i>Water Level Min Max Values</a></li>	
			</ol>
        </section>
		<section class="content">
				<!-- left column -->				
					@if(Session::has('success_msg'))
					<div class="box callout callout-success">
						<div class="box-header ">
							{{Session::get('success_msg')}}
							<div class="box-tools pull-right">
								<button class="btn btn-box-tool" data-widget="remove" data-toggle="tooltip" title="Remove"><i class="fa fa-times"></i></button>
							</div>
						</div>
					</div><!-- /.box -->	
					@endif
					@if(Session::has('error_msg'))
					<div class="box callout callout-danger">
						<div class="box-header ">
							{{Session::get('error_msg')}}
							<div class="box-tools pull-right">
								<button class="btn btn-box-tool" data-widget="remove" data-toggle="tooltip" title="Remove"><i class="fa fa-times"></i></button>
							</div>
						</div>
					</div>
					@endif
				
				  <!-- general form elements -->
					<div class="box box-primary">
							<div class="box-header ">
								<h3 class="box-title"></h3>
							</div>
		
								<form action="" method="post" >
									<input type="hidden" name="_token" value="{{ csrf_token() }}" />
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
										<input type="submit" name="submit" class="btn btn-success" value="Show Data"  />
									</div>
								</form>
								
								<table class="customTable table table-bordered table-striped">
									<thead>
									  <tr>
										<th>S.No</th>
										<th>Station ID</th>
										<th>Station Name</th>
										<th>Min</th>
										<th>Min Datetime</th>
										<th>Max</th>
										<th>Max Datetime</th>
									  </tr>
									</thead>
									<tbody>
										
										@foreach($stations as $key=>$val)
											
											<tr>
												<td>{{$key+1}}</td>
												<td>{{$val['station_id']}}</td>
												<td>{{$val['station_name']}}</td>
												<td>{{$val['min']}}</td>
												<td>{{date('d-m-Y H:i',strtotime($val['min_datetime']))}}</td>
												<td>{{$val['max']}}</td>
												<td>{{date('d-m-Y H:i',strtotime($val['max_datetime']))}}</td>
											</tr>
										@endforeach
									</tbody>
								</table>
						</div>
        </section>
				
		
			
	@endsection
	
	
	@section('js')
	
	<script>
	
		$(document).ready(function () {
		
			$('.customTable').DataTable({
				"paging": true,
				"lengthChange": true,
				"searching": true,
				"ordering": true,
				"sorting":[],
				"info": true,
				"autoWidth": false,
				"aaSorting": []
			});
			$('#daterange').daterangepicker({
				timePicker: true, 
				timePickerIncrement: 1, 
				format: 'YYYY/MM/DD HH:mm',
			});
						
		});
		
	</script>
	@endsection