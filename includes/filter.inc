<?php
/**
 * @file
 * Filter module integration.
 */

/**
 * Implements hook_filter().
 */
function wysiwyg_fields_filter($op, $delta = 0, $format = -1, $text = '', $cache_id = 0) {
  switch ($op) {
    case 'list':
      return array(
        0 => t('Wysiwyg Fields filter')
      );

    case 'process':
      $node = node_load(arg(1));
      $text = _wysiwyg_fields_filter_process($node, $text);
      return $text;

    default:
      return $text;
  }
}

/**
 *
 */
function _wysiwyg_fields_filter_process($node, $text) {
  $fields = array();
  $tokens = _wysiwyg_fields_text_to_tokens($text);

  foreach ($tokens as $key => $token) {
    $fields[$token['wf_field']] = isset($fields[$token['wf_field']]) ? $fields[$token['wf_field']] : content_fields($token['wf_field'], $node->type);

    $field = $fields[$token['wf_field']];
    $token['wf_deltas'] = explode('_', $token['wf_deltas']);
    $items = array();
    foreach ($token['wf_deltas'] as $delta) {
      if (isset($node->{$token['wf_field']}[$delta])) {
        $items[] = $node->{$token['wf_field']}[$delta];
      }
    }

    list($field_type, $formatter_name) = explode('_formatter_', $token['wf_formatter']);
    $formatter = _content_get_formatter($formatter_name, $field_type);

    // @TODO - Merge logic with AHAH version.
    if ($formatter->multiple == CONTENT_HANDLE_CORE) {
      $element = '';
      foreach ($items as $item) {
        $item = _wysiwyg_fields_ahah_get_element($field, $item, array($field_type, $formatter_name));
        $element .= theme($item['#theme'], $item);
      }
      $text = str_replace($key, $element, $text);
    }

    else {
      $element = _wysiwyg_fields_ahah_get_element($field, $items, array($field_type, $formatter_name));
      $text = str_replace($key, theme($element['#theme'], $element), $text);
    }
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
    preg_match_all('/(\w*?)\=["\'](\w*?)["\']/', $match[1], $attributes, PREG_SET_ORDER);
    $tokens[$match[0]] = array();
    foreach ($attributes as $attribute) {
      $tokens[$match[0]][$attribute[1]] = $attribute[2];
    }
  }

  return $tokens;
}

/**
 * Implements hook_wysiwyg_fields_nodeapi_alter() on behalf of filter.module.
 */
function filter_wysiwyg_fields_nodeapi_alter($node, $op, $a3 = NULL, $a4 = NULL) {
  switch ($op) {
    case 'update':
      // @TODO - Only flush cache if any of the tokens are affected.
      $textfields = _wysiwyg_fields_textfields($node);
      foreach ($textfields as $textfield) {
        $cid = "{$textfield['format']}:" . md5($textfield['value']);
        if (cache_get($cid, 'cache_filter') != FALSE) {
          cache_clear_all($cid, 'cache_filter');
        }
      }
      break;
  }
}

/**
 * Implements hook_wysiwyg_fields_form_alter_alter() on behalf of filter.module.
 */
function filter_wysiwyg_fields_form_alter_alter($form, $form_state, $form_id) {
  if ($form_id == 'filter_admin_format_form') {
    $form['filters']['wysiwyg_fields/0']['#default_value'] = TRUE;
    $form['filters']['wysiwyg_fields/0']['#disabled'] = TRUE;
  }
}
