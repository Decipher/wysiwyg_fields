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
        if (isset($profile->editor) && file_exists($js = drupal_get_path('module', 'wysiwyg_fields') . "/scripts/wysiwyg.{$profile->editor}.js")) {
          drupal_add_js($js);
        }
      }
      break;
  }
}

/**
 * Implements hook_wysiwyg_fields_elements_alter().
 */
function hook_wysiwyg_fields_elements_alter(&$elements) {
  $elements['date_select'] = array(
    '#process' => array('_date_wysiwyg_fields_element_alter_process'),
  );
}

/**
 * Implements hook_wysiwyg_fields_icons().
 */
function hook_wysiwyg_fields_icons() {
  return array(
    drupal_get_path('module', 'wysiwyg_fields') . '/images/icons',
  );
}

/**
 * Implements hook_wysiwyg_fields_theme_bypass().
 */
function hook_wysiwyg_fields_theme_bypass($widget_type) {
  switch ($widget_type) {
    case 'date_select':
      return TRUE;
  }

  return FALSE;
}
