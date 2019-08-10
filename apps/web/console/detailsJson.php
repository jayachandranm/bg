<?php
include 'dynDB.php';
header('Access-Control-Allow-Origin: *');

$sid =  $_GET['sid'];
$type =  $_GET['type'];

            $reqtype = 'trc';
            $filter = new stdClass;

            //$filter->sid = 'CWS001'; 
            $filter->sid = $sid; 
            //$filter->attr = $type; 
            $filter->end = round(microtime(true) *1000);
            //$filter->start = $filter->end - (30*3600*24*1000);
            $filter->start = $filter->end - (15*3600*24*1000);
            //print_r($filter);
            $result = _getdata_dyndb($reqtype, $filter);
            foreach ($result as $row) {
                //print_r($row);
                $ts = $row['ts'];
                $val = 0.0;
                if($type === 'wh') {
                    //$val = $row['wa'];
                    $val = isset($row['wh']) ? $row['wh'] : 0;
                    //$val = isset($row['ra']) ? $row['ra'] : 0;
                } elseif ($type === 'bl') {
                    $val = $row['bl'];
                } elseif ($type === 'ss') {
                    $val = $row['ss'];
                } elseif ($type === 'ra') {
                    $val = isset($row['ra']) ? $row['ra'] : 0;
                } elseif ($type === 'ts_r') {
                    // 1999-12-31 19:20:00
                    $dt_tsr = isset($row['ts_r']) ? $row['ts_r'] : "1970-01-01 00:00:00";
                    $val = floatval(strtotime($dt_tsr));
                }
                if($val != null) {
                    $data[] = (object)array('date'=>$ts, 'value'=>$val);
                    //$timestamps[] = $ts;
                }
            } // foreach
echo json_encode($data);
//print_r($data);
