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

//function _get_geojson($rqtype)
function _get_geojson()
{
    //function bgmap_get_geojson($filter, $reqtype, $starttime, $endtime) {
    //$nid_list = $_REQUEST['nidList'];
    $post_data = json_decode($_POST['jsonPost']);
    $reqtype = $post_data->reqtype;
    $filter = $post_data->filter;
    //dpm($filter); // This works, but not print_r.
    //print_r($filter);

    module_load_include("config.inc", "bgmap");
    $bg_db = getExtDBConfig();
    module_load_include("api.inc", "bgmap");
    //
    date_default_timezone_set('Asia/Singapore');
    $geojson = array(
        'type' => 'FeatureCollection',
        'features' => array()
    );

    $items2 = array();
    switch ($reqtype) {
        case 'trc':
            // The list only has one value.
            $filter->sid = $filter->sidList[0];;
            $result = _getdata_dyndb($reqtype, $filter);
            foreach ($result as $row) {
                //dpm($row);
                $time = $row['ts'];
                $gps_data = $row['gps_data'];
                //$lat = 1.421; $lng = 103.829;
                // If for any timestamp, gps_data does not exist, just skip that item.
                if($gps_data != null) {
                    $lat = $gps_data['latitude'];
                    $lng = $gps_data['longitude'];
                    $polygon[] = array($lng, $lat);
                    $timestamps[] = $time;
                }
            } // foreach
            //dpm($polygon);
            // Add this feature only if there are some values.
            if ($polygon) {
                $feature = array(
                    'type' => 'Feature',
                    'geometry' => array('type' => 'LineString', 'coordinates' => $polygon),
                    //'geometry' => array('type' => 'MultiPoint', 'coordinates' => $polygon),
                    'properties' => array(
                        'time' => $timestamps,
                        'title' => 'Test2',
                        'line-color' => '#f00',
                        'line-size' => 'small'
                    )
                );
            }
            /*
            'title' => $row['name'],
            'marker-color' => '#f00',
            'marker-size' => 'small'
            */
            # Add feature arrays to feature collection array
            // Only if not empty.
            if ($feature) {
                array_push($geojson['features'], $feature);
            }
            break;
        case 'trcm':
            // TODO: Assemble Polygon GeoJSON for multiple devices.
            break;

        case 'rt': // both single and multi.
            //$result = _getdata_exdb($bg_db, $reqtype, $filter);
            $sid_list = $filter->sidList;
            foreach ($sid_list as $sid) {
                $filter->sid = $sid;
                $result = _getdata_dyndb($reqtype, $filter);
                // A result array is always created. Will be empty for no data.
                //dpm($result);
                //if( ($result != null) && (!empty($result)) ) {
                // Empty is considered false in PHP,
                if($result) {
                    $row = $result;
                    //$time = intval($row['ts']);
                    $time = $row['ts'];
                    $gps_data = $row['gps_data'];
                    // Ignore this row, if now GPS data.
                    if($gps_data != null) {
                        //dpm($gps_data);
                        $lat = $gps_data['latitude'];
                        $lng = $gps_data['longitude'];
                        //dpm($lat, $lng);
                        $feature = array(
                            'type' => 'Feature',
                            'geometry' => array("type" => "Point", "coordinates" => [$lng, $lat]),
                            'properties' => array(
                                'title' => $sid,
                                'style' => array(
                                    'radius' => 10,
                                    'fillColor' => '#ff7800',
                                    'fillOpacity' => 0.8,
                                    'color' => '#000',
                                    /*
                                    'weight' => '1',
                                    'opacity' => '1',
                                    'marker-color' => '#f00',
                                    'marker-size' => 'small',
                                    */
                                ),
                            ),
                        );
                        # Add feature arrays to feature collection array
                        array_push($geojson['features'], $feature);
                    } // if $gps_data.
                } // if $result.
                //
            } // foreach.
            break;
    }
    //dpm($geojson);
    return drupal_json_output($geojson);
}

