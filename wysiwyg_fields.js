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

  Drupal.behaviors.wysiwygFields = function(context) {
    // TODO - This gets triggered multiple times when an AHAH event is fired,
    // causing multiple inserts.
    $('.wysiwyg_fields_insert').bind('click', function() {
      var name = $(this).attr('name').replace(']', '').split('[');
      $.post(Drupal.settings.basePath + 'ahah/wysiwyg_fields/insert/' + name[0] + '/' + name[1], $(this).parents('form').serialize(), function(data) {
        Drupal.wysiwyg.instances[Drupal.wysiwyg.activeId].insert(data.output);
      }, 'json');
      return false;
    });
  }
})(jQuery);
