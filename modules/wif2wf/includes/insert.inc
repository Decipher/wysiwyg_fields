<?php
/**
 * @file
 * Insert module integration.
 */

/**
 * Implements hook_wif2wf_style2formatter() on behalf of insert.module.
 */
function insert_wif2wf_style2formatter($item, $style, $widget) {
  if ($style['name'] == 'auto') {
    $info = @pathinfo($item['filepath']);
    if (in_array(strtolower($info['extension']), array('png', 'jpg', 'jpeg', 'gif'))) {
      $style['name'] = 'image';
    }
  }

  switch ($style['name']) {
    case 'image':
      return 'imagefield_formatter_image_plain';

    default:
      return 'filefield_formatter_default';
  }
}
