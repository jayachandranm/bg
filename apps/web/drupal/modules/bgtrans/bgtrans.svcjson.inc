<?php

function _get_json()
{
    $geojson = array();
    //$geojson['test'] = 'hello';
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
    //function bgtrans_get_geojson($filter, $reqtype, $starttime, $endtime) {
    //$nid_list = $_REQUEST['nidList'];
    $post_data = json_decode($_POST['jsonPost']);
    $reqtype = $post_data->reqtype;
    $filter = $post_data->filter;
    //dpm($filter); // This works, but not print_r.
    //print_r($filter);

    module_load_include("api.inc", "bgtrans");
    $result = _getdata_exdb($reqtype, $filter);
    //
    date_default_timezone_set('Asia/Singapore');
    $geojson = array(
        'type' => 'FeatureCollection',
        'features' => array()
    );

    $items2 = array();
    switch ($reqtype) {
        case 'trc':
            foreach ($result as $row) {
                // TODO: Or use float/double?
                $time = intval($row->timestamp);
                //$noise = round($row->noise_data, 2);
                // In DB as double.
                $lat = floatval($row->latitude);
                $lng = floatval($row->longitude);

                //$polygon[] = array($lat, $lng);
                $polygon[] = array($lng, $lat);
                //
            } // foreach
            //dpm($polygon);
            // Add this feature only if there are some values.
            # Add feature arrays to feature collection array
            // Only if not empty.
            break;
        case 'trcm':
            // TODO: Assemble Polygon GeoJSON for multiple devices.
            break;

        case 'rt': // both single and multi.
            foreach ($result as $row) {
                //$noise = round($row->noise_data, 2);
                $time = intval($row->timestamp);
                $lat = floatval($row->latitude);
                $lng = floatval($row->longitude);
                $sid = $row->sid;
                //$title = $row->title; //$row['name']

                # Add feature arrays to feature collection array
                array_push($geojson['features'], $feature);
                //
            } // foreach
            break;
    }
    //dpm($geojson);
    return drupal_json_output($geojson);
}


