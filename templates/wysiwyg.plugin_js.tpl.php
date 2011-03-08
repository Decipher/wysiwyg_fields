<?php
/**
 * @file
 * Template for Wysiwyg Fields dynamic Wysiwyg plugin.
 */
?>
(function ($) {
  Drupal.wysiwyg.plugins['wysiwyg_fields_<?php print $field; ?>'] = {

    /**
     * Return whether the passed node belongs to this plugin.
     */
    isNode: function(node) {
      return Drupal.wysiwygFields.wysiwygIsNode('<?php print $field; ?>', node);
    },

    /**
     * Execute the button.
     */
    invoke: function(data, settings, instanceId) {
      Drupal.wysiwygFields.wysiwygInvoke('<?php print $field; ?>', data, settings, instanceId);
    },

    /**
     * Create wysiwyg_imagefield dialog window.
     */
    attach: function(content, settings, instanceId) {
      Drupal.wysiwygFields.init('<?php print $field; ?>');
      return Drupal.wysiwygFields.wysiwygAttach('<?php print $field; ?>', content, settings, instanceId);
    },

    /**
     *
     */
    detach: function(content, settings, instanceId) {
      return Drupal.wysiwygFields.wysiwygDetach('<?php print $field; ?>', content, settings, instanceId);
    }

  }
})(jQuery);
