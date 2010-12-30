// $Id: filefield_sources.js,v 1.2 2010/08/18 06:08:35 deciphered Exp $

(function ($) {
  // Make sure WYSIWYG ImageField objects are defined.
  Drupal.wysiwygImageField = Drupal.wysiwygImageField || {};
  Drupal.wysiwygImageField.hookSetPosition = Drupal.wysiwygImageField.hookSetPosition || {};

  // Implements hookSetPosition.
  Drupal.wysiwygImageField.hookSetPosition.fileFieldSources = function() {
    $('#wysiwyg_fields-wrapper .filefield-element .widget-edit table').parents('.widget-edit').css('max-width', '100%');

    // Set table width.
    $('#wysiwyg_fields-wrapper .filefield-element .widget-edit table').css('width', $('#wysiwyg_fields-dialog').width() - 131);

    // Set pager width.
    if ($('#wysiwyg_fields-dialog').length != 0) {
      $('#wysiwyg_fields-wrapper .filefield-element .widget-edit div.pager').css({
        'clear': 'both',
        'width': $('#wysiwyg_fields-dialog').width() - 10
      });
    }
  }

  Drupal.behaviors.wysiwygImageField_fileFieldSources = function(context) {
    var vars = {};
    getVars = function(element) {
      $(($(element).attr('class')).split(' ')).each(function(id, className) {
        if (className.indexOf('wysiwyg_fields-') != -1) {
          args = className.substr(19).split('-');
          vars[args[0]] = args[1];
        }
      });
    }

    // Invoke FileField Sources hookSetPosition.
    Drupal.wysiwygImageField.hookSetPosition.fileFieldSources();

    // Table hover.
    $('#wysiwyg_fields-wrapper tbody tr').hover(
      function() {
        getVars(this);
        $(this).addClass('selected').css('cursor', 'pointer');
        $(this).parents('.view-content').find('.imagefield-preview').html(
          $(this).parents('.view-content').find('.wysiwyg_fields-thumbnail-' + vars['fid']).html()
        );
      },
      function() {
        getVars(this);
        $(this).removeClass('selected').css('cursor', 'default');
        $(this).parents('.view-content').find('.imagefield-preview').html('');
      }
    );

    // Table click.
    $('#wysiwyg_fields-wrapper tbody tr').click(function() {
      getVars(this);
      $(this).parents('.filefield-source-reference').find('.wysiwyg_fields-hidden .form-text').val('[fid:' + vars['fid'] + ']');
      $(this).parents('.filefield-source-reference').find('.wysiwyg_fields-hidden .form-submit').mousedown();
    });
  }
})(jQuery);
