<?php
    $st = 0;
    $et = 0;
    if (isset($_GET['st'])) {
      $st = $_GET['st'];
    }
    if (isset($_GET['et'])) {
      $et = $_GET['et'];
    }

    $st = $st/1000 + 28800;
    $et = $et/1000 + 28800;
    $host = 'localhost';
    $db   = 'db';
    $user = 'user';
    $pass = 'pass';
    $charset = 'utf8';

    $conn = mysqli_connect($host, $user, $pass, $db);

    date_default_timezone_set('Asia/Singapore');
    $currentdate = date('Y-m-d H:i:s', time());

    //$curr_dt = new DateTime($currentdate);
    $curr_dt = date_create($currentdate);

    $sid = "CWS100";

    //$sql = "SELECT station_id, UNIX_TIMESTAMP(datetime) as ts, waterlevel_meter from raw_data WHERE station_id='$sid' AND datetime BETWEEN from_unixtime($st) and from_unixtime($et)";
    $sql = "SELECT station_id, UNIX_TIMESTAMP(datetime) as ts, waterlevel_meter from raw_data WHERE station_id='$sid' AND (datetime > from_unixtime($st) and datetime <= from_unixtime($et))";

    //echo $sql;
    //$station_list = array();
    //$set = array ();
    foreach ($conn->query($sql) as $row)
    {
        //print_r($row);
        $sid = $row['station_id'];
        $ts = 1000 * (intval($row['ts']) - 28800);
        //$ts = intval($row['ts']) - 28800;
        //$wa = floatval($row['waterlever_mrl']);
        $wa = floatval($row['waterlevel_meter']);
        //$offset_o = $row['offset_o'];
        $data[] = array($ts, $wa);
    }

    //print_r($set);
    echo json_encode($data);
    //echo json_encode($station_list);
?>
