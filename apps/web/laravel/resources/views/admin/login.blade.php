<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8">
    <title>BluGraph BluLevel</title>
	<link href="{{asset('/public/admin/images/favicon.ico')}}" rel="icon" type="image/x-icon" />
	<link rel="apple-touch-icon" href="images/bg.png">
	<link rel="apple-touch-icon" sizes="76x76" href="images/bg.png">
	<link rel="apple-touch-icon" sizes="120x120" href="images/bg.png">
	<link rel="apple-touch-icon" sizes="152x152" href="images/bg.png">
	<link rel="apple-touch-startup-image" href="images/bg.png">
	<meta name="apple-mobile-web-app-capable" content="yes">
	<meta name="apple-mobile-web-app-status-bar-style" content="black">
	
    <meta content='width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no' name='viewport'>
    <!-- Bootstrap 3.3.2 -->
    <link href="{{asset('/public/admin/bootstrap/css/bootstrap.min.css')}}" rel="stylesheet" type="text/css" />
    <!-- Theme style -->
    <link href="{{asset('/public/admin/dist/css/AdminLTE.min.css')}}" rel="stylesheet" type="text/css" />
    <!-- iCheck -->
    <link href="{{asset('/public/admin/plugins/iCheck/square/blue.css')}}" rel="stylesheet" type="text/css" />
	<link href="{{asset('/public/admin/dist/css/skins/_all-skins.min.css')}}" rel="stylesheet" type="text/css" />
  </head>
  <body class="skin-purple">
      <header class="" style="border-bottom: solid 2px; color:#2c2d77; margin:0px; padding:0px;height:80px; background-color:#8dcff2;padding-top:10px;">
			<!-- Logo -->
			<a href="#" class="logo"><b style="font-size:36px;margin:0px; padding:0px;color:#2c2d77;">BluGraph -</b><img src="{{asset('/public/admin/dist/img/pub_big_logo.png')}}" style="margin-left:5px; margin-top:-15px;" alt="PUB" /></a>
			<!-- Header Navbar: style can be found in header.less -->
			<nav class="navbar navbar-static-top" role="navigation" style="margin:0px; padding:0px;">
				<!-- Sidebar toggle button-->
			</nav>
    </header>
		<?php
		
			if (isset($_POST["submit1"]))
			{
				header("Location: ../index.html");
				exit(0); 
			}
		
		?>

    <div class="login-box" style="border:solid 1px;">
      <div class="login-box-body">
        <p class="login-box-msg">Invalid User Name / Password</p>		
		@if(Session::has('error_msg'))
		<div class="alert alert-danger">
		   <button type="button" class="close" data-dismiss="alert" aria-hidden="true"></button>
		   {{Session::get('error_msg')}}
		</div>
		@endif	
        <form action="{{url('auth/login')}}" method="post">
			<input type="hidden" name="_token" value="{{ csrf_token() }}">
          <div class="form-group has-feedback">
            <input type="text" class="form-control" name="username" placeholder="User Name"/>
            <span class="glyphicon glyphicon-envelope form-control-feedback"></span>
          </div>
          <div class="form-group has-feedback">
            <input type="password" class="form-control" name="password" placeholder="Password"/>
            <span class="glyphicon glyphicon-lock form-control-feedback"></span>
          </div>
          <div class="row">
            <div class="col-xs-8">    
            </div><!-- /.col -->
            <div class="col-xs-4">
              <button type="submit" class="btn btn-primary btn-block btn-flat" style="background-color:#551A8B;">Sign In</button>
            </div><!-- /.col -->
          </div>
        </form>
      </div><!-- /.login-box-body -->
    </div><!-- /.login-box -->
    <!-- jQuery 2.1.3 -->
    <script src="{{asset('/public/admin/plugins/jQuery/jQuery-2.1.3.min.js')}}"></script>
    <!-- Bootstrap 3.3.2 JS -->
    <script src="{{asset('/public/admin/bootstrap/js/bootstrap.min.js')}}" type="text/javascript"></script>
  </body>
</html>