<?php

//date_default_timezone_set('UTC');

function _getdata_exdb($jav_db, $reqtype, $filter)
{
    // From admin page.
    //$max_num = variable_get('jav_max', 3);
    //$sid_list = $filter[sidList];
    $sid_list = $filter->sidList;
    $start_time = $filter->start;
    $end_time = $filter->end;

    /*
        $bg_db = array(
            'database' => 'db',
            'username' => 'user',
            'password' => 'pass',
            'host' => 'localhost',
            'driver' => 'mysql',
        );
    */

    Database::addConnectionInfo('JAV', 'default', $jav_db);
    db_set_active('JAV');

    // TODO: Sanitize sids array before using in the query statement.
    // TODO: iF multiple entry match the condition, handle as error?

    $query = array();
    if ($reqtype == 'rt') {
        //dpm($sid_list);
        $query_inner = db_select('lift_events', 'a')
            ->fields('a', array('lift_id', 'ts', 'value', 'is_set', 'remarks'))
            ->condition('lift_id', $sid_list, 'IN')
            ->orderBy('ts', 'DESC');
        //$query->addExpression('MAX(id)');
        // TODO: Can be conditional, different for block and page.
        //$query->range(0, $max_num);
        // TODO: Use timestamp condition instead?
        $query_inner->range(0, 100);
        //$query_inner->range(0, 1);
        //
        //dpm($query_inner);
        $query = db_select($query_inner, 'b')
            ->fields('b', array('lift_id', 'ts', 'value', 'is_set', 'remarks'))
            ->groupBy('lift_id');

    }
    if ($reqtype == 'trc') {
        $query = db_select('lift_events', 'a')
            ->fields('a', array('lift_id', 'ts', 'value', 'is_set', 'remarks'))
            ->condition('lift_id', $sid_list, 'IN')
            //->condition('sid', array(1,5,7),'IN')
            //->condition('status', 0,'>')
            ->condition('ts', array($start_time, $end_time), 'BETWEEN')
            //->orderBy('datetime', 'DESC');
            ->orderBy('ts', 'ASC');
    }
    if ($reqtype == 'rpt') {
        $query = db_select('lift_events', 'a')
            ->fields('a', array('lift_id', 'ts', 'value', 'is_set', 'remarks'))
            ->condition('lift_id', $sid_list, 'IN')
            //->condition('sid', array(1,5,7),'IN')
            //->condition('status', 0,'>')
            ->condition('ts', array($start_time, $end_time), 'BETWEEN')
            //->orderBy('datetime', 'DESC');
            ->orderBy('ts', 'ASC');
    }
    if ($reqtype == 'ss') {
        $query = db_select('sensor_status', 'a')
            ->fields('a', array('lift_id', 'ts', 'sensor', 'value', 'remarks'))
            ->condition('lift_id', $sid_list, 'IN')
            //->condition('sid', array(1,5,7),'IN')
            //->condition('status', 0,'>')
            ->condition('ts', array($start_time, $end_time), 'BETWEEN')
            //->orderBy('datetime', 'DESC');
            ->orderBy('ts', 'DESC');
    }

    $result = $query->execute();
    db_set_active();
    return $result;
}

function _get_active_events($jav_db, $filter)
{     
    $sid_list = $filter->sidList;
    $start_time = $filter->start;
    $end_time = $filter->end;
    $condition = $filter->condition;
  
    //print_r($filter);

    //dpm($jav_db);
 
    $result_all = array();

    Database::addConnectionInfo('JAV', 'default', $jav_db);
    db_set_active('JAV');

    $event_types = array("fight", "vandalism", "fallen_human", "liquid", "urine", "co", "fire", "light_malfunction", "ventilation_malfunction", "co_low_level", "uncat");
    
    foreach ($sid_list as $sid) {
    foreach($event_types as $e_type) {
        //$sql = "SELECT * FROM `lift_events` WHERE lift_id='$sid' and value='$e_type' and (ts > (select coalesce(max(ts),0) from `lift_events` where lift_id='$sid' and value='$e_type' AND is_set = 0))";
        if($condition == 'all_unack') {
            $sql = "SELECT * FROM `lift_events` WHERE lift_id='$sid' and value='$e_type' ORDER BY ts DESC limit 1";
            $result = db_query($sql);
            $is_cleared = 0;
            foreach($result as $row) {
                if($row->msg_type == 'event_clear') {
                    $is_cleared = 1;
                }
            }
            if(!$is_cleared) {
                $sql = "SELECT * FROM `lift_events` WHERE lift_id='$sid' and value='$e_type' and is_set=1 ORDER BY ts DESC limit 1";
            }
        }
        else {
            $sql = "SELECT * FROM `lift_events` WHERE lift_id='$sid' and value='$e_type' ORDER BY ts DESC limit 1";
        }
        $result = db_query($sql);
        foreach($result as $row) {
            if($row->is_set == 1) {
                $result_all[] = $row;
            }
        } 
    } // foreach e_type
    } // foreach sid
    db_set_active();
    return $result_all;
}                       


function _get_sensorerr($jav_db, $lift_id)
{
    // all sensor errors = sensor errors at last report 
    //        + any extra errors reported from then till now in alt2 events.
    Database::addConnectionInfo('JAV', 'default', $jav_db);
    db_set_active('JAV');
    $sid_list[] = $lift_id;
    $msg_type = 'err_rpt';
    //
    $query = array();
    // get last rpt entry.
    $query = db_select('sensor_status', 'a')
        ->fields('a', array('lift_id', 'ts', 'value', 'sensor'))
        ->condition('lift_id', $sid_list, 'IN')
        ->condition('msg_type', $msg_type)
        ->orderBy('ts', 'DESC');
    $query->range(0, 1);
    //
    $result = $query->execute();
    //
    $s_err = "healthy";
    $s_name_err = 'all';
    $ts_rpt = -1;
    // Just looking at last entry, either no entries or one row.
    /*    foreach ($result as $row) {
            $s_err = $row->value;
            $s_name_err = $row->sensor;
            $ts_rpt = $row->ts;
        }*/
    if ($row = $result->fetchObject()) {
        $s_err = $row->value;
        $s_name_err = $row->sensor;
        $ts_rpt = $row->ts;
    } else {
        db_set_active();
        $result = null;
        return $result;
    }
    $curr_time = time() * 1000;
    // Do further check only if reports are not timed out (1 day).
    // Otherwise return the single report entry to mark an error.
    if( ($curr_time - $ts_rpt) < 24*60*60*1000) {
        // If last rpt was all healthy, query everything after the rpt time.
        // If last rpt had errors, include the rpt time in query, so that rpt errors
        //      will be included in the final result.
        if (($s_name_err == 'all') && ($s_err == 'healthy')) {
            // Only one healthy entry exists for last report.
            // TODO: Trick, just skip this entry from the error list.
            // The default case is considered healthy at $ts_rpt = -1, sets $ts_rpt to 0.
            $ts_rpt = $ts_rpt + 1;
        }
        $query = array();
        // get all errors from last rpt till now, including the rpt errors.
        // (rpt + alt1)ts_rpt - now
        $query = db_select('sensor_status', 'a')
            ->fields('a', array('lift_id', 'ts', 'value', 'sensor'))
            ->condition('lift_id', $sid_list, 'IN')
            //->condition('msg_type', $msg_type)
            ->condition('ts', array($ts_rpt, $curr_time), 'BETWEEN')
            ->orderBy('ts', 'DESC');
        //$query->range(0, 1);
    }
    // Query again for the case of timeout as fetchAssoc has modified $result.
    $result = $query->execute();
    // $result will be empty if all sensors are considered healthy.
    db_set_active();
    return $result;
}

function _get_mnt_lifts($jav_db, $lift_ids)
{
    // all sensor errors = sensor errors at last report 
    //        + any extra errors reported from then till now in alt2 events.
    Database::addConnectionInfo('JAV', 'default', $jav_db);
    db_set_active('JAV');
    $sid_list[] = $lift_ids;
    //$msg_type = 'err_rpt';
    //
    $query = array();
    // get last error status entry.
    $query = db_select('sensor_status', 'a')
        ->fields('a', array('lift_id', 'ts', 'value', 'sensor', 'remarks'))
        ->condition('lift_id', $sid_list, 'IN')
        //->condition('msg_type', $msg_type)
        ->orderBy('ts', 'DESC');
    $query->range(0, 1);
    //
    $result = $query->execute();
    //
    // $result will be empty if all sensors are considered healthy.
    db_set_active();
    return $result;
}

function _update_ext_db($db, $lift_nid, $lift_id, $lift_address, $supplier_nid, $sms_list, $flag)
{
    Database::addConnectionInfo('JAV', 'default', $db);
    db_set_active('JAV');

    // TODO: consider timezone.
    $millis = round(microtime(true) * 1000);
    $dt = date('Y-m-d H:i:s');

    //$query = array();
    if ($flag) {
        db_insert('contact_list')
            ->fields(array(
                'ts' => $millis,
                'date_time' => $dt,
                'lift_id' => $lift_id,
                'lift_nid' => $lift_nid,
                'lift_address' => $lift_address,
                'supplier_nid' => $supplier_nid,
                'sms_list' => $sms_list,
            ))->execute();
    } else {
        db_update('contact_list')
            ->fields(array(
                'ts' => $millis,
                'date_time' => $dt,
                'lift_id' => $lift_id,
                'lift_nid' => $lift_nid,
                'lift_address' => $lift_address,
                'supplier_nid' => $supplier_nid,
                'sms_list' => $sms_list,
            ))
            ->condition('lift_id', $lift_id)
            ->execute();
    }
    // without the paramater means set back to the default for the site
    db_set_active();
}

function _update_ext_db2($db, $params_list)
{
    Database::addConnectionInfo('JAV', 'default', $db);
    db_set_active('JAV');
    // TODO: consider timezone.
    $millis = round(microtime(true) * 1000);
    $dt = date('Y-m-d H:i:s');

    $list_params = $params_list['rows'];
    //print_r($list_params);
    foreach ($list_params as $key => $params) {
        $lift_id = $params['lift_id']; //->lift_id;
        $ts = $params['ts']; //->ts;
        $msg_type = $params['msg_type']; //->msg_type;
        $sgroup = $params['sensor_group']; // ->sensor_group;
        $event = $params['event']; //->event;
        $remarks = $params['remarks']; 
        if(true) {
            db_insert('lift_events')
                ->fields(array(
                    'lift_id' => $lift_id,
                    'ts' => $millis,
                    'date_time' => $dt,
                    'msg_type' => $msg_type,
                    'sensor_group' => $sgroup,
                    'is_set' => 0,
                    'value' => $event,
                    'remarks' => $remarks,
                ))->execute();
        }
    }
    db_set_active();
}

function _get_ext_db_liftlist($jav_db, $supplier_nid)
{
    Database::addConnectionInfo('JAV', 'default', $jav_db);
    db_set_active('JAV');

    $query = array();
    $query = db_select('contact_list', 'a')
        ->fields('a', array('lift_id', 'lift_nid', 'lift_address','supplier_nid', 'sms_list'))
        //->condition('supplier_nid', $supplier_nid, 'IN');
        ->condition('supplier_nid', $supplier_nid);

    $result = $query->execute();
    db_set_active();
    return $result;
}
