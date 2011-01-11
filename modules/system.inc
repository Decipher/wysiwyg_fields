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

/**
 * Implements hook_form_alter().
 */
function wysiwyg_fields_form_alter(&$form, &$form_state, $form_id) {
  drupal_alter('wysiwyg_fields_form_alter', &$form, &$form_state, $form_id);
}
