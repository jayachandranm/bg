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

<?php
//dpm($fields);
/*$sid = $row->field_field_lift_id[0]['raw']['value'];
$time_div = "time-".$sid;*/
$time_div = "time-test";
?>

<?php /*foreach ($fields as $id => $field): */ ?>
  <?php /*if (!empty($field->separator)): */?>
    <?php /*print $field->separator; */?>
  <?php /*endif; */?>

  <?php /*print $field->wrapper_prefix; */?>
    <?php /*print $field->label_html; */?>
    <?php /*print $field->content; */?>
  <?php /*print $field->wrapper_suffix;*/ ?>
<?php /*endforeach; */?>

<div class="panel panel-primary"; style="margin-bottom: 20px">
  <div class="panel-heading">
    <h3 class="panel-title"><?php print $fields['title']->raw; ?> </h3>
  </div>
  <div class="panel-body">
    <?php print $fields['field_lift_id']->wrapper_prefix; ?>
    <?php print $fields['field_lift_id']->label_html; ?>
    <?php print $fields['field_lift_id']->content; ?>
    <?php print $fields['field_lift_id']->wrapper_suffix; ?>
    <?php /*print render($content['field_lift_photo']); */?>
    <hr>
    <?php print $fields['field_lift_photo']->content; ?>
    <p></p>
    <p></p>
    <?php
      $content_link_raw = $fields['view_node']->content;
      $button_link = str_replace('<a', '<a class="btn btn-info"', $content_link_raw);
      print $button_link;
    ?>
  </div>
</div>

