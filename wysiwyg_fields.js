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
        width: 'auto'
      });
      //$('#wysiwyg_fields-' + id + '-wrapper').children().hide();
      $('#wysiwyg_fields-' + id + '-wrapper').parents('.ui-dialog').attr('id', 'wysiwyg_fields-' + id + '-dialog');
      this.dialogFix(id);
    },

    /**
     *
     */
    wysiwygIsNode: function(id, node) {
      // @TODO - Check if selection is Wysiwyg field, and if so make content
      // non-editable based on tinyMCE non-editable plugin.
      //console.log($(node));
      return false;
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

      $('#wysiwyg_fields-' + id + '-wrapper')./*css('display', 'block').*/dialog('open');
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

    },

    /**
     *
     */
    dialogFix: function(id) {
      if ($('#wysiwyg_fields-' + id + '-dialog').parent() !== $('#node-form')) {
        $('#wysiwyg_fields-' + id + '-dialog').prependTo($('#node-form'));
        $('.ui-widget-overlay').prependTo($('#node-form')).css('position', 'fixed');
      }
    }
  }

  /**
   *
   */
  Drupal.behaviors.wysiwygFields = function(context) {
    // Attach AHAH events here as it doesn't seem to be possible to do via FAPI
    // in #after_build.
    $('.wysiwyg_fields_insert').each(function() {
      if (!$(this).hasClass('.ahah-processed')) {
        name = $(this).attr('name').replace(']', '').split('[');
        Drupal.settings.ahah[$(this).attr('id')] = {
          'button': {
            'op': $(this).val()
          },
          'effect': "none",
          //'element':
          'event': "mousedown",
          'keypress': true,
          'method': "replace",
          'progress': {
            'type': "throbber"
          },
          'selector': "#" + $(this).attr('id'),
          'url': Drupal.settings.basePath + "ahah/wysiwyg_fields/insert/" + name[0] + "/" + name[1],
          'wrapper': $(this).attr('id').substr(0, $(this).attr('id').length - 6) + 'ahah-wrapper'
        };
      }
    });
    Drupal.behaviors.ahah(context);
  }
})(jQuery);
