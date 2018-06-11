<?php

/**
 * Implements hook_block_info().
 */
function jav_block_info()
{
    $blocks = array();
    $blocks['rtsingle'] = array(
        // The name that will appear in the block list.
        'info' => t('JAV Tracking'),
        // Default setting.
        'cache' => DRUPAL_CACHE_PER_ROLE,
        //'cache' => DRUPAL_CACHE_GLOBAL,
    );
    $blocks['rtmulti'] = array(
        'info' => t('JAV Tracking All'),
        'cache' => DRUPAL_CACHE_PER_ROLE,
    );
    $blocks['eventlist_all'] = array(
        'info' => t('JAV Events'),
        'cache' => DRUPAL_CACHE_PER_ROLE,
    );
    $blocks['eventlist_single'] = array(
        'info' => t('JAV Lift Events'),
        'cache' => DRUPAL_CACHE_PER_ROLE,
    );
    $blocks['sensor_status'] = array(
        'info' => t('JAV Sensor Status'),
        'cache' => DRUPAL_CACHE_PER_ROLE,
    );
    $blocks['reports'] = array(
        'info' => t('JAV Reports'),
        'cache' => DRUPAL_CACHE_PER_ROLE,
    );
    $blocks['dash_info'] = array(
        'info' => t('Info Widgets'),
        'cache' => DRUPAL_CACHE_PER_ROLE,
    );
    return $blocks;
}

/**
 *
 * Implements hook_theme().
 */
function jav_theme()
{
    $theme_subfolder = drupal_get_path('module', 'jav') . "/theme";
    return array(
        'jav_dash_info' => array(
            'path' => $theme_subfolder,
            'template' => 'jav_dash_info_blk',
            'arguments' => array('items' => NULL),
            // All preprocess hooks in .theme.inc.
            //'file' => 'bgmap.theme.inc',
        ),
    );
}


/**
 * Implements hook_block_view().
 *
 * Prepares the contents of the block.
 */
function jav_block_view($delta = '')
{
    // For the case of block added to a View.
    //$view_1 = views_get_view('dashboard');
    //$info = views_embed_view('dashboard');
    // Get the list of lifts based on the active view.
    $dev_list = _jav_set_list();
    //$dev_list = drupal_static('jav');
    //dpm($this);
    //dpm($dev_list);
    $sid_list = array();
    if ($dev_list) {
        //foreach($dev_list as $key => $value) {
        foreach ($dev_list as $dev) {
            //$sid_list[] = $key;
            $sid_list[] = $dev["sid"];
        }
    }
    $block = array();
    // TODO: exit if it is not a node but a view or something else. But should allow selected views.
    // TODO: Move this to init? For the case of view this happens outside.
    $mpath = drupal_get_path('module', 'jav');

    // For the case of block added to a Node.
    if ($node = menu_get_object()) {
        // TODO: if($node) {}
        if ($node->type == 'lifts') {
            //dpm($node);
            $nid = $node->nid;
            // Always read these fields in English.
            $field_dev = field_get_items('node', $node, 'field_lift_id', 'en');
            $sid = $field_dev[0]['safe_value'];
        } // if node-type.
        else {
            $sid = "Unknown";
        }
    } // if node.
    else {
        $sid = "Unknown";
    }

    // Always pass as an array of values, for generic handling at JS side.
    if ($sid) {
        $sid_list[] = $sid;
    }
    //$sid = (string)$sid_tmp;

    switch ($delta) {
        /*
        * The real time block may appear in a page that shows all items or on a page that
        * shows single item. Create a filter to reflect this context. The filter can be
        * presented as a JSON, where some parameters may be missing, if some fields on the page
        * is missing (eg. sensor_id).
        */
        case 'rtsingle':
            // Pass any node related parameters here, which can then be used by the JS during Ajax.
            // Here will be an array that contains the filter values.
            // if(isset($sid)) {}
            $block['subject'] = t('Location...');
            if (user_access('access content')) {
                $block['content']['#markup'] = "<div id='rt_map'>Map will display here.....</div>";
            }
            $block['content']['#attached']['libraries_load'][] = array('leaflet');
            // If not in libraries directory,
            //$block['content']['#attached']['library'][] = array('system','ui.droppable');
            $block['content']['#attached']['js'] = array(
                array(
                    'type' => 'file',
                    'data' => $mpath . '/jav_rt.js',),
                array(
                    'type' => 'setting',
                    'data' => array(
                        'rt' => array(
                            'veh_list' => array(
                                $sid => array(
                                    'sid' => $sid,
                                    'nid' => $nid,
                                    'vnum' => $vnum
                                ),
                            ),
                        ),
                    ),
                )
            );
            break;
            //
        case 'rtmulti':
            // Only appears in a view.
            // TODO: What if this block is enabled for a node?
            // TODO: nidList already set in the view preprocess.
            if (user_access('access content')) {
                $block = array
                (
                    'subject' => t('JAV Locations...'),
                    'content' => array
                    (
                        'rtmulti_block' => array
                        (
                            '#prefix' => "<div id='rt_map'>",
                            '#suffux' => "</div>",
                            '#markup' => t("Map will display here....."),
                        ),
                    ),
                );
            }
            $block['content']['#attached']['libraries_load'][] = array('leaflet');
            $block['content']['#attached']['js'] = array(
                array(
                    'type' => 'file',
                    'data' => $mpath . '/jav_rt.js',),
            );
            break;
            //
        case 'eventlist_all':
            //$dev_list = _jav_set_list();
            //$dev_list = drupal_static('jav');
            $dev_list = $_SESSION['jav']['#selected_lifts'];
            $sid_list = array();
            if ($dev_list) {
                //foreach($dev_list as $key => $value) {
                foreach ($dev_list as $dev) {
                    //$sid_list[] = $key;
                    $sid_list[] = $dev["sid"];
                }
            }
            $block['content']['#attached']['js'] = array(
                array(
                    'type' => 'file',
                    'data' => $mpath . '/jav.js',),
            );
            if (user_access('access content')) {
                $block = array
                (
                    'subject' => t('Lift Events'),
                    'content' => array
                    (
                        'eventlist_block' => array
                        (
                            '#prefix' => "<div id='rt_map'>",
                            '#suffux' => "</div>",
                            '#markup' => t("Event table....."),
                        ),
                    ),
                );

                $header = array(
                    array('data' => t('Date Time')),
                    array('data' => t('Lift ID')),
                    array('data' => t('Lift Location')),
                    array('data' => t('Event Type')),
                    array('data' => t('Event')),
                );

                $reqtype = 'rt';
                $filter = new stdClass(); // (object) [];
                // Get most recent values.
                $filter->start = -1;
                $filter->end = -1;
                //dpm($sid_list);
                //$sid_list = ['99'];
                $filter->sidList = $sid_list;
                //$filter->sidList = ['99'];
                //
                module_load_include("config.inc", "jav");
                $jav_db = getExtDBConfig();
                module_load_include("api.inc", "jav");
                $result = _getdata_exdb($jav_db, $reqtype, $filter);
                //dpm($result);
                date_default_timezone_set('Asia/Singapore');
                //
                $items = array();
                // Only one result expected. If no entry, set default as None.
                $lift_event = 'None';
                $rpt_time = 'NA';
                foreach ($result as $row) {
                    //dpm($row);
                    $is_set = $row->is_set;
                    if ($is_set == 1) {
                        $lift_event = $row->value;
                        $event_type = "Lift Event";
                        $date = new DateTime();
                        $date->setTimestamp(intval($row->ts) / 1000);
                        $rpt_time = $date->format('j-M-y g:i a');
                        $loc = $dev_list[$row->lift_id]['loc'];
                        $items[] = array($rpt_time, $row->lift_id, $loc, $event_type, $lift_event);
                    }
                }
                foreach ($sid_list as $lift_id) {
                    $result = _get_sensorerr($jav_db, $lift_id);
                    foreach ($result as $row) {
                        //dpm($result);
                        $err_code = $row->value;
                        $sensor = $row->sensor;
                        $err_msg = _errcode_to_message($sensor, $err_code);
                        $err = $sensor . ' / ' . $err_msg;
                        $event_type = "Sensor Error";
                        $date = new DateTime();
                        $date->setTimestamp(intval($row->ts) / 1000);
                        $err_time = $date->format('j-M-y g:i a');
                        $loc = $dev_list[$row->lift_id]['loc'];
                        $items[] = array($err_time, $row->lift_id, $loc, $event_type, $err);
                    }
                }
                $block['content']['eventlist_block']['#markup'] = theme('table', array('header' => $header, 'rows' => $items, 'attributes' => array('id' => 'sort-table')));
            } // if user_access
            break;
            //
        case 'eventlist_single':
            $block['content']['#attached']['js'] = array(
                array(
                    'type' => 'file',
                    'data' => $mpath . '/jav.js',),
            );
            if (user_access('access content')) {
                $block = array
                (
                    'subject' => t('Lift Events'),
                    'content' => array
                    (
                        'eventlist_block' => array
                        (
                            '#prefix' => "<div id='rt_map'>",
                            '#suffux' => "</div>",
                            '#markup' => t("Event table....."),
                        ),
                    ),
                );

                $header = array(
                    array('data' => t('Date Time')),
                    array('data' => t('Lift ID')),
                    array('data' => t('Lift Location')),
                    array('data' => t('Event Type')),
                    array('data' => t('Set / Reset')),
                );

                $reqtype = 'trc';
                $filter = new stdClass(); // (object) [];
                $filter->start = -1;
                $filter->end = time() * 1000;
                $filter->sidList = $sid_list;
                //$filter->sidList = ['112233C'];
                //
                module_load_include("config.inc", "jav");
                $jav_db = getExtDBConfig();
                module_load_include("api.inc", "jav");
                $result = _getdata_exdb($jav_db, $reqtype, $filter);
                //dpm($result);
                date_default_timezone_set('Asia/Singapore');
                //
                $items = array();
                foreach ($result as $row) {
                    $date = new DateTime();
                    $date->setTimestamp(intval($row->ts) / 1000);
                    $dtime = $date->format('j-M-y g:i a');
                    //print_r($dtime, $row->snum);
                    //dpm($dev_list[$row->lift_id]);
                    $loc = $dev_list[$row->lift_id]["loc"];
                    $items[] = array($dtime, $row->lift_id, $loc, $row->value, $row->is_set);
                }
                //dpm($items);
                $block['content']['eventlist_block']['#markup'] = theme('table', array('header' => $header, 'rows' => $items, 'attributes' => array('id' => 'list-events-table')));
            } // if user_access
            break;
            //
        case 'sensor_status':
            $block['content']['#attached']['js'] = array(
                array(
                    'type' => 'file',
                    'data' => $mpath . '/jav.js',),
            );
            if (user_access('access content')) {
                $block = array
                (
                    'subject' => t('Sensor Status'),
                    'content' => array
                    (
                        'eventlist_block' => array
                        (
                            '#prefix' => "<div id='sensor_status'>",
                            '#suffux' => "</div>",
                            '#markup' => t("Sensor status....."),
                        ),
                    ),
                );

                $header = array(
                    //array('data' => t('Time'), 'field' => 'id', 'sort' => 'desc'),
                    //array('data' => t('Address'), 'colspan' => 3),
                    //array('data' => t('Sensor Name')),
                    array('data' => t('Reported Time')),
                    array('data' => t('Status')),
                    array('data' => t('Remarks')),
                );

                $reqtype = 'ss';
                $filter = new stdClass(); // (object) [];
                $filter->start = -1;
                $filter->end = time() * 1000;
                $filter->sidList = $sid_list;
                //$filter->sidList = ['112233C'];
                //
                module_load_include("config.inc", "jav");
                $jav_db = getExtDBConfig();
                module_load_include("api.inc", "jav");
                $result = _getdata_exdb($jav_db, $reqtype, $filter);
                //dpm($result);
                date_default_timezone_set('Asia/Singapore');
                //
                $items = array();
                foreach ($result as $row) {
                    $date = new DateTime();
                    $date->setTimestamp(intval($row->ts) / 1000);
                    $dtime = $date->format('j-M-y g:i a');
                    //print_r($dtime, $row->snum);
                    //$items[] = array($dtime, $row->name, $row->status, $row->details);
                    $items[] = array($dtime, $row->value, $row->sensor);
                }
                //dpm($items);

                $block['content']['eventlist_block']['#markup'] = theme('table', array('header' => $header, 'rows' => $items, 'attributes' => array('id' => 'sensor-status-table')));

            } // if user_access
            break;
            //
        case 'reports':
            if (user_access('access content')) {
                $block = array
                (
                    'subject' => t(''),
                    'content' => array
                    (
                        'reports_block' => array
                        (
                            '#prefix' => "<div id='reports'>",
                            '#suffux' => "</div>",
                            '#markup' => t("Reports....."),
                        ),
                    ),
                );
                $block['content']['#attached']['js'] = array(
                    array(
                        'type' => 'file',
                        'data' => $mpath . '/jav_reports.js',),
                );

                $reqtype = 'rpt';
                $filter = new stdClass(); // (object) [];
                $filter->start = -1;
                $filter->end = time() * 1000;
                // Get all nids of type lifts.
                $node_type = "lifts";
                $nids = array();
                $grouplist = array();
                $nids = db_query("SELECT nid FROM {node} WHERE type = :type", array(':type' => $node_type))->fetchCol();
                foreach ($nids as $nid) {
                    $node = node_load($nid);
                    //dpm($node);
                    $field_dev = field_get_items('node', $node, 'field_lift_id', 'en');
                    $sid = $field_dev[0]['safe_value'];
                    $sid_list[] = $sid;

                    //dpm($nid, $sid);
                    //$og_id = current($node->og_groups);
                    $og_groups = og_get_entity_groups('node', $node);
                    foreach ($og_groups as $entity_type => $og_memberships) {
                        foreach ($og_memberships as $membership_id => $entity_id) {
                            if ($entity_type == 'node') {
                                $group_node = node_load($entity_id);
                                //dpm($group_node->title);
                                $grouplist[$sid] = $group_node->title;
                            }
                        }
                    }
                }
                $filter->sidList = $sid_list;
                //$filter->sidList = ['112233C'];
                //
                module_load_include("config.inc", "jav");
                $jav_db = getExtDBConfig();
                module_load_include("api.inc", "jav");
                $result = _getdata_exdb($jav_db, $reqtype, $filter);
                //dpm($result);
                date_default_timezone_set('Asia/Singapore');
                //
                $header = array(
                    array('data' => t('Town Council')),
                    array('data' => t('Lift ID')),
                    array('data' => t('Reported Date')),
                    array('data' => t('Time')),
                    array('data' => t('Status')),
                    array('data' => t('Set / Reset')),
                );

                $items = array();
                foreach ($result as $row) {
                    $date = new DateTime();
                    $date->setTimestamp(intval($row->ts) / 1000);
                    //$dtime = $date->format('j-M-y g:i a');
                    $dt = $date->format('d-m-Y');
                    $tt = $date->format('g:i a');
                    $og_group = $grouplist[$row->lift_id];
                    $items[] = array($og_group, $row->lift_id, $dt, $tt, $row->value, $row->is_set);
                }
                $block['content']['reports_block']['#markup'] = theme('table', array('header' => $header, 'rows' => $items, 'attributes' => array('id' => 'reports-table')));
            } // if user_access
            break;
            //
        case 'dash_info':
            if (user_access('access content')) {
                $block = array
                (
                    'subject' => t(''),
                    'content' => array
                    (
                        'info_block' => array
                        (
                            '#prefix' => "<div id='info'>",
                            '#suffix' => "</div>",
                            '#markup' => t("Info....."),
                        ),
                    ),
                );
                $items2 = array();
                $block['content']['info_block']['#markup'] = theme('jav_dash_info', array('items' => $items2));
            } // if user_access
            break;
        case 'aob':
            if (user_access('access content')) {
                print_r("Unexpected switch");
            } // if user_access
            break;
    } // switch
    //libraries_info('moment');
    return $block;
}

function _errcode_to_message($sensor, $err_code) {
    $err_msg = "error";
    switch ($err_code) {
        case "error1":
            $err_msg = "sagnac low power.";
            break;
        case "error2":
            $err_msg = "sagnac over power.";
            break;
        case "error3":
            $err_msg = "mz low power.";
            break;
        case "error4":
            $err_msg = "mz over power.";
            break;
    }
    return $err_msg;
}
