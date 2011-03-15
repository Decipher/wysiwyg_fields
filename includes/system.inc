<?php
/**
 * @file
 * System module integration.
 */

/**
 * Implements hook_init().
 */
function wysiwyg_fields_init() {
  drupal_alter('wysiwyg_fields_init', $data = NULL);
}

/**
 * Implements hook_menu().
 */
function wysiwyg_fields_menu() {
  $items = array();
  drupal_alter('wysiwyg_fields_menu', $items);
  return $items;
}

/**
 * Implements hook_theme().
 */
function wysiwyg_fields_theme() {
  $items = array();
  drupal_alter('wysiwyg_fields_theme', $items);
  return $items;
}

/**
 * Implements hook_elements().
 */
function wysiwyg_fields_elements() {
  $elements = array();
  drupal_alter('wysiwyg_fields_elements', $elements);
  return $elements;
}

/**
 * Implements hook_form_alter().
 */
function wysiwyg_fields_form_alter(&$form, &$form_state, $form_id) {
  drupal_alter('wysiwyg_fields_form_alter', $form, $form_state, $form_id);
}

/**
 * Implements hook_nodeapi().
 */
function wysiwyg_fields_nodeapi(&$node, $op, $a3 = NULL, $a4 = NULL) {
  drupal_alter('wysiwyg_fields_nodeapi', $node, $op, $a3, $a4);
}
