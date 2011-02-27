<?php
/**
 * @file
 * Features module integration.
 */

/**
 * Implements hook_features_api().
 */
function wysiwyg_fields_features_api() {
  return array(
    'wysiwyg_fields' => array(
      'name' => t('Wysiwyg Fields: Icon'),
      'feature_source' => TRUE,
      'default_hook' => 'wysiwyg_fields_icons',
    ),
  );
}

/**
 * Implements hook_features_export_options().
 */
function wysiwyg_fields_features_export_options() {
  $icons = array();
  foreach (wysiwyg_fields_icons() as $checksum => $file) {
    // @TODO - Don't show default Wysiwyg Fields icons.
    // @TODO - Don't render as HTML.
    $icons[$checksum] = theme('image', $file);
  }
  return $icons;
}

/**
 * Implements hook_features_export().
 */
function wysiwyg_fields_features_export($data, &$export, $module_name = '') {
  $export['dependencies']['wysiwyg_fields'] = 'wysiwyg_fields';
  foreach ($data as $checksum) {
    $export['features']['wysiwyg_fields'][$checksum] = $checksum;
  }
}

/**
 * Implements hook_features_export_render().
 */
function wysiwyg_fields_features_export_render($module_name = '', $data) {
  return array(
    'wysiwyg_fields_icons' => "  return array(
    drupal_get_path('module', '{$module_name}') . '/images/wysiwyg_fields',
  );"
  );
}

/**
 * Implements hook_features_export_wysiwyg_fields_assets().
 *
 * @see http://drupal.org/node/1064340
 */
function wysiwyg_fields_features_export_wysiwyg_fields_assets($data, $export, $module_name) {
  $assets = array();

  foreach ($data as $checksum) {
    $assets['images'][] = wysiwyg_fields_icons($checksum);
  }

  return $assets;
}

/**
 * Implements hook_features_pipe_component_alter().
 */
function wysiwyg_fields_features_pipe_content_alter(&$pipe, $data, $export, $module_name = '') {
  foreach ($data as $field) {
    $args = explode('-', $field);
    $field = content_fields($args[1], $args[0]);
    if ($field['widget']['wysiwyg_fields_status']) {
      $pipe['wysiwyg_fields'][$field['widget']['wysiwyg_fields_icon']] = $field['widget']['wysiwyg_fields_icon'];
      foreach ($field['widget']['wysiwyg_fields_formatters'] as $formatter) {
        $formatter = array_merge(_content_get_formatter($formatter, $field['type']), array('name' => $formatter));
        $pipe['dependencies'][] = $formatter['module'];
        // @TODO - Move this elsewhere?
        if ($formatter['module'] == 'custom_formatters') {
          $pipe['custom_formatters'][$formatter['name']] = $formatter['name'];
        }
      }
    }
  }
}
