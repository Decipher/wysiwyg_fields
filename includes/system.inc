<?php
/**
 * @file
 * System module integration.
 */

/**
 * Implements hook_init().
 */
function wysiwyg_fields_init() {
  module_invoke_all('wysiwyg_fields_init');
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
 * Implements hook_element_info().
 */
function wysiwyg_fields_element_info() {
  $elements = array();
  drupal_alter('wysiwyg_fields_element_info', $elements);
  return $elements;
}

/**
 * Implements hook_form_alter().
 */
function wysiwyg_fields_form_alter(&$form, &$form_state, $form_id) {
  drupal_alter('wysiwyg_fields_form_alter', $form, $form_state, $form_id);
}

/**
 * Implements hook_entity_presave().
 */
function wysiwyg_fields_entity_presave($entity, $type) {
  drupal_alter('wysiwyg_fields_entity_presave', $entity, $type);
}

/**
 * Implements hook_entity_insert().
 */
function wysiwyg_fields_entity_insert($entity, $type) {
  drupal_alter('wysiwyg_fields_entity_insert', $entity, $type);
}

/**
 * Implements hook_entity_insert().
 */
function wysiwyg_fields_entity_update($entity, $type) {
  drupal_alter('wysiwyg_fields_entity_update', $entity, $type);
}
