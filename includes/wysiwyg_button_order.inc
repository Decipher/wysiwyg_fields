<?php
/**
 * @file
 * Wysiwyg Button Order integration.
 */

/**
 * Implements hook_wysiwyg_fields_wysiwyg_editor_settings_alter() on behalf of
 * wysiwyg_button_order.module.
 */
function wysiwyg_button_order_wysiwyg_fields_wysiwyg_editor_settings_alter(&$settings, $context) {
  if ($context['profile']->editor == 'ckeditor') {
    $wysiwyg_fields = array();
    foreach ($context['profile']->settings['buttons']['drupal'] as $plugin => $enabled) {
      if (strpos($plugin, 'wysiwyg_fields_') === 0 && $enabled) {
        $wysiwyg_fields[] = $plugin;
      }
    }
    if (!empty($wysiwyg_fields)) {
      $settings['toolbar'][] = $wysiwyg_fields;
    }
  }
}
