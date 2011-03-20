<?php
/**
 * @file
 * Embedded Media Field module integration.
 */

/**
 * Implements hook_wysiwyg_fields_widget_bypass() on behalf of emfield.module.
 */
function emfield_wysiwyg_fields_widget_bypass($widget) {
  $modules = array('emfield', 'emaudio', 'emimage', 'eminline', 'emthumb', 'emvideo', 'emwave');
  if (in_array($widget['module'], $modules)) {
    return TRUE;
  }
  return FALSE;
}
