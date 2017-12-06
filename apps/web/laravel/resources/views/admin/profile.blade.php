<?php 
	
	use App\Helper
	
	
?>
@extends('admin.layout')

@section('css')
<style>

</style>

@endsection

@section('content')

        <section class="content-header">	
			<h1>
				My Profile
			</h1>
			<ol class="breadcrumb">
				<li class="active"><i class="fa fa-edit"></i> Edit Profile</a></li>	
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
					</div><!-- /.box -->	
					@endif
				
				  <!-- general form elements -->
					<div class="box box-primary">
						<div class="box-header with-border">
						  <h3 class="box-title">Edit Profile</h3>
						</div><!-- /.box-header -->
						<!-- form start -->
						<form role="form" class="validate" method="post" action="">
						<input type="hidden" name="_token" value="{{ csrf_token() }}">
						<div class="col-md-6">
						  <div class="box-body">
							<div class="form-group">
							  <label for="username">Username</label><span class="required_star">*</span>
							  <input type="text" class="form-control" id="username" name="username" placeholder="Username" disabled value="@if($user){{$user->username}}@endif" required />
							</div>
							<div class="form-group">
							  <label for="email">Email address</label><span class="required_star">*</span>
							  <input type="email" class="form-control" id="email" name="email" placeholder="Email" disabled value="@if($user){{$user->email}}@endif" required/>
							</div>
						  </div><!-- /.box-body -->
						</div>
						<div class="col-md-6">
						  <div class="box-body">
							<div class="form-group">
							  <label for="password">Password</label>
							  <input type="password" class="form-control" id="password" name="password" placeholder=" Password" required>
							</div>
							<div class="form-group">
							  <label for="cpassword">Confirm Password</label>
							  <input type="password" class="form-control" id="cpassword" name="cpassword" placeholder="Password" required>
							</div>
						  </div><!-- /.box-body -->
						</div>
						  <div class="box-footer ">
							<div class="col-md-offset-5 col-md-4">
								<button type="submit" class="btn btn-primary">Submit</button>
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
			rules:{
				cpassword:{
					equalTo:"#password"
				}
			}
		});
	});
</script>

@endsection

