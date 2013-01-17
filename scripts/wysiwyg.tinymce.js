(function ($) {
  /**
   *
   */
  Drupal.wysiwygFields = Drupal.wysiwygFields || {};
  Drupal.wysiwygFields.wysiwyg = Drupal.wysiwygFields.wysiwyg || {};

  /**
   *
   */
  Drupal.wysiwygFields.wysiwyg.tinymce = {
    init: function(id) {
      // MCEditor icon size fix.
      $('.mce_wysiwyg_fields_' + id).addClass('mce_wysiwyg_fields_icon');

      // Prevent links being clickable inside Wysiwyg.
      editor = tinyMCE.activeEditor;
      $(editor.contentDocument).delegate('a', 'click', function() {
        return false;
      });
    },

    /**
     *
     */
    insert: function(instance, content) {
      tinyMCE.editors[instance].selection.setContent(content);
    },

    /**
     * @TODO - Remove IMG resize helper.
     */
    wysiwygSelectNode: function(element) {
      editor = tinyMCE.activeEditor;

      // Create the range for the element.
      range = editor.contentDocument.createRange();
      range.selectNode(element);

      // Select the range.
      var sel = editor.selection.getSel();
      sel.removeAllRanges();
      sel.addRange(range);
    },

    /**
     *
     */
    wysiwygAttach: function() {
      delete Drupal.settings.wysiwygFields.timer;
      if (typeof tinyMCE !== "undefined") {
        $.each(tinyMCE.editors, function(instance) {
          if (typeof tinyMCE.editors[instance].contentDocument !== "undefined") {
            $('.wysiwyg_fields-placeholder', tinyMCE.editors[instance].contentDocument.body).each(function() {
              // @TODO - Figure out a better way to sort the attributes.
              // @TODO - Move this logic into a more generic location.
              var keys = new Array();
              var attributes = {};
              $.each(this.attributes, function(index, attr) {
                keys.push(attr.name);
                attributes[attr.name] = attr.value;
              });
              var token_data = {};
              $.each(keys.sort(), function(index, attr) {
                token_data[attr] = attributes[attr];
              });
              delete token_data['class'];
              delete token_data['wf_cache'];
              delete token_data['wf_entity_id'];
              delete token_data['wf_entity_type'];

              $(this).removeClass('wysiwyg_fields-placeholder');
              if (typeof Drupal.settings.wysiwygFields.fields[$(this).attr('wf_field')].replacements !== "undefined" && typeof Drupal.settings.wysiwygFields.fields[$(this).attr('wf_field')].replacements[JSON.stringify(token_data)] !== "undefined") {
                replacement = Drupal.settings.wysiwygFields.fields[$(this).attr('wf_field')].replacements[JSON.stringify(token_data)];
                Drupal.wysiwygFields.wysiwyg.tinymce.wysiwygSelectNode(this);
                $(this).replaceWith(replacement);
              }
            });
          }

          else {
            // Document not ready, reset timer.
            Drupal.wysiwygFields._wysiwygAttach();
          }
        });
      }

      else {
        // API not ready, reset timer.
        Drupal.wysiwygFields._wysiwygAttach();
      }
    }
  }
})(jQuery);
