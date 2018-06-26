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
    $bg_db = getExtDBConfig();
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
    $bg_db = getExtDBConfig();
    module_load_include("api.inc", "jav");
    $res = _update_ext_db2($bg_db, $received);

    //$reqtype = $post_data->reqtype;
    $test_json = array('result' => 'ok');
    return drupal_json_output($test_json);
}

