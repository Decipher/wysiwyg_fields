(function ($) {
  $.each(wysiwygFields, function(delta, field_name) {
    Drupal.wysiwyg.plugins['wysiwyg_fields_' + field_name] = {
      /**
       * Return whether the passed node belongs to this plugin.
       */
      isNode: function(node) {
        return Drupal.wysiwygFields.wysiwygIsNode(field_name, node);
      },

      /**
       * Execute the button.
       */
      invoke: function(data, settings, instanceId) {
        Drupal.wysiwygFields.wysiwygInvoke(field_name, data, settings, instanceId);
      },

      /**
       * Create wysiwyg_imagefield dialog window.
       */
      attach: function(content, settings, instanceId) {
        Drupal.wysiwygFields.init(field_name);
        return Drupal.wysiwygFields.wysiwygAttach(field_name, content, settings, instanceId);
      },

      /**
       *
       */
      detach: function(content, settings, instanceId) {
        return Drupal.wysiwygFields.wysiwygDetach(field_name, content, settings, instanceId);
      }
    }
  });
})(jQuery);
