<?php
include 'dynDB.php';

$sid =  $_GET['sid'];

            $reqtype = 'trc';
            $filter = new stdClass;

            //$filter->sid = 'CWS001'; 
            $filter->sid = $sid; 
            $filter->end = round(microtime(true) *1000);
            $filter->start = $filter->end - (5*3600*24*1000);
            //print_r($filter);
            $result = _getdata_dyndb($reqtype, $filter);
            foreach ($result as $row) {
                //print_r($row);
                $time = $row['ts'];
                $bl = $row['bl'];
                if($bl != null) {
                    $data[] = (object)array('date'=>$time, 'value'=>$bl);
                    //$timestamps[] = $time;
                }
            } // foreach
echo json_encode($data);
//print_r($data);
