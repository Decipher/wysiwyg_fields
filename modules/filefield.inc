<?php
// $Id$
/**
 * @file
 * FileField module integration.
 */

/**
 * Implements hook_wysiwyg_fields_elements_alter() on behalf of filefield.module.
 */
function filefield_wysiwyg_fields_elements_alter(&$elements) {
  $elements['filefield_widget']['#after_build'] = array('_filefield_wysiwyg_fields_elements_alter_after_build');
}

/**
 *
 */
function _filefield_wysiwyg_fields_elements_alter_after_build($form_element, &$form_state) {
  if (empty($form_element['fid']['#value'])) {
    unset($form_element['wysiwyg_fields_formatters'], $form_element['wysiwyg_fields_insert']);
  }
  return $form_element;
}
