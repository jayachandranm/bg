<?php
   include 'dynDB.php';

   $type =  $_GET['attr'];
   //echo "Hello";

   $reqtype = 'rt';
   $filter = new stdClass;
   
   //$sid_list = array("CWS001", "CWS002");
   //$sid_list = ["CWS001", "CWS002"];
   $sid_list = ["CWS001", "CWS002", "CWS003", "CWS007", "CWS010", "CWS011", "CWS012", "CWS013", "CWS014", "CWS015", "CWS155", "CWS017", "CWS019", "CWS020", 
"CWS021", "CWS022", "CWS023", "CWS156", "CWS025", "CWS027", "CWS029", "CWS030", 
"CWS031", "CWS032", "CWS033", "CWS034", "CWS035", "CWS036", "CWS038", "CWS039", "CWS040", "CWS041", "CWS043", "CWS044", "CWS045", "CWS046", "CWS047", "CWS048", "CWS049", "CWS050", 
"CWS051", "CWS052", "CWS055", "CWS056", "CWS057", "CWS058", "CWS060", "CWS061", "CWS083", "CWS096", "CWS141", "CWS099", "CWS100", "CWS101", "CWS135", "CWS137", "CWS140", 
"CWS143", "CWS148", "TST001", "TST002"];

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
   //print_r($data);
?>
