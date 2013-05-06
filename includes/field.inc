<?php
/**
 * @file
 * Feild module integration.
 */

/**
 * Implements hook_wysiwyg_fields_wysiwyg_plugins() on behalf of field.module.
 */
function field_wysiwyg_fields_wysiwyg_plugins($info) {
  $plugins = array();
  foreach (field_info_instances($info['#entity_type'], $info['#bundle']) as $field) {
    $wysiwyg_fields = isset($field['settings']['wysiwyg_fields']) ? $field['settings']['wysiwyg_fields'] : NULL;
    if (/* !in_array(TRUE, module_invoke_all('wysiwyg_fields_field_bypass', $field)) && !is_null(content_fields($field['field_name'], $content_type)) && */!is_null($wysiwyg_fields) && $wysiwyg_fields['status'] == TRUE) {
      $plugins[$field['field_name']] = array(
        'label' => $wysiwyg_fields['settings']['label'],
        'icon' => $wysiwyg_fields['settings']['icon'],
      );
    }
  }
  return $plugins;
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
function _field_wysiwyg_fields_form_alter_alter_submit($form, &$form_state) {
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
 * Implements hook_wysiwyg_fields_entity_presave_alter() on behalf of
 * field.module.
 *
 * This will delete any un-referenced Wysiwyg Fields items and re-number the
 * deltas accordingly.
 */
function field_wysiwyg_fields_entity_presave_alter($entity, $entity_type) {
  list($id, $vid, $bundle_name) = entity_extract_ids($entity_type, $entity);
  $instances = field_info_instances($entity_type, $bundle_name);

  foreach ($instances as $instance) {
    if (isset($instance['settings']['wysiwyg_fields']) && $instance['settings']['wysiwyg_fields']['status']) {
      $field_name = $instance['field_name'];
      $settings = $instance['settings'];
      $langcode = field_language($entity_type, $entity, $field_name);
      $items = field_get_items($entity_type, $entity, $field_name, $langcode);

      // First run, get require information.
      if (!isset($tokens)) {
        $tokens = array();
        $textfields = _wysiwyg_fields_textfields($entity_type, $entity);
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
          foreach ($tokens[$token]['wf_deltas'] as $delta) {
            $info['fields'][$tokens[$token]['wf_field']]['deltas'][$delta][] = &$tokens[$token]['wf_deltas'][$delta];
          }
          ksort($info['fields'][$tokens[$token]['wf_field']]['deltas']);
          $info['tokens'][$token] = &$tokens[$token];
        }
      }

      // Delete un-referenced field.
      if ($settings['wysiwyg_fields']['settings']['advanced']['delete']) {
        foreach (array_keys($items) as $delta) {
          if (empty($info) || (isset($info['fields'][$field_name]['deltas']) && !isset($info['fields'][$field_name]['deltas'][$delta]))) {
            unset($entity->{$field_name}[$langcode][$delta]);

            // Re-number deltas to compensate for the deleted field.
            if (!empty($info)) {
              foreach (array_keys($info['fields'][$field_name]['deltas']) as $value) {
                if ($value > $delta) {
                  foreach ($info['fields'][$field_name]['deltas'][$value] as &$reference) {
                    $reference--;
                  }
                }
              }
            }
          }
        }
      }
    }
  }

  if (isset($info['tokens'])) {
    // Set new deltas.
    foreach (array_keys($info['tokens']) as $token) {
      $info['tokens'][$token]['wf_deltas'] = array_flip($info['tokens'][$token]['wf_deltas']);
      foreach (array_keys($info['tokens'][$token]['wf_deltas']) as $delta) {
        $info['tokens'][$token]['wf_deltas'][$delta] = $delta;
      }
      ksort($info['tokens'][$token]['wf_deltas']);
    }

    // Replace tokens.
    $tempstamp = 'wf_temp="' . REQUEST_TIME . '"';
    foreach ($textfields as &$textfield) {
      foreach ($info['tokens'] as $token => $attributes) {
        $attributes['wf_deltas'] = is_array($attributes['wf_deltas'])
          ? implode(',', array_keys($attributes['wf_deltas']))
          : $attributes['wf_deltas'];
        // A tempstamp (temporary timestamp) is attached as an attribute to the
        // new token so that the token can't match an existing, soon to be
        // replaced token.
        $new_token = array($tempstamp);
        foreach ($attributes as $key => $value) {
          $new_token[] = "{$key}=\"{$value}\"";
        }
        $new_token = '[wysiwyg_field ' . implode(' ', $new_token) . ']';

        $textfield['value'] = str_replace($token, $new_token, $textfield['value']);
      }
      // Remove the tempstamp now that all tokens have been repalced on this
      // textfield.
      $textfield['value'] = str_replace($tempstamp, '', $textfield['value']);
    }
  }
}

/**
 * Helper functon;
 */
function _field_wysiwyg_fields_get_fields($type, $entity) {
  // Get all tokens from all textfields.
  $tokens = array();
  $textfields = _wysiwyg_fields_textfields($type, $entity);
  foreach ($textfields as &$textfield) {
    $tokens = array_merge(_wysiwyg_fields_text_to_tokens($textfield['value']), $tokens);
  }

  // Build array of fields and their deltas that are currently in user.
  $fields = array();
  foreach ($tokens as $token) {
    $token['wf_deltas'] = explode('_', $token['wf_deltas']);
    foreach ($token['wf_deltas'] as $delta) {
      $fields[$token['wf_field']][$delta] = TRUE;
    }
  }

  return array($fields, $textfields);
}
