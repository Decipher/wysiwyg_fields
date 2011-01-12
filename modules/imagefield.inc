<?php
// $Id$
/**
 * @file
 * ImageField module integration.
 */

/**
 * Implements hook_wysiwyg_fields_elements_alter() on behalf of imagefield.module.
 */
function imagefield_wysiwyg_fields_elements_alter(&$elements) {
  $elements['imagefield_widget']['#after_build'] = array('_filefield_wysiwyg_fields_elements_alter_after_build');
}
