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
    // Wrapper element override.
    //wrapperElement: 'wysiwyg_field',

    init: function(id) {
      // MCEditor icon size fix.
      $('.mce_wysiwyg_fields_' + id).addClass('mce_wysiwyg_fields_icon');
    },

    /**
     * @TODO - Remove IMG resize helper.
     */
    wysiwygIsNode: function(element) {
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
    divToWysiwygField: function() {
      delete Drupal.settings.wysiwygFields.timer;
      if (typeof tinyMCE !== "undefined") {
        $.each(tinyMCE.editors, function(instance) {
          if (typeof tinyMCE.editors[instance].contentDocument !== "undefined") {
            $('.wysiwyg_fields-placeholder', tinyMCE.editors[instance].contentDocument.body).each(function() {
              replacement = Drupal.settings.wysiwygFields.fields[$(this).parent().attr('wf_field')].replacements[$(this).parent().attr('wf_deltas')][$(this).parent().attr('wf_formatter')];
              Drupal.wysiwygFields.wysiwyg.tinymce.wysiwygIsNode(this);
              Drupal.wysiwyg.instances[tinyMCE.editors[instance].editorId].insert(replacement);
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
