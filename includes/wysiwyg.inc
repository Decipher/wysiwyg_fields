<?php
/**
 * @file
 * Wysiwyg module integration.
 */

/**
 * Implements hook_wysiwyg_fields_init() on behalf of wysiwyg.module.
 */
function wysiwyg_wysiwyg_fields_init() {
  // Rebuild menu after module is enabled.
  if (variable_get('wysiwyg_fields_enable', FALSE)) {
    variable_del('wysiwyg_fields_enable');
    menu_rebuild();
  }
}

/**
 * Implements hook_wysiwyg_fields_menu_alter() on behalf of wysiwyg.module.
 */
function wysiwyg_wysiwyg_fields_menu_alter(&$items) {
  $items[drupal_get_path('module', 'wysiwyg_fields') . '/plugins'] = array(
    'title' => 'Wysiwyg Fields dynamic Wysiwyg plugin callback',
    'page callback' => 'wysiwyg_fields_wysiwyg_plugin_callback',
    'access callback' => TRUE,
    'type' => MENU_CALLBACK,
  );
}

/**
 * Implements hook_wysiwyg_fields_form_alter_alter() on behalf of wysiwyg.module.
 *
 * Make Wyiwyg Fields Wysiwyg plugins congigurable by Wysiwyg profile.
 *
 * @TODO - Re-implement this.
 */
//function wysiwyg_wysiwyg_fields_form_alter_alter($form, $form_state, $form_id) {
//  if ($form_id == 'wysiwyg_profile_form') {
//    foreach (module_invoke_all('wysiwyg_fields_wysiwyg_plugins', $_SESSION['wysiwyg_fields']) as $name => $settings) {
//      $form['buttons']['drupal']["wysiwyg_fields_{$name}"] = array(
//        '#type' => 'checkbox',
//        '#title' => t('!label (!id)', array('!label' => $settings['label'], '!id' => $name)),
//        '#default_value' => isset($form['#parameters'][2]->settings['buttons']['drupal']["wysiwyg_fields_{$name}"]),
//      );
//    }
//  }
//}

/**
 * Implements hook_wysiwyg_include_directory().
 */
function wysiwyg_fields_wysiwyg_include_directory($type) {
  if ('plugins' == $type) {
    return $type;
  }
}

/**
 * Implements hook_wysiwyg_fields_node_form_attached_alter() on behalf of wysiwyg.module.
 *
 * Adds the necessary Javascript for each enabled Wysiwyg editor.
 */
function wysiwyg_wysiwyg_fields_node_form_attached_alter(&$attached) {
  foreach (wysiwyg_profile_load_all() as $profile) {
    $js = drupal_get_path('module', 'wysiwyg_fields') . "/scripts/wysiwyg.{$profile->editor}.js";
    if (isset($profile->editor) && file_exists($js)) {
      $attached['js'][] = $js;
    }
  }
}

/**
 * Page callback; Render dynamic Wysiwyg plugin js or icon.
 */
function wysiwyg_fields_wysiwyg_plugin_callback() {
  $request = explode('/', request_uri());
  if ('images' == $request[count($request) - 2]) {
    $file = wysiwyg_fields_icons(current(explode('?', $request[count($request) - 1])));
    $info = pathinfo($file);

    header("Content-Type: image/{$info['extension']}");
    header('Cache-Control: public');
    readfile($file);
  }
}

/**
 * Implements hook_wysiwyg_editor_settings_alter().
 */
function wysiwyg_fields_wysiwyg_editor_settings_alter(&$settings, $context) {
  drupal_alter('wysiwyg_fields_wysiwyg_editor_settings', $settings, $context);
}

/**
 * Implements hook_wysiwyg_fields_wysiwyg_editor_settings_alter().
 *
 * @See http://drupal.org/node/1010534
 */
function wysiwyg_wysiwyg_fields_wysiwyg_editor_settings_alter(&$settings, $context) {
  if ($context['profile']->editor == 'tinymce') {
    $settings['extended_valid_elements'] = !empty($settings['extended_valid_elements'])
      ? $settings['extended_valid_elements'] . ','
      : '';
    $settings['extended_valid_elements'] .= 'wysiwyg_fields[*]';
  }
}
