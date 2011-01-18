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
    }
  }
})(jQuery);
