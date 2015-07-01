<?php

/**
 * @file
 * Theme functions for the Wysiwyg Fields module.
 */

/**
 * Map of CKEditor elements and attributes for styling.
 *
 * @return array
 */
function wysiwyg_fields_ckeditor_elements() {
  return array(
    'checkbox'  => array(
      'class'   => 'checkbox_input',
      'labeled' => FALSE,
    ),
    'select'    => array('class' => 'input_select'),
    'textarea'  => array('class' => 'input_textarea'),
    'textfield' => array('class' => 'input_text'),
  );
}

/**
 * Implements hook_preprocess().
 *
 * @param $variables
 */
function template_preprocess_wysiwyg_fields(&$variables) {
  $field   =& drupal_static('wysiwyg_field_form_element_field', NULL);
  $element = $variables['element'];

  $field = TRUE;
  foreach (element_children($element) as $delta) {
    if (is_numeric($delta)) {
      $variables['deltas'][$delta] = render($element[$delta]);
    }
  }

  $variables['add_more']       = render($element['add_more']);
  $variables['wysiwyg_fields'] = render($element['wysiwyg_fields']);

  drupal_static_reset('wysiwyg_field_form_element_field');
}

/**
 * Implements hook_preprocess().
 *
 * @param $variables
 */
function wysiwyg_fields_preprocess_form_element(&$variables) {
  $field =& drupal_static('wysiwyg_field_form_element_field', NULL);
  if (!is_null($field)) {
    $element = &$variables['element'];
    $fields  = wysiwyg_fields_ckeditor_elements();
    if (isset($element['#type']) && isset($fields[$element['#type']])) {
      $variables['theme_hook_suggestions'][] = 'wysiwyg_fields_form_element';
    }
  }
}

/**
 * Preprocess callback for all generic HTML field elements.
 */
function wysiwyg_fields_preprocess_wysiwyg_fields_field(&$variables) {
  $field =& drupal_static('wysiwyg_field_form_element_field', FALSE);
  if ($field) {
    $element = &$variables['element'];
    $fields  = wysiwyg_fields_ckeditor_elements();

    $element['#attributes']['class'][] = 'cke_dialog_ui_' . $fields[$element['#type']]['class'];
  }
}

/**
 * Modified version of theme_form_element().
 *
 * Adds CKEditor dialog ui classes to Wysiwyg Fields form elements.
 *
 * @param $variables
 *
 * @return string
 * @throws Exception
 */
function theme_wysiwyg_fields_form_element($variables) {
  $element = &$variables['element'];
  $fields  = wysiwyg_fields_ckeditor_elements();

  // This function is invoked as theme wrapper, but the rendered form element
  // may not necessarily have been processed by form_builder().
  $element += array(
    '#title_display' => 'before',
  );

  // Add element #id for #type 'item'.
  if (isset($element['#markup']) && !empty($element['#id'])) {
    $attributes['id'] = $element['#id'];
  }

  // Add element's #type and #name as class to aid with JS/CSS selectors.
  $attributes['class'] = array('form-item');
  if (!empty($element['#type'])) {
    $attributes['class'][] = 'form-type-' . strtr($element['#type'], '_', '-');
  }
  if (!empty($element['#name'])) {
    $attributes['class'][] = 'form-item-' . strtr($element['#name'], array(
        ' ' => '-',
        '_' => '-',
        '[' => '-',
        ']' => ''
      ));
  }
  // Add a class for disabled elements to facilitate cross-browser styling.
  if (!empty($element['#attributes']['disabled'])) {
    $attributes['class'][] = 'form-disabled';
  }
  $output = '<div' . drupal_attributes($attributes) . '>' . "\n";

  // If #title is not set, we don't display any label or required marker.
  if (!isset($element['#title'])) {
    $element['#title_display'] = 'none';
  }
  $prefix = isset($element['#field_prefix']) ? '<span class="field-prefix">' . $element['#field_prefix'] . '</span> ' : '';
  $suffix = isset($element['#field_suffix']) ? ' <span class="field-suffix">' . $element['#field_suffix'] . '</span>' : '';

  // Add 'ckeditor_dialog_ui_labeled_content' class wrapper.
  if (!isset($fields[$element['#type']]['labeled']) || $fields[$element['#type']]['labeled']) {
    $prefix = '<div class="ckeditor_dialog_ui_labeled_content">' . $prefix;
    $suffix .= '</div>';
  }

  switch ($element['#title_display']) {
    case 'before':
    case 'invisible':
      $output .= ' ' . theme('form_element_label', $variables);
      $output .= ' ' . $prefix . $element['#children'] . $suffix . "\n";
      break;

    case 'after':
      $output .= ' ' . $prefix . $element['#children'] . $suffix;
      $output .= ' ' . theme('form_element_label', $variables) . "\n";
      break;

    case 'none':
    case 'attribute':
      // Output no label and no required marker, only the children.
      $output .= ' ' . $prefix . $element['#children'] . $suffix . "\n";
      break;
  }

  if (!empty($element['#description'])) {
    $output .= '<div class="description">' . $element['#description'] . "</div>\n";
  }

  $output .= "</div>\n";

  // Add 'cke_dialog_ui_vbox_child' class wrapper.
  $output = '<div class="cke_dialog_ui_vbox_child">' . $output . '</div>';

  return $output;
}
