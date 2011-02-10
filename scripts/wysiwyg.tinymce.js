// $Id$

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
    wrapperElement: 'span',

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
      if (typeof tinyMCE.activeEditor.contentDocument !== "undefined") {
        $('span.wysiwyg_fields-placeholder', tinyMCE.activeEditor.contentDocument.body).each(function() {
          $(this).removeClass('wysiwyg_fields-placeholder');
          replacement = "<span id='" + $(this).attr('id') + "' class='" + $(this).attr('class') + "'>" + Drupal.settings.wysiwygFields.replacements['[' + $(this).attr('id') + ']'] + "</span>";
          Drupal.wysiwygFields.wysiwyg.tinymce.wysiwygIsNode(this);
          Drupal.wysiwyg.instances[Drupal.wysiwyg.activeId].insert(replacement);
        });
      }

      else {
        // Document not ready, reset timer.
        Drupal.wysiwygFields._wysiwygAttach();
      }
    }
  }
})(jQuery);
