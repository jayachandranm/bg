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
        $query_inner = db_select('lift_events', 'a')
            ->fields('a', array('snum', 'ts', 'etype', 'remarks'))
            ->condition('snum', $sid_list, 'IN')
            ->orderBy('ts', 'DESC');
        //$query->addExpression('MAX(id)');
        // TODO: Can be conditional, different for block and page.
        //$query->range(0, $max_num);
        // TODO: Use timestamp condition instead?
        $query_inner->range(0, 100);
        //
        $query = db_select($query_inner, 'b')
            ->fields('b', array('snum', 'ts', 'etype', 'remarks'))
            ->groupBy('snum');

    }
    if ($reqtype == 'trc') {
        $query = db_select('lift_events', 'a')
            ->fields('a', array('snum', 'ts', 'etype', 'remarks'))
            ->condition('snum', $sid_list, 'IN')
            //->condition('sid', array(1,5,7),'IN')
            //->condition('status', 0,'>')
            ->condition('ts', array($start_time, $end_time), 'BETWEEN')
            //->orderBy('datetime', 'DESC');
            ->orderBy('ts', 'ASC');
    }
    if ($reqtype == 'rpt') {
        $query = db_select('lift_events', 'a')
            ->fields('a', array('snum', 'ts', 'etype', 'remarks'))
            ->condition('snum', $sid_list, 'IN')
            //->condition('sid', array(1,5,7),'IN')
            //->condition('status', 0,'>')
            ->condition('ts', array($start_time, $end_time), 'BETWEEN')
            //->orderBy('datetime', 'DESC');
            ->orderBy('ts', 'ASC');
    }
    if ($reqtype == 'ss') {
        $query = db_select('sensor_status', 'a')
            ->fields('a', array('lift_id', 'ts', 'name', 'status', 'details'))
            ->condition('lift_id', $sid_list, 'IN')
            //->condition('sid', array(1,5,7),'IN')
            //->condition('status', 0,'>')
            ->condition('ts', array($start_time, $end_time), 'BETWEEN')
            //->orderBy('datetime', 'DESC');
            ->orderBy('ts', 'ASC');
    }

    $result = $query->execute();
    db_set_active();
    return $result;
}


function _update_ext_db($bg_db, $nid, $sid, $vnum, $vgroup, $flag)
{
    Database::addConnectionInfo('JAV', 'default', $bg_db);
    db_set_active('JAV');

    // TODO: consider timezone.
    $millis = round(microtime(true) * 1000);
    $dt = date('Y-m-d H:i:s');

    //$query = array();
    if ($flag) {
        db_insert('jav_node_map')
            ->fields(array(
                'timestamp' => $millis,
                'datetime' => $dt,
                'sid' => $sid,
                'nid' => $nid,
                'jav_num' => $vnum,
                'jav_type' => $vgroup,
            ))->execute();
    } else {
        db_update('obd_node_map')
            ->fields(array(
                'timestamp' => $millis,
                'datetime' => $dt,
                'sid' => $sid,
                'nid' => $nid,
                'jav_num' => $vnum,
                'jav_type' => $vgroup,
            ))
            ->condition('nid', $nid)
            ->execute();
    }
    // without the paramater means set back to the default for the site
    db_set_active();
}

