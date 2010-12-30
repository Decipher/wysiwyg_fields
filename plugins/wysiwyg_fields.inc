<?php
// $Id$
/**
 * @file
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
   * @see wysiwyg_fields_build_after().
   */
  if (isset($_SESSION['wysiwyg_fields'])) {
    foreach (content_fields(NULL, $_SESSION['wysiwyg_fields']) as $field) {
      if (isset($field['widget']['wysiwyg_fields_status']) && $field['widget']['wysiwyg_fields_status']) {
        $plugins["wysiwyg_fields_{$field['field_name']}"] = array(
          'title' => $field['widget']['label'],
          'vendor url' => 'http://drupal.org/project/wysiwyg_fields',
          'icon file' => $field['widget']['wysiwyg_fields_icon'],
          'icon title' => $field['widget']['label'],
          'settings' => array(),
        );
      }
    }

    // Enable dynamically created Wysiwyg plugins.
    // @TODO - This is called too late, needs to be run before the WYSIWYG is
    // loaded.
    foreach (wysiwyg_profile_load_all() as $profile) {
      // @TODO - If $profile->settings['buttons'] is empty, the dynamic buttons
      // aren't added.
      if (!empty($profile->settings['buttons'])) {
        $update = FALSE;
        foreach ($plugins as $id => $data) {
          if (!isset($profile->settings['buttons']['drupal'][$id]) || empty($profile->settings['buttons']['drupal'][$id])) {
            $update = TRUE;
            $profile->settings['buttons']['drupal'][$id] = 1;
          }
        }

        // Write updated Wysiwyg profile settings to database.
        if ($update) {
          db_query("UPDATE {wysiwyg} SET settings = '%s' WHERE format = %d", serialize($profile->settings), $profile->format);
        }
      }
    }

    unset($_SESSION['wysiwyg_fields']);
  }

  return $plugins;
}
