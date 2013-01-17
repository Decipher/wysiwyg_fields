(function ($) {
  /**
   *
   */
  Drupal.wysiwygFields = Drupal.wysiwygFields || {};
  Drupal.wysiwygFields.wysiwyg = Drupal.wysiwygFields.wysiwyg || {};

  /**
   *
   */
  Drupal.wysiwygFields.wysiwyg.ckeditor = {
    /**
     * Returns Text node parent element.
     */
    wysiwygGetTextNode: function() {
      editor = CKEDITOR.instances[Drupal.settings.wysiwygFields.activeId];
      selection = new CKEDITOR.dom.selection(editor.document);
      return selection.getStartElement().$;
    },

    /**
     * @TODO - Cross browser support?
     * @TODO - Remove IMG resize helper.
     * @TODO - Element path no longer works?
     */
    wysiwygSelectNode: function(element) {
      editor = CKEDITOR.instances[Drupal.settings.wysiwygFields.activeId];

      // Create the range for the element.
      range = editor.document.$.createRange();
      range.selectNode(element);

      // Select the range.
      var selection = editor.getSelection().getNative();
      selection.removeAllRanges();
      selection.addRange(range);
      editor.getSelection().reset();
    },

    /**
     *
     */
    wysiwygAttach: function() {
      delete Drupal.settings.wysiwygFields.timer;
      if (typeof CKEDITOR !== "undefined") {
        $.each(CKEDITOR.instances, function(instance) {
          editor = CKEDITOR.instances[instance];

          // $(editor.document.$).bind('keydown, mousedown', function(event) {
          //   selection = new CKEDITOR.dom.selection(editor.document);
          //   element = selection.getSelectedElement();
          //   if (element == null) {
          //     element = Drupal.wysiwygFields.wysiwyg.ckeditor.wysiwygGetTextNode();
          //   }
          //   if ($(element).is('wysiwyg_field')) {
          //     Drupal.wysiwygFields.wysiwyg.ckeditor.wysiwygSelectNode(element);
          //   }
          // });

          // // Attach keypress handling.
          // $(editor.document.$).bind('keypress', function(event) {
          //   // selection = new CKEDITOR.dom.selection(editor.document);
          //   // element = selection.getSelectedElement();
          //   // if (element != null) {
          //   //   // If a Wyswiyg Field is currently selected we want to make sure
          //   //   // that the keypress is placed at the end of the Wysiwyg Field.
          //   //   if ($(element.$).parents('wysiwyg_field').length > 0) {
          //   //     element = $(element.$).parents('wysiwyg_field').get(0);

          //   //     range = editor.document.$.createRange();
          //   //     range.selectNode(element);
          //   //     // // // console.log(element);
          //   //     // // // // console.log($(element.$).parents('wysiwyg_field').get(0));
          //   //     // console.log(range);
          //   //     // // // // range.setStart(range., 100);
          //   //     range.collapse(false);

          //   //     selection = selection.getNative();
          //   //     selection.removeAllRanges();
          //   //     selection.addRange(range);
          //   //   }
          //   // }

          //   // selection = new CKEDITOR.dom.selection(editor.document);
          //   // element = selection.getSelectedElement();

          //   // startElement = selection.getStartElement();
          //   // if (element == null && $(startElement.$).is('wysiwyg_field')) {
          //   //   $(startElement.$).replaceWith(startElement.$.outerHTML + String.fromCharCode(event.which));
          //   //   range = editor.document.$.createRange();
          //   //   range.selectNode(element);
          //   //   console.log(range);
          //   //   return false;
          //   // }

          //   return true;
          // });

          // Replace placeholders with there rendered HTML counterparts.
          if (editor.mode == 'wysiwyg' && typeof editor.document !== "undefined") {
            // @TODO - Handle items with no replacements.
            $('.wysiwyg_fields-placeholder', editor.document.$.body).each(function() {
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
                Drupal.wysiwygFields.wysiwyg.ckeditor.wysiwygSelectNode(this);

                // This is required to slow down this function so that the insert
                // doesn't get fired to early. It is hacky and needs fixing.
                timestamp = now = new Date();
                while (timestamp.getMilliseconds == now.getMilliseconds()) {
                  now = new Date();
                }

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
