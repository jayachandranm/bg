
	@extends('admin.layout')
	
	@section('css')
		<style>		
		</style>
	@endsection
	
	
	@section('content')
	
		<section class="content-header">	
			<h1>
				SMS Subscribers List
			</h1>
			<ol class="breadcrumb">
				<li class="active"><i class="fa fa-edit"></i>SMS Subscribers List</a></li>	
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
								<table class="customTable table table-bordered table-striped">
									<thead>
									  <tr>
										<th>S.No</th>
										<th>Station ID</th>
										<th>Station Name</th>
										<th>User Name</th>
										<th>User Phone</th>
									  </tr>
									</thead>
									<tbody>	
										<?php $i=1; ?>
										@foreach($stations as $key=>$val)											
											<tr>
												<td>{{$i}}</td>
												<td>{{$val['station_id']}}</td>
												<td>{{$val['station_name']}}</td>
												<td>
													@if(is_array($val['username']))
														@foreach($val['username'] as $k=>$v)
															@if($k>0)
																<br/>
															@endif
															{{$v}}
														@endforeach
													@endif
												</td>
												<td>
													@if(is_array($val['mobile']))
														@foreach($val['mobile'] as $k=>$v)
															@if($k>0)
																<br/>
															@endif
															{{$v}}
														@endforeach
													@endif
												</td>
											</tr>
											<?php $i++; ?>
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
						
		});
		
	</script>
	@endsection