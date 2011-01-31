// $Id$

(function ($) {
  Drupal.settings.wysiwygFields = Drupal.settings.wysiwygFields || {};

  Drupal.wysiwygFields = {
    /**
     * Initialize Wysiwyg Fields plugin.
     */
    init: function(id) {
      if (typeof Drupal.settings.wysiwygFields.fields[id].init == "undefined") {
        Drupal.settings.wysiwygFields.fields[id].init = true;

        // Create jQuery UI dialog.
        $('#wysiwyg_fields-' + id + '-wrapper').dialog({
          autoOpen: false,
          buttons: {
            'Insert': function() {
              $('#wysiwyg_fields-' + id + '-dialog .wysiwyg_fields-widget input.form-submit:first').trigger('mousedown');
              $('#wysiwyg_fields-' + id + '-wrapper').dialog('close');
              Drupal.wysiwygFields.dialogClose(id);
            }
          },
          height: 'auto',
          modal: true,
          title: Drupal.settings.wysiwyg.plugins[Drupal.wysiwyg.instances[Drupal.wysiwyg.activeId].format].drupal['wysiwyg_fields_' + id].title,
          width: '80%'
        });
        $('#wysiwyg_fields-' + id + '-wrapper').bind('dialogclose', function(event, ui) {
          Drupal.wysiwygFields.dialogClose(id);
        });
        $('#wysiwyg_fields-' + id + '-wrapper').parents('.ui-dialog').attr('id', 'wysiwyg_fields-' + id + '-dialog');
        $('#wysiwyg_fields-' + id + '-dialog .ui-dialog-buttonpane').hide();
        this.dialogFix(id);

        // Expand icon.
        $('#wysiwyg_fields-' + id + '-dialog .ui-dialog-titlebar').prepend('<a class="ui-corner-all wysiwyg_fields-icon-expand" href="#" role="button" unselectable="on"><span class="ui-icon ui-icon-plusthick ui-plus-default" unselectable="on">' + Drupal.t('Expand') + '</span></a>');
        $('#wysiwyg_fields-' + id + '-dialog .ui-dialog-titlebar .wysiwyg_fields-icon-expand')
          .hover(
            function() {
              $(this).addClass('ui-state-hover');
            },
            function() {
              $(this).removeClass('ui-state-hover');
            }
          )
          .bind('click', function() {
            Drupal.wysiwygFields.dialogShow(id, 'All');
            return false;
          });

        // MCEditor icon size fix.
        $('.mce_wysiwyg_fields_' + id).addClass('mce_wysiwyg_fields_icon');
      }
    },

    /**
     * @TODO - wysiwygIsNode only fires when the 'node' object changes, so it
     *   will unselect the DIV on a second click of the element.
     */
    wysiwygIsNode: function(id, node) {
      delete Drupal.settings.wysiwygFields.fields[id].active;

      // Get TextNode if node is empty.
      if (node == null) {
        if ($.isFunction(this.wysiwyg[Drupal.wysiwyg.instances[Drupal.wysiwyg.activeId].editor].wysiwygGetTextNode)) {
          node = this.wysiwyg[Drupal.wysiwyg.instances[Drupal.wysiwyg.activeId].editor].wysiwygGetTextNode();
        }
      }

      node = ($(node).parents('div.wysiwyg_fields-' + id).length == 1) ? $(node).parents('div.wysiwyg_fields-' + id).get(0) : node;
      if ($(node).is('div.wysiwyg_fields-' + id)) {
        // Select Wysiwyg Fields wrapper.
        // Invoke appropriate function based on active Wysiwyg editor.
        if ($.isFunction(this.wysiwyg[Drupal.wysiwyg.instances[Drupal.wysiwyg.activeId].editor].wysiwygIsNode)) {
          this.wysiwyg[Drupal.wysiwyg.instances[Drupal.wysiwyg.activeId].editor].wysiwygIsNode(node);
        }

        // Store active token in settings.
        Drupal.settings.wysiwygFields.fields[id].active = $(node).attr('id');
      }

      return $(node).parents('div.wysiwyg_fields-' + id).length == 1 || $(node).is('div.wysiwyg_fields-' + id);
    },

    /**
     * Convert tokens to the appropriate rendered preview.
     */
    wysiwygAttach: function(id, content, settings, instanceId) {
      var regex = new RegExp('(\\[wysiwyg_fields-' + id + '-([\\d_])+-(.*?)\\])', 'g');
      if ((matches = content.match(regex))) {
        $.each($(matches), function(i, elem) {
          elemId = elem.substr(1, elem.length - 2);
          replacement = "<div id='" + elemId + "' class='wysiwyg_fields wysiwyg_fields-" + id + "'>" + Drupal.settings.wysiwygFields.replacements[elem] + "</div>";
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
      $.each($('div.wysiwyg_fields-' + id, $content), function(i, elem) {
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
      // If there is an active field, render update dialog.
      if (op == undefined && typeof Drupal.settings.wysiwygFields.fields[id].active !== "undefined") {
        op = 'Update';
      }

      // If no operation is defined, use default.
      else if (op == undefined) {
        op = 'Default';
      }

      $('#wysiwyg_fields-' + id + '-wrapper').dialog('open').focus();
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
      // Get field delta.
      delta = 0;
      if (Drupal.settings.wysiwygFields.fields[id].delta !== null) {
        delta = Drupal.settings.wysiwygFields.fields[id].delta;
      }

      if (Drupal.settings.wysiwygFields.fields[id].multiple > 0) {
        $('#' + id.replace('_', '-') + '-items, #wysiwyg_fields-' + id + '-wrapper table').hide();
        if ($('#edit-' + id.replace('_', '-') + '-' + delta + '-wysiwyg-fields-ahah-wrapper').parents('table#' + id + '_values').length == 1) {
          $('#edit-' + id.replace('_', '-') + '-' + delta + '-wysiwyg-fields-ahah-wrapper')
            .before('<div id="edit-' + id.replace('_', '-') + '-' + delta + '-wysiwyg-fields-ahah-wrapper-placeholder" class="placeholder" />')
            .prependTo('#wysiwyg_fields-' + id + '-wrapper');
        }
      }

      if ($('.wysiwyg_fields-' + id + '-field:first .wysiwyg_fields-widget').length == 1) {
        this.buttonsAttach(id);
      }
    },

    /**
     *
     */
    dialogShowUpdate: function(id) {
      if (Drupal.settings.wysiwygFields.fields[id].multiple > 0) {
        token = Drupal.settings.wysiwygFields.fields[id].active.split('-');
        deltas = token[2].split('_');

        if (deltas.length == 1) {
          $('#' + id.replace('_', '-') + '-items, #wysiwyg_fields-' + id + '-wrapper table').hide();
          if ($('#edit-' + id.replace('_', '-') + '-' + token[2] + '-wysiwyg-fields-ahah-wrapper').parents('table#' + id + '_values').length == 1) {
            $('#edit-' + id.replace('_', '-') + '-' + token[2] + '-wysiwyg-fields-ahah-wrapper')
              .before('<div id="edit-' + id.replace('_', '-') + '-' + token[2] + '-wysiwyg-fields-ahah-wrapper-placeholder" class="placeholder" />')
              .prependTo('#wysiwyg_fields-' + id + '-wrapper');
          }
        }

        else {
          this.dialogShowAll(id);
          $.each(deltas, function(delta) {
            $('#edit-' + id.replace('_', '-') + '-' + delta + '-wysiwyg-fields-select').attr('checked', 'checked');
          });
        }
      }

      if ($('.wysiwyg_fields-' + id + '-field:first .wysiwyg_fields-widget').length == 1) {
        this.buttonsAttach(id, 'Update');
      }
    },

    /**
     *
     */
    dialogShowAll: function(id) {
      if ($('#wysiwyg_fields-' + id + '-dialog .ui-dialog-titlebar .wysiwyg_fields-icon-expand .ui-icon').html() == Drupal.t('Expand')) {
        this.dialogClose(id);
        this.buttonsAttach(id);

        // Reposition Multiselect checkboxes.
        if (Drupal.settings.wysiwygFields.fields[id].multiple > 0) {
          $('#wysiwyg_fields-' + id + '-dialog .wysiwyg_fields_select').each(function() {
            $(this)
              .before('<div id="' + $(this).attr('id') + '-placeholder" class="placeholder" />')
              .appendTo($(this).parents('tr:first').find('td:first'));
          });
        }

        $('#wysiwyg_fields-' + id + '-dialog .ui-dialog-titlebar .wysiwyg_fields-icon-expand .ui-icon')
          .html(Drupal.t('Contract'))
          // jQuery UI 1.6
          .removeClass('ui-plus-default')
          .addClass('ui-minus-default')
          // jQuery UI 1.7
          .removeClass('ui-icon-plusthick')
          .addClass('ui-icon-minusthick');
      }

      else {
        this.dialogClose(id);
        this.dialogShow(id);
      }
    },

    /**
     *
     */
    dialogClose: function(id) {
      if (Drupal.settings.wysiwygFields.fields[id].multiple > 0) {
        $('#wysiwyg_fields-' + id + '-wrapper table, #' + id.replace('_', '-') + '-items').show();
      }

      // Undo DOM modificatons.
      $('.placeholder').each(function() {
        $(this).replaceWith($('#' + $(this).attr('id').substr(0, $(this).attr('id').length - 12)));
      });

      // Reset button pane.
      $('#wysiwyg_fields-' + id + '-dialog .ui-dialog-buttonpane').hide();
      $('#wysiwyg_fields-' + id + '-dialog .ui-dialog-buttonpane button').html(Drupal.t('Insert'));

      // Reset expand icon.
      $('#wysiwyg_fields-' + id + '-dialog .ui-dialog-titlebar .wysiwyg_fields-icon-expand .ui-icon')
        .html(Drupal.t('Expand'))
        // jQuery UI 1.6
        .addClass('ui-plus-default')
        .removeClass('ui-minus-default')
        // jQuery UI 1.7
        .addClass('ui-icon-plusthick')
        .removeClass('ui-icon-minusthick');
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
    },

    /**
     *
     */
    buttonsAttach: function(id, label) {
      if ($('.wysiwyg_fields-' + id + '-field:first .wysiwyg_fields-widget select').length == 1 && $('#wysiwyg_fields-' + id + '-dialog .ui-dialog-buttonpane select').length == 0) {
        button = $('#wysiwyg_fields-' + id + '-dialog .ui-dialog-buttonpane button')
        $('.wysiwyg_fields-' + id + '-field:first .wysiwyg_fields-widget select')
          .css({
            fontSize: button.css('font-size'),
            float: button.css('float'),
            lineHeight: button.css('line-height'),
            marginBottom: button.css('margin-bottom'),
            marginLeft: button.css('margin-left'),
            marginRight: button.css('margin-right'),
            marginTop: button.css('margin-top')
          })
          .before('<div id="' + $('.wysiwyg_fields-' + id + '-field:first .wysiwyg_fields-widget select').attr('id') + '-placeholder" class="placeholder" />')
          .appendTo('#wysiwyg_fields-' + id + '-dialog .ui-dialog-buttonpane'); // @TODO - Append or Prepend based on jQuery 1.6/1.7
      }
      if (label !== undefined) {
        token = Drupal.settings.wysiwygFields.fields[id].active.split('-');
        $('#wysiwyg_fields-' + id + '-dialog select.wysiwyg_fields_formatters').val(token[3]);
        $('#wysiwyg_fields-' + id + '-dialog .ui-dialog-buttonpane button').html(Drupal.t(label));
      }
      $('#wysiwyg_fields-' + id + '-dialog .ui-dialog-buttonpane').show();
    },

    /**
     * Increment field delta.
     */
    deltaUpdate: function(id, delta) {
      if (Drupal.settings.wysiwygFields.fields[id].delta <= delta) {
        Drupal.settings.wysiwygFields.fields[id].delta = delta + 1;
      }
    }
  }

  Drupal.behaviors.wysiwygFields = function(context) {
    if (context !== document) {
      $.each(Drupal.settings.wysiwygFields.fields, function(id) {
        Drupal.wysiwygFields.buttonsAttach(id);
        if ($('#wysiwyg_fields-' + id + '-dialog').css('display') == 'block' && $('#wysiwyg_fields-' + id + '-dialog .wysiwyg_fields-icon-expand .ui-icon').hasClass('ui-icon-minusthick')) {
          Drupal.wysiwygFields.dialogShowAll(id);
        }
      });
    }
  }
})(jQuery);
