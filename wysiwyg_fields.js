// $Id$

(function ($) {
  Drupal.settings.wysiwygFields = Drupal.settings.wysiwygFields || {};

  Drupal.wysiwygFields = {

    /**
     *
     */
    init: function(id) {
      // MCEditor icon size fix.
      $('.mce_wysiwyg_fields_' + id).addClass('mce_wysiwyg_fields_icon');

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
      // @TODO - Check if selection is Wysiwyg field, and if so make content
      // non-editable based on tinyMCE non-editable plugin.
      if ($(node).parents('span.wysiwyg_fields-' + id).length == 1) {
        // Code here.
      }
      return $(node).parents('span.wysiwyg_fields-' + id).length == 1;
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

      $('#wysiwyg_fields-' + id + '-wrapper')./*css('display', 'block').*/dialog('open').focus();
      this.dialogFix(id);

      // Invoke appropriate function based on 'op'.
      if ($.isFunction(this['dialogShow' + op])) {
        this['dialogShow' + op](id);
      }
    },

    /**
     *
     */
    dialogShowDefault: function(id) {
      // @TODO - Figure out why I can't use switch() {} here.
      if (Drupal.settings.wysiwygFields.fields[id].multiple > 1) {
      }

      else if (Drupal.settings.wysiwygFields.fields[id].multiple == 1) {
      }

      //if ($('#' + Drupal.settings.wysiwygFields[id]).parent().attr('id') !== 'wysiwyg_fields-' + id + '-wrapper') {
      //  // @TODO - Select first empty field, not last field.
      //  // @TODO - Need to check if field is populated for non-Unlimited values.
      //  $('#wysiwyg_fields-' + id + '-wrapper div[id$="ahah-wrapper"], #wysiwyg_fields-' + id + '-wrapper div[id$="value-wrapper"]').children(':last').parent().parent().appendTo('#wysiwyg_fields-' + id + '-wrapper');
      //  Drupal.settings.wysiwygFields[id] = $('#wysiwyg_fields-' + id + '-wrapper').children(':last').parent().parent().attr('id');
      //}
    },

    /**
     *
     */
    dialogHide: function(id) {
      // @TODO - Find out why jQuery UI dialog Method 'close' doesn't work?
      $('#wysiwyg_fields-' + id + '-dialog .ui-dialog-titlebar-close').trigger('click');
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
        $('#wysiwyg_fields-' + id + '-wrapper > *').css({ padding: "1.5em 1.7em" });
      }
    }
  }
})(jQuery);
