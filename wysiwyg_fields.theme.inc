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
 *
 * @param $variables
 */
function wysiwyg_fields_preprocess_wysiwyg_fields_field(&$variables) {
  $field =& drupal_static('wysiwyg_field_form_element_field', NULL);
  if (!is_null($field)) {
    $element = &$variables['element'];
    $fields  = wysiwyg_fields_ckeditor_elements();

    $element['#attributes']['class'][] = 'cke_dialog_ui_' . $fields[$element['#type']]['class'];
  }
}

/**
 * Returns Wysiwyg Fields wrapper.
 *
 * @param $variables
 *
 * @return string
 * @throws Exception
 */
function theme_wysiwyg_fields(&$variables) {
  $field   =& drupal_static('wysiwyg_field_form_element_field', NULL);
  $element = $variables['element'];

  $rows  = array();
  $field = TRUE;
  foreach (element_children($element) as $delta) {
    if (is_numeric($delta)) {
      $cols   = array();
      $cols[] = array(
        'data'  => render($element[$delta]),
        'class' => array(
          'cke_dialog_ui_vbox_child',
          "wysiwyg_fields-{$element['#field_name']}-delta",
          "wysiwyg_fields-{$element['#field_name']}-delta-{$delta}"
        ),
        'role'  => 'presentation',
      );
      $cols[] = array(
        'data'  => render($element['wysiwyg_fields']['select'][$delta]),
        'class' => array(
          'cke_dialog_ui_vbox_child',
          'wysiwyg_fields-select',
        ),
      );
      $rows[] = $cols;
    }
  }
  drupal_static_reset('wysiwyg_field_form_element_field');

  return theme('table', array(
    'rows'       => $rows,
    'attributes' => array(
      'align'       => 'left',
      'border'      => 0,
      'cellspacing' => 0,
      'class'       => array('wysiwyg_fields-table'),
      'role'        => 'presentation',
    ),
    'sticky'     => FALSE,
  )) . drupal_render_children($element);
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
