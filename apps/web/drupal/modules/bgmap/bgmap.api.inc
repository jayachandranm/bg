<?php

function _getdata_exdb($reqtype, $filter)
{
    // From admin page.
    //$max_num = variable_get('bgmap_max', 3);
    //$sid_list = $filter[sidList];
    $sid_list = $filter->sidList;
    $start_time = $filter->start;
    $end_time = $filter->end;

    // TODO: Sanitize sids array before using in the query statement.
    $bg_db = array(
        'database' => 'bgmap',
        'username' => 'bgmap', // assuming this is necessary
        'password' => 'bgmap%user$1', // assuming this is necessary
        'host' => 'localhost', // assumes localhost
        'driver' => 'mysql', // replace with your database driver
    );

    Database::addConnectionInfo('BLUGRAPHTECH', 'default', $bg_db);
    db_set_active('BLUGRAPHTECH');

    // TODO: iF multiple entry match the condition, handle as error?

    $query = array();
    if ($reqtype == 'rt') {
        $query = db_select('obd_gps', 'a')
            ->fields('a', array('sid', 'timestamp', 'longitude', 'latitude'))
            ->condition('sid', $sid_list, 'IN')
            ->orderBy('timestamp', 'DESC');
        // TODO: Can be conditional, different for block and page.
        //$query->range(0, $max_num);
        // TODO: Use timestamp condition instead?
        $query->range(0, 1);
    }
    if ($reqtype == 'trc') {
        $query = db_select('obd_gps', 'a')
            ->fields('a', array('sid', 'timestamp', 'longitude', 'latitude'))
            // TODO: Currently assumes single sid.
            ->condition('sid', $sid_list, 'IN')
            //->condition('sid', array(1,5,7),'IN')
            //->condition('status', 0,'>')
            ->condition('timestamp', array($start_time, $end_time), 'BETWEEN')
            //->orderBy('datetime', 'DESC');
            ->orderBy('datetime', 'ASC');
    }

    $result = $query->execute();
    db_set_active();
    return $result;
}


function _update_ext_db($nid, $sid, $vnum, $vgroup, $flag)
{
    $bg_db = array(
        'database' => 'bgmap',
        'username' => 'bgmap', // assuming this is necessary
        'password' => 'bgmap%user$1', // assuming this is necessary
        'host' => 'localhost', // assumes localhost
        'driver' => 'mysql', // replace with your database driver
    );

    Database::addConnectionInfo('BLUGRAPHTECH', 'default', $bg_db);
    db_set_active('BLUGRAPHTECH');

    // TODO: consider timezone.
    $millis = round(microtime(true) * 1000);
    $dt = date('Y-m-d H:i:s');

    //$query = array();
    if ($flag) {
        db_insert('obd_node_map')
            ->fields(array(
                'timestamp' => $millis,
                'datetime' => $dt,
                'sid' => $sid,
                'nid' => $nid,
                'veh_num' => $vnum,
                'veh_type' => $vgroup,
            ))->execute();
    } else {
        db_update('obd_node_map')
            ->fields(array(
                'timestamp' => $millis,
                'datetime' => $dt,
                'sid' => $sid,
                'nid' => $nid,
                'veh_num' => $vnum,
                'veh_type' => $vgroup,
            ))
            ->condition('nid', $nid)
            ->execute();
    }
    // without the paramater means set back to the default for the site
    db_set_active();
}

