@extends('admin.layout')

@section('css')
<style>

</style>

@endsection

@section('content')
		
        <!-- Content Header (Page header) -->
			
        <section class="content-header">	
			<h1>
				Station
			</h1>
			<ol class="breadcrumb">
				<li class="active"><i class="fa fa-edit"></i> Edit Station</a></li>	
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
							<h3 class="box-title">Edit Station</h3>
						</div>
						
						<form role="form" class="validate" method="post" action="" enctype="multipart/form-data">
							<input type="hidden" name="_token" value="{{ csrf_token() }}">
							<div class="col-md-12">						  
								<div class="col-md-6">						  
									<div class="box-body">
										<div class="form-group">
											<label for="station_id">Station ID</label><span class="required_star">*</span>
											<input type="text" class="form-control" id="station_id" name="station_id" placeholder="Station ID" value="{{$station->station_id}}" required/>
										</div>
									</div>				  
									<div class="box-body">
										<div class="form-group">
											<label for="station_name">Station Name</label><span class="required_star">*</span>
											<input type="text" class="form-control" id="station_name" name="station_name" placeholder="Station Name" value="{{$station->station_name}}" required/>
										</div>
									</div>			  
									<div class="box-body">
										<div class="form-group">
											<label for="station_latitude">Station Latitude</label><span class="required_star">*</span>
											<input type="number" class="form-control" id="station_latitude" name="station_latitude" placeholder="Station Latitude" value="{{$station->station_latitude}}" required/>
										</div>
									</div>		  
									<div class="box-body">
										<div class="form-group">
											<label for="station_longitude">Station Longitude</label><span class="required_star">*</span>
											<input type="number" class="form-control" id="station_longitude" name="station_longitude" placeholder="Station Longitude" value="{{$station->station_longitude}}" required/>
										</div>
									</div>
									<div class="form-group">								
										<label for="project_id"> Project ID</label><span class="required_star">*</span>
										<select name="project_id" class="form-control project_id" required >
											<option value="">Select Project ID</option>
											@foreach($projects as $key=>$val)
												<option value="{{$val->id}}"  @if($station && $station->project_id==$val->id){{'selected'}} @endif  >{{$val->project_name}}</option>
											@endforeach
										</select>
									</div>		
									<div class="box-body">
										<div class="form-group">
											<label for="offset_o">Station Offset</label><span class="required_star">*</span>
											<input type="number" class="form-control" id="offset_o" name="offset_o" placeholder="Station Offset" value="{{$station->offset_o}}" />
										</div>
									</div>		
									<div class="box-body">
										<div class="form-group">
											<label for="calibration_m">Station M</label><span class="required_star"></span>
											<input type="number" class="form-control" id="calibration_m" name="calibration_m" placeholder="Station M"  value="{{$station->calibration_m}}"/>
										</div>
									</div>	
									<div class="box-body">
										<div class="form-group">
											<label for="spike_threshold">Spike Threshold</label><span class="required_star"></span>
											<input type="number" class="form-control" id="spike_threshold" name="spike_threshold" placeholder="Spike Threshold"  value="{{$station->spike_threshold}}"/>
										</div>
									</div>	  
									<div class="box-body">
										<label for="project_id"> Manintenance</label><span class="required_star"></span>
										<div class="form-group">
											<div class="col-md-3">		
												<div class="radio">
													<label>
													  <input type="radio" name="maintenance" id="maintenance1" value="1" @if($station && $station->maintenance==1){{'checked'}}@endif  >
													  True
													</label>
												</div>
											</div>
											<div class="col-md-3">		
												<div class="radio">
													<label>
													  <input type="radio" name="maintenance" id="maintenance2" value="0"  @if($station && $station->maintenance==0){{'checked'}}@endif >
														False
													</label>
												</div>
											</div>
										</div>
									</div>	
								</div>								
								<div class="col-md-6">		
									<div class="box-body">
										<div class="form-group">
											<label for="copelevel">Station Cope Level</label><span class="required_star">*</span>
											<input type="number" class="form-control copelevel" id="copelevel" name="copelevel" placeholder="Station ID" required onblur="setHeight()"  value="{{$station->copelevel}}" />
										</div>
									</div>				  
									<div class="box-body">
										<div class="form-group">
											<label for="invertlevel">Station Invert Level</label><span class="required_star">*</span>
											<input type="number" class="form-control invertlevel" id="invertlevel" name="invertlevel" placeholder="Station Name" required onblur="setHeight()"   value="{{$station->invertlevel}}"  />
										</div>
									</div>			  
									<div class="box-body">
										<div class="form-group">
											<label for="height">Station Height</label><span class="required_star">*</span>
											<input type="number" class="form-control height" id="height" name="height" placeholder="Station Height" required readonly  value="{{$station->height}}"  />
										</div>
									</div>		  
									<div class="box-body">
										<div class="form-group">
											<label for="operationlevel">Station operation level</label><span class="required_star">*</span>
											<input type="number" class="form-control operationlevel" id="operationlevel" name="operationlevel" placeholder="Station operation level" required value="{{$station->operationlevel}}"  />
										</div>
									</div>		  
									<div class="box-body">
										<div class="form-group">
											<label for="criticallevel">Station critical level</label><span class="required_star">*</span>
											<input type="number" class="form-control criticallevel" id="criticallevel" name="criticallevel" placeholder="Station critical level" required value="{{$station->criticallevel}}"  />
										</div>
									</div>
									<div class="box-body">
										<div class="form-group">
											<label for="calibration_c">Station C</label><span class="required_star"></span>
											<input type="number" class="form-control calibration_c" id="calibration_c" name="calibration_c" placeholder="Station C" value="{{$station->calibration_c}}"  />
										</div>
									</div>		  
									<div class="box-body">
										<div class="form-group">
											<label for="delta">Delta</label><span class="required_star"></span>
											<input type="number" class="form-control delta" id="delta" name="delta" placeholder="Delta" value="{{$station->delta}}"  />
										</div>
									</div>		  
									<div class="box-body">
										<div class="form-group">
											<label for="image">Station Image</label><span class="required_star">*</span>
											<input type="file" class="form-control image" id="image" name="image" placeholder="Station Image" />
										</div>
										@if($station->image)
											{{$station->image}}
										@endif
									</div>		  
								</div>
							</div>
							<div class="col-md-6 col-md-offset-3">		
								<div class="box-footer ">
									<div class="col-md-offset-5 col-md-4">
										<button type="submit" class="btn btn-primary">Submit</button>								
										<a href="{{URL::to('station')}}" class="btn btn-default">Back</a>
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
		$('.validate').validate({
			rules: {
				invertlevel: {
					required: true,
					max: function() {
						return parseFloat($('.copelevel').val() || 0);
					}
				}
			}
		});
				
	});

	function setHeight(){ 
		var copelevel = $('.copelevel').val() || 0;
		var invertlevel = $('.invertlevel').val() || 0;
		copelevel = parseFloat(copelevel);
		invertlevel = parseFloat(invertlevel);console.log(copelevel);console.log(invertlevel);console.log((copelevel-invertlevel));
		if(copelevel>0 && invertlevel>0 && (copelevel-invertlevel)>0){
			$('.height').val((copelevel-invertlevel).toFixed(2));
		}
	}
</script>

@endsection

