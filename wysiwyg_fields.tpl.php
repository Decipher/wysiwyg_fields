<?php
/**
 * @file
 * Template file for Wysiwyg Fields field form.
 */
?>
<table role="presentation" cellspacing="0" border="0"
       style="width: 100%; float: none;" align="left">
  <?php foreach ($deltas as $delta => $field) : ?>
    <tr>
      <td role="presentation" class="cke_dialog_ui_vbox_child">
        <div
          role="presentation"
          class="wysiwyg_fields-<?php echo $element['#field_name'] ?>-delta wysiwyg_fields-<?php echo $element['#field_name'] ?>-delta-<?php echo $delta ?>">
          <?php echo $field ?>
        </div>
      </td>
    </tr>
  <?php endforeach ?>
</table>
<?php echo $add_more ?>
<?php echo $wysiwyg_fields ?>
