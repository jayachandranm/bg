<?php

/**
 * Page callback: Module admin settings page.
 *
 * @see current_posts_menu()
 */
function bgmap_admin_config($form, &$form_state)
{
    $form['bgmap_max'] = array(
        '#type' => 'textfield',
        '#title' => t('Maximum number of entries in the map'),
        '#default_value' => variable_get('bgmap_max', 3),
        '#size' => 2,
        '#maxlength' => 2,
        '#description' => t('The maximum number of entries to display in the map.'),
        '#required' => TRUE,
    );
    return system_settings_form($form);
}

