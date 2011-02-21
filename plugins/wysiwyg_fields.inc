<?php
// $Id$
/**
 * @file
 * Wysiwyg module plugin.
 */

/**
 * Implements hook_INCLUDE_plugin().
 */
function wysiwyg_fields_wysiwyg_fields_plugin() {
  $plugins = array();

  /**
   * $_SESSION['wysiwyg_fields'] contains active content type as
   * hook_wysiwyg_fields_plugin() provides no context.
   *
   * @see wysiwyg_fields_after_build()
   */
  if (isset($_SESSION['wysiwyg_fields'])) {
    foreach (content_fields(NULL, $_SESSION['wysiwyg_fields']) as $field) {
      if (isset($field['widget']['wysiwyg_fields_status']) && $field['widget']['wysiwyg_fields_status']) {
        $plugins["wysiwyg_fields_{$field['field_name']}"] = array(
          'title' => $field['widget']['label'],
          'vendor url' => 'http://drupal.org/project/wysiwyg_fields',
          'icon file' => $field['widget']['wysiwyg_fields_icon'],
          'icon title' => $field['widget']['label'],
          'css path' => drupal_get_path('module', 'wysiwyg_fields') . '/plugins',
          'css file' => 'wysiwyg_fields.css',
          'settings' => array(),
        );
      }
    }
    unset($_SESSION['wysiwyg_fields']);
  }

  return $plugins;
}
