<?php
/**
 * @file
 * Help module integration.
 */

/**
 * Implements hook_wysiwyg_fields_theme_alter() on behalf of help.module.
 */
function help_wysiwyg_fields_theme_alter($items) {
  $path = drupal_get_path('module', 'wysiwyg_fields') . '/templates';

  $items['wysiwyg_fields_help__admin_help'] = array(
    'arguments' => array(),
    'template' => 'help.admin_help',
    'path' => $path,
  );
}

/**
 * Implements hook_help().
 */
function wysiwyg_fields_help($path, $arg) {
  switch ($path) {
    // Main module help for the Wysiwyg ImageField module
    case 'admin/help#wysiwyg_fields':
      // @TODO - Make this translatable.
      return theme('wysiwyg_fields_help__admin_help');
  }
}
