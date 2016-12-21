<?php
/**
 * @file
 * The primary PHP file for this theme.
 */

function bgtrans_theme()
{
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
    //
    $items['vehicle_node_form'] = array(
        'arguments' => array('form' => NULL),
        'render element' => 'form',
        'path' => drupal_get_path('theme', 'bgtrans') . '/templates',
        'template' => 'vehicle-node-form',
        //'template' => 'templates/custom-content-type-node-form',

    );
    //print_r($items);
    //dpm($items);
    return $items;
}

function bgtrans_preprocess_user_login(&$vars)
{
    $vars['intro_text'] = t(' Login');
    // TODO: To remove warnings.
    // http://drupal.stackexchange.com/questions/206819/custom-user-login-template-error
    //print drupal_render_children($form);
    $vars['content_attributes_array']['class'][] = 'content';
    $vars['title_attributes_array']['class'][] = 'content';
    $vars['attributes_array']['class'][] = 'content';
    $vars['classes_array'] = array('content');
}

/*
 *  Remove labels and add HTML5 placeholder attribute to login form
 */
function bgtrans_form_alter(&$form, &$form_state, $form_id)
{
    //dpm($form);
    if (TRUE === in_array($form_id, array('user_login', 'user_login_block'))) {
        $form['name']['#attributes']['placeholder'] = t('Username / Email');
        $form['pass']['#attributes']['placeholder'] = t('Password');
        $form['name']['#title_display'] = "invisible";
        $form['pass']['#title_display'] = "invisible";
        //$form['actions']['submit']['#value'] = t('add desired text for submit button here');
    }
    if ($form_id == 'vehicle_node_form') {
        //dpm($form);
    }
}


/*
 *  Remove login form descriptions
 */
function bgtrans_form_user_login_alter(&$form, &$form_state)
{
    $form['name']['#description'] = t('');
    $form['pass']['#description'] = t('');
}
