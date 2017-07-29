<?php 
	use App\Helper;	
	$segment = Request::segment(1);
	
	$map = Helper::checkAuthFunction(1);
	$project = Helper::checkAuthFunction(2);
	$location = Helper::checkAuthFunction(3);
	$user = Helper::checkAuthFunction(4);
	$menu = Helper::checkAuthFunction(5);
	$menuaccess = Helper::checkAuthFunction(6);
	$dashboardData = Helper::checkAuthFunction(7);
	$summaryData = Helper::checkAuthFunction(8);
	$individualChart = Helper::checkAuthFunction(9);
	$stationGrouping = Helper::checkAuthFunction(10);
	$summary50 = Helper::checkAuthFunction(11);
	$summary75 = Helper::checkAuthFunction(12);
	$wlMaxMin = Helper::checkAuthFunction(13);
	$selfAuditing = Helper::checkAuthFunction(14);
	$smsList = Helper::checkAuthFunction(15);
	$stationGroup = Helper::checkAuthFunction(17);
	
	$username = isset(Auth::user()->username)?(Auth::user()->username):null;
	
?>
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

<body class="skin-purple sidebar-collapse">
    <!-- Site wrapper -->
    <div class="wrapper">

        <header class="main-header">
            <!-- Logo -->
            <a href="{{url('dashboard')}}" class="logo"><b style="color:#1c449c;">BG -</b><img src="{{asset('/public/admin/dist/img/pub_logo.png')}}" style="margin-left:5px;"  alt="PUB" /></a>
            <!-- Header Navbar: style can be found in header.less -->
            <nav class="navbar navbar-static-top" role="navigation">
                <!-- Sidebar toggle button-->
                <a href="#" class="sidebar-toggle" data-toggle="offcanvas" role="button">
                    <span class="sr-only">Toggle navigation</span>
                </a>
                <div class="navbar-custom-menu">
                    <ul class="nav navbar-nav">
                        <!-- User Account: style can be found in dropdown.less -->
                        <li class="dropdown user user-menu">
                            <a href="#" class="dropdown-toggle" data-toggle="dropdown">
                                <img src="{{asset('/public/admin/dist/img/user2-160x160.png')}}" class="user-image" alt="User Image" />
                                <span class="hidden-xs">{{$username}}</span>
                            </a>
                            <ul class="dropdown-menu">
                                <!-- User image -->
                                <li class="user-header">
                                    <img src="{{asset('/public/admin/dist/img/user2-160x160.png')}}" class="img-circle" alt="User Image" />
                                    <p>
                                       {{$username}}
                                    </p>
                                </li>
                                <!-- Menu Footer-->
                                <li class="user-footer">
                                    <div class="pull-left">
                                        <a href="{{url('profile')}}" class="btn btn-default btn-flat">Profile</a>
                                    </div>
                                    <div class="pull-right">
                                        <a href="{{url('logout')}}" class="btn btn-default btn-flat">Sign out</a>
                                    </div>
                                </li>
                            </ul>
                        </li>
                    </ul>
                </div>
            </nav>
        </header>

        <!-- =============================================== -->

        <!-- Left side column. contains the sidebar -->
        <aside class="main-sidebar">
            <!-- sidebar: style can be found in sidebar.less -->
            <section class="sidebar">
                <!-- Sidebar user panel -->
                <!-- search form -->
                <form action="#" method="get">
                </form>
                <!-- /.search form -->
                <!-- sidebar menu: : style can be found in sidebar.less -->
				
                <ul class="sidebar-menu">
					@if($map)
                    <li class="treeview @if($segment=='map' || $segment=='display') active @endif">
                        <a href="{{url('dashboard')}}">
                            <i class="fa fa-map-marker"></i><span>Map</span>
                        </a>
                    </li>
					@endif
                    <!-- Dashboard info start -->
					@if($dashboardData || $summaryData || $individualChart || $stationGrouping || $summary50 || $summary75 || $wlMaxMin || $selfAuditing || $smsList || $stationGroup )
                    <li class="treeview @if($segment=='station-grouping' || $segment=='dashboard-data' || $segment=='summary-data' || $segment=='wl-min-max' || $segment=='wl-summary-50' || $segment=='wl-summary-75' || $segment=='individual-chart' || $segment=='sms-list' || $segment=='view-station-group') active @endif">
						<a href="javascript:;">
                            <i class="fa fa-tachometer"></i><span>Dashboard</span><i class="fa fa-angle-left pull-right"></i>
                        </a>
                        <ul class="treeview-menu">
							@if($dashboardData)
                            <li class="treeview @if($segment=='dashboard-data') active @endif">
                                <a href="{{URL::to('dashboard-data')}}">
                                    <i class="fa fa-list-alt"></i><span>Dashboard data </span>
                                </a>
                            </li>
							@endif
							@if($stationGroup)
                            <li class="treeview @if($segment=='view-station-group') active @endif">
                                <a href="{{URL::to('view-station-group')}}">
                                    <i class="fa fa-building-o"></i><span>View Station Group</span>
                                </a>
                            </li>
							@endif
							@if($summaryData)
                            <li class="treeview @if($segment=='summary-data') active @endif">
                                <a href="{{URL::to('summary-data')}}">
                                    <i class="fa fa-building-o"></i><span>Summary data</span>
                                </a>
                            </li>
							@endif
							@if($individualChart)
                            <li class="treeview @if($segment=='individual-chart') active @endif">
                                <a href="{{URL::to('individual-chart/0')}}">
                                    <i class="fa fa-area-chart"></i><span>Individual chart </span></i>
                                </a>
                            </li>
							@endif
							@if($stationGrouping)
                            <li class="treeview @if($segment=='station-grouping') active @endif">
                                <a href="{{	URL::to('station-grouping') }}" >
                                    <i class="fa fa-users"></i><span>Station grouping</span></i>
                                </a>
                            </li>
							@endif
							@if($summary75)
                            <li class="treeview @if($segment=='wl-summary-75') active @endif">
                                <a href="{{URL::to('wl-summary-75')}}">
                                    <i class="fa fa-chevron-right"></i><span>WL (summary > 75%)</span></i>
                                </a>
                            </li>
							@endif
							@if($summary50)
                            <li class="treeview @if($segment=='wl-summary-50') active @endif">
                                <a href="{{URL::to('wl-summary-50')}}">
                                    <i class="fa fa-angle-right"></i><span>WL (summary > 50%)</span></i>
                                </a>
                            </li>
							@endif
							@if($wlMaxMin)
                            <li class="treeview @if($segment=='wl-min-max') active @endif">
                                <a href="{{URL::to('wl-min-max')}}">
                                    <i class="fa fa-user"></i><span>WL Max-Min values</span></i>
                                </a>
                            </li>
							@endif
							@if($selfAuditing)
                            <li class="treeview @if($segment=='self-auditing') active @endif">
                                <a href="{{URL::to('self-auditing')}}">
                                    <i class="fa fa-book"></i><span>Self Auditing</span></i>
                                </a>
                            </li>
							@endif
							@if($smsList)
                            <li class="treeview @if($segment=='sms-list') active @endif">
                                <a href="{{URL::to('sms-list')}}">
                                    <i class="fa fa-book"></i><span>SMS Subscribers List</span></i>
                                </a>
                            </li>
							@endif
                        </ul>

                    </li>
					@endif
                    <!-- Dashboard info end -->

                    <!-- Administration info start -->
					@if($project || $location || $user || $menu || $menuaccess)
                    <li class="treeview @if($segment=='project' || $segment=='station' || $segment=='user' || $segment=='menu' || $segment=='menu-access') active @endif">
                        <a href="javascript:;">
                            <i class="fa fa-cog"></i><span>Administration</span><i class="fa fa-angle-left pull-right"></i>
                        </a>

                        <ul class="treeview-menu">
							@if($project)
                            <li class="treeview  @if($segment=='project') active @endif">
                                <a href="{{url('project')}}">
                                    <i class="fa fa-list-alt"></i><span>Project </span>
                                </a>
                            </li>
							@endif
							@if($location)
                            <li class="treeview  @if($segment=='station') active @endif">
                                <a href="{{url('station')}}">
                                    <i class="fa fa-building-o"></i><span>Location(Station)</span>
                                </a>
                            </li>
							@endif
							@if($user)
                            <li class="treeview  @if($segment=='user') active @endif">
                                <a href="{{url('user')}}">
                                    <i class="fa fa-user"></i><span>User </span></i>
                                </a>
                            </li>
							@endif
							@if($menu)
                            <li class="treeview  @if($segment=='menu') active @endif">
                                <a href="{{url('menu')}}">
                                    <i class="fa fa-list-ul"></i><span>Menu </span></i>
                                </a>
                            </li>
							@endif
							@if($menuaccess)
                            <li class="treeview  @if($segment=='menu-access') active @endif">
                                <a href="{{url('menu-access/0')}}">
                                    <i class="fa fa-lock"></i><span>Menu Access </span></i>
                                </a>
                            </li>
							@endif
                        </ul>
                    </li>
					@endif

                    <!-- Administration info end -->

                    <!-- Download info start

                    <li class="treeview">
                        <a href="download.php">
                            <i class="fa fa-download"></i><span>Download</span>
                        </a>
                    </li>

                    <!-- Download info end -->

                    <!-- Profile info start -->

                    <li class="treeview @if($segment=='profile') active @endif">
                        <a href="{{url('profile')}}">
                            <i class="fa fa-book"></i><span>My Profile</span>
                        </a>
                    </li>

                    <!-- Profile info end -->
                </ul>
            </section>
            <!-- /.sidebar -->
        </aside>
		
		<div class="content-wrapper">
			@yield('content')
		</div>
        <!-- =============================================== -->

        <footer class="main-footer">
            <strong>Copyright &copy; 2017 <a href="http://blugraph.com">blugraph.com</a>.</strong> All rights reserved.
        </footer>

    </div>
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
    <script src="{{asset('/public/admin/dist/js/app.min.js')}}" type="text/javascript"></script>
	
	@yield('js')
</body>

</html>