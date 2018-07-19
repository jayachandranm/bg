<?php

function _get_json()
{
    $geojson = array();
    return drupal_json_output($geojson);
}

/**
 * Ajax end point function, menu callback.
 *
 * Used by browser JS to retrieve data in real time.
 * saved in that time period.
 *
 * @return
 *   JSON data.
 */

function _get_geojson($rqtype)
{
    //function jav_get_geojson($filter, $reqtype, $starttime, $endtime) {
    //$nid_list = $_REQUEST['nidList'];
    $post_data = json_decode($_POST['jsonPost']);
    $reqtype = $post_data->reqtype;
    $filter = $post_data->filter;
    //dpm($filter); // This works, but not print_r.
    //print_r($filter);

    module_load_include("config.inc", "jav");
    $jav_db = getExtDBConfig();
    module_load_include("api.inc", "jav");
    //
    date_default_timezone_set('Asia/Singapore');
    $geojson = array(
        'type' => 'FeatureCollection',
        'features' => array()
    );

    $items2 = array();
    switch ($reqtype) {
    }
    //dpm($geojson);
    return drupal_json_output($geojson);
}

function _get_event_count() 
{
    $num_unack = 0;
    if(isset($_POST['jsonPost'])) {
        //print_r('Hello World');
        $dev_list = $_SESSION['jav']['#selected_lifts'];
        $sid_list = array();
        if ($dev_list) {
            //foreach($dev_list as $key => $value) {
            foreach ($dev_list as $dev) {
                //$sid_list[] = $key;
                $sid_list[] = $dev["sid"];
            }
        }
        $received = $_POST['jsonPost'];
        $post_data = json_decode($received, TRUE);
        $reqtype = $post_data->reqtype;
        $filter = $post_data->filter;
        $filter->condition = 'all_unack';
        $filter->sidList = $sid_list;
        //print_r($sid_list);
        //dpm($filter); // This works, but not print_r.
        module_load_include("config.inc", "jav");
        $jav_db = getExtDBConfig();
        module_load_include("api.inc", "jav");
        //date_default_timezone_set('Asia/Singapore');
        $result_all = _get_active_events($jav_db, $filter);
        //print_r($result_all);
        $num_unack = count($result_all);
    }
    $data = array('unack_count' => $num_unack);
    return drupal_json_output($data);
}

function _update_db()
{
    $received = $_POST['jsonPost'];
    //$post_data = json_decode($_POST['jsonPost']);
    // Use inputstream module.
    //$received = file_get_contents("drupal://input");
    $received = json_decode($received, TRUE);
    //print_r($received['rows']);
     
    //dpm($received);
    module_load_include("config.inc", "jav");
    $jav_db = getExtDBConfig();
    module_load_include("api.inc", "jav");
    $res = _update_ext_db2($jav_db, $received);

    //$reqtype = $post_data->reqtype;
    $test_json = array('result' => 'ok');
    return drupal_json_output($test_json);
}

function _notify_node() {
    $received = $_POST['jsonPost'];
    // $received = json_decode($received, TRUE);

    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, 'http://localhost');
    curl_setopt($ch, CURLOPT_PORT, 8001);
    //curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 2);

    $data = array( "liftId"=> $lift_id, "sType"=> $stype );
    //$payload = json_encode($data);
    $payload = $received;

    curl_setopt($ch, CURLOPT_POSTFIELDS, $payload);
    curl_setopt($ch, CURLOPT_HTTPHEADER, array('Content-Type:application/json'));
    # Return response instead of printing.
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true );
    //curl_setopt($ch, CURLOPT_DNS_LOCAL_IP4, '127.0.0.1' );

    $result = curl_exec($ch);
    curl_close($ch);
    # Print response.
    $test_json = array('result' => 'ok');
    return drupal_json_output($test_json);
}