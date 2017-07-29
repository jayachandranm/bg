
<!DOCTYPE html>
<html>

<head>
    <meta charset="UTF-8">
    <title>BluGraph BluLevel</title>
    <link href="{{asset('/favicon.ico')}}" rel="icon" type="image/x-icon" />
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
    <!-- Font Awesome Icons -->
    <link href="https://maxcdn.bootstrapcdn.com/font-awesome/4.3.0/css/font-awesome.min.css" rel="stylesheet" type="text/css" />
    <!-- Ionicons -->
    <link href="https://code.ionicframework.com/ionicons/2.0.1/css/ionicons.min.css" rel="stylesheet" type="text/css" />
    <!-- DATA TABLES -->
    <link href="{{asset('/public/admin/plugins/datatables/dataTables.bootstrap.css')}}" rel="stylesheet" type="text/css" />
    <link href="{{asset('/public/admin/plugins/select2/select2.min.css')}}" rel="stylesheet" type="text/css" />
    <link href="{{asset('/public/admin/plugins/daterangepicker/daterangepicker-bs3.css')}}" rel="stylesheet" type="text/css" />
    <!-- Theme style -->
    <link href="{{asset('/public/admin/dist/css/AdminLTE.min.css')}}" rel="stylesheet" type="text/css" />
    <!-- AdminLTE Skins. Choose a skin from the css/skins 
         folder instead of downloading all of them to reduce the load. -->
    <link href="{{asset('/public/admin/dist/css/skins/_all-skins.min.css')}}" rel="stylesheet" type="text/css" />
    <link href="{{asset('/public/admin/dist/css/style.css')}}" rel="stylesheet" type="text/css" />

    <!-- HTML5 Shim and Respond.js IE8 support of HTML5 elements and media queries -->
    <!-- WARNING: Respond.js doesn't work if you view the page via file:// -->
    <!--[if lt IE 9]>
        <script src="https://oss.maxcdn.com/libs/html5shiv/3.7.0/html5shiv.js"></script>
        <script src="https://oss.maxcdn.com/libs/respond.js/1.3.0/respond.min.js"></script>
    <![endif]-->
	@yield('css')
</head>

<body class="skin-purple">
    <!-- Site wrapper -->
    
			@yield('content')
		
    <!-- ./wrapper -->
    <!-- jQuery 2.1.3 -->
    <script src="{{asset('/public/admin/plugins/jQuery/jQuery-2.1.3.min.js')}}"></script>
		
    <script src="{{URL::to('public/admin/dist/js/jquery.validate.js')}}"></script>
    <!-- Bootstrap 3.3.2 JS -->
    <script src="{{asset('/public/admin/bootstrap/js/bootstrap.min.js')}}" type="text/javascript"></script>
    <!-- SlimScroll -->
    <script src="{{asset('/public/admin/plugins/slimScroll/jquery.slimScroll.min.js')}}" type="text/javascript"></script>
	
    <script src="{{asset('public/admin/plugins/datatables/jquery.dataTables.js')}}"></script>
	
    <script src="{{asset('public/admin/plugins/datatables/dataTables.bootstrap.js')}}"></script>
    <script src="{{asset('public/admin/plugins/daterangepicker/daterangepicker.js')}}"></script>
    <!-- FastClick -->
    <script src="{{asset('/public/admin/plugins/fastclick/fastclick.min.js')}}"></script>
    <script src="{{asset('/public/admin/plugins/select2/select2.full.min.js')}}"></script>
    <script src="{{asset('/public/admin/plugins/select2/select2.full.min.js')}}"></script>
    <!-- AdminLTE App -->
	
	@yield('js')
</body>

</html>