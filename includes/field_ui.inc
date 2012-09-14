<?php
/**
 * @file
 * Field UI module integration.
 */

/**
 * Implements hook_wysiwyg_fields_theme_alter() on behalf of field_ui.module.
 */
function field_ui_wysiwyg_fields_theme_alter(&$items) {
  $items['wysiwyg_fields_widget_settings_alter'] = array(
    'render element' => 'element',
    'file' => 'includes/field_ui.inc',
  );
}

/**
 * Implements hook_wysiwyg_fields_form_alter_alter() on behalf of field.module.
 */
function field_ui_wysiwyg_fields_form_alter_alter(&$form, $form_state, $form_id) {
  if ($form_id == 'field_ui_field_edit_form') {
    if (!in_array(TRUE, module_invoke_all('wysiwyg_fields_field_bypass', $form['#field']))) {
      drupal_add_css(drupal_get_path('module', 'wysiwyg_fields') . '/styles/settings_form.css');
      $wysiwyg_fields = isset($form['#instance']['settings']['wysiwyg_fields'])
        ? $form['#instance']['settings']['wysiwyg_fields']
        : array();

      $form['instance']['settings']['wysiwyg_fields'] = array(
        '#type' => 'container',
        '#weight' => 30,
      );

      $form['instance']['settings']['wysiwyg_fields']['status'] = array(
        '#title' => t('Attach to Wysiwyg?'),
        '#type' => 'checkbox',
        '#description' => t('Use Wysiwyg Fields to embed this field into a Wysiwyg.'),
        '#weight' => 20,
        '#default_value' => isset($wysiwyg_fields['status']) ? $wysiwyg_fields['status'] : 0,
      );

      $form['instance']['settings']['wysiwyg_fields']['settings'] = array(
        '#title' => t('Wysiwyg Fields settings'),
        '#type' => 'fieldset',
        '#weight' => 21,
        '#collapsible' => TRUE,
        '#collapsed' => TRUE,
        '#theme' => 'wysiwyg_fields_widget_settings_alter',
        '#states' => array(
          'invisible' => array(
            'input[name="instance[settings][wysiwyg_fields][status]"]' => array('checked' => FALSE),
          ),
        ),
      );

      $form['instance']['settings']['wysiwyg_fields']['settings']['label'] = array(
        '#title' => t('Label'),
        '#type' => 'textfield',
        '#parent' => array('instance', 'settings', 'wysiwyg_fields'),
        '#default_value' => isset($wysiwyg_fields['settings']['label']) ? $wysiwyg_fields['settings']['label'] : $form['#instance']['label'],
      );

      $form['instance']['settings']['wysiwyg_fields']['settings']['icon'] = array(
        '#title' => t('Icon'),
        '#type' => 'radios',
        '#options' => array_merge(
          array('upload' => t('Upload')),
          _wysiwyg_fields_widget_settings_alter_icons()
        ),
        '#default_value' => isset($wysiwyg_fields['settings']['icon'])
          ? $wysiwyg_fields['settings']['icon']
          : current(array_keys(_wysiwyg_fields_widget_settings_alter_icons()))
        ,
        '#attributes' => array(
          'class' => array('container-inline', 'wysiwyg_fields_icons'),
        ),
      );

      $form['instance']['settings']['wysiwyg_fields']['settings']['upload'] = array(
        '#title' => t('Upload'),
        '#type' => 'file',
        '#element_validate' => array('_wysiwyg_fields_widget_settings_alter_upload_validate'),
        '#parents' => array('wysiwyg_fields_upload'),
      );

      $form['instance']['settings']['wysiwyg_fields']['settings']['formatters'] = array(
        '#title' => t('Formatters'),
        '#type' => 'select',
        '#options' => field_ui_formatter_options($form['#field']['type']),
        '#default_value' => isset($wysiwyg_fields['settings']['formatters']) ? $wysiwyg_fields['settings']['formatters'] : array(),
        '#multiple' => TRUE,
        '#element_validate' => array('_wysiwyg_fields_widget_settings_alter_formatters_validate'),
      );

      // Advanced settings.
      $form['instance']['settings']['wysiwyg_fields']['settings']['advanced'] = array(
        '#title' => t('Advanced settings'),
        '#type' => 'fieldset',
        '#collapsible' => 'TRUE',
        '#collapsed' => 'TRUE',
      );

      // Advanced setting - Set field display settings to <Hidden>.
      $form['instance']['settings']['wysiwyg_fields']['settings']['advanced']['hide'] = array(
        '#title' => t('Set field display settings to &lt;Hidden&gt;.'),
        '#type' => 'checkbox',
        '#default_value' => isset($wysiwyg_fields['settings']['advanced']['hide']) ? $wysiwyg_fields['settings']['advanced']['hide'] : TRUE,
      );

      // Advanced setting - Delete field items not inserted on Node save.
      $form['instance']['settings']['wysiwyg_fields']['settings']['advanced']['delete'] = array(
        '#title' => t('Delete field items not inserted on Node save.'),
        '#type' => 'checkbox',
        '#default_value' => isset($wysiwyg_fields['settings']['advanced']['delete']) ? $wysiwyg_fields['settings']['advanced']['delete'] : TRUE,
      );

//    $form['field']['required']['#element_validate'] = is_array($form['field']['required']['#element_validate'])
//      ? array_merge($form['field']['required']['#element_validate'], array('_content_wysiwyg_fields_form_alter_alter_required_validate'))
//      : array('_content_wysiwyg_fields_form_alter_alter_required_validate');

      $form['#submit'][] = '_field_wysiwyg_fields_form_alter_alter_submit';
    }
  }
}

/**
 * Validation callback for Wysiwyg Fields icon uploader.
 */
function _wysiwyg_fields_widget_settings_alter_upload_validate($element, &$form_state) {
  if ($form_state['values']['instance']['settings']['wysiwyg_fields']['settings']['icon'] == 'upload' && empty($_FILES['files']['name']['wysiwyg_fields_upload'])) {
    form_error($element, t('You must select a file to upload or an existing icon.'));
  }

  // Upload and reference new icon.
  $validators = array(
    'file_validate_is_image' => array(),
    'file_validate_image_resolution' => array('16x16'),
  );
  if ($form_state['values']['instance']['settings']['wysiwyg_fields']['settings']['icon'] == 'upload' && $file = file_save_upload('wysiwyg_fields_upload', $validators)) {
    file_prepare_directory($directory = 'public://wysiwyg_fields', FILE_CREATE_DIRECTORY);
    $uri = file_unmanaged_move($file->uri, 'public://wysiwyg_fields', FILE_EXISTS_RENAME);
    $form_state['values']['instance']['settings']['wysiwyg_fields']['settings']['icon'] = md5_file($uri);
    cache_clear_all('wysiwyg_fields_icons', 'cache');
  }
}

/**
 * Validation callback for Wysiwyg Fields formatters.
 */
function _wysiwyg_fields_widget_settings_alter_formatters_validate($element, &$form_state) {
  if ($form_state['values']['instance']['settings']['wysiwyg_fields']['status'] == TRUE && empty($form_state['values']['instance']['settings']['wysiwyg_fields']['settings']['formatters'])) {
    form_error($element, t('At least one Formatter must be selected to be used with Wysiwyg Fields.'));
  }
}

/**
 * @TODO
 */
function _wysiwyg_fields_widget_settings_alter_icons() {
  $icons = wysiwyg_fields_icons(NULL, TRUE);
  foreach ($icons as &$icon) {
    $icon = theme('image', array('path' => $icon));
  }
  return $icons;
}

/**
 * Theme callback;
 */
function theme_wysiwyg_fields_widget_settings_alter($variables) {
  $element = $variables['element'];

  unset($element['upload']['#title']);
  $element['icon'] = array('#markup' => drupal_render($element['icon']));
  $element['icon']['#markup'] = str_replace(t('Upload'), drupal_render($element['upload']), $element['icon']['#markup']);

  return drupal_render_children($element);
}

