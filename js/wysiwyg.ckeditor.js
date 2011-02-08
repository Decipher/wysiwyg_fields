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
  Drupal.wysiwygFields.wysiwyg.ckeditor = {
    /**
     * Returns Text node.
     */
    wysiwygGetTextNode: function() {
      return $(CKEDITOR.instances[Drupal.wysiwyg.activeId].getSelection().getStartElement().$).get(0).firstChild;
    },

    /**
     * @TODO - Cross browser support?
     * @TODO - Remove IMG resize helper.
     * @TODO - Element path no longer works?
     */
    wysiwygIsNode: function(element) {
      editor = CKEDITOR.instances[Drupal.wysiwyg.activeId];

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
      if (typeof CKEDITOR.instances[Drupal.wysiwyg.activeId].document !== "undefined") {
        $('wysiwyg_field.wysiwyg_fields-placeholder', CKEDITOR.instances[Drupal.wysiwyg.activeId].document.$.body).each(function() {
          $(this).removeClass('wysiwyg_fields-placeholder');
          replacement = "<wysiwyg_field id='" + $(this).attr('id') + "' class='" + $(this).attr('class') + "'>" + Drupal.settings.wysiwygFields.replacements['[' + $(this).attr('id') + ']'] + "</wysiwyg_field>";
          Drupal.wysiwygFields.wysiwyg.ckeditor.wysiwygIsNode(this);
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
