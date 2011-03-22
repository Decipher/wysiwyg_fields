<?php
/**
 * @file
 * @TODO - Improve documentation.
 */

/**
 * Implements hook_wysiwyg_fields_add_js().
 */
function hook_wysiwyg_fields_add_js($type) {
  switch ($type) {
    case 'node_form':
      foreach (wysiwyg_profile_load_all() as $profile) {
        if (isset($profile->editor) && file_exists($js = drupal_get_path('module', 'MYMODULE') . "/scripts/wysiwyg.{$profile->editor}.js")) {
          drupal_add_js($js);
        }
      }
      break;
  }
}

/**
 * Implements hook_wysiwyg_fields_elements_alter().
 */
function hook_wysiwyg_fields_elements_alter($elements) {
  $elements['MYMODULE_WIDGET'] = array(
    '#process' => array('_MYMODULE_wysiwyg_fields_element_alter_process'),
  );
}

/**
 * Implements hook_wysiwyg_fields_field_bypass().
 */
function hook_wysiwyg_fields_field_bypass($field) {
  switch ($field['widget']['module']) {
    case 'MYMODULE':
      return TRUE;
  }
  return FALSE;
}

/**
 * Implements hook_wysiwyg_fields_icons().
 */
function hook_wysiwyg_fields_icons() {
  return array(
    drupal_get_path('module', 'MYMODULE') . '/images/icons',
  );
}

/**
 * Implements hook_wysiwyg_fields_theme_bypass().
 */
function hook_wysiwyg_fields_theme_bypass($widget_type) {
  switch ($widget_type) {
    case 'MYMODULE_WIDGET':
      return TRUE;
  }
  return FALSE;
}

/**
 * Implements hook_wysiwyg_fields_wysiwyg_plugins().
 */
function hook_wysiwyg_fields_wysiwyg_plugins($content_type) {
  $plugins = array();
  foreach (content_fields() as $field) {
    if (!in_array(TRUE, module_invoke_all('wysiwyg_fields_field_bypass', $field)) && !is_null(content_fields($field['field_name'], $content_type)) && isset($field['widget']['wysiwyg_fields_status']) && $field['widget']['wysiwyg_fields_status']) {
      $plugins[$field['field_name']] = array(
        'label' => $field['widget']['label'],
        'icon' => $field['widget']['wysiwyg_fields_icon'],
      );
    }
  }
  return $plugins;
}
