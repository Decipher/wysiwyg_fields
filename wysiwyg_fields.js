// $Id$

(function ($) {
  Drupal.settings.wysiwygFields = Drupal.settings.wysiwygFields || {};

  Drupal.wysiwygFields = {
    /**
     * Initialize Wysiwyg Fields plugin.
     */
    init: function(id) {
      // MCEditor icon size fix.
      $('.mce_wysiwyg_fields_' + id).addClass('mce_wysiwyg_fields_icon');

      // Create jQuery UI dialog.
      $('#wysiwyg_fields-' + id + '-wrapper').dialog({
        autoOpen: false,
        height: 'auto',
        modal: true,
        title: Drupal.settings.wysiwyg.plugins[Drupal.wysiwyg.instances[Drupal.wysiwyg.activeId].format].drupal['wysiwyg_fields_' + id].title,
        width: '80%'
      });
      $('#wysiwyg_fields-' + id + '-wrapper').parents('.ui-dialog').attr('id', 'wysiwyg_fields-' + id + '-dialog');

      //$('#wysiwyg_fields-' + id + '-wrapper .wysiwyg_fields_formatters').parent().css({ display: 'inline' });
      this.dialogFix(id);
    },

    /**
     *
     */
    wysiwygIsNode: function(id, node) {
      // @TODO - Node doesn't work for text, need to use alternative check.
      if ($(node).parents('span.wysiwyg_fields-' + id).length == 1) {
        // FCKEditor - @see FCKDomRange.prototype.SelectBookmark
        // TinyMCE - @see moveToBookmark();

        // Invoke appropriate function based on active Wysiwyg editor.
        if ($.isFunction(this._wysiwygIsNode[Drupal.wysiwyg.instances[Drupal.wysiwyg.activeId].editor])) {
          this._wysiwygIsNode[Drupal.wysiwyg.instances[Drupal.wysiwyg.activeId].editor]($(node).parents('span.wysiwyg_fields-' + id).get(0));
        }
      }
      return $(node).parents('span.wysiwyg_fields-' + id).length == 1;
    },

    /**
     *
     */
    _wysiwygIsNode: {
      /**
       * @TODO - Cross browser support?
       * @TODO - Remove IMG resize helper.
       * @TODO - Element path no longer works?
       */
      ckeditor: function(element) {
        editor = CKEDITOR.instances[Drupal.wysiwyg.activeId];

        // Create the range for the element.
        range = editor.document.$.createRange();
        range.selectNode(element);

        // Select the range.
        var sel = editor.getSelection().getNative();
        sel.removeAllRanges();
        sel.addRange(range);
        editor.reset();
      },

      /**
       *
       */
      fckeditor: function(element) {
        
      },

      /**
       *
       */
      tinymce: function(element) {

      }
    },

    /**
     * Convert tokens to the appropriate rendered preview.
     */
    wysiwygAttach: function(id, content, settings, instanceId) {
      var regex = new RegExp('(\\[wysiwyg_fields-' + id + '-(\\d)-(.*?)\\])', 'g');
      if ((matches = content.match(regex))) {
        $.each($(matches), function(i, elem) {
          elemId = elem.substr(1, elem.length - 2);
          replacement = "<span id='" + elemId + "' class='wysiwyg_fields wysiwyg_fields-" + id + "'>" + Drupal.settings.wysiwygFields.replacements[elem] + "</span>";
          content = content.replace(elem, replacement);
        });
      }
      return content;
    },

    /**
     * Convert rendered previews to the appropriate token.
     */
    wysiwygDetach: function(id, content, settings, instanceId) {
      var $content = $('<div>' + content + '</div>');
      $.each($('span.wysiwyg_fields-' + id, $content), function(i, elem) {
        var token = '[' + $(elem).attr('id') + ']';

        // Store replacement in Drupal.settings for wysiwygAttach.
        Drupal.settings.wysiwygFields.replacements = Drupal.settings.wysiwygFields.replacements || {};
        Drupal.settings.wysiwygFields.replacements[token] = $(elem).html();

        $($content).find('#' + $(elem).attr('id')).replaceWith(token);
      });
      return $content.html();
    },

    /**
     *
     */
    dialogShow: function(id, op) {
      if (op == undefined) {
        op = 'Default';
      }

      $('#wysiwyg_fields-' + id + '-wrapper').dialog('open').focus();
      this.dialogFix(id);

      // Invoke appropriate function based on 'op'.
      if ($.isFunction(this['dialogShow' + op])) {
        this['dialogShow' + op](id);
      }

      $('#wysiwyg_fields-' + id + '-wrapper > *').css({ padding: "1.5em 1.7em" });
    },

    /**
     *
     */
    dialogShowDefault: function(id) {
      // @TODO - Figure out why I can't use switch() {} here.
      if (Drupal.settings.wysiwygFields.fields[id].multiple > 1) {

      }

      // Show last field if multiple is Unlimited.
      else if (Drupal.settings.wysiwygFields.fields[id].multiple == 1) {
        $('#' + id.replace('_', '-') + '-items').hide();
        if ($('.wysiwyg_fields-' + id + '-field:last').parents('table#' + id + '_values').length == 1) {
          $('<div id="wysiwyg_fields-' + id + '-placeholder" />').insertAfter($('.wysiwyg_fields-' + id + '-field:last'));
          $('.wysiwyg_fields-' + id + '-field:last').prependTo('#wysiwyg_fields-' + id + '-wrapper');
        }
      }
    },

    /**
     *
     */
    dialogHide: function(id) {
      // @TODO - Find out why jQuery UI dialog Method 'close' doesn't work?
      $('#wysiwyg_fields-' + id + '-dialog .ui-dialog-titlebar-close').trigger('click');

      if (Drupal.settings.wysiwygFields.fields[id].multiple > 1) {
      }

      // Undo DOM modificatons and trigger 'Add more' button if multiple is
      // Unlimited.
      else if (Drupal.settings.wysiwygFields.fields[id].multiple == 1) {
        if (!$('.wysiwyg_fields-' + id + '-field:first').parent().is('td')) {
          $('#wysiwyg_fields-' + id + '-placeholder').replaceWith($('.wysiwyg_fields-' + id + '-field:first'));
          }
        $('#' + id.replace('_', '-') + '-items').show();
        $('.form-submit[name="' + id + '_add_more"]').trigger('mousedown');
      }
    },

    /**
     *
     */
    dialogFix: function(id) {
      if ($('#wysiwyg_fields-' + id + '-dialog').parent() !== $('#' + Drupal.wysiwyg.activeId).parent()) {
        $('#wysiwyg_fields-' + id + '-dialog').prependTo($('#' + Drupal.wysiwyg.activeId).parent());
        $('.ui-widget-overlay, .ui-dialog-overlay').prependTo($('#' + Drupal.wysiwyg.activeId).parent()).css('position', 'fixed');
        $('#' + Drupal.wysiwyg.activeId).parent().css({ position: 'relative' });
        $('#wysiwyg_fields-' + id + '-dialog').css({ left: '10%', top: '20%' });
        $('#wysiwyg_fields-' + id + '-wrapper').css({ height: 'auto', padding: 0, width: '100%' });
      }
    }
  }
})(jQuery);
