<?php
/**
 * @file
 * FileField module integration.
 */

/**
 * Implements hook_wysiwyg_fields_elements_alter() on behalf of filefield.module.
 */
function filefield_wysiwyg_fields_elements_alter($elements) {
  foreach (module_invoke_all('widget_info') as $widget_type => $widget) {
    if (in_array('filefield', $widget['field types'])) {
      $elements[$widget_type]['#after_build'] = array('_filefield_wysiwyg_fields_elements_alter_after_build');
    }
  }
}

/**
 *
 */
function _filefield_wysiwyg_fields_elements_alter_after_build($form_element, &$form_state) {
  if (empty($form_element['fid']['#value'])) {
    unset($form_element['wysiwyg_fields']);
  }
  return $form_element;
}
