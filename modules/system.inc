<?php
// $Id$
/**
 * @file
 * System module integration.
 */

/**
 * Implements hook_nodeapi().
 */
function wysiwyg_fields_nodeapi(&$node, $op, $a3 = NULL, $a4 = NULL) {
  drupal_alter('wysiwyg_fields_nodeapi', &$node, $op, $a3, $a4);
}

// @TODO - Add form_alter and other system hooks here.
