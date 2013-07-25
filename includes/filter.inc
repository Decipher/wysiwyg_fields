<?php
/**
 * @file
 * Filter module integration.
 */

/**
 * Implements hook_filter_info().
 */
function wysiwyg_fields_filter_info() {
  $filters = array();

  $filters['wysiwyg_fields'] = array(
    'title' => t('Wysiwyg Fields filter'),
    'process callback' => '_wysiwyg_fields_filter_process',
  );

  return $filters;
}

/**
 * Wysiwyg Fields filter process callback.
 */
function _wysiwyg_fields_filter_process($text, $filter, $format, $langcode, $cache, $cache_id, $entity = NULL, $entity_type = NULL) {
  // Prevent a recursive loop caused when loading the entity for contextual
  // information.
  $filter_recurse = &drupal_static(__FUNCTION__, NULL);
  if (isset($filter_recurse) && $filter_recurse >= REQUEST_TIME) {
    return;
  }

  $filter_recurse = REQUEST_TIME;
  $fields = array();
  $instances = array();
  $tokens = _wysiwyg_fields_text_to_tokens($text);

  foreach ($tokens as $token => $token_data) {
    // @TODO - wf_nid is deprecated and will be removed in the future.
    if (isset($token_data['wf_nid'])) {
      watchdog('Wysiwyg Fields', 'Node !nid is using a deprecated Wysiwyg Fields token format, it needs to be updated or it will break in a future release.', array('!nid' => $token_data['wf_nid']));
      $token_data['wf_entity_id'] = $token_data['wf_nid'];
      $token_data['wf_entity_type'] = 'node';
    }

    if (isset($token_data['wf_field']) && isset($token_data['wf_deltas']) && isset($token_data['wf_formatter']) && (isset($token_data['wf_entity_id']) || !is_null($entity))) {
      $entity_type = isset($token_data['wf_entity_type']) ? $token_data['wf_entity_type'] : $entity_type;
      if (!isset($entity)) {
        $conditions = array();
        if (isset($token_data['wf_entity_vid'])) {
          $conditions['vid'] = $token_data['wf_entity_vid'];
        }

        $entity = entity_load($entity_type, array($token_data['wf_entity_id']), $conditions);
        $entity = reset($entity);
      }
      $fields[$token_data['wf_field']] = isset($fields[$token_data['wf_field']]) ? $fields[$token_data['wf_field']] : field_info_field($token_data['wf_field']);
      $field = $fields[$token_data['wf_field']];
      $field_name = $field['field_name'];
      $instances[$token_data['wf_field']] = isset($instances[$token_data['wf_field']]) ? $instances[$token_data['wf_field']] : field_info_instance($entity_type, $token_data['wf_field'], $entity->type);
      $instance = $instances[$token_data['wf_field']];
      $langcode = field_language($entity_type, $entity, $field['field_name']);

      $token_data['wf_deltas'] = explode(',', $token_data['wf_deltas']);
      $items = array();
      foreach ($token_data['wf_deltas'] as $delta) {
        if (isset($entity->{$field_name}[$langcode][$delta])) {
          $items[] = $entity->{$field_name}[$langcode][$delta];
        }
      }

      // Prepare field view.
      $functions = array("{$field['module']}_field_prepare_view", "{$field['module']}_field_load");
      foreach ($functions as $function) {
        if (function_exists($function)) {
          $items = array($items);
          $function($entity_type, array($entity), $field, array($instance), $langcode, $items, FIELD_LOAD_CURRENT);
          $items = $items[0];
        }
      }

      // @TODO - Cache the Formatters.
      $formatter = field_info_formatter_types($token_data['wf_formatter']);

      // Formatter settings.
      $formatter_settings = array();
      foreach ($token_data as $key => $value) {
        if (drupal_substr($key, 0, 11) == 'wf_settings') {
          $formatter_settings[drupal_substr($key, 12)] = $value;
        }
      }

      $display = array(
        'label' => 'hidden',
        'type' => $token_data['wf_formatter'],
        'module' => $formatter['module'],
        'settings' => $formatter_settings,
        // @TODO - Move this to includes/custom_formatters.inc and determine
        // a way to allow contextual links without exposing to anonymous user.
        'cf_options' => array(
          '#contextual_links' => FALSE,
        ),
      );

      // Prepare field formatter view.
      if (function_exists($function = "{$field['module']}_field_formatter_prepare_view")) {
        $items = array($items);
        $function($entity_type, array($entity), $field, array($instance), $langcode, $items, array($display));
        $items = $items[0];
      }

      $function = "{$formatter['module']}_field_formatter_view";

      // Load JS prior to rendering the formatter.
      $js_old = drupal_add_js();

      $output = $function($entity_type, $entity, $field, $instance, $langcode, $items, $display);
      $element = render($output);

      // Determine newly added JS and attach to element.
      $js_new = drupal_add_js();
      $js = array();
      foreach (array_diff(array_keys($js_new), array_keys($js_old)) as $key) {
        $js[$key] = $js_new[$key];
      }
      if (!empty($js)) {
        $element .= drupal_get_js('header', $js);
      }

      $text = str_replace($token, $element, $text);
    }
  }
  drupal_static_reset(__FUNCTION__);

  return $text;
}

/**
 *
 */
function _wysiwyg_fields_text_to_tokens($text) {
  preg_match_all('/\[wysiwyg_field(.*?)\]/', $text, $matches, PREG_SET_ORDER);

  // Use token as array key to ensure no unnecessary processing.
  $tokens = array();
  foreach ($matches as $match) {
    preg_match_all('/([\w\-]*?)\=["\'](.*?)["\']/', $match[1], $attributes, PREG_SET_ORDER);
    $tokens[$match[0]] = array();
    foreach ($attributes as $attribute) {
      $tokens[$match[0]][$attribute[1]] = $attribute[2];
    }
  }

  return $tokens;
}

/**
 * Implements hook_wysiwyg_fields_entity_insert_alter() on behalf of
 * filter.module.
 *
 * Add cache buster and contextual information to the Wysiwyg Fields token.
 */
function filter_wysiwyg_fields_entity_insert_alter($entity, $type) {
  $textfields = _wysiwyg_fields_textfields($type, $entity);
  foreach ($textfields as &$textfield) {
    $tokens = _wysiwyg_fields_text_to_tokens($textfield['value']);
    foreach ($tokens as $token => $attributes) {
      // Add cache buster (timestamp) to Wysiwyg Fields token.
      $attributes['wf_cache'] = $entity->changed;

      // Ensure Wysiwyg Fields token has contextual information.
      if (!isset($attributes['wf_entity_id'])) {
        list($entity_id, $entity_vid, $bundle) = entity_extract_ids($type, $entity);

        $attributes['wf_entity_id'] = $entity_id;
        if (!empty($entity_vid)) {
          $attributes['wf_entity_vid'] = $entity_vid;
        }
        $attributes['wf_entity_type'] = $type;
      }

      // Rebuild Wysiwyg Fields token.
      $new_token = array();
      foreach ($attributes as $key => $value) {
        $new_token[] = "{$key}=\"{$value}\"";
      }
      $textfield['value'] = str_replace($token, '[wysiwyg_field ' . implode(' ', $new_token) . ']', $textfield['value']);
    }
  }

  // Store modified fields in the database.
  field_attach_update($type, $entity);
}

/**
 * Implements hook_wysiwyg_fields_entity_update_alter() on behalf of
 * filter.module.
 */
function filter_wysiwyg_fields_entity_update_alter($entity, $type) {
  filter_wysiwyg_fields_entity_insert_alter($entity, $type);
}

/**
 * Implements hook_wysiwyg_fields_form_alter_alter() on behalf of filter.module.
 */
function filter_wysiwyg_fields_form_alter_alter(&$form, $form_state, $form_id) {
  if ('filter_admin_format_form' == $form_id) {
    // Force the Wysiwyg Fields filter to be always on.
    $form['filters']['status']['wysiwyg_fields']['#default_value'] = TRUE;
    $form['filters']['status']['wysiwyg_fields']['#disabled'] = TRUE;

    // Set weight to 100 so that the Wysiwyg Fields filter processes after the
    // HTML filter (by default).
    $form['filters']['order']['wysiwyg_fields']['#weight'] = 50;
    $form['filters']['order']['wysiwyg_fields']['weight']['#default_value'] = 50;
  }
}
