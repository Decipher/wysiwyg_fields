<?php
// $Id$
/**
 * @file
 * Content module integration.
 */

/**
 * @TODO - Add validation for formatters, at least one required if field enabled
 *   for Wysiwyg Fields.
 */
function wysiwyg_fields_widget_settings_alter(&$settings, $op, $widget) {
  switch ($op) {
    case 'form':
      $settings['wysiwyg_fields'] = array(
        '#title' => t('Wysiwyg Fields settings'),
        '#type' => 'fieldset',
        '#weight' => 10,
        '#collapsible' => TRUE,
        '#collapsed' => TRUE,
      );

      $settings['wysiwyg_fields']['wysiwyg_fields_status'] = array(
        '#title' => t('Attach to Wysiwyg?'),
        '#type' => 'checkbox',
        '#default_value' => isset($widget['wysiwyg_fields_status'])
          ? $widget['wysiwyg_fields_status']
          : 0
        ,
      );

      // @TODO: Allow for uploaded icons and manual URLs.
      $settings['wysiwyg_fields']['wysiwyg_fields_icon'] = array(
        '#title' => t('Icon'),
        '#type' => 'radios',
        '#options' => /*array_merge(*/
          _wysiwyg_fields_icons(),
        //  array('upload' => t('Upload'))
        //),
        '#default_value' => isset($widget['wysiwyg_fields_icon'])
          ? $widget['wysiwyg_fields_icon']
          : current(array_keys(_wysiwyg_fields_icons()))
        ,
        '#attributes' => array(
          'class' => 'container-inline',
        ),
      );

      $settings['wysiwyg_fields']['wysiwyg_fields_formatters'] = array(
        '#title' => t('Formatters'),
        '#type' => 'select',
        '#options' => _wysiwyg_fields_formatters(),
        '#default_value' => isset($widget['wysiwyg_fields_formatters'])
          ? $widget['wysiwyg_fields_formatters']
          : array()
        ,
        '#multiple' => TRUE,
        '#element_validate' => array('_wysiwyg_fields_widget_settings_alter_formatters_validate'),
      );
      break;

    case 'save':
      $settings[] = 'wysiwyg_fields_status';
      $settings[] = 'wysiwyg_fields_icon';
      $settings[] = 'wysiwyg_fields_formatters';
  }
}

function _wysiwyg_fields_widget_settings_alter_formatters_validate($element, &$form_state) {
  if ($form_state['values']['wysiwyg_fields_status'] == TRUE && empty($form_state['values']['wysiwyg_fields_formatters'])) {
    form_error($element, t('At least one Formatter must be selected to be used with Wysiwyg Fields.'));
  }
}

/**
 *
 */
function _wysiwyg_fields_icons() {
  $icons = array();

  foreach (scandir(dirname(__FILE__) . '/../images/icons') as $file) {
    if (!is_dir($file)) {
      $file = "/images/icons/{$file}";
      $icons["../../..{$file}"] = theme('image', drupal_get_path('module', 'wysiwyg_fields') . $file);
    }
  }

  return $icons;
}

/**
 *
 */
function _wysiwyg_fields_formatters() {
  $field = content_fields(arg(5), arg(3));
  $field_types = _content_field_types();

  $formatters = array();
  foreach ($field_types[$field['type']]['formatters'] as $id => $formatter) {
    $formatters[$id] = $formatter['label'];
  }

  return $formatters;
}
