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

<?php /*dpm($fields);*/ ?>
<!-- <div class="event-img"> -->
<span>
<!-- <span style="float:left; margin-left;10px;margin-right:10px;margin-bottom:30px"> -->
<span class="event-img">
  <?php if (!empty($fields['field_image'])): ?>
  <?php $field = $fields['field_image']; ?>
  <?php /*print $field->wrapper_prefix;*/ ?>
    <?php print $field->label_html; ?>
    <?php print $field->content; ?>
  <?php /*print $field->wrapper_suffix;*/ ?>
  <?php endif; ?>
</span>
<!-- </div> -->
<!-- <div class="event-txt">  -->
  <?php if (!empty($fields['title'])): ?>
  <?php $field = $fields['title']; ?>
  <?php print $field->wrapper_prefix; ?>
    <?php print $field->label_html; ?>
    <?php print $field->content; ?>
  <?php print $field->wrapper_suffix; ?>
  <?php endif; ?>
   </br>Location : Address
  <?php if (!empty($fields['view_node'])): ?>
  <?php $field = $fields['view_node']; ?>
    <?php print $field->content; ?>
  <?php endif; ?>
</span>
<!-- <div style="clear:left"></div> -->
<div class="event-txt">  
<!-- </div> -->
<!-- <div class="line-separator"></div> -->

