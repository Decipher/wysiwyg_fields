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
function _wysiwyg_fields_filter_process($text, $filter, $format, $node = NULL) {
  if ((isset($_SESSION['wf_filter_recurse']) && $_SESSION['wf_filter_recurse'] < REQUEST_TIME) || !isset($_SESSION['wf_filter_recurse'])) {
    $_SESSION['wf_filter_recurse'] = REQUEST_TIME;
    $fields = array();
    $instances = array();
    $tokens = _wysiwyg_fields_text_to_tokens($text);

    foreach ($tokens as $key => $token) {
      if (isset($token['wf_field']) && isset($token['wf_deltas']) && isset($token['wf_formatter']) && isset($token['wf_nid'])) {
        // @TODO - Move to Entities instead of Nodes.
        $entity_type = 'node';
        $entity = isset($entity) ? $entity : node_load($token['wf_nid']);
        $fields[$token['wf_field']] = isset($fields[$token['wf_field']]) ? $fields[$token['wf_field']] : field_info_field($token['wf_field']);
        $field = $fields[$token['wf_field']];
        $instances[$token['wf_field']] = isset($instances[$token['wf_field']]) ? $instances[$token['wf_field']] : field_info_instance($entity_type, $token['wf_field'], $entity->type);
        $instance = $instances[$token['wf_field']];
        $langcode = field_language($entity_type, $entity, $field['field_name']);

        $token['wf_deltas'] = explode(',', $token['wf_deltas']);
        $items = array();
        // @TODO - Multilingual handling.
        foreach ($token['wf_deltas'] as $delta) {
          if (isset($entity->{$token['wf_field']}[LANGUAGE_NONE][$delta])) {
            $items[] = $entity->{$token['wf_field']}[LANGUAGE_NONE][$delta];
          }
        }

        // @TODO - Cache the Formatters.
        $formatter = field_info_formatter_types($token['wf_formatter']);
        $function = "{$formatter['module']}_field_formatter_view";

        $display = array(
          'label' => 'hidden',
          'type' => $token['wf_formatter'],
          'module' => $formatter['module'],
          'settings' => $formatter['settings'],
          // @TODO - Move this to includes/custom_formatters.inc and determine
          // a way to allow contextual links without exposing to anonymous user.
          'cf_options' => array(
            '#contextual_links' => FALSE,
          ),
        );

        $element = render($function($entity_type, $entity, $field, $instance, $langcode, $items, $display));
        $text = str_replace($key, $element, $text);
      }
    }
    unset($_SESSION['wf_filter_recurse']);
  }

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
    preg_match_all('/(\w*?)\=["\'](.*?)["\']/', $match[1], $attributes, PREG_SET_ORDER);
    $tokens[$match[0]] = array();
    foreach ($attributes as $attribute) {
      $tokens[$match[0]][$attribute[1]] = $attribute[2];
    }
  }

  return $tokens;
}

/**
 * Implements hook_wysiwyg_fields_node_insert_alter() on behalf of filter.module.
 */
function filter_wysiwyg_fields_node_insert_alter(&$node) {
  $textfields = _wysiwyg_fields_textfields($node);
  foreach ($textfields as &$textfield) {
    $tokens = _wysiwyg_fields_text_to_tokens($textfield['value']);
    print '<pre>';
    foreach ($tokens as $token => $attributes) {
      $attributes['wf_cache'] = $node->changed;
      if (!isset($attributes['wf_nid'])) {
        $attributes['wf_nid'] = $node->nid;
        $new_token = array();
        foreach ($attributes as $key => $value) {
          $new_token[] = "{$key}=\"{$value}\"";
        }
        $textfield['value'] = str_replace($token, '[wysiwyg_field ' . implode(' ', $new_token) . ']', $textfield['value']);
      }
    }
  }

  field_attach_update('node', $node);
  // cache_clear_all("content:{$node->nid}:{$node->vid}", content_cache_tablename());
}

/**
 * Implements hook_wysiwyg_fields_node_update_alter() on behalf of filter.module.
 */
function filter_wysiwyg_fields_node_update_alter($node) {
  filter_wysiwyg_fields_node_insert_alter($node);
}

/**
 * Implements hook_wysiwyg_fields_form_alter_alter() on behalf of filter.module.
 */
function filter_wysiwyg_fields_form_alter_alter(&$form, $form_state, $form_id) {
  if ($form_id == 'filter_admin_format_form') {
    $form['filters']['status']['wysiwyg_fields']['#default_value'] = TRUE;
    $form['filters']['status']['wysiwyg_fields']['#disabled'] = TRUE;
  }
}
