<?php
/**
 * @file
 * Wysiwyg module plugin.
 */

/**
 * Implements hook_INCLUDE_plugin().
 */
function wysiwyg_fields_wysiwyg_fields_plugin() {
  $plugins = array();

  $context = &drupal_static('wysiwyg_fields_context', NULL);
  if (!is_null($context)) {
    // Invoke hook_wysiwyg_fields_wysiwyg_plugins().
    $wysiwyg_plugins = module_invoke_all('wysiwyg_fields_wysiwyg_plugins', $context);
    foreach ($wysiwyg_plugins as $name => $settings) {
      // Define Wysiwyg plugin.
      // @TODO - Wysiwyg plugins aren't being ordered by weight, fix.
      $plugins["wysiwyg_fields_{$name}"] = array(
        'title' => $settings['label'],
        'vendor url' => 'http://drupal.org/project/wysiwyg_fields',
        'icon file' => $settings['icon'],
        'icon title' => $settings['label'],
        'js path' => drupal_get_path('module', 'wysiwyg_fields') . '/scripts',
        'js file' => 'wysiwyg.js',
        'css path' => drupal_get_path('module', 'wysiwyg_fields') . '/plugins',
        'css file' => 'wysiwyg_fields.css',
        'settings' => array(),
      );

      // Enable Wysiwyg plugin.
      // @TODO - Provide fine grain control on Wysiwyg profile settings.
      foreach (wysiwyg_profile_load_all() as $profile) {
        $profile->settings = is_array($profile->settings) ? $profile->settings : array();
        $profile->settings['buttons'] = isset($profile->settings['buttons']) ? $profile->settings['buttons'] : array();

        $id = "wysiwyg_fields_{$name}";
        if (!isset($profile->settings['buttons']['drupal'][$id]) || empty($profile->settings['buttons']['drupal'][$id])) {
          $profile->settings['buttons']['drupal'][$id] = 1;
          db_update('wysiwyg')
            ->fields(array('settings' => serialize($profile->settings)))
            ->condition('format', $profile->format)
            ->execute();
        }
      }
    }

    // Make Wysiwyg plugin field names available via javascript as the Wysiwyg
    // plugin javascript is invoked before Drupal.settings are available.
    drupal_add_js('var wysiwygFields = ' . drupal_json_encode(array_keys($wysiwyg_plugins)), 'inline');

    // Clear the Wysiwyg Fields context static variable.
    drupal_static_reset('wysiwyg_fields_context');
  }

  return $plugins;
}
