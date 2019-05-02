<?php
   include 'dynDB.php';

   $type =  $_GET['attr'];
   $list =  $_GET['list'];
   $tbl = isset($_GET['tbl']) ? $_GET['tbl'] : 'n';
   //echo "Hello";

   $reqtype = 'rt';
   $filter = new stdClass;
   
   $sid_list = array();
   if($list == 'list1') {
      $list_file = "flow_stations_all.json";
      //echo "$list_file";
      $string = file_get_contents($list_file);
      //echo "$string";
      $json_a = json_decode($string, true);
      //print_r($json_a);
      $json_list = $json_a['dev_state'];
      //print_r($json_list);
      $sid_list = array_keys($json_list);
      //print_r(array_keys($json_list));
      /*
      foreach($json_list->entries as $entry) {
	 print_r($entry);
	 $sid_list += array_keys(get_object_vars($entry));
      }
       */
      //print_r($sid_list);
   }
   else if($list == 'list2') {
      $list_file = "rain_stations_all.json";
      $string = file_get_contents($list_file);
      $json_a = json_decode($string, true);
      $json_list = $json_a['dev_state'];
      $sid_list1 = array_keys($json_list);
      /*
      foreach($json_a->entries as $entry) {
	 $sid_list += array_keys(get_object_vars($entry));
      }
       */
      $list_file = "rlevel_stations_all.json";
      $string = file_get_contents($list_file);
      $json_a = json_decode($string, true);
      $json_list = $json_a['dev_state'];
      $sid_list2 = array_keys($json_list);
      /*
      foreach($json_a->entries as $entry) {
	 $sid_list += array_keys(get_object_vars($entry));
      }
       */
      $sid_list = array_merge($sid_list1, $sid_list2);
   }
   /*
   $list_file = "station_" . $list . ".json";
   //echo $list_file;
   //$string = file_get_contents("station_list1.json");
   $string = file_get_contents($list_file);
   $json_a = json_decode($string, true);
   $sid_list = $json_a['sids'];
    */

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
         $val2 = 0.0;
         if($type === 'wh') {
           //$val = $row['wh'];
	   $val = 0;
         } elseif ($type === 'bl') {
           $val = $row['bl'];
         } elseif ($type === 'ss') {
           $val = $row['ss'];
         }
         if($tbl == 'y') {
           $val2 = $row['ss'];
	 }
         if($val != null) {
           //$data[] = (object)array('sid'=>$sid, 'value'=>$val, 'alpha'=> 0.8);
           if($tbl == 'y') {
             $data_arr = array('sid'=>$sid, 'value'=>$val, 'value2'=>$val2);
	   } else {
             $data_arr = array('sid'=>$sid, 'value'=>$val);
	   }
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
   if($tbl == 'y') {
     $data = array('data'=>$data);
   }
   echo json_encode($data);
   //print_r($data);
?>
