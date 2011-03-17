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
      return FCKeditorAPI.Instances[Drupal.settings.wysiwygFields.activeId].Selection.GetSelection().anchorNode;
    },

    /**
     * @TODO - Remove IMG resize helper.
     */
    wysiwygIsNode: function(element) {
      editor = FCKeditorAPI.Instances[Drupal.settings.wysiwygFields.activeId];

      // Create the range for the element.
      range = editor.EditorDocument.createRange();
      range.selectNode(element);

      // Select the range.
      var sel = editor.Selection.GetSelection();
      sel.removeAllRanges();
      sel.addRange(range);
    },

    /**
     *
     */
    divToWysiwygField: function() {
      delete Drupal.settings.wysiwygFields.timer;
      if (typeof FCKeditorAPI !== "undefined") {
        $.each(FCKeditorAPI.Instances, function(instance) {
          if (typeof FCKeditorAPI.Instances[instance].EditorDocument !== "undefined") {
            $('wysiwyg_field.wysiwyg_fields-placeholder', FCKeditorAPI.Instances[instance].EditorDocument.body).each(function() {
              $(this).removeClass('wysiwyg_fields-placeholder');
              replacement = "<wysiwyg_field id='" + $(this).attr('id') + "' class='" + $(this).attr('class') + "'>" + Drupal.settings.wysiwygFields.replacements['[' + $(this).attr('id') + ']'] + "</wysiwyg_field>";
              Drupal.wysiwygFields.wysiwyg.fckeditor.wysiwygIsNode(this);
              Drupal.wysiwyg.instances[instance].insert(replacement);
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
