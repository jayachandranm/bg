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
            $filter->start = $filter->end - (30*3600*24*1000);
            //print_r($filter);
            $result = _getdata_dyndb($reqtype, $filter);
            foreach ($result as $row) {
                //print_r($row);
                $time = $row['ts'];
                $val = 0.0;
                if($type === 'wa') {
                    $val = $row['wa'];
                } elseif ($type === 'bl') {
                    $val = $row['bl'];
                } elseif ($type === 'ss') {
                    $val = $row['ss'];
                }
                if($val != null) {
                    $data[] = (object)array('date'=>$time, 'value'=>$val);
                    //$timestamps[] = $time;
                }
            } // foreach
echo json_encode($data);
//print_r($data);
