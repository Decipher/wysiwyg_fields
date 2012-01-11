<?php
/**
 * @file
 * Content module integration.
 */

/**
 * Implements hook_wysiwyg_fields_wysiwyg_plugins() on behalf of content.module.
 */
function content_wysiwyg_fields_wysiwyg_plugins($content_type) {
  $plugins = array();
  foreach (content_fields() as $field) {
    if ($field = content_fields($field['field_name'], $content_type)) {
      if (!in_array(TRUE, module_invoke_all('wysiwyg_fields_field_bypass', $field)) && !is_null(content_fields($field['field_name'], $content_type)) && isset($field['widget']['wysiwyg_fields_status']) && $field['widget']['wysiwyg_fields_status']) {
        $plugins[$field['field_name']] = array(
          'label' => isset($field['widget']['wysiwyg_fields_label'])
            ? $field['widget']['wysiwyg_fields_label']
            : $field['widget']['label'],
          'icon' => $field['widget']['wysiwyg_fields_icon'],
        );
      }
    }
  }
  return $plugins;
}

/**
 * Implements hook_wysiwyg_fields_theme_alter() on behalf of content.module.
 */
function content_wysiwyg_fields_theme_alter($items) {
  $items['wysiwyg_fields_widget_settings_alter'] = array(
    'arguments' => array(
      'element' => array(),
    ),
    'file' => 'modules/content.inc',
  );
}

/**
 * Implements hook_widget_settings_alter().
 */
function wysiwyg_fields_widget_settings_alter(&$settings, $op, $widget) {
  $content_type = str_replace('-', '_', arg(3));
  $field_name = arg(5);
  $field = content_fields($field_name, $content_type);
  if (!in_array(TRUE, module_invoke_all('wysiwyg_fields_field_bypass', $field))) {
    switch ($op) {
      case 'form':
        drupal_add_css(drupal_get_path('module', 'wysiwyg_fields') . '/styles/settings_form.css');

        $settings['wysiwyg_fields'] = array(
          '#title' => t('Wysiwyg Fields settings'),
          '#type' => 'fieldset',
          '#weight' => 10,
          '#collapsible' => TRUE,
          '#collapsed' => TRUE,
          '#theme' => 'wysiwyg_fields_widget_settings_alter',
        );

        $settings['wysiwyg_fields']['wysiwyg_fields_status'] = array(
          '#title' => t('Attach to Wysiwyg?'),
          '#type' => 'checkbox',
          '#default_value' => isset($widget['wysiwyg_fields_status'])
            ? $widget['wysiwyg_fields_status']
            : 0
          ,
        );

        $settings['wysiwyg_fields']['wysiwyg_fields_label'] = array(
          '#title' => t('Label'),
          '#type' => 'textfield',
          '#default_value' => isset($widget['wysiwyg_fields_label'])
            ? $widget['wysiwyg_fields_label']
            : $widget['label']
        );

        $settings['wysiwyg_fields']['wysiwyg_fields_icon'] = array(
          '#title' => t('Icon'),
          '#type' => 'radios',
          '#options' => array_merge(
            array('upload' => t('Upload')),
            _wysiwyg_fields_widget_settings_alter_icons()
          ),
          '#default_value' => isset($widget['wysiwyg_fields_icon'])
            ? $widget['wysiwyg_fields_icon']
            : current(array_keys(_wysiwyg_fields_widget_settings_alter_icons()))
          ,
          '#attributes' => array(
            'class' => 'container-inline wysiwyg_fields_icons',
          ),
        );

        $settings['wysiwyg_fields']['wysiwyg_fields_upload'] = array(
          '#title' => t('Upload'),
          '#type' => 'file',
          '#element_validate' => array('_wysiwyg_fields_widget_settings_alter_upload_validate'),
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

        $settings['wysiwyg_fields']['wysiwyg_fields_advanced'] = array(
          '#title' => t('Advanced settings'),
          '#type' => 'fieldset',
          '#collapsible' => 'TRUE',
          '#collapsed' => 'TRUE',
        );

        $settings['wysiwyg_fields']['wysiwyg_fields_advanced']['wysiwyg_fields_profiles'] = array(
          '#title' => t('Enable on all Wysiwyg profiles.'),
          '#type' => 'checkbox',
          '#default_value' => isset($widget['wysiwyg_fields_profiles'])
            ? $widget['wysiwyg_fields_profiles']
            : TRUE
          ,
          '#description' => 'When checked, this will forcefully enable the plugin on all Wysiwyg profiles. If you wish this plugin only enabled on specific Wysiwyg profiles, be sure to uncheck this before making changes.'
        );

        $settings['wysiwyg_fields']['wysiwyg_fields_advanced']['wysiwyg_fields_hide'] = array(
          '#title' => t('Set field display settings to &lt;Hidden&gt;.'),
          '#type' => 'checkbox',
          '#default_value' => isset($widget['wysiwyg_fields_hide'])
            ? $widget['wysiwyg_fields_hide']
            : TRUE
          ,
        );

        $settings['wysiwyg_fields']['wysiwyg_fields_advanced']['wysiwyg_fields_delete'] = array(
          '#title' => t('Delete field items not inserted on Node save.'),
          '#type' => 'checkbox',
          '#default_value' => isset($widget['wysiwyg_fields_delete'])
            ? $widget['wysiwyg_fields_delete']
            : TRUE
          ,
        );
        break;

      case 'save':
        $settings[] = 'wysiwyg_fields_status';
        $settings[] = 'wysiwyg_fields_label';
        $settings[] = 'wysiwyg_fields_icon';
        $settings[] = 'wysiwyg_fields_formatters';
        $settings[] = 'wysiwyg_fields_profiles';
        $settings[] = 'wysiwyg_fields_hide';
        $settings[] = 'wysiwyg_fields_delete';
    }
  }
}

/**
 *
 */
function _wysiwyg_fields_widget_settings_alter_icons() {
  $icons = wysiwyg_fields_icons(NULL, TRUE);
  foreach ($icons as &$icon) {
    $icon = theme('image', $icon);
  }
  return $icons;
}

/**
 *
 */
function _wysiwyg_fields_widget_settings_alter_upload_validate($element, &$form_state) {
  if ($form_state['values']['wysiwyg_fields_icon'] == 'upload' && empty($_FILES['files']['name']['wysiwyg_fields_upload'])) {
    form_error($element, t('You must select a file to upload or an existing icon.'));
  }

  // Upload and reference new icon.
  $validators = array(
    'file_validate_is_image' => array(),
    'file_validate_image_resolution' => array('16x16'),
  );
  if ($form_state['values']['wysiwyg_fields_icon'] == 'upload' && $file = file_save_upload('wysiwyg_fields_upload', $validators)) {
    file_check_directory($directory = file_directory_path() . '/wysiwyg_fields', TRUE);
    file_move($file, 'wysiwyg_fields', FILE_EXISTS_RENAME);
    $form_state['values']['wysiwyg_fields_icon'] = md5_file($file->filepath);
    cache_clear_all('wysiwyg_fields_icons', 'cache');
  }
}

/**
 *
 */
function _wysiwyg_fields_formatters() {
  $field = content_fields(arg(5), str_replace('-', '_', arg(3)));
  $field_types = _content_field_types();

  $formatters = array();
  if (is_array($field_types[$field['type']]['formatters'])) {
    foreach ($field_types[$field['type']]['formatters'] as $id => $formatter) {
      $formatters[$id] = $formatter['label'];
    }
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
 *
 */
function theme_wysiwyg_fields_widget_settings_alter($element) {
  unset($element['wysiwyg_fields_upload']['#title']);
  $element['wysiwyg_fields_icon'] = array('#value' => drupal_render($element['wysiwyg_fields_icon']));
  $element['wysiwyg_fields_icon']['#value'] = str_replace(t('Upload'), drupal_render($element['wysiwyg_fields_upload']), $element['wysiwyg_fields_icon']['#value']);

  return drupal_render($element);
}

/**
 * Implements hook_wysiwyg_fields_form_alter_alter() on behalf of content.module.
 */
function content_wysiwyg_fields_form_alter_alter($form, $form_state, $form_id) {
  if ($form_id == 'content_field_edit_form') {
    $form['#attributes'] = isset($form['#attributes']) ? $form['#attributes'] : array();
    $form['#attributes']['enctype'] = 'multipart/form-data';

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

  if ($field['widget']['wysiwyg_fields_profiles'] == TRUE) {
    foreach (wysiwyg_profile_load_all() as $profile) {
      $profile->settings = is_array($profile->settings) ? $profile->settings : array();
      $profile->settings['buttons'] = isset($profile->settings['buttons']) ? $profile->settings['buttons'] : array();

      $id = "wysiwyg_fields_{$field['field_name']}";
      if (!isset($profile->settings['buttons']['drupal'][$id])) {
        $profile->settings['buttons']['drupal'][$id] = 1;
        db_query("UPDATE {wysiwyg} SET settings = '%s' WHERE format = %d", serialize($profile->settings), $profile->format);

        $format = filter_formats($profile->format);
        drupal_set_message(t('Wysiwyg Field plugin for %field enabled on %format format.', array('%field' => $field['field_name'], '%format' => $format->name)));
      }
    }
    wysiwyg_profile_load_all(TRUE);
  }

  // Set display settings to <Hidden>.
  if ($field['widget']['wysiwyg_fields_status'] == TRUE && $form_state['values']['wysiwyg_fields_hide'] == TRUE) {
    foreach ($field['display_settings'] as $name => &$type) {
      if ($name != 'label') {
        $type['format'] = 'hidden';
      }
    }
  }
  content_field_instance_update($field, FALSE);
}

/**
 * Implements hook_wysiwyg_fields_nodeapi_alter() on behalf of content.module.
 */
function content_wysiwyg_fields_nodeapi_alter($node, $op, $a3 = NULL, $a4 = NULL) {
  switch ($op) {
    case 'presave':
      $flag = FALSE;
      foreach (content_fields(NULL, $node->type) as $field) {
        if ($field = content_fields($field['field_name'], $node->type)) {
          $flag = !empty($field['widget']['wysiwyg_fields_status']) ? TRUE : $flag;
        }
      }

      if ($flag) {
        $tokens = array();
        $textfields = _wysiwyg_fields_textfields($node);
        foreach ($textfields as &$textfield) {
          $tokens = array_merge(_wysiwyg_fields_text_to_tokens($textfield['value']), $tokens);
        }

        // Build info array.
        $info = array();
        foreach ($tokens as $token => $data) {
          $deltas = explode(',', $tokens[$token]['wf_deltas']);
          $tokens[$token]['wf_deltas'] = array();
          foreach ($deltas as $delta) {
            $tokens[$token]['wf_deltas'][$delta] = $delta;
          }
          $info['fields'][$tokens[$token]['wf_field']]['deltas'] = isset($info['fields'][$tokens[$token]['wf_field']]['deltas']) ? $info['fields'][$tokens[$token]['wf_field']]['deltas'] : array();
          foreach ($tokens[$token]['wf_deltas'] as $delta) {
            $info['fields'][$tokens[$token]['wf_field']]['deltas'][$delta] = isset($info['fields'][$tokens[$token]['wf_field']]['deltas'][$delta]) ? $info['fields'][$tokens[$token]['wf_field']]['deltas'][$delta] : array();
            $info['fields'][$tokens[$token]['wf_field']]['deltas'][$delta][] = &$tokens[$token]['wf_deltas'][$delta];
          }
          ksort($info['fields'][$tokens[$token]['wf_field']]['deltas']);
          $info['tokens'][$token] = &$tokens[$token];
        }

        // Re-assign deltas to match CCKs changes.
        if (is_array($info['fields'])) {
          foreach ($info['fields'] as $field_name => $field) {
            foreach (array_keys($field['deltas']) as $delta) {
              foreach ($node->{$field_name} as $field_delta => $item) {
                if ($item['wysiwyg_fields']['wysiwyg_fields_delta'] == $delta && $delta != $field_delta) {
                  foreach ($info['fields'][$field_name]['deltas'][$delta] as &$reference) {
                    $reference = $field_delta;
                  }
                  break;
                }
              }
            }
          }
        }

        // Delete any Wysiwyg Fields that weren't inserted.
        foreach (content_fields(NULL, $node->type) as $field) {
          if ($field['widget']['wysiwyg_fields_status'] == TRUE && $field['widget']['wysiwyg_fields_delete'] && isset($node->{$field['field_name']})) {
            foreach (array_keys($node->{$field['field_name']}) as $delta) {
              if (isset($info['fields'][$field['field_name']]['deltas']) && !isset($info['fields'][$field['field_name']]['deltas'][$delta])) {
                foreach (array_keys($info['fields'][$field['field_name']]['deltas']) as $value) {
                  if ($value > $delta) {
                    foreach ($info['fields'][$field['field_name']]['deltas'][$value] as &$reference) {
                      $reference = $value - 1;
                    }
                  }
                }
                unset($node->{$field['field_name']}[$delta]);
              }
            }
          }
        }

        // Set new deltas.
        if (is_array($info['tokens'])) {
          foreach (array_keys($info['tokens']) as $token) {
            $info['tokens'][$token]['wf_deltas'] = array_flip($info['tokens'][$token]['wf_deltas']);
            foreach (array_keys($info['tokens'][$token]['wf_deltas']) as $delta) {
              $info['tokens'][$token]['wf_deltas'][$delta] = $delta;
            }
            ksort($info['tokens'][$token]['wf_deltas']);
          }

          // Replace tokens.
          foreach ($info['tokens'] as $token => $attributes) {
            foreach ($textfields as &$textfield) {
              $attributes['wf_deltas'] = is_array($attributes['wf_deltas']) ? implode(',', array_keys($attributes['wf_deltas'])) : $attributes['wf_deltas'];
              $new_token = array();
              foreach ($attributes as $key => $value) {
                $new_token[] = "{$key}=\"{$value}\"";
              }
              $textfield['value'] = str_replace($token, '[wysiwyg_field ' . implode(' ', $new_token) . ']', $textfield['value']);
            }
          }
        }
      }
      break;
  }
}

/**
 *
 */
function _wysiwyg_fields_textfields($node) {
  $textfields = array();

  // Node body field.
  $textfields['body'] = array(
    'value' => &$node->body,
    'format' => $node->format,
  );

  // Node teaser field.
  $textfields['teaser'] = array(
    'value' => &$node->teaser,
    'format' => $node->format,
  );

  // CCK Textarea fields.
  foreach (content_fields(NULL, $node->type) as $field) {
    if (substr($field['widget']['type'], 0, 13) == 'text_textarea' && isset($node->{$field['field_name']})) {
      foreach ($node->{$field['field_name']} as $delta => $data) {
        $textfields["{$field['field_name']}-{$delta}"] = array(
          'value' => &$node->{$field['field_name']}[$delta]['value'],
          'format' => $node->{$field['field_name']}[$delta]['format'],
        );
      }
    }
  }

  return $textfields;
}
