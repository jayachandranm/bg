<?php
include 'dynDB.php';

            $reqtype = 'trc';
            $filter = new stdClass;

            $filter->sid = 'CWS001'; 
            $filter->end = round(microtime(true) *1000);
            $filter->start = $filter->end - (3600*24*1000);
            //print_r($filter);
            $result = _getdata_dyndb($reqtype, $filter);
            foreach ($result as $row) {
                //dpm($row);
                $time = $row['ts'];
                $ss = $row['ss'];
                if($ss != null) {
                    $data[] = (object)array('date'=>$time, 'value'=>$ss);
                    //$timestamps[] = $time;
                }
            } // foreach
echo json_encode($data);
//print_r($data);
