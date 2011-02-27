<?php
/**
 * @file
 * Wysiwyg Fields module integration.
 */

/**
 * Implements hook_wysiwyg_fields_icons().
 */
function wysiwyg_fields_wysiwyg_fields_icons() {
  return array(
    drupal_get_path('module', 'wysiwyg_fields') . '/images/icons',
    file_directory_path() . '/wysiwyg_fields',
  );
}
