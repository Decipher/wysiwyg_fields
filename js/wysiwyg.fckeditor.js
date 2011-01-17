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
  Drupal.wysiwygFields.wysiwyg.fckeditor = {
    /**
     * Returns Text node.
     */
    wysiwygGetTextNode: function(element) {
      return FCKeditorAPI.Instances[Drupal.wysiwyg.activeId].Selection.GetSelection().anchorNode;
    },

    /**
     * @TODO - Remove IMG resize helper.
     */
    wysiwygIsNode: function(element) {
      editor = FCKeditorAPI.Instances[Drupal.wysiwyg.activeId];

      // Create the range for the element.
      range = editor.EditorDocument.createRange();
      range.selectNode(element);

      // Select the range.
      var sel = editor.Selection.GetSelection();
      sel.removeAllRanges();
      sel.addRange(range);
    }
  }
})(jQuery);
