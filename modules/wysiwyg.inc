<?php
// $Id$
/**
 * @file
 * Wysiwyg module integration.
 */

/**
 * Implements hook_wysiwyg_include_directory().
 */
function wysiwyg_fields_wysiwyg_include_directory($type) {
  switch ($type) {
    case 'plugins':
      return $type;
  }
}
