(function ($) {
  $.each(wysiwygFields, function(delta, field_name) {
    Drupal.wysiwyg.plugins['wysiwyg_fields_' + field_name] = {
      /**
       * Return whether the passed node belongs to this plugin.
       */
      isNode: function(node) {
        delete Drupal.settings.wysiwygFields.fields[field_name].active;

        // Get TextNode if node is empty.
        if (node == null) {
          if ($.isFunction(Drupal.wysiwygFields.wysiwyg[Drupal.wysiwyg.instances[Drupal.settings.wysiwygFields.activeId].editor].wysiwygGetTextNode)) {
            node = Drupal.wysiwygFields.wysiwyg[Drupal.wysiwyg.instances[Drupal.settings.wysiwygFields.activeId].editor].wysiwygGetTextNode();
          }
        }

        node = ($(node).parents('wysiwyg_field[wf_field="' + field_name + '"]').length == 1)
          ? $(node).parents('wysiwyg_field[wf_field="' + field_name + '"]').get(0)
          : node;

        if ($(node).is('wysiwyg_field[wf_field="' + field_name + '"]')) {
          // Select Wysiwyg Fields wrapper.
          // Invoke appropriate function based on active Wysiwyg editor.
          if ($.isFunction(Drupal.wysiwygFields.wysiwyg[Drupal.wysiwyg.instances[Drupal.settings.wysiwygFields.activeId].editor].wysiwygSelectNode)) {
            Drupal.wysiwygFields.wysiwyg[Drupal.wysiwyg.instances[Drupal.settings.wysiwygFields.activeId].editor].wysiwygSelectNode(node);
          }

          // Store active token in settings.
          Drupal.settings.wysiwygFields.fields[field_name].active = Drupal.wysiwygFields.getTokenData(node);

          return true;
        }

        return false;
      },

      /**
       * Execute the button.
       */
      invoke: function(data, settings, instanceId) {
        Drupal.wysiwyg.activeId = instanceId;
        Drupal.settings.wysiwygFields.activeId = instanceId;
        Drupal.wysiwygFields.dialogShow(field_name);
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
