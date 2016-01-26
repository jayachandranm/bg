<?php

/**
 * @file
 * Default simple view template to all the fields as a row.
 *
 * - $view: The view in use.
 * - $fields: an array of $field objects. Each one contains:
 *   - $field->content: The output of the field.
 *   - $field->raw: The raw data for the field, if it exists. This is NOT output safe.
 *   - $field->class: The safe class id to use.
 *   - $field->handler: The Views field handler object controlling this field. Do not use
 *     var_export to dump this object, as it can't handle the recursion.
 *   - $field->inline: Whether or not the field should be inline.
 *   - $field->inline_html: either div or span based on the above flag.
 *   - $field->wrapper_prefix: A complete wrapper containing the inline_html to use.
 *   - $field->wrapper_suffix: The closing tag for the wrapper.
 *   - $field->separator: an optional separator that may appear before a field.
 *   - $field->label: The wrap label text to use.
 *   - $field->label_html: The full HTML of the label to use including
 *     configured element type.
 * - $row: The raw result object from the query, with all data it fetched.
 *
 * @ingroup views_templates
 */
?>
<?php /*dpm($row);*/ ?>
<?php /*dpm($fields['field_station_id']);*/ ?>
<?php /*dpm($view);*/ ?>
<?php /*print_r($fields['title']->raw);*/ ?>
<?php /*print_r($fields['view_node']->content);*/ ?>
<?php 
$nid = $row->nid;
$sid = $row->field_field_station_id[0]['raw']['value'];
// Possible bug,
// https://www.drupal.org/node/1160706
// https://www.drupal.org/node/1140896, views_php module
//$time_div = "time-".$fields['field_station_id']->raw;
$time_div = "time-".$sid;
$mov_div = "mov-".$sid;
$resp_div = "resp-".$sid;
$pulse_div = "pulse-".$sid;
$occ_div = "occ-".$sid;


$resp_val = 0;
$pulse_val = 0;
$occ_val = 0;

//dpm($row->_field_data['nid']['entity']->field_resp['und'][0]['value']);
$resp_val = $row->_field_data['nid']['entity']->field_resp['und'][0]['value'];
//field_field_resp[0]['raw']['value'];
$pulse_val = $row->_field_data['nid']['entity']->field_pulse['und'][0]['value'];
$occ_val = $row->_field_data['nid']['entity']->field_occupancy['und'][0]['value'];
$occ_status = "Not Occupied";
if($occ_val == 1) {
  $occ_status = "Occupied";
}
?>

<div class="panel panel-primary">
  <div class="panel-heading"> 
    <h3 class="panel-title"><?php print $fields['title']->raw; ?> </h3>
  </div> 
  <div class="panel-body">
    <h4><span class="label label-default" id=<?php print $time_div ?>> -- </span> </h4>
    <!-- <h3><span class="label label-primary" id="occupancy0">Not Occupied</span></h3> -->
    <h3><span class="label label-primary" id=<?php print $mov_div ?>> <?php print $occ_status ?></span></h3>
    <hr>
    <div>
    <div class="vitals-score-background">
      <h5>&nbsp;&nbsp;RESPIRATION</h5>
      <h2><div style="text-align: center; vertical-align: middle;"; id=<?php print $resp_div ?>>
        <?php /*print $fields['field_station_id']->raw;*/ ?> 
        <?php print $resp_val; ?> 
      </div></h2>
    </div>
    <div class="vitals-score-background">
      <h5>&nbsp;&nbsp;PULSE</h5>
      <h2><div style="text-align: center; vertical-align: middle;"; id=<?php print $pulse_div ?>>
        <?php /*print $fields['nid']->content;*/ ?> 
        <?php print $pulse_val; ?> 
      </div></h2>
    </div>
    </div>
    <p></p>
    <div class="occ-background">
      <img class="img-responsive" id=<?php print $occ_div ?> style="display: block; margin: 0 auto;" src="sites/default/files/unoccupied.png">
    </div>
    <p></p>
    <p></p>
    <?php  
      $content_link_raw = $fields['view_node']->content;
      $button_link = str_replace('<a', '<a class="btn btn-info"', $content_link_raw);
      print $button_link;
    ?>
    <!-- <button class="btn btn-info" role="button">  -->
      <?php /*print $fields['view_node']->content; */?> 
    <!-- </button> -->
  </div>
</div>

