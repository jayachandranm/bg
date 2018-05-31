<?php
/**
 * @file
 * Custom views handler definition.
 *
 * Place this code in
 * /sites/all/[custom_module_name]/includes/views_handler_my_custom_field.inc
 */
 
/**
 * Custom handler class.
 *
 * @ingroup views_field_handlers
 */
class views_handler_event_field extends views_handler_field {
    /**
     * {@inheritdoc}
     *
     * Perform any database or cache data retrieval here. In this example there is
     * none.
     */
    function query() {
       //$this->ensure_my_table();
       //$this->add_additional_fields();
    }
   
    /**
     * {@inheritdoc}
     *
     * Modify any end user views settings here. Debug $options to view the field
     * settings you can change.
     */
    function option_definition() {
      $options = parent::option_definition();
      return $options;
    }

    /*
    function construct() {
      parent::construct();
      $this->additional_fields['type'] = 'type';
    }
     */

    /**
     * {@inheritdoc}
     *
     * Make changes to the field settings form seen by the end user when adding
     * your field.
     */
    function options_form(&$form, &$form_state) {
      parent::options_form($form, $form_state);
    }
   
    /**
     * Render callback handler.
     *
     * Return the markup that will appear in the rendered field.
     */
    function render($values) {
      //$type = $this->get_value($values, 'type');
      //$nid = $this->get_value($values, 'nid');
      //$lift_id = $this->get_value($values, 'field_lift_id');
      $lift_id = $values->field_field_lift_id[0]['rendered']['#markup'];
      // Get any active events for the lift.
      // Check whether last error status is healthy.
      //return mymodule_print_my_link($nid, $type)
      //dpm($lift_id);
      return t('Healthy');
      //$lift_status = $this->get_lift_status($lift_id);
      //return $lift_status;
    }

    /**
     * @param $lift_id
     * @return string
     */
    function get_lift_status($lift_id) {
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
  }
