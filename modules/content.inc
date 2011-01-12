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

/**
 *
 */
function _wysiwyg_fields_widget_settings_alter_formatters_validate($element, &$form_state) {
  if ($form_state['values']['wysiwyg_fields_status'] == TRUE && empty($form_state['values']['wysiwyg_fields_formatters'])) {
    form_error($element, t('At least one Formatter must be selected to be used with Wysiwyg Fields.'));
  }
}

/**
 * Implements hook_wysiwyg_fields_form_alter_alter() on behalf of content.module.
 */
function content_wysiwyg_fields_form_alter_alter(&$form, &$form_state, $form_id) {
  if ($form_id == 'content_field_edit_form') {
    $form['field']['required']['#element_validate'] = is_array($form['field']['required']['#element_validate'])
      ? array_merge($form['field']['required']['#element_validate'], array('_content_wysiwyg_fields_form_alter_alter_required_validate'))
      : array('_content_wysiwyg_fields_form_alter_alter_required_validate');

    $form['#submit'][] = '_content_wysiwyg_fields_form_alter_alter_submit';
  }
}

/**
 *
 */
function _content_wysiwyg_fields_form_alter_alter_required_validate($element, &$form_state) {
  if ($form_state['values']['wysiwyg_fields_status'] == TRUE && $form_state['values']['required'] == TRUE) {
    form_error($element, t('Field must not be required to be used with Wysiwyg Fields.'));
  }
}

/**
 *
 */
function _content_wysiwyg_fields_form_alter_alter_submit($form, &$form_state) {
  $field = content_fields($form_state['values']['field_name'], $form_state['values']['type_name']);

  // Enable wysiwyg plugin.
  foreach (wysiwyg_profile_load_all() as $profile) {
    $profile->settings = is_array($profile->settings) ? $profile->settings : array();
    $profile->settings['buttons'] = is_array($profile->settings['buttons']) ? $profile->settings['buttons'] : array();

    $id = "wysiwyg_fields_{$field['field_name']}";
    if (!isset($profile->settings['buttons']['drupal'][$id]) || empty($profile->settings['buttons']['drupal'][$id])) {
      $profile->settings['buttons']['drupal'][$id] = 1;
      db_query("UPDATE {wysiwyg} SET settings = '%s' WHERE format = %d", serialize($profile->settings), $profile->format);
    }
  }

  // Set display settings to render as <Hidden> if currently set as Default.
  foreach ($field['display_settings'] as $name => &$type) {
    if ($name != 'label') {
      if (in_array($type['format'], array('default', 'hidden'))) {
        $type['format'] = 'hidden';
      }

      else {
        drupal_set_message(t('It is recommended for use with Wysiwyg Fields that you set the Display settings for this field to &lt;Hidden&gt;, you can do so on the !display page.', array('!display' => l(t('Display fields'), "admin/content/node-type/{$form_state['values']['type_name']}/display"))), 'status', FALSE);
      }
    }
  }
  content_field_instance_update($field, FALSE);
}

/**
 * Implements hook_wysiwyg_fields_nodeapi_alter() on behalf of content.module.
 */
function content_wysiwyg_fields_nodeapi_alter(&$node, $op, $a3 = NULL, $a4 = NULL) {
  switch ($op) {
    case 'insert':
    case 'update':
      // Delete any Wysiwyg Fields that weren't inserted.
      // @TODO - Make this an option?
      // @TODO - Check CCK Textarea fields as well.
      $tokens = _wysiwyg_fields_text_to_tokens($node->body);
      $fields = array();
      foreach ($tokens as $token) {
        $fields[$token[1]] = is_array($fields[$token[1]]) ? $fields[$token[1]] : array();
        $fields[$token[1]][$token[2]] = TRUE;
      }

      foreach (content_fields(NULL, $node->type) as $field) {
        if (isset($field['widget']['wysiwyg_fields_status']) && $field['widget']['wysiwyg_fields_status'] == TRUE && isset($node->{$field['field_name']})) {
          foreach (array_keys($node->{$field['field_name']}) as $delta) {
            if (!$fields[$field['field_name']][$delta]) {
              unset($node->{$field['field_name']}[$delta]);
            }
          }
        }
      }
      break;
  }
}
