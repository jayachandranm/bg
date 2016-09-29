<?php
/**
 * @file
 * The primary PHP file for this theme.
 */

function bgtrans_theme() {
  $items = array();
  // create custom user-login.tpl.php
  $items['user_login'] = array(
  'render element' => 'form',
  'path' => drupal_get_path('theme', 'bgtrans') . '/templates',
  'template' => 'user-login',
  'preprocess functions' => array(
  'bgtrans_preprocess_user_login'
  ),
 );
return $items;
}

function bgtrans_preprocess_user_login(&$vars) {
  $vars['intro_text'] = t(' Login');
}

/*
 *  Remove labels and add HTML5 placeholder attribute to login form
 */
function bgtrans_form_alter(&$form, &$form_state, $form_id) {
  if ( TRUE === in_array( $form_id, array( 'user_login', 'user_login_block') ) )
    $form['name']['#attributes']['placeholder'] = t( 'Username / Email' );
    $form['pass']['#attributes']['placeholder'] = t( 'Password' );
    $form['name']['#title_display'] = "invisible";
    $form['pass']['#title_display'] = "invisible";
    //$form['actions']['submit']['#value'] = t('add desired text for submit button here');
}



/*
 *  Remove login form descriptions
 */
function bgtrans_form_user_login_alter(&$form, &$form_state) {
    $form['name']['#description'] = t('');
    $form['pass']['#description'] = t('');
}
