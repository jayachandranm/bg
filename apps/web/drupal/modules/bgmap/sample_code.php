<?php
    //drupal_add_js('https://cdn.jsdelivr.net/momentjs/2.14.1/moment.min.js', 'external');
    //drupal_add_css('https://maxcdn.bootstrapcdn.com/font-awesome/4.5.0/css/font-awesome.min.css', 'external');
/*
    $path2moment = libraries_get_path('moment');
    drupal_add_js($path2moment.'/moment.min.js');
*/
/*
if (($library = libraries_detect('moment')) && !empty($library['installed'])) {
  // The library is installed. Awesome!
  dpm($library);
  print_r("Library moment is installed (2)</br>");
}
else {
  // Something went wrong. :(
  print_r("Error: Library moment is not installed</br>");
  // This contains a short status code of what went wrong, such as 'not found'.
  $error = $library['error'];
  // This contains a detailed (localized) error message.
  $error_message = $library['error message'];
  print_r($error_message);
}

// Try to load the library and check if that worked.
if (($library = libraries_load('moment')) && !empty($library['loaded'])) {
  // Do something with the library here.
  print_r("Library moment loaded.");
}
else {
  print_r("Error: Library moment is not loaded.");
}
*/

/*
            // https://www.computerminds.co.uk/articles/rendering-drupal-7-fields-right-way
            $lng = $node->language;
            $lng = $form['FIELDNAME']['#language'];
            $sid = $node->field_obd_id['und'][0]['value'];
            $sid = $node->field_obd_id[LANGUAGE_NONE][0]['value'];
            $vnum = $node->field_vehicle_num['und'][0]['value'];
*/
            // 
/*
    if (arg(0) == 'node' && is_numeric(arg(1))) {
       // Get the nid
       $nid = arg(1);

       // Load the node if you need to
       $node = node_load($nid);
    }
*/

/*
// http://www.jaypan.com/tutorial/custom-drupal-blocks-right-way
function bgmap_theme()
{
  $themes['bgmap_trace_block'] = array
  (
    'variables' => array
    (
      'username' => FALSE,
      'age' => FALSE,
      'location' => FALSE,
      'followers' => FALSE,
    ),
  );
 
  return $themes;
}

// Default theme, override in template.php
function theme_bgmap_trace_block($variables)
{
  return '<p>' . t('Need to override theme_bgmap_trace_block() in template.php') . '</p>';
}
*/

/*
      // Pass variables for the block to theme.
      // http://www.jaypan.com/tutorial/custom-drupal-blocks-right-way
      $account = menu_get_object('user');
      if($account) {}
      $username = get_some_username($account);
      $followers = get_user_followers($account);
      $age = get_user_age($account);
      $location = get_user_location($location);
 
      $block = array
      (
        'subject' => '',
        'content' => array
        (
          'my_block_block' => array
          (
            '#theme' => 'mymodule_myblock_block',
            '#username' => $username,
            '#age' => $age,
            '#followers' => $followers,
            '#location' => $location,
          ),
        ),
      );
*/

        /*
                This doesn't seem to work for Drupal-7.
                $vars['#attached']['js'] = array(
                $vars['view']['#attached']['js'] = array(
                              array(
                                'type' => 'file',
                                'data' => $mpath . '/bgmap_rt.js',),
                              array(
                                'type' => 'setting',
                                'data' => array(
                                  'rt' => array('veh_list' => $selected_vehs),
                                ),
                              )
                           );
        */

/*
                $items2 = array();
                $items2[] = array('Test', '2');
                // No content in the last week.
                if (empty($items2)) {
                    $block['content']['#markup'] = t('No data available.');
                    //$block['content'] = t('No data available.');
                } else {
                    // Pass data through theme function.
                    //$block['content']['#markup'] = theme('item_list', array('items' => $items2));
                    // TODO: Create empty div here?
                    $block['content']['#markup'] = theme('table', array('items' => $items2));
                    //$block['content'] = theme('item_list', array('items' => $items2));
                }
*/
//drupal_set_message((string) $query);
//while($record = $result->fetchAssoc()) {
//print_r($record);
//dpm($filter);
//$today = getdate();
//$start_time = mktime(0, 0, 0,$today['mon'],($today['mday'] - 20), $today['year']);

