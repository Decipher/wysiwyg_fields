<?php
/**
 * @file
 * Image module integration.
 */

/**
 * Implements hook_wysiwyg_fields_field_bypass() on behalf of image.module.
 */
function image_wysiwyg_fields_field_bypass($field, $form_element = NULL) {
  if (isset($form_element['#file'])) {
    return empty($form_element['#file']);
  }
  return FALSE;
}
