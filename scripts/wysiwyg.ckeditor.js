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
     *
     */
    init: function(id) {
    //  if (typeof CKEDITOR.instances[Drupal.settings.wysiwygFields.activeId] !== "undefined" && typeof CKEDITOR.instances[Drupal.settings.wysiwygFields.activeId].document !== "undefined") {
    //    $(CKEDITOR.instances[Drupal.settings.wysiwygFields.activeId].document.$).bind('mouseup keyup', function() {
    //      Drupal.wysiwygFields.wysiwyg.ckeditor.isNode(id);
    //    });
    //  }
    //  else {
    //    setTimeout(
    //      function() {
    //        Drupal.wysiwygFields.wysiwyg.ckeditor.init(id);
    //      },
    //      10
    //    );
    //  }
      // Prevent links being clickable inside Wysiwyg.
      $.each(CKEDITOR.instances, function() {
        $(this).delegate('a', 'click', function() {
          return false;
        });
      });
    },

    /**
     * @see http://drupal.org/node/1060552
     */
    //isNode: function(id) {
    //  var node = CKEDITOR.instances[Drupal.settings.wysiwygFields.activeId].getSelection().getSelectedElement();
    //  var state = Drupal.wysiwygFields.wysiwygIsNode(id, node ? node.$ : null) ? CKEDITOR.TRISTATE_ON : CKEDITOR.TRISTATE_OFF;
    //  CKEDITOR.instances[Drupal.settings.wysiwygFields.activeId].getCommand('wysiwyg_fields_' + id).setState(state);
    //},

    /**
     * Returns Text node.
     */
    wysiwygGetTextNode: function() {
      return $(CKEDITOR.instances[Drupal.settings.wysiwygFields.activeId].getSelection().getStartElement().$).get(0).firstChild;
    },

    /**
     * @TODO - Cross browser support?
     * @TODO - Remove IMG resize helper.
     * @TODO - Element path no longer works?
     */
    wysiwygIsNode: function(element) {
      editor = CKEDITOR.instances[Drupal.settings.wysiwygFields.activeId];

      // Create the range for the element.
      range = editor.document.$.createRange();
      range.selectNode(element);

      // Select the range.
      var sel = editor.getSelection().getNative();
      sel.removeAllRanges();
      sel.addRange(range);
      editor.getSelection().reset();
    },

    /**
     *
     */
    divToWysiwygField: function() {
      delete Drupal.settings.wysiwygFields.timer;
      if (typeof CKEDITOR !== "undefined") {
        $.each(CKEDITOR.instances, function(instance) {
          if (CKEDITOR.instances[instance].mode == 'wysiwyg' && typeof CKEDITOR.instances[instance].document !== "undefined") {
            // @TODO - Handle items with no replacements.
            $('.wysiwyg_fields-placeholder', CKEDITOR.instances[instance].document.$.body).each(function() {
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

              if (typeof Drupal.settings.wysiwygFields.fields[$(this).attr('wf_field')].replacements !== "undefined") {
                replacement = Drupal.settings.wysiwygFields.fields[$(this).attr('wf_field')].replacements[JSON.stringify(token_data)];
                Drupal.wysiwygFields.wysiwyg.ckeditor.wysiwygIsNode(this);

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
