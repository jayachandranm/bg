<?php

/*
* $range=0, for current value.
* $range=1 for 1 week range.
*/
function _get_json($uid=-1, $range=0) {
  //
  date_default_timezone_set('Asia/Singapore');
  module_load_include("config.inc", "bedmon");
  $bedmon_db = getExtDBConfig();
  module_load_include("api.inc", "bedmon");
  $result_p = _get_results_db($bedmon_db, 'block', $uid, $range, 'pulserate');
  //dpm($result_p);
  //print_r($result_p);
  $result_r = _get_results_db($bedmon_db, 'block', $uid, $range, 'resprate');
  $items_p = array();
  $items_r = array();
  // Iterate over the resultset and format as links.
  foreach ($result_p as $row) {
    //$date = new DateTime();
    //$timeHr = date('g:i a',($row->timestamp)/1000);
    //$date->setTimestamp(($row->currentdatetime)/1000);
    $time = intval($row->timestamp);
    $value = round($row->value2use, 2);
    $items_p[] = array('x' => $time, 'y' => $value);
    //print_r($items_p);
  } // foreach
  foreach ($result_r as $row) {
    $time = intval($row->timestamp);
    $value = round($row->value2use, 2);
    $items_r[] = array('x' => $time, 'y' => $value);
  } // foreach
  $items_all = array();
  //$items_all[] = array('p' => $items_p, 'r' => $items_r);
  $items_all = array('p' => $items_p, 'r' => $items_r);
  return drupal_json_output($items_all);
}


function _vitals_json() {
  //
  date_default_timezone_set('Asia/Singapore');
  module_load_include("config.inc", "bedmon");
  $bedmon_db = getExtDBConfig();
  module_load_include("api.inc", "bedmon");
  //retrieve our post value
  //$nid_list = $_REQUEST['nidList'];
  $uid_list = $_POST['nidList'];
  //dpm($nid_list); // This works, but not print_r.
  //print_r($nid_list); This print will cause ajax reply error.
  // do our custom database query
  $result = _get_vitals($bedmon_db, $uid_list);
  if($result){
    return drupal_json_output($result);
  }else{
    return drupal_json_output("fail");
  }
}


function _getpp_json($uid=-1, $range=0) {
  //
  date_default_timezone_set('Asia/Singapore');
  module_load_include("config.inc", "bedmon");
  $bedmon_db = getExtDBConfig();
  module_load_include("api.inc", "bedmon");
  //
  $result = _get_results_db2('block', $uid);
  if($result){
    return drupal_json_output($result);
  }else{
    return drupal_json_output("fail");
  }
}
