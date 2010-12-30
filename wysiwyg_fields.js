// $Id$

(function ($) {
  Drupal.settings.wysiwygFields = Drupal.settings.wysiwygFields || {};

  Drupal.wysiwygFields = {

    /**
     *
     */
    init: function(id) {
      $('#wysiwyg_fields-' + id + '-wrapper').dialog({
        autoOpen: false,
        height: 'auto',
        modal: true,
        title: Drupal.settings.wysiwyg.plugins[Drupal.wysiwyg.instances[Drupal.wysiwyg.activeId].format].drupal['wysiwyg_fields_' + id].title,
        width: 'auto'
      });
      $('#wysiwyg_fields-' + id + '-wrapper').children().hide();
      $('#wysiwyg_fields-' + id + '-wrapper').parents('.ui-dialog').attr('id', 'wysiwyg_fields-' + id + '-dialog');
    },

    /**
     *
     */
    dialogShow: function(id, op) {
      if (op == undefined) {
        op = 'Default';
      }

      $('#wysiwyg_fields-' + id + '-wrapper').css('display', 'block').dialog('open');
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
      if ($('#' + Drupal.settings.wysiwygFields[id]).parent().attr('id') !== 'wysiwyg_fields-' + id + '-wrapper') {
        // @TODO - Select first empty field, not last field.
        // @TODO - Need to check if field is populated for non-Unlimited values.
        $('#wysiwyg_fields-' + id + '-wrapper div[id$="ahah-wrapper"], #wysiwyg_fields-' + id + '-wrapper div[id$="value-wrapper"]').children(':last').parent().parent().appendTo('#wysiwyg_fields-' + id + '-wrapper');
        Drupal.settings.wysiwygFields[id] = $('#wysiwyg_fields-' + id + '-wrapper').children(':last').parent().parent().attr('id');
      }
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
        $('#wysiwyg_fields-' + id + '-dialog').prependTo($('#node-form')).css('position', 'fixed');
        $('.ui-widget-overlay').prependTo($('#node-form')).css('position', 'fixed');
      }
    }

  }
})(jQuery);
