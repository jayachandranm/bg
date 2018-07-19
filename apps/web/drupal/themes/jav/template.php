<?php
/**
 * @file
 * The primary PHP file for this theme.
 */

function hdbjav_preprocess_block(&$variables) {
    //dpm($variables);
}

/**
 * Implements hook_preprocess_node
 */
function hdbjav_preprocess_node(&$variables){
  if ($variables['node']->type == 'lift_companies') {
    $variables['title'] = FALSE;
  }
}
