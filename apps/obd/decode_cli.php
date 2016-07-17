<?php

include('obdConstants.php');
include('PackageClass.php');

$_spawn;
$_socket;

$data = ReadDataFromSocket();

if( $data)
{
	echo "Data Recvd: ".$data."\n\n";
	$packageType = findPackageType($data);
	//$data = $_GET["rawdata"];

	switch($packageType)
	{
		case PACKAGE_LOGIN:
			$data_package = DivideLoginPackageData($data);
			$data_package->setpackageType(PACKAGE_LOGIN);
			DecodeLoginPackage($data_package);
			$LoginResponse = BuildLoginResponse($data_package);
			SendLoginResponse($LoginResponse);
			break;
		case PACKAGE_OBD_DATA_FLOW_SUPPORTED:
			break;
		case PACKAGE_DTC_PACKAGE_FOR_PASSENGER_CAR:
			break;
		case PACKAGE_SNAPSHOOT_FREEZE_FRAME_PACKAGE:
			break;
		case PACKAGE_GPS_DATA_PACKAGE:
			break;
		case PACKAGE_OBD_PID_DATA_PACKAGE:
			break;
		case PACKAGE_ALARMS_DATA_PACKAGE_UPLOAD:
			break;
		case PACKAGE_GSENSOR_DATA_PACKAGE:
			break;
		case PACKAGE_SET_REPLY_PACKAGE:
			break;
		case PACKAGE_QUERY_RESPONSE_PACKAGE:
			break;
		case PACKAGE_HEARTBEAT_PACKAGE:
			break;
		case PACKAGE_CANCELLATION_PACKAGE:
			break;
		default:
			break;
	}
	//exit();
}



function ReadDataFromSocket()
{
	$host = "127.0.0.1";
	$port = 39003;
	// don't timeout!
	set_time_limit(0);
	// create socket
	$socket = socket_create(AF_INET, SOCK_STREAM, 0) or die("Could not create socket\n");
	$GLOBALS['_socket'] = $socket;
	// bind socket to port
	$result = socket_bind($socket, $host, $port) or die("Could not bind to socket\n");
	// start listening for connections
	$result = socket_listen($socket, 3) or die("Could not set up socket listener\n");

	// accept incoming connections
	// spawn another socket to handle communication
	$spawn = socket_accept($socket) or die("Could not accept incoming connection\n");
	$GLOBALS['_spawn'] = $spawn;
	// read client input
	$input = socket_read($spawn, 1024) or die("Could not read input\n");
	//socket_close($spawn);
	//socket_close($socket);
	return $input;
}

function getCommandtype($commandtype) {
	$packType = -1;
	switch($commandtype)
	{
		case PACKAGE_LOGIN_CMD:
		$packageType = "Login Package";
		$packType = PACKAGE_LOGIN;
		echo "Package Type: Login Package"."<br/>";
		break;

		case PACKAGE_OBD_DATA_FLOW_SUPPORTED_CMD:
		$packageType = "OBD data flow supported";
		$packType = PACKAGE_OBD_DATA_FLOW_SUPPORTED;
		echo "Package Type: OBD data flow supported"."<br/>";
		break;

		case PACKAGE_DTC_PACKAGE_FOR_PASSENGER_CAR_CMD:
		$packageType = "DTC package for passenger car";
		$packType = PACKAGE_DTC_PACKAGE_FOR_PASSENGER_CAR;
		echo "Package Type: DTC package for passenger car"."<br/>";
		break;

		case PACKAGE_SNAPSHOOT_FREEZE_FRAME_PACKAGE_CMD:
		$packageType = "Snapshoot& freeze frame package";
		$packType = PACKAGE_SNAPSHOOT_FREEZE_FRAME_PACKAGE;
		echo "Package Type: Snapshoot& freeze frame package"."<br/>";
		break;

		case PACKAGE_GPS_DATA_PACKAGE_CMD:
		$packageType = "GPS data package";
		$packType = PACKAGE_GPS_DATA_PACKAGE;
		echo "Package Type: GPS data package"."<br/>";
		break;

		case PACKAGE_OBD_PID_DATA_PACKAGE_CMD:
		$packageType = "OBD PID data package";
		$packType = PACKAGE_OBD_PID_DATA_PACKAGE;
		echo "Package Type: OBD PID data package"."<br/>";
		break;

		case PACKAGE_ALARMS_DATA_PACKAGE_UPLOAD_CMD:
		$packageType = "Alarms data package upload";
		$packType = PACKAGE_ALARMS_DATA_PACKAGE_UPLOAD;
		echo "Package Type: Alarms data package upload"."<br/>";
		break;

		case PACKAGE_GSENSOR_DATA_PACKAGE_CMD:
		$packageType = "G-Sensor data package";
		$packType = PACKAGE_GSENSOR_DATA_PACKAGE;
		echo "Package Type: G-Sensor data package"."<br/>";
		break;

		case PACKAGE_SET_REPLY_PACKAGE_CMD:
		$packageType = "Set reply package";
		$packType = PACKAGE_SET_REPLY_PACKAGE;
		echo "Package Type: Set reply package"."<br/>";
		break;

		case PACKAGE_QUERY_RESPONSE_PACKAGE_CMD:
		$packageType = "Query response package";
		$packType = PACKAGE_QUERY_RESPONSE_PACKAGE;
		echo "Package Type: Query response package"."<br/>";
		break;

		case PACKAGE_HEARTBEAT_PACKAGE_CMD:
		$packageType = "Heartbeat package";
		$packType = PACKAGE_HEARTBEAT_PACKAGE;
		echo "Package Type: Heartbeat package"."<br/>";
		break;

		case PACKAGE_CANCELLATION_PACKAGE_CMD:
		$packageType = "Cancellation package";
		$packType = PACKAGE_CANCELLATION_PACKAGE;
		echo "Package Type: Cancellation package"."<br/>";
		break;

		default:
		$packageType = "";
		$packType = -1;
		echo "Package Type: Not supported"."<br/>";
		break;
	}
	return $packType;
}

function findPackageType($rawdata) {
	$commandtype = substr ( $rawdata , 50 ,4);
	return getCommandtype($commandtype);
}

function DivideLoginPackageData($data){
	$data_package = new PackageData();

	echo "*****************************************************************************************"."<br/>";
	echo "*                RawData Upload Packages:                                                               *"."<br/>";
	echo "*                                                                                       *"."<br/>";
	echo "*****************************************************************************************"."<br/>";
	echo "<br/>";
	echo "RawData: ". $data."<br/>"."<br/>";
	echo "<br/>"."<br/>";
	echo "*****************************************************************************************"."<br/>";
	echo "*                Data Breakup:                                                          *"."<br/>";
	echo "*                                                                                       *"."<br/>";
	echo "*****************************************************************************************"."<br/>";
	echo "<br/>";

	$header = substr ( $data , 0 ,4);
	echo "Header: ". $header."<br/>";
	$data_package->setHeader($header);

	$length = substr ( $data , 4 ,4);
	echo "length: ". $length."<br/>";
	$data_package->setLength($length);

	$version = substr ( $data , 8 ,2);
	echo "Version: ". $version."<br/>";
	$data_package->setVersion($version);

	$dev_id = substr ( $data , 10 ,40); //show in ascii as �1001112529987�
	echo "dev_id: ". $dev_id."<br/>";
	$data_package->setdevID($dev_id);

	$commandtype = substr ( $data , 50 ,4);
	echo "commandtype: ". $commandtype."<br/>";
	$data_package->setCommandType($commandtype);

	$param1 = substr ( $data , 54 ,68);
	echo "param1: ". $param1."<br/>";
	$data_package->setparam1($param1);

	$param2 = substr ( $data , 122 ,40);
	echo "param2: ". $param2."<br/>";
	$data_package->setparam2($param2);

	$param3 = substr ( $data , 162 ,40);
	echo "param3: ". $param3."<br/>";
	$data_package->setparam3($param3);

	$param4 = substr ( $data , 202 ,40);
	echo "param4: ". $param4."<br/>";
	$data_package->setparam4($param4);

	$param5 = substr ( $data , 242 ,4);
	echo "param5: ". $param5."<br/>";
	$data_package->setparam5($param5);

	$crc = substr ( $data , 246 ,4);
	echo "crc: ". $crc."<br/>";
	$data_package->setCRC($crc);

	$tail = substr ( $data , 250 ,4);
	echo "tail: ". $tail."<br/>";
	$data_package->setTail($tail);
	echo "<br/>"."<br/>";

	return $data_package;
}

function DecodeLoginPackage(PackageData $data_package)
{
	echo "*****************************************************************************************"."<br/>";
	echo "*               Data Decode:                                                             *"."<br/>";
	echo "*                                                                                       *"."<br/>";
	echo "*****************************************************************************************"."<br/>";

	$len = DecodeLength($data_package->getLength());
	echo "Length: ". $len."<br/>";

	$devID = DecodeDeviceID($data_package->getdevID());
	echo "Dev Id: ". $devID."<br/>";

	DecodeParam1($data_package->getparam1());
	DecodeParam2($data_package->getparam2());
}

function DecodeLength($length)
{
	$lowtohigh = substr($length, 2, 2).substr($length, 0,2);
	return hexdec ($lowtohigh);
}

function DecodeDeviceID($devid)
{
	$devIDChar = "";
	for($i = 0; $i < 40; $i+= 2)
	{
		$val = intval(substr($devid, $i, 2));
		if($val >= 30)
		{
			$devIDChar .= ($val - 30);
		}
	}

	return $devIDChar;
}

function DecodeParam1($param1)
{
	echo "***********Param 1***********"."<br/>";
	//$AccOnTime
	$AccOnTime = substr($param1, 0, 8);
	$AccOnTimeFormatted = date("Y-m-d\TH:i:s\Z",intval($AccOnTime));
	echo "AccOnTimeFormatted: ".$AccOnTimeFormatted."<br/>";

	//$UTCTime
	$UTCTime = substr($param1, 8, 8);
	$UTCTimeFormatted = date("Y-m-d\TH:i:s\Z",intval($UTCTime));
	echo "UTCTimeFormatted: ".$UTCTimeFormatted."<br/>";

	//$Total Mileage
	$TotalMileage = substr($param1, 16, 8);
	$TotalMileageFormatted = "";
	for($i = 7; $i > 0; $i-= 2)
	{
		$val = (substr($TotalMileage, $i-1, 2));
		$TotalMileageFormatted .= $val;

	}
	$TotalMileage = hexdec ($TotalMileageFormatted);
	echo "Total Mileage: ".$TotalMileage." meter"."<br/>";

	//CurrentTripMilege
	$CurrentTripMilege = substr($param1, 24, 8);
	echo "CurrentTripMilege: ".$CurrentTripMilege."<br/>";

	//Total Fuel Consumption
	$TotalFuelConsumption = substr($param1, 32, 8);
	$FuelConsumed = "";
	for($i = 7; $i > 0; $i-= 2)
	{
		$val = substr($TotalFuelConsumption, $i-1, 2);
		$FuelConsumed .= $val;
	}
	$TotalFuelConsumed = hexdec ($FuelConsumed) * 0.01;
	echo "TotalFuelConsumed: ".$TotalFuelConsumed."<br/>";

	//Current Trip Fuel Consumption
	$CurrentTripFuelCon = substr($param1, 40, 4);
	$CurrentTripFuel = "";
	for($i = 3; $i > 0; $i-= 2)
	{
		$val = substr($CurrentTripFuelCon, $i-1, 2);
		$CurrentTripFuel .= $val;
	}
	$CurrentTripFuelComsumed = hexdec($CurrentTripFuel) * 0.01;
	echo "CurrentTripFuelComsumed: ". $CurrentTripFuelComsumed."<br/>";

}

function DecodeParam2($param2)
{
	echo "***********Param 2***********"."<br/>";
	if(substr($param2, 0, 2) != "01")
	{
		echo "There is no GPS data followed."."<br/>";
		return;
	}
	else{
		echo "GPS Data recieved"."<br/>";
	}
	//Day
	$day = substr($param2, 2, 2);
	$day = hexdec($day);
	echo "Day: ".$day."<br/>";

	//Month
	$month = substr($param2, 4, 2);
	$month = hexdec($month);
	echo "Month: ".$month."<br/>";

	//Year
	$year = substr($param2, 6, 2);
	$year = hexdec($year);
	echo "Year: ".$year."<br/>";

	//Hour
	$hour = substr($param2, 8, 2);
	$hour = hexdec($hour);
	echo "Hour: ".$hour."<br/>";

	//Min
	$min = substr($param2, 10, 2);
	$min = hexdec($min);
	echo "Min: ".$min."<br/>";

	//Sec
	$sec = substr($param2, 12, 2);
	$sec = hexdec($sec);
	echo "Sec: ".$sec."<br/>";

	//Latitude
	$latitude = substr($param2, 14, 8);
	$lat = "";
	for($i = 7; $i > 0; $i-= 2)
	{
		$val = substr($latitude, $i-1, 2);
		$lat .= $val;
	}
	$lat = hexdec($lat)/3600000;
	echo "lat: ". $lat."<br/>";

	//Longitude
	$longitude = substr($param2, 22, 8);
	$long = "";
	for($i = 7; $i > 0; $i-= 2)
	{
		$val = substr($longitude, $i-1, 2);
		$long .= $val;
	}
	$long = hexdec($long)/3600000;
	echo "Longitude: ". $long."<br/>";
}

function BuildLoginResponse($data_package)
{
	$LoginResponse = "";

	$LoginResponse .= $LoginResponse.$data_package->getHeader()
	.$data_package->getLength()
	.$data_package->getVersion()
	.$data_package->getdevID()
	.$data_package->getCommandType()
	.$data_package->getparam1()
	.$data_package->getparam2()
	.$data_package->getparam3()
	.$data_package->getCRC()
	.$data_package->gettail();
	echo "Login Response=".$LoginResponse;
	return $LoginResponse ;
}

function SendLoginResponse($LoginResponse)
{
	// don't timeout!
	set_time_limit(0);

	socket_write($GLOBALS['_spawn'], $LoginResponse, strlen ($LoginResponse)) or die("Could not write LoginResponse\n");
	//$input = socket_read($spawn, 1024) or die("Could not read input\n");
	socket_close($GLOBALS['_spawn']);
	socket_close($GLOBALS['_socket']);
}

?>
