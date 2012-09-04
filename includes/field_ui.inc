<?php
/**
 * @file
 * Content module integration.
 */

/**
 * Implements hook_wysiwyg_fields_wysiwyg_plugins() on behalf of field_ui.module.
 */
function field_ui_wysiwyg_fields_wysiwyg_plugins($info) {
  $plugins = array();
  foreach (field_info_instances($info['#entity_type'], $info['#bundle']) as $field) {
    $wysiwyg_fields = isset($field['settings']['wysiwyg_fields']) ? $field['settings']['wysiwyg_fields'] : NULL;
    if (/*!in_array(TRUE, module_invoke_all('wysiwyg_fields_field_bypass', $field)) && !is_null(content_fields($field['field_name'], $content_type)) && */!is_null($wysiwyg_fields) && $wysiwyg_fields['status'] == TRUE) {
      $plugins[$field['field_name']] = array(
        'label' => $wysiwyg_fields['settings']['label'],
        'icon' => $wysiwyg_fields['settings']['icon'],
      );
    }
  }
  return $plugins;
}

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
      $wysiwyg_fields = isset($form['#instance']['settings']['wysiwyg_fields']) ? $form['#instance']['settings']['wysiwyg_fields'] : array();

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

      $form['#submit'][] = '_field_ui_wysiwyg_fields_form_alter_alter_submit';
    }
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
function theme_wysiwyg_fields_widget_settings_alter($variables) {
  $element = $variables['element'];

  unset($element['upload']['#title']);
  $element['icon'] = array('#markup' => drupal_render($element['icon']));
  $element['icon']['#markup'] = str_replace(t('Upload'), drupal_render($element['upload']), $element['icon']['#markup']);

  return drupal_render_children($element);
}

/**
 * @TODO
 * Implements hook_wysiwyg_fields_form_alter_alter() on behalf of content.module.
 */
//function content_wysiwyg_fields_form_alter_alter($form, $form_state, $form_id) {
//  if ($form_id == 'content_field_edit_form') {
//    $form['#attributes'] = isset($form['#attributes']) ? $form['#attributes'] : array();
//    $form['#attributes']['enctype'] = 'multipart/form-data';
//
//    $form['field']['required']['#element_validate'] = is_array($form['field']['required']['#element_validate'])
//      ? array_merge($form['field']['required']['#element_validate'], array('_content_wysiwyg_fields_form_alter_alter_required_validate'))
//      : array('_content_wysiwyg_fields_form_alter_alter_required_validate');
//
//    $form['#submit'][] = '_content_wysiwyg_fields_form_alter_alter_submit';
//  }
//}

/**
 * @TODO
 */
//function _content_wysiwyg_fields_form_alter_alter_required_validate($element, &$form_state) {
//  if ($form_state['values']['wysiwyg_fields_status'] == TRUE && $form_state['values']['required'] == TRUE) {
//    form_error($element, t('Field must not be required to be used with Wysiwyg Fields.'));
//  }
//}

/**
 * Submit callback for Wysiwyg Fields field settings form.
 */
function _field_ui_wysiwyg_fields_form_alter_alter_submit($form, &$form_state) {
  $instance = field_info_instance($form_state['values']['instance']['entity_type'], $form_state['values']['instance']['field_name'], $form_state['values']['instance']['bundle']);

  // Set display settings to <Hidden>.
  if ($instance['settings']['wysiwyg_fields']['status'] == TRUE && $instance['settings']['wysiwyg_fields']['settings']['advanced']['hide'] == TRUE) {
    foreach ($instance['display'] as &$display) {
      $display['type'] = 'hidden';
    }
  }
  field_update_instance($instance);
}

/**
 * Implements hook_wysiwyg_fields_nodeapi_alter() on behalf of content.module.
 */
//function content_wysiwyg_fields_nodeapi_alter($node, $op, $a3 = NULL, $a4 = NULL) {
//  switch ($op) {
//    case 'presave':
//      // @TODO - Handle multi-field tokens.
//      // Re-assign deltas to match CCKs changes.
//      list($fields, $textfields) = _content_wysiwyg_fields_get_fields($node);
//      foreach ($fields as $id => $items) {
//        ksort($items);
//        foreach ($items as $delta => $val) {
//          foreach ($node->{$id} as $field_delta => $item) {
//            if ($item['wysiwyg_fields']['wysiwyg_fields_delta'] == $delta) {
//              foreach ($textfields as &$textfield) {
//                $textfield['value'] = str_replace("[wysiwyg_fields-{$id}-{$delta}", "[wysiwyg_fields-{$id}-{$field_delta}", $textfield['value']);
//              }
//              break;
//            }
//          }
//        }
//      }
//
//      // Delete any Wysiwyg Fields that weren't inserted.
//      list($fields, $textfields) = _content_wysiwyg_fields_get_fields($node);
//      foreach (content_fields(NULL, $node->type) as $field) {
//        if ($field['widget']['wysiwyg_fields_status'] == TRUE && $field['widget']['wysiwyg_fields_delete'] && isset($node->{$field['field_name']})) {
//          foreach (array_keys($node->{$field['field_name']}) as $delta) {
//            if (!$fields[$field['field_name']][$delta]) {
//              $fields[$field['field_name']][$delta] = FALSE;
//              unset($node->{$field['field_name']}[$delta]);
//            }
//          }
//        }
//      }
//
//      // Update token deltas.
//      foreach ($fields as $id => $field) {
//        $minus = 0;
//        ksort($field);
//        foreach ($field as $delta => $value) {
//          $minus = $value ? $minus : $minus + 1;
//          if ($value) {
//            foreach ($textfields as &$textfield) {
//              $textfield['value'] = str_replace("[wysiwyg_fields-{$id}-{$delta}", "[wysiwyg_fields-{$id}-" . ($delta - $minus), $textfield['value']);
//            }
//          }
//        }
//      }
//      break;
//  }
//}

/**
 *
 */
function _wysiwyg_fields_textfields($entity_type, $entity) {
  $textfields = array();

  list($id, $vid, $bundle_name) = entity_extract_ids($entity_type, $entity);
  $fields = field_info_fields($entity_type, $bundle_name);
  foreach ($fields as $name => $field) {
    if ($field['module'] == 'text' && isset($entity->{$field['field_name']}) && is_array($entity->{$field['field_name']})) {
      foreach ($entity->{$field['field_name']} as $langcode => $items) {
        foreach ($items as $delta => $item) {
          if (is_numeric($delta)) {
            $textfields["{$field['field_name']}-{$langcode}-{$delta}"] = array(
              'value' => &$entity->{$field['field_name']}[$langcode][$delta]['value'],
              // 'format' => $entity->{$field['field_name']}[$langcode][$delta]['format'],
            );
          }
        }
      }
    }
  }

  return $textfields;
}

/**
 *
 */
// function _content_wysiwyg_fields_get_fields($node) {
//   // Get all tokens from all textfields.
//   $tokens = array();
//   $textfields = _wysiwyg_fields_textfields($node);
//   foreach ($textfields as &$textfield) {
//     $tokens = array_merge(_wysiwyg_fields_text_to_tokens($textfield['value']), $tokens);
//   }

//   $fields = array();
//   foreach ($tokens as $token) {
//     $fields[$token[1]] = is_array($fields[$token[1]]) ? $fields[$token[1]] : array();
//     $token[2] = explode('_', $token[2]);
//     foreach ($token[2] as $delta) {
//       $fields[$token[1]][$delta] = TRUE;
//     }
//   }

//   return array($fields, $textfields);
// }
