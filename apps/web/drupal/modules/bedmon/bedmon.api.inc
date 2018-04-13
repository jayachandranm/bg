<?php

/**
 * Custom content function.
 *
 * Set beginning and end dates, retrieve posts from database
 * saved in that time period.
 *
 * @return
 *   A result set of the targeted posts.
 */
function _get_results_db($bedmon_db, $display, $uid, $range, $vtype){
  //Calculate the date a week ago.
  $today = getdate();
  //$start_time = mktime(0, 0, 0,$today['mon'],($today['mday'] - 7), $today['year']);
  //Get today's date.
  $end_time = time();
  $end_time = $end_time * 1000;
  //$end_time = microtime(true) * 1000;
  // By default, pick up to 10 weeks data.
  // TODO: Use range parameter.
  $start_time = $end_time - 3600*1000*24*7*10;

  //NEW LINE
  $max_num = variable_get('bedmon_max', 3);

  // replace 'YourDatabaseKey' with something that's unique to your module
  Database::addConnectionInfo('COMFORT', 'default', $bedmon_db);
  db_set_active('COMFORT');

  // SELECT * FROM (SELECT * FROM [table] WHERE userid='$userid' ORDER BY timestamp DESC LIMIT $q_length) sub ORDER BY timestamp ASC
  // execute queries here
  //print_r($start_time, $end_time );
  //dpm($start_time. ":".$end_time);
  $query = array();
  if ($display == 'block'){
    //$query = db_select('pulserate', 'hr')
    // inner_query first.
    $query_inner = db_select($vtype, 'tbl')
      ->fields('tbl', array('timestamp', 'value2use'))
      //->condition('sender_id', 1) //Published.
      ->condition('userid', $uid) //Published.
      ->condition('timestamp', array($start_time, $end_time), 'BETWEEN')
      ->orderBy('timestamp', 'DESC'); //Most recent first.
    // TODO: Can be conditional, different for block and page.
    //$query->range(0, 12);
    //$query->range(0, $max_num);
    // subquery or outer_query. Reverse the order for timestamps, otherwise highchart will not work.
    $query = db_select($query_inner, 'sub')
       ->fields('sub', array('timestamp', 'value2use'))
       ->orderBy('timestamp', 'ASC');
  }
  //drupal_set_message((string) $query);
  $result = $query->execute();
  //print_r($result);
  db_set_active(); // without the paramater means set back to the default for the site
  //drupal_set_message(t('The queries have been made.'));
/*
   while($record = $result->fetchAssoc()) {
        print_r($record);
   }
*/
  return $result;
}


/**
 * Retrieve vital data from external db.
 *
 * @return
 *   A result set of vitals and bed status.
 */
function _get_vitals($bedmon_db, $uid_list){
  //Get today's date.
  $today = getdate();
  //Calculate the date a week ago.
  $start_time = mktime(0, 0, 0,$today['mon'],($today['mday'] - 7), $today['year']);
  //Get all posts from one week ago to the present.
  $end_time = time();

  $max_num = variable_get('bedmon_max', 3);

  Database::addConnectionInfo('COMFORT', 'default', $bedmon_db);
  db_set_active('COMFORT');

  $query = array();

  $params = array();
  $params['pulserate'] = -1;
  $params['resprate'] = -1;
  $params['bedmovement'] = 0;
  $params['bedstatus'] = 0;

  $result_all = array();
  $time_hr = -1;
  $db_tables = array('pulserate', 'resprate', 'bedmovement', 'bedstatus');
  foreach($uid_list as $snum => $uid) {
    foreach($db_tables as $tblname) {
      $query = db_select($tblname, 'tbl')
        ->fields('tbl', array('timestamp', 'value2use,'))
        ->condition('userid', $uid)
        // ->condition('timestamp', array($start_time, $end_time), 'BETWEEN')
        ->orderBy('timestamp', 'DESC')
        ->range(0, 1);
      $result = $query->execute();
      // If there is no next record, FALSE will be returned.
      if($result->rowCount() > 0) {
        $row = $result->fetchAssoc();
        $time = $row['timestamp'];
        $params[$tblname] = round($row['value2use'], 2);
        //dpm($params);
      } else {
        // No values in the db for this parameter and userid.
        // TODO: Fix this.
        $time = -1;
        $value = -1;
      }
      // TODO: Fix this.
      if($tblname == 'pulserate') {
        $time_hr = $time;
      }
    }
    $result_all[] = array('UserID' => $uid,
                          'TimeP' => $time_hr,
                          'Pulse' => $params['pulserate'],
                          'Resp' => $params['resprate'],
                          'Mov' => $params['bedmovement'],
                          'Occ' => $params['bedstatus'],
                          );
    // Set default values for next userid.
    $params['pulserate'] = -1;
    $params['resprate'] = -1;
    $params['bedmovement'] = 0;
    $params['bedstatus'] = 0;
  }
  //
  // without the paramater means set back to the default for the site
  db_set_active();
  return $result_all;
}


function _get_results_db2($bedmon_db, $display, $uid){
  //
  Database::addConnectionInfo('COMFORT', 'default', $bedmon_db);
  db_set_active('COMFORT');
  $tblname = 'posture';
  $query = array();

  $query = db_select($tblname, 'tbl')
        ->fields('tbl', array('timestamp', 'p1', 'p2', 'p3', 'p4', 'p5', 'p6', 'p7'))
        ->condition('userid', $uid)
        // ->condition('timestamp', array($start_time, $end_time), 'BETWEEN')
        ->orderBy('timestamp', 'DESC')
        ->range(0, 1);
  $result = $query->execute();
  //
  $grid1 = 1;
  $grid2 = 200;
  $grid3 = 110;
  $grid4 = 350;
  $grid5 = 260;
  $grid6 = 100;
  $grid7 = 10;
  //
  if($result->rowCount() > 0) {
    $row = $result->fetchAssoc();
    $time = $row['timestamp'];
    $grid1 = intval($row['p1']);
    $grid2 = intval($row['p2']);
    $grid3 = intval($row['p3']);
    $grid4 = intval($row['p4']);
    $grid5 = intval($row['p5']);
    $grid6 = intval($row['p6']);
    $grid7 = intval($row['p7']);
  }

  $data = array($grid1, $grid2, $grid3, $grid4, $grid5, $grid6, $grid7);
  //
  db_set_active();
  //
  return $data;
}


function _get_reports($bedmon_db, $uid_list){
  //Get today's date.
  $today = getdate();
  //Calculate the date a week ago.
  $start_time = mktime(0, 0, 0,$today['mon'],($today['mday'] - 90), $today['year']);
  $start_time = $start_time * 1000;
  //$start_time = -1;
  //Get all posts from one week ago to the present.
  //$end_time = time();
  $end_time = time()*1000;

  Database::addConnectionInfo('COMFORT', 'default', $bedmon_db);
  db_set_active('COMFORT');

  $query = array();
  $params = array();
  $result_all = array();
  $time_hr = -1;
  $db_tables = array('pulserate', 'resprate', 'bedmovement', 'bedstatus');
  foreach($uid_list as $snum => $uid) {
    foreach($db_tables as $tblname) {
      $query = db_select($tblname, 'tbl')
        ->fields('tbl', array('userid', 'timestamp', 'value2use'))
        ->condition('userid', $uid)
        ->condition('timestamp', array($start_time, $end_time), 'BETWEEN')
        ->orderBy('timestamp', 'DESC');
        //->range(0, 1);
      $result = $query->execute();
      //dpm($result);
      foreach ($result as $row) {
	//dpm($row);
        date_default_timezone_set('Asia/Singapore');
        //$date = new DateTime();
        //$timeHr = date('g:i a',($row->timestamp)/1000);
        //$date->setTimestamp(($row->currentdatetime)/1000);
        $uid = intval($row->userid);
        $time = intval($row->timestamp);
        $value = round($row->value2use, 2);
        $result_all[] = array('uid' => $uid,
          'ts' => $time,
          'vtype' => $tblname,
          'val' => $value
        );
      } // foreach row
    } // foreach table
  } // foreach uid
  //
  db_set_active();
  return $result_all;
}
