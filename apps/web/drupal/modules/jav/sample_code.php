/*
$items = array();
foreach ($result as $row) {
$date = new DateTime();
$date->setTimestamp(intval($row->ts)/1000);
$dtime = $date->format('j-M-y g:i a');
$loc = $dev_list[$row->lift_id]['loc'];
//print_r($dtime, $row->snum);
$items[] = array($dtime, $row->lift_id, $loc, $row->value, $row->is_set);
}
*/

/*
$result_all = db_query("SELECT nid FROM node WHERE type = '%s' ", $node_type);
while ($obj = db_fetch_object ($result)) {
$sid_list = $obj->nid;
}
*/
//$field = field_info_field('field_blk_zone');
//dpm($field);
//$allowed_values = list_allowed_values($field);
//dpm($allowed_values);

//dpm($grouplist);
//$field_dev2 = field_get_items('node', $node, 'field_blk_zone', 'en');
//$uid = $field_dev2['target_id'];
//dpm($uids);
//$test = $node->get('tags')->referencedEntities();
/*
$node_wrapper = entity_metadata_wrapper('node', $node);
$zone = $node_wrapper->field_blk_zone->value()->name;
$zonelist[$sid] = $zone;
*/


/*
function jav_views_data() {

$data = array();

// Putting the table into its own groups so that we can recognize in the UI
// where it comes from
$data['exposed']['table']['group'] = t('Exposed');

// Making the 'exposed' table a base table so a View can created based on it
$data['exposed']['table']['base'] = array(
'title' => t('Exposed'),
'help' => t('Contains records we want exposed to Views.'),
);

$data['exposed']['table']['join'] = array(
'node' => array(
'left_field' => 'nid',
'field' => 'node_id',
),
);

// The ID field
$data['exposed']['id'] = array(
'title' => t('ID'),
'help' => t('The record ID.'),
'field' => array(
'handler' => 'views_handler_field_numeric',
),
'sort' => array(
'handler' => 'views_handler_sort',
),
'filter' => array(
'handler' => 'views_handler_filter_numeric',
),
);

// The Name field
$data['exposed']['name'] = array(
'title' => t('Name'),
'help' => t('The record name.'),
'field' => array(
'handler' => 'views_handler_field',
),
'sort' => array(
'handler' => 'views_handler_sort',
),
'filter' => array(
'handler' => 'views_handler_filter_string',
),
);

// The Deadline field
$data['exposed']['deadline'] = array(
'title' => t('Deadline'),
'help' => t('The record deadline.'),
'field' => array(
'handler' => 'views_handler_field_date',
),
'sort' => array(
'handler' => 'views_handler_sort_date',
),
'filter' => array(
'handler' => 'views_handler_filter_date',
),
);

// The Node ID field
$data['exposed']['node_id'] = array(
'title' => t('Node ID'),
'help' => t('The record node ID.'),
'field' => array(
'handler' => 'views_handler_field_node',
),
'sort' => array(
'handler' => 'views_handler_sort',
),
'filter' => array(
'handler' => 'views_handler_filter_numeric',
),
'relationship' => array(
'base' => 'node',
'field' => 'node_id',
'handler' => 'views_handler_relationship',
'label' => t('Node'),
),
'argument' => array(
'handler' => 'views_handler_argument_node_nid',
'numeric' => TRUE,
'validate type' => 'nid',
),
);

return $data;
}
*/
