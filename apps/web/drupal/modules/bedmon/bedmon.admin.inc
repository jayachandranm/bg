/**
 * Page callback: Current posts settings
 *
 * @see current_posts_menu()
 */
function bedmon_admin_config($form, &$form_state) {
  $form['bedmon_max'] = array(
    '#type' => 'textfield',
    '#title' => t('Maximum number of entries in the chart'),
    '#default_value' => variable_get('bedmon_max', 3),
    '#size' => 2,
    '#maxlength' => 2,
    '#description' => t('The maximum number of entries to display in the chart.'),
    '#required' => TRUE,
  );

  return system_settings_form($form);
}
