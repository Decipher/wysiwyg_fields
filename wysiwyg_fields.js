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
     * Convert tokens to the appropriate rendered preview.
     */
    wysiwygAttach: function(id, content, settings, instanceId) {
      //var regex = new RegExp('(\\[wysiwyg_fields-' + id + '-(\\d)-(.*?)\\])', 'g');
      //// @TODO - Don't process same token multple times.
      //// @TODO - Content is being returned before AHAH Callback is finished.
      //if ((matches = content.match(regex))) {
      //  $.each($(matches), function(i, elem) {
      //    values = elem.split(regex);
      //    $.post(Drupal.settings.basePath + 'ahah/wysiwyg_fields/format/' + id + '/' + values[2] + '/' + values[3], $('#' + instanceId).parents('form').serialize(), function(data) {
      //      var id = elem.substr(1, elem.length - 2);
      //      content = "<span id='" + id + "' class='wysiwyg_fields wysiwyg_fields-" + values[2] + "'>" + data.output + "</span>";
      //    }, 'json');
      //  });
      //}
      return content;
    },

    /**
     * Convert rendered previews to the appropriate token.
     */
    wysiwygDetach: function(id, content, settings, instanceId) {
      var $content = $('<div>' + content + '</div>');
      $.each($('span.wysiwyg_fields-' + id, $content), function(i, elem) {
        var token = '[' + $(elem).attr('id') + ']';
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
    //},
    //
    ///**
    // *
    // */
    //insert: function() {
    //  var name = $(this).attr('name').replace(']', '').split('[');
    //  $.post(Drupal.settings.basePath + 'ahah/wysiwyg_fields/insert/' + name[0] + '/' + name[1], $(this).parents('form').serialize(), function(data) {
    //    var formatter = $('select[name="' + name[0] + '[' + name[1] + '][wysiwyg_fields_formatters]"]').val();
    //    var id = "wysiwyg_fields-" + name[0] + "-" + name[1] + "-" + formatter;
    //    var output = "<span id='" + id + "' class='wysiwyg_fields wysiwyg_fields-" + name[0] + "'>" + data.output + "</span>";
    //    Drupal.wysiwyg.instances[Drupal.wysiwyg.activeId].insert(output);
    //  }, 'json');
    //  return false;
    }
  }

  /**
   *
   */
  Drupal.behaviors.wysiwygFields = function(context) {
    //$('.wysiwyg_fields_insert').bind('click', Drupal.wysiwygFields.insert);
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
