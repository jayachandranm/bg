//drupal_add_js(array('bedmon' => array('uid' => $station_id)), 'setting');
//drupal_add_js($path . '/bedmon_chart.js');
//drupal_add_js(array('bedmon3' => array('uid' => $station_id)), 'setting');
/*
      $block = array (
        'subject' => t('Pulse, Respiration Charts'),
        'content' => array(
          '#markup' => t('These are the block contents'),
          '#attached' => array(
            'js' => array(
              array(
                'type' => 'file',
                'data' => $path . '/bedmon_chart.js',
              ),
            ),
          ),
        ),
      );
*/
/*
      if (user_access('access content')) {
        $block['content']['#markup'] = "";
      }
*/
      //$block['content']['#attached']['libraries_load'][] = array('highcharts', 'highcharts');
      //$block['content']['#attached']['libraries_load'][] = array('highcharts');
      //$block['content']['#attached']['js'] = drupal_get_path('module', 'bedmon') . '/bedmon.js';

      /*
            $block = array();
            drupal_add_js(drupal_get_path('module', 'bedmon') . '/bedmon_pressure.js');
            $block['subject'] = t('Pressure Profile');
            if (user_access('access content')) {
              //$block['content']['#markup'] = "";
              $block['content'] = custom_contents();
            }
      */
