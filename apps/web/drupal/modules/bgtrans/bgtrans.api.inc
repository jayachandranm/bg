<?php

function _getdata_exdb($reqtype, $filter)
{
    // From admin page.
    //$max_num = variable_get('bgtrans_max', 3);
    //$sid_list = $filter[sidList];
    $sid_list = $filter->sidList;
    $start_time = $filter->start;
    $end_time = $filter->end;

    //dpm($sid_list); 
    //dpm($reqtype); 
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
    if ($reqtype == 'alarms') {
        $query_inner = db_select('obd_gps', 'a')
            ->fields('a', array('sid', 'timestamp', 'longitude', 'latitude'))
            ->condition('sid', $sid_list, 'IN')
            ->condition('timestamp', array($start_time, $end_time), 'BETWEEN');
            //->orderBy('timestamp', 'DESC');
        // Limit to a max.
        $query_inner->range(0, 1000);
        //
        $query = db_select($query_inner, 'b')
            ->fields('b', array('sid', 'timestamp', 'longitude', 'latitude'))
            //->groupBy('sid');
            ->orderBy('timestamp', 'DESC');
    }
    if ($reqtype == 'alarms_rt') {
        $query_inner = db_select('obd_gps', 'a')
            ->fields('a', array('sid', 'timestamp', 'longitude', 'latitude'))
            ->condition('sid', $sid_list, 'IN')
            ->condition('timestamp', array($start_time, $end_time), 'BETWEEN');
            //->orderBy('timestamp', 'DESC');
            //$query->addExpression('MAX(id)');
        // TODO: Can be conditional, different for block and page.
        //$query->range(0, $max_num);
        // TODO: Use timestamp condition instead?
        $query_inner->range(0, 1000);
        //
        $query = db_select($query_inner, 'b')
            ->fields('b', array('sid', 'timestamp', 'longitude', 'latitude'))
            ->groupBy('sid');
        
    }
    if ($reqtype == 'fuel') {
/*
        $query = db_select('obd_gps', 'a')
            ->fields('a', array('sid', 'timestamp', 'longitude', 'latitude'))
            // TODO: Currently assumes single sid.
            ->condition('sid', $sid_list, 'IN')
            //->condition('sid', array(1,5,7),'IN')
            //->condition('status', 0,'>')
            ->condition('timestamp', array($start_time, $end_time), 'BETWEEN')
            //->orderBy('datetime', 'DESC');
            ->orderBy('datetime', 'ASC');
*/
    }

    $result = $query->execute();
    db_set_active();
    return $result;
}


