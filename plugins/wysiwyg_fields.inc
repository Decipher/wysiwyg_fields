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

  /**
   * $_SESSION['wysiwyg_fields'] contains active content type as
   * hook_wysiwyg_fields_plugin() provides no context.
   *
   * @see wysiwyg_fields_after_build()
   * @see wysiwyg_wysiwyg_fields_init()
   */
  if (isset($_SESSION['wysiwyg_fields'])) {
    /**
     * Invoke hook_wysiwyg_fields_wysiwyg_plugins().
     */
    foreach (module_invoke_all('wysiwyg_fields_wysiwyg_plugins', $_SESSION['wysiwyg_fields']) as $name => $settings) {
      // Define Wysiwyg plugin.
      // @TODO - Wysiwyg plugins aren't being ordered by weight, fix.
      $plugins["wysiwyg_fields_{$name}"] = array(
        'title' => $settings['label'],
        'vendor url' => 'http://drupal.org/project/wysiwyg_fields',
        'icon file' => $settings['icon'],
        'icon title' => $settings['label'],
        'css path' => drupal_get_path('module', 'wysiwyg_fields') . '/plugins',
        'css file' => 'wysiwyg_fields.css',
        'settings' => array(),
        // @See http://drupal.org/node/1010534
        //'extended_valid_elements' => array(
        //  'wysiwyg_field[*]',
        //),
      );

      // Prevent dynamic JavaScript files from being parsed through locale.
      $parsed = variable_get('javascript_parsed', array());
      $js = drupal_get_path('module', 'wysiwyg_fields') . "/plugins/wysiwyg_fields_{$name}/wysiwyg_fields_{$name}.js";
      if (!in_array($js, $parsed)) {
        $parsed[] = $js;
      }
      variable_set('javascript_parsed', $parsed);
    }
    unset($_SESSION['wysiwyg_fields']);
  }

  return $plugins;
}
