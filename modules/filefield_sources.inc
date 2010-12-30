<?php
// $Id: filefield_sources.inc,v 1.2 2010/08/10 04:51:03 deciphered Exp $
/**
 * @file
 * FileField Sources module integration.
 */

/**
 * Alter Wysiwyg ImageField theme registry.
 */
function filefield_sources_wysiwyg_fields_theme_registry_alter($theme_registry) {
  $theme_registry['filefield_source_reference_element']['file'] = 'modules/filefield_sources.inc';
  $theme_registry['filefield_source_reference_element']['theme path'] = drupal_get_path('module', 'wysiwyg_fields');
  $theme_registry['filefield_source_reference_element']['function'] = 'theme_wysiwyg_fields_filefield_source_reference_element';
  $theme_registry['filefield_source_reference_element']['include files'] = array('./' . drupal_get_path('module', 'wysiwyg_fields') . '/modules/filefield_sources.inc');
  $theme_registry['filefield_source_reference_element']['theme paths'] = array(drupal_get_path('module', 'wysiwyg_fields'));
}

/**
 * Theme the output of the autocomplete field.
 */
function theme_wysiwyg_fields_filefield_source_reference_element($element) {
  drupal_add_js(drupal_get_path('module', 'wysiwyg_fields') . '/modules/filefield_sources.js');
  $element['autocomplete']['#field_suffix'] = theme('submit', $element['select']);

  if (module_exists('views')) {
    $view = views_get_view('wysiwyg_fields');
    $view->pager['use_pager'] = TRUE;
    $view->use_ajax = TRUE;

    return '<div class="filefield-source filefield-source-reference clear-block"><span class="wysiwyg_fields-hidden">' . theme('textfield', $element['autocomplete']) . '</span>' . $view->render('default') . '</div>';
  }

  else {
    return '<div class="filefield-source filefield-source-reference clear-block">' . theme('textfield', $element['autocomplete']) . '</div>';
  }
}
