<?php
header("Content-type: text/json");

$ip = $_SERVER['REMOTE_ADDR'];

//$username = $_GET["id"];
$time = $_GET["t"];
$valtype = $_GET["v"];
$userid = $_GET["uid"];

$con = mysql_connect("localhost","bg1","bg%user$1");

if (!$con) {
  die('Could not connect: ' . mysql_error());
}

mysql_select_db("bg", $con);

$day = date('Y-m-d'); //UTC
/*
*/

$q_length = "3600";

switch ($time)
{
case "0":
	//print "Case 0";
	// min 1 hr data
	$q_length = "3600";
	break;
case "1":
	//print "Case 1";
	// min 5 hr data
	$q_length = "18000";
	break;
case "2":
	//print "Case 2";
	// min 24 hr data
	$q_length = "86400";
	break;
default:
	print "Case not handled";
}

#$result = mysql_query("SELECT COUNT(*) FROM table WHERE time='{$day}';");
#$count = mysql_fetch_array($result);
$reslist = null;

if (strcmp($valtype,"noise") == 0) 
	$reslist = mysql_query("SELECT * FROM (SELECT * FROM noise WHERE userid='$userid' ORDER BY timestamp DESC LIMIT $q_length) sub ORDER BY timestamp ASC");

if (!$reslist)
	echo 'Invalid Request: <br/>';

$row = null;

while( $row = mysql_fetch_array($reslist) ) {
	//print($row);
	//extract $row;
	$timestamp = $row["timestamp"];
	$x = floatval($timestamp);
	//echo "$x  ";
	$value = 0.0;
	if (strcmp($valtype,"noise") == 0)
		$value = $row["value"];
		$y = floatval($value);
	//echo "$y\n";
	$data[] = array($x, $y);
}
	//print json_encode($data);

#$x = time() * 1000;
#$x = round(microtime(true) *1000)* 1000;

//$y = rand(0,100) ;

mysql_close($con);

echo json_encode($data);

//echo "[";
//echo join($data, ',');
//echo "]";

//print json_encode($result, JSON_NUMERIC_CHECK);

?>
