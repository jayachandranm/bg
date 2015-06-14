<?php
header("Content-type: text/json");

/*
$username = $_GET["id"];
$time = $_GET["t"];
*/

$ip = $_SERVER['REMOTE_ADDR'];
$valtype = $_GET["v"];
$userid = $_GET["uid"];
//$sessionid = $_GET["sid"];

//$ip = "192.168.1.122";

$con = mysql_connect("localhost","bg1","bg%user$1");
if (!$con) {
  die('Could not connect: ' . mysql_error());
}
mysql_select_db("bg", $con);

//$day = date('Y-m-d'); //UTC
/*
*/

//echo $sessionid;

$res = null;
$y = 0;

if (strcmp($valtype,"noise") == 0) {
	$res = mysql_query("SELECT * FROM noise WHERE userid='$userid' ORDER BY timestamp DESC LIMIT 1");
}


$row_recent = mysql_fetch_assoc($res);

$xf = $row_recent["timestamp"]; //* 1000;
$x  = floatval($xf);

#$x = $xf.toFixed();
#$y = intval($count[0]);
#$y = intval($rows['data'][0]);

$y = 0;
if(strcmp($valtype,"noise") == 0)
	$y = floatval($row_recent["value"]);
	
	
$currenttimemillis = round(microtime(true) * 1000);	
$timeelapsed = $currenttimemillis - $x;

/*
if($timeelapsed > 60000) 
	$y = 0;
*/	
	
//$y = rand(0,100) ;
mysql_close($con);

$ret = array($x, $y);
echo json_encode($ret);
//print json_encode($result, JSON_NUMERIC_CHECK);
?>
