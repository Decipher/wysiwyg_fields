<?php
/**
 * @file
 * Libraries module integration.
 */

/**
 * Implements hook_wysiwyg_fields_icons() on behalf of libraries.module.
 */
function libraries_wysiwyg_fields_icons() {
  $icons = array();
  $libraries = libraries_get_libraries();

  // famfamfam.com Silk Icons.
  if (in_array('famfamfam_silk_icons', array_keys($libraries))) {
    $icons[] = libraries_get_path('famfamfam_silk_icons') . '/icons';
  }

  return $icons;
}
