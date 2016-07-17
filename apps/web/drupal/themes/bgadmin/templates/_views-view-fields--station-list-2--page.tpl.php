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
<div class="panel panel-primary">
<!-- <div class="panel-heading">
<h3 class="panel-title">Bed-1 (Mr. Tham)</h3>
</div> -->
<?php foreach ($fields as $id => $field): ?>
<?php /*dpm($field);*/ ?>
  <?php if( $field->class == "title" ) { ?>
<div class="panel-heading">
<h3 class="panel-title"> <?php print $field->raw; ?> </h3>
</div>
   <?php } ?>
 
<div class="panel-body">
  <?php if (!empty($field->separator)): ?>
    <?php print $field->separator; ?>
  <?php endif; ?>
 
  <?php /*print_r($field->raw);*/ ?>
 
  <?php print $field->wrapper_prefix; ?>
    <?php print $field->label_html; ?>
    <?php print $field->content; ?>
  <?php print $field->wrapper_suffix; ?>
</div>
<?php endforeach; ?>
</div>

