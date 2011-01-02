<?php
// $Id$
/**
 * @file
 * CCK integration.
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
        '#default_value' => isset($widget['wysiwyg_fields_status']) ? $widget['wysiwyg_fields_status'] : 0,
      );
      // @TODO: Allow for uploaded icons and manual URLs.
      $settings['wysiwyg_fields']['wysiwyg_fields_icon'] = array(
        '#title' => t('Icon'),
        '#type' => 'radios',
        '#options' => /*array_merge(*/
          _wysiwyg_fields_icons(),
        //  array('upload' => t('Upload'))
        //),
        '#default_value' => isset($widget['wysiwyg_fields_icon']) ? $widget['wysiwyg_fields_icon'] : 0,
        '#attributes' => array(
          'class' => 'container-inline',
        ),
      );
      break;

    case 'save':
      $settings[] = 'wysiwyg_fields_status';
      $settings[] = 'wysiwyg_fields_icon';
  }
}

function _wysiwyg_fields_icons() {
  $icons = array();

  foreach (scandir(dirname(__FILE__) . '/../images/icons') as $file) {
    if (!is_dir($file)) {
      $file = "/images/icons/{$file}";
      $icons["../../../{$file}"] = theme('image', drupal_get_path('module', 'wysiwyg_fields') . $file);
    }
  }

  return $icons;
}
