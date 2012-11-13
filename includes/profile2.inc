<?php
/**
 * @file
 * Profile2 module integration.
 */

/**
 * Implements hook_form_alter().
 */
function profile2_wysiwyg_fields_form_alter_alter(&$form, $form_state, $form_id) {
  if ($form_id == 'user_profile_form' && isset($form['#user_category']) && isset($form["profile_{$form['#user_category']}"])) {
    wysiwyg_fields_wysiwyg_fields_form_alter_alter($form["profile_{$form['#user_category']}"], $form_state, $form_id);
  }
}
