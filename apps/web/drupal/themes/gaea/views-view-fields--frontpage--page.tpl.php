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

<div class="col-md-12 fp-listing">
<div class="col-md-4">
  <?php if (!empty($fields['field_image'])): ?>
  <?php $field = $fields['field_image']; ?>
  <?php print $field->wrapper_prefix; ?>
    <?php print $field->label_html; ?>
    <?php print $field->content; ?>
  <?php print $field->wrapper_suffix; ?>
  <?php endif; ?>
</div>
<div class="col-md-8">
  <?php $field = $fields['title']; ?>
  <?php print $field->wrapper_prefix; ?>
    <?php print $field->label_html; ?>
    <h3>
      <?php print $field->content; ?>
    </h3>
  <?php print $field->wrapper_suffix; ?>
  <?php $field = $fields['body']; ?>
  <?php print $field->wrapper_prefix; ?>
    <?php print $field->label_html; ?>
    <?php print $fields['body']->content; ?>
  <?php print $field->wrapper_suffix; ?>
</div>
</div>
<div class="col-md-4">
</div>
<div class="col-md-8">
  <div class="line-separator"></div>
</div>

