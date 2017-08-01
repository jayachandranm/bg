@extends('admin.layout')

@section('css')
<style>

</style>

@endsection

@section('content')
		
        <!-- Content Header (Page header) -->
			
        <section class="content-header">	
			<h1>
				Station Grouping
			</h1>
			<ol class="breadcrumb">
				<li class="active"><i class="fa fa-edit"></i>Station Grouping</a></li>	
			</ol>
        </section>
		<section class="content">
			<div class="row">
				<!-- left column -->
				<div class="col-md-12">	
				
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
						<div class="box-header with-border">
							<h3 class="box-title">Station Grouping</h3>
						</div>
						
						<form role="form" class="validate" method="post" action="" enctype="multipart/form-data">
							<input type="hidden" name="_token" value="{{ csrf_token() }}">
							
							<div class="box-body">
								<table class="customTable table table-bordered table-striped">
									<thead>
									  <tr>
										<th>S.No</th>
										<th>Group Name</th>
										<th>Station1</th>
										<th>Station2</th>
										<th>Station3</th>
										<th>Station4</th>
										<th>Selection</th>
									  </tr>
									</thead>
									<tbody>
										
										@foreach($grouping as $key=>$v)
											<tr>
												<td>{{$key+1}}</td>
												<td><input type="text" class="form-control" id="group_name" name="group_name[{{$v->id}}]" placeholder="Group Name" value="{{$v->group_name}}" /></td>
												<td>
													<select class="form-control select2 station" name="station1[{{$v->id}}]" style="width: 100%;" >
													<option value="">Select Station</option>
													@foreach($stations as $val)
														<option value="{{$val->id}}" @if($v->station1==$val->id){{'selected'}}@endif >{{$val->station_id}}</option>
													@endforeach
													</select>
												</td>
												<td>
													<select class="form-control select2 station" name="station2[{{$v->id}}]" style="width: 100%;" >
													<option value="">Select Station</option>
													@foreach($stations as $val)
														<option value="{{$val->id}}" @if($v->station2==$val->id){{'selected'}}@endif>{{$val->station_id}}</option>
													@endforeach
													</select>
												</td>
												<td>
													<select class="form-control select2 station" name="station3[{{$v->id}}]" style="width: 100%;" >
													<option value="">Select Station</option>
													@foreach($stations as $val)
														<option value="{{$val->id}}" @if($v->station3==$val->id){{'selected'}}@endif>{{$val->station_id}}</option>
													@endforeach
													</select>
												</td>
												<td>
													<select class="form-control select2 station" name="station4[{{$v->id}}]" style="width: 100%;" >
													<option value="">Select Station</option>
													@foreach($stations as $val)
														<option value="{{$val->id}}" @if($v->station4==$val->id){{'selected'}}@endif>{{$val->station_id}}</option>
													@endforeach
													</select>
												</td>
												<td><input type="radio" name="selection" value="{{$v->id}}" @if($v->is_active==0){{'checked'}}@endif required /></td>
											</tr>
										@endforeach
									</tbody>
								</table>
							</div>
							<div class="col-md-6 col-md-offset-3">		
								<div class="box-footer ">
									<div class="col-md-offset-4 col-md-6">
										<button type="submit" class="btn btn-primary">Submit</button>								
										<button type="reset" class="btn btn-default">&nbsp; Reset &nbsp;</button>		
									</div>
								</div>
							</div>
						</form>
					</div><!-- /.box -->
				</div>
			</div>
		</section>


        <!-- Main content -->
        

@endsection

@section('js')

<script>
	$(document).ready(function () {
		$('.validate').validate();
		$(".select2").select2();	
		
	});
</script>

@endsection

