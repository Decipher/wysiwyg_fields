<?php
/**
 * @file
 * Date module integration.
 */

/**
 * Implements hook_wysiwyg_fields_elements_alter() on behalf of date.module.
 */
function date_wysiwyg_fields_elements_alter($elements) {
  $elements['date_select'] = array(
    '#process' => array('_date_wysiwyg_fields_element_alter_process'),
  );
}

/**
 *
 */
function _date_wysiwyg_fields_element_alter_process($form_element) {
  $field = content_fields($form_element['#field']['field_name'], $form_element['#field']['type_name']);
  if (isset($field['widget']['wysiwyg_fields_status']) && $field['widget']['wysiwyg_fields_status'] == TRUE) {
    $form_element['#field_name'] = $form_element['#field']['field_name'];
    $form_element['#type_name'] = $form_element['#field']['type_name'];
  }
  return $form_element;
}

/**
 * Implements hook_wysiwyg_fields_theme_bypass() on behalf of date.module.
 */
function date_wysiwyg_fields_theme_bypass($widget_type) {
  switch ($widget_type) {
    case 'date_select':
      return TRUE;
  }

  return FALSE;
}
