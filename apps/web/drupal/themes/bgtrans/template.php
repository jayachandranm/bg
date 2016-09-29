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

/*
// http://www.jaypan.com/tutorial/custom-drupal-blocks-right-way
// Overriding the block's theme defined in bgmap module.
function bgtrans_bgmap_trace_block($variables)
{
  $username = $variables['username'];
  $age = $variables['age'];
  $location = $variables['location'];
  $followers = $variables['followers'];
 
  $output = '';
  $output .= '<p>' . t('The user is named @name', array('@name' => $username)) . '</p>';
  $output .= '<p>' . t('The user has !count followers', array('!count' => count($followers))) . '</p>';
  $output .= '<p>' . t('The user is !age years old', array('!age' => $age)) . '</p>';
  $output .= '<p>' . t('The user is in @location', array('@location' => $location)) . '</p>';
 
  return $output;
}

// Have custom JS and CSS for the block for each theme.
function bgtrans_block_view_bgmap_trace_block_alter(&$block, $data)
{
  // We only want to attach our files if $block has been returned in our module.
  if($data)
  {
    $path = drupal_get_path('theme', 'bgtrans');
    $block['content']['#attached'] = array
    (
      'js' => array
      (
        array
        (
          'type' => 'file',
          'data' => $path . '/js/my_block.js',
        ),
      ),
      'css' => array
      (
        array
        (
          'type' => 'file',
          'data' => $path . '/css/my_block.css',
        ),
      ),
    );
  }
}
*/
