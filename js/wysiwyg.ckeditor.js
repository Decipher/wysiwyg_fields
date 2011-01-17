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
    }
  }
})(jQuery);
