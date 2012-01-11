<?php
/**
 * @file
 * Wysiwyg module integration.
 */

/**
 * Implements hook_wysiwyg_fields_init_alter() on behalf of wysiwyg.module.
 */
function wysiwyg_wysiwyg_fields_init_alter($data) {
  // Rebuild menu after module is enabled.
  if (variable_get('wysiwyg_fields_enable', FALSE)) {
    variable_del('wysiwyg_fields_enable');
    menu_rebuild();
  }

  // Store Content Type in $_SESSION['wysiwyg_fields'] to provide context.
  if (isset($_POST) && isset($_POST['form_id']) && strpos($_POST['form_id'], '_node_form') == strlen($_POST['form_id']) - 10) {
    $_SESSION['wysiwyg_fields'] = str_replace('_node_form', '', $_POST['form_id']);
  }
}

/**
 * Implements hook_wysiwyg_fields_menu_alter() on behalf of wysiwyg.module.
 */
function wysiwyg_wysiwyg_fields_menu_alter($items) {
  $items[drupal_get_path('module', 'wysiwyg_fields') . '/plugins'] = array(
    'title' => 'Wysiwyg Fields dynamic Wysiwyg plugin callback',
    'page callback' => 'wysiwyg_fields_wysiwyg_plugin_callback',
    'access callback' => TRUE,
    'type' => MENU_CALLBACK,
  );
}

/**
 * Implements hook_wysiwyg_fields_theme_alter() on behalf of wysiwyg.module.
 */
function wysiwyg_wysiwyg_fields_theme_alter($items) {
  $path = drupal_get_path('module', 'wysiwyg_fields') . '/templates';

  $items['wysiwyg_fields_wysiwyg_plugin_js'] = array(
    'arguments' => array(
      'field' => NULL,
    ),
    'template' => 'wysiwyg.plugin_js',
    'path' => $path,
  );
}

/**
 * Implements hook_wysiwyg_fields_form_alter_alter() on behalf of wysiwyg.module.
 */
function wysiwyg_wysiwyg_fields_form_alter_alter($form, $form_state, $form_id) {
  if ($form_id == 'wysiwyg_profile_form') {
    foreach (module_invoke_all('wysiwyg_fields_wysiwyg_plugins', $_SESSION['wysiwyg_fields']) as $name => $settings) {
      $form['buttons']['drupal']["wysiwyg_fields_{$name}"] = array(
        '#type' => 'checkbox',
        '#title' => t('!label (!id)', array('!label' => $settings['label'], '!id' => $name)),
        '#default_value' => isset($form['#parameters'][2]->settings['buttons']['drupal']["wysiwyg_fields_{$name}"]),
      );
    }
  }
}

/**
 * Implements hook_wysiwyg_include_directory().
 */
function wysiwyg_fields_wysiwyg_include_directory($type) {
  switch ($type) {
    case 'plugins':
      return $type;
  }
}

/**
 * Implements hook_wysiwyg_fields_add_js() on behalf of wysiwyg.module.
 */
function wysiwyg_wysiwyg_fields_add_js($type) {
  switch ($type) {
    case 'node_form':
      foreach (wysiwyg_profile_load_all() as $profile) {
        if (isset($profile->editor) && file_exists($js = drupal_get_path('module', 'wysiwyg_fields') . "/scripts/wysiwyg.{$profile->editor}.js")) {
          drupal_add_js($js);
        }
      }
      break;
  }
}

/**
 * Page callback; Render dynamic Wysiwyg plugin js or icon.
 */
function wysiwyg_fields_wysiwyg_plugin_callback() {
  $request = explode('/', request_uri());
  switch ($request[count($request) - 2]) {
    case 'images':
      $file = wysiwyg_fields_icons(current(explode('?', $request[count($request) - 1])));
      $info = pathinfo($file);

      header("Content-Type: image/{$info['extension']}");
      header('Cache-Control: public');
      readfile($file);
      break;

    default:
      $field = drupal_substr($request[count($request) - 2], 15);

      header("Content-type: text/javascript");
      print theme('wysiwyg_fields_wysiwyg_plugin_js', $field);
      break;
  }
}

/**
 * Implements hook_wysiwyg_editor_settings_alter().
 *
 * @See http://drupal.org/node/1010534
 */
function wysiwyg_fields_wysiwyg_editor_settings_alter(&$settings, $context) {
  if ($context['profile']->editor == 'tinymce'/* && $context['profile']->settings['buttons']['drupal']['MY_PLUGIN']*/) {
    $settings['extended_valid_elements'] = (!empty($settings['extended_valid_elements']) ? $settings['extended_valid_elements'] . ',' : '') . 'wysiwyg_field[*]';
  }
}
