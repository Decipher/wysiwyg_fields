<?php
/**
 * @file
 * Fieldgroup module integration.
 */

/**
 * Implements hook_wysiwyg_fields_form_alter_alter() on behalf of fieldgroup.module.
 */
function fieldgroup_wysiwyg_fields_form_alter_alter($form, $form_state, $form_id) {
  if (isset($form['type']['#value']) && $form_id == "{$form['type']['#value']}_node_form") {
    $form['#after_build'][] = 'fieldgroup_wysiwyg_fields_form_alter_after_build';
  }
}

function fieldgroup_wysiwyg_fields_form_alter_after_build($form_element, &$form_state) {
  foreach (fieldgroup_groups($form_element['type']['#value']) as $group) {
    if (!empty($group['fields'])) {
      foreach ($group['fields'] as $field) {
        if (isset($form_element['#field_info']) && isset($form_element['#field_info'][$field['field_name']]['widget']['wysiwyg_fields_status']) && $form_element['#field_info'][$field['field_name']]['widget']['wysiwyg_fields_status']) {
          wysiwyg_field_after_build_wrapper($form_element[$group['group_name']][$field['field_name']], $field['field_name']);
        }
      }
    }
  }

  return $form_element;
}
