<?php
/**
 * @file
 * Template file for Wysiwyg Fields field form.
 */
?>
<?php foreach ($deltas as $delta => $field) : ?>
  <div
    class="wysiwyg_fields-<?php echo $element['#field_name'] ?>-delta wysiwyg_fields-<?php echo $element['#field_name'] ?>-delta-<?php echo $delta ?>">
    <?php echo $field ?>
  </div>
<?php endforeach ?>
<?php echo $add_more ?>
<?php echo $wysiwyg_fields ?>
