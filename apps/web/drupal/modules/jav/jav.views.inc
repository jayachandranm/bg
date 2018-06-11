<?php

/**
 * Implements hook_views_data().
 */
function jav_views_data() {
    $data['jav']['table']['group'] = t('Exposed from ext-db');
    $data['jav']['table']['join'] = array(
      // Exist in all views.
      '#global' => array(),
    );
   
    $data['jav']['lift_status_field'] = array(
    //$data['field']['field_sensor_status'] = array(
      'title' => t('My custom field'),
      'help' => t('My custom field displays the word "Some custom markup".'),
      'field' => array(
        'handler' => 'views_handler_event_field',
      ),
    );
   
    return $data;
  }


/**
 * Implements hook_views_data_alter().
 */
/*
function jav_views_data_alter(&$data) {
  $data['node']['field_sensor_status'] = array(
    'title' => t('Name of my handler'),
    'help' => t('Description of my handler.'),
    'field' => array(
      'handler' => 'views_handler_event_field',
    ),
  );
}
 */

/**
 *
 * Substituting custom field content in views hooks
 * eg. for disaplying data from ext db.
 */
function jav_views_pre_render(&$view) {
    foreach ($view->result as &$item) {
        $lift_id = $item->field_field_lift_id[0]['rendered']['#markup'];
        $lift_status = _get_lift_status($lift_id);
        $item->field_field_sensor_status[0]['rendered']['#markup'] = t($lift_status);
        $item->field_field_sensor_status[0]['raw']['value'] = t($lift_status);
        $item->field_field_sensor_status[0]['raw']['safe_value'] = t($lift_status);
    }
}

/**
 * @param $lift_id
 * @return string
 */
function _get_lift_status($lift_id) {
    // Initialize to no_event and Healthy. Other values, Event, Error, Event+Error.
    $status = 'Healthy';
    //
    $reqtype = 'rt';
    $filter = new stdClass();
    // Get most recent values.
    $filter->start = -1;  $filter->end = -1;
    $sid_list[] = $lift_id;
    $filter->sidList = $sid_list;
    //$filter->sidList = ['99'];
    //
    module_load_include("config.inc", "jav");
    $jav_db = getExtDBConfig();
    module_load_include("api.inc", "jav");
    $result = _getdata_exdb($jav_db, $reqtype, $filter);
    // Result will either be empty or single element.
    if($row = $result->fetch()) {
        $is_set = $row->is_set;
        if ($is_set == 1) {
            $status = 'Event';
        }
    }
    $result = _get_sensorerr($jav_db, $lift_id);
    // Only need to look at the last row.
    //if($result->fetch()) {
    if($result->fetchAssoc()) {
        if($status === 'Event') {
            $status = 'Event+Error';
        } else {
            $status = 'Error';
        }
    }
    return $status;
}
//


/*
function jav_views_pre_render(&$view)
{
    // This is messy and hard to understand for site builders
    // and future developers.
    //dpm($view->field);
    foreach ($view->result as &$item) {
        //dpm()
        $lift_id = $item->field_field_lift_id[0]['rendered']['#markup'];
        $sid_list = array();
        $sid_list[] = $lift_id;
        $rpt_time = $item->field_field_event_time[0]['rendered']['#markup'];
        $reqtype = 'rt';
        $filter = new stdClass(); // (object) [];
        $filter->start = -1;
        $filter->end = -1;
        $filter->sidList[] = $sid_list;
        //$filter->sidList = ['112233C'];
        //
        module_load_include("config.inc", "jav");
        $jav_db = getExtDBConfig();
        module_load_include("api.inc", "jav");
        $result = _getdata_exdb($jav_db, $reqtype, $filter);
        date_default_timezone_set('Asia/Singapore');
        //
        $items = array();
        // Only one result expected. If no entry, set default as None.
        $lift_event = 'None';
        $rpt_time = 'NA';
        foreach ($result as $row) {
            //dpm($result);
            $is_set = $row->is_set;
            if ($is_set == 1) {
                $lift_event = $row->value;
                $date = new DateTime();
                $date->setTimestamp(intval($row->ts) / 1000);
                $rpt_time = $date->format('j-M-y g:i a');
            }
        }
        //dpm($items);

        $item->field_field_event_type[0]['rendered']['#markup'] = t($lift_event);
        $item->field_field_event_time[0]['rendered']['#markup'] = t($rpt_time);
        $item->field_field_sensor_status[0]['rendered']['#markup'] = t('Event+Error');
        $item->field_field_sensor_status[0]['raw']['value'] = t('Event+Error');
        $item->field_field_sensor_status[0]['raw']['safe_value'] = t('Event+Error');
        // Multiple errors expected for same list.
        //$item->field_field_sensor_status[0]['rendered']['#markup'] = t($rpt_time);
    }
    //$view->result[0]->custom_field_999 = t('Foo');
}
*/

