<?php
/**
 * @file
 * Help module integration.
 */

/**
 * Implements hook_help().
 */
function wysiwyg_fields_help($path, $arg) {
  switch ($path) {
    // Main module help for the Wysiwyg Fields module
    case 'admin/help#wysiwyg_fields':
      return '<h2>' . t('Configuration') . "</h2>\n"
           . "<p>\n"
           . '  ' . t('Wysiwyg Fields settings can be found with the standard CCK field settings:') . "<br />\n"
           . '  &nbsp;&nbsp;' . t('Administer > Content management > Content types > [content type] > Manage fields > [field] > Configure') . "<br />\n"
           . '  &nbsp;&nbsp;' . t('http://[www.yoursite.com/path/to/drupal]/admin/content/node-type/[content-type]/fields/[field]') . "\n"
           . "</p>\n"
           . "<ul>\n"
           . '  <li>' . t('Expand the <strong>Wysiwyg Fields settings</strong> fieldset.') . "</li>\n"
           . '  <li>' . t('Check the <strong>Attach to Wysiwyg?</strong> checkbox.') . "</li>\n"
           . '  <li>' . t('Choose or upload icon for the Wysiwyg Field.') . "</li>\n"
           . '  <li>' . t('Select at least one (1) formatter.') . "</li>\n"
           . '  <li>' . t('(optional) Expand and configure the <strong>Advanced settings</strong>.') . "</li>\n"
           . "</ul>\n"
           . "<p>&nbsp;</p>\n"
           . '<h2>' . t('Tips &amp; Tricks') . "</h2>\n"
           . "<p>\n"
           . '  <em>' . t('Coming soon') . "</em>\n"
           . "</p>\n"
           . "<p>&nbsp;</p>\n"
           . '<h2>' . t('Frequently asked questions') . "</h2>\n"
           . "<dl>\n"
           . '  <dt><strong>' . t('Where did my CCK field go?') . "</strong></dt>\n"
           . '  <dd>' . t('For usability purposes, Wysiwyg Fields consumes the fields that it is enabled on. If the field is required for use outside of the Wysiwyg it is recommended that you create a second field specifically for use with Wysiwyg Fields.') . "</dd>\n"
           . '  <dt><strong>' . t('How can I see all the items on a Wysiwyg Field?') . "</strong></dt>\n"
           . '  <dd>' . t('While the Wysiwyg Fields dialog is active you will see a <strong>+</strong> icon to the left of the dialog title, simply click the <strong>+</strong> to display the full CCK field view.') . "</dd>\n"
           . '</dl>';
  }
}
