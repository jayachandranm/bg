<?php
   include 'dynDB.php';

   $type =  $_GET['attr'];
   //echo "Hello";

   $reqtype = 'rt';
   $filter = new stdClass;
   
   //$sid_list = array("CWS001", "CWS002");
   //$sid_list = ["CWS001", "CWS002"];
   $sid_list = ["EWS001", "EWS002", "EWS003", "EWS004", "EWS005", "EWS006", "EWS007", 
"EWS008", "EWS010", "EWS011", "EWS012", "EWS014", "EWS015", "EWS016", "EWS017", 
"EWS018", "EWS086", "EWS020", "EWS021", "EWS087", "EWS023", "EWS024", "EWS050", 
"EWS053", "EWS084", "EWS085", "WWS001", "WWS003", "WWS004", "WWS005", "WWS006", 
"WWS008", "WWS009", "WWS011", "WWS012", "WWS013", "WWS016", "WWS019", "WWS020", 
"WWS021", "WWS022", "WWS023", "WWS061", "WWS062", "WWS063", "WWS088", "WWS089", "WWS095",
"CWS085B", "CWS086B", "CWS087B", "CWS088B", "CWS090B", "CWS091B", "CWS093B", "CWS094B", "CWS145B", "EWS054B", "EWS055B", "EWS065B", "WWS055B", "WWS056B", "WWS057B", "WWS058B", "WWS059B", "WWS060B", "WWS064B", "WWS085B", "WWS090B"];

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
           }
           if( isset( $row['md'] ) ){
               //$md = "maintenance";
               //$md = $raw['md'];
               $data_arr += array('dashLength'=> 8);
           }
           $data[] = (object)$data_arr;
         }
       }
   } // foreach
   echo json_encode($data);
?>
