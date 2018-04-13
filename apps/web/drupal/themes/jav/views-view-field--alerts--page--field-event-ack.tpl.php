<?php

/**
 * @file
 * This template is used to print a single field in a view.
 *
 * It is not actually used in default Views, as this is registered as a theme
 * function which has better performance. For single overrides, the template is
 * perfectly okay.
 *
 * Variables available:
 * - $view: The view object
 * - $field: The field handler object that can process the input
 * - $row: The raw SQL result that can be used
 * - $output: The processed output that will normally be used.
 *
 * When fetching output from the $row, this construct should be used:
 * $data = $row->{$field->field_alias}
 *
 * The above will guarantee that you'll always get the correct data,
 * regardless of any changes in the aliasing that might happen if
 * the view is modified.
 */
?>

<?php /*dpm($row->field_field_sensor_status[0]['raw']['safe_value']);*/ ?>
<?php /*dpm($field);*/ ?>

<?php
$lift_id = $row->field_field_lift_id[0]['raw']['safe_value'];
$ack_id = "ack-".$lift_id;
$event_ack = $row->field_field_event_ack[0]['raw']['safe_value'];
?>

<button type="button" class="ack btn btn-primary btn-xs" data-id= 
  <?php print $ack_id; ?> id=<?php print $ack_id; ?> >
<?php print $event_ack; ?>
</button> 

<?php /*print $output;*/ ?>
