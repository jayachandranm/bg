<?php
include 'dynDB.php';

            $reqtype = 'trc';
            $filter = new stdClass;
/*
            $filter->sid = '213EP2016000570'; 
            $filter->start = 1480565971000;
            $filter->end = 1480567044000;
*/
            $filter->sid = 'WL1001'; 
            $filter->end = round(microtime(true) *1000);
            $filter->start = $filter->end - (3600*24*1000);
            //print_r($filter);
            $result = _getdata_dyndb($reqtype, $filter);
            foreach ($result as $row) {
                //dpm($row);
                $time = $row['ts'];
                $wl = $row['wl'];
                //$lat = 1.421; $lng = 103.829;
                // If for any timestamp, gps_data does not exist, just skip that item.
                if($wl != null) {
/*
                    $lat = $gps_data['latitude'];
                    $lng = $gps_data['longitude'];
*/
                    $data[] = (object)array('date'=>$time, 'value'=>$wl);
                    //$timestamps[] = $time;
                }
            } // foreach
echo json_encode($data);
//print_r($data);
