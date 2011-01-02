<?php
// $Id$
/**
 * @file
 * Template for Wysiwyg Fields dynamic Wysiwyg plugin.
 */
?>
// $Id$

(function ($) {
  Drupal.wysiwyg.plugins['wysiwyg_fields_<?php print $field; ?>'] = {

    /**
     * Return whether the passed node belongs to this plugin.
     */
    isNode: function(node) {
      return false;
    },

    /**
     * Execute the button.
     */
    invoke: function(data, settings, instanceId) {
      Drupal.wysiwygFields.dialogShow('<?php print $field; ?>');
    },

    /**
     * Create wysiwyg_imagefield dialog window.
     */
    attach: function(content, settings, instanceId) {
      Drupal.wysiwygFields.init('<?php print $field; ?>');
      return content;
    },

    /**
     *
     */
    detach: function(content, settings, instanceId) {
      return content;
    }

  }
})(jQuery);
