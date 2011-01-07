<?php
// $Id$
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
      $tokens = $fields = array();
      preg_match_all('/\[wysiwyg_fields-(.*?)-(\d+)-(.*?)\]/', $text, $matches, PREG_SET_ORDER);

      // Use token as array key to ensure no unnecessary processing.
      foreach ($matches as $match) {
        $tokens[$match[0]] = $match;
      }

      foreach ($tokens as $token) {
        $fields[$token[1]] = isset($fields[$token[1]]) ? $fields[$token[1]] : content_fields($token[1], $node->type);

        $field = $fields[$token[1]];
        $item = $node->{$token[1]}[$token[2]];
        $formatter = explode('_formatter_', $token[3]);

        $element = _wysiwyg_fields_ahah_get_element($field, $item, $formatter);
        $text = str_replace($token[0], theme($element['#theme'], $element), $text);
      }
      return $text;

    default:
      return $text;
  }
}

/**
 * Implements hook_wysiwyg_fields_form_alter_alter() on behalf of filter.module.
 */
function filter_wysiwyg_fields_form_alter_alter(&$form, &$form_state, $form_id) {
  if ($form_id == 'filter_admin_format_form') {
    $form['filters']['wysiwyg_fields/0']['#default_value'] = TRUE;
    $form['filters']['wysiwyg_fields/0']['#disabled'] = TRUE;
  }
}
