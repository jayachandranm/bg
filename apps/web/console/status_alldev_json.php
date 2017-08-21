<?php
   include 'dynDB.php';

   $type =  $_GET['attr'];
   $list =  $_GET['list'];
   //echo "Hello";

   $reqtype = 'rt';
   $filter = new stdClass;
   
   $list_file = "station_" . $list . ".json";
   //echo $list_file;
   //$string = file_get_contents("station_list1.json");
   $string = file_get_contents($list_file);
   $json_a = json_decode($string, true);
   $sid_list = $json_a['sids'];

   //print_r($sid_list);

   $filter->end = round(microtime(true) *1000);
   $filter->start = $filter->end - (3600*24*1000);
   foreach ($sid_list as $sid) {
       //echo $sid;
       $filter->sid = $sid; 
       //print_r($filter);
       $result = _getdata_dyndb($reqtype, $filter);
       $row = $result;
       //print_r($row);
       //foreach ($result as $row) {
       if(!is_null($row)) {
         $time = $row['ts'];
         $lastRcvd = ($row['ts'])/1000;
         $currTime = time();
         $diff = $currTime - $lastRcvd;
         $val = 0.0;
         if($type === 'wl') {
           $val = $row['wl'];
         } elseif ($type === 'bl') {
           $val = $row['bl'];
         } elseif ($type === 'ss') {
           $val = $row['ss'];
         }
         if($val != null) {
           //$data[] = (object)array('sid'=>$sid, 'value'=>$val, 'alpha'=> 0.8);
           $data_arr = array('sid'=>$sid, 'value'=>$val);
           if( $diff > 15*60) {
             $data_arr += array('alpha'=> 0.9);
             $data_arr += array('color'=> "#FEC514");
             //$data_arr += array('bullet'=> "triangleDown");
           }
           if( isset( $row['md'] ) ){
               //$md = "maintenance";
               //$md = $raw['md'];
               //$data_arr += array('dashLength'=> 8);
               $data_arr += array('bullet'=> "https://www.amcharts.com/lib/images/faces/C02.png");
           }
           $data[] = (object)$data_arr;
         }
       }
   } // foreach
   echo json_encode($data);
   //print_r($data);
?>
