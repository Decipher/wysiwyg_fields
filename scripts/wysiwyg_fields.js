(function ($) {
  Drupal.settings.wysiwygFields = Drupal.settings.wysiwygFields || {};

  Drupal.wysiwygFields = {
    wrapperElement: 'wysiwyg_field',
    wrapperElementDefault: 'wysiwyg_field',

    /**
     * Initialize Wysiwyg Fields plugin.
     */
    init: function(id) {
      Drupal.settings.wysiwygFields.activeId = Drupal.wysiwyg.activeId;
      if ($.isFunction(this.wysiwyg[Drupal.wysiwyg.instances[Drupal.settings.wysiwygFields.activeId].editor].init)) {
        node = this.wysiwyg[Drupal.wysiwyg.instances[Drupal.settings.wysiwygFields.activeId].editor].init(id);
      }

      this.wrapperElement = (typeof this.wysiwyg[Drupal.wysiwyg.instances[Drupal.settings.wysiwygFields.activeId].editor].wrapperElement == 'undefined')
        ? this.wrapperElementDefault
        : this.wysiwyg[Drupal.wysiwyg.instances[Drupal.settings.wysiwygFields.activeId].editor].wrapperElement;

      if (typeof Drupal.settings.wysiwygFields.fields[id].init == "undefined") {
        Drupal.settings.wysiwygFields.fields[id].init = true;

        // Create jQuery UI dialog.
        $('#wysiwyg_fields-' + id + '-wrapper').dialog({
          autoOpen: false,
          buttons: {
            'Insert': function() {
              $('#wysiwyg_fields-' + id + '-dialog .wysiwyg_fields-widget input.form-submit:first').trigger('mousedown');
            }
          },
          height: 'auto',
          modal: true,
          title: Drupal.settings.wysiwyg.plugins[Drupal.wysiwyg.instances[Drupal.settings.wysiwygFields.activeId].format].drupal['wysiwyg_fields_' + id].title,
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
      }
    },

    /**
     *
     */
    wysiwygInvoke: function(id, data, settings, instanceId) {
      Drupal.wysiwyg.activeId = instanceId;
      Drupal.settings.wysiwygFields.activeId = instanceId;
      this.dialogShow(id);
    },

    /**
     * @TODO - wysiwygIsNode only fires when the 'node' object changes, so it
     *   will unselect the DIV on a second click of the element.
     */
    wysiwygIsNode: function(id, node) {
      delete Drupal.settings.wysiwygFields.fields[id].active;

      // Get TextNode if node is empty.
      if (node == null) {
        if ($.isFunction(this.wysiwyg[Drupal.wysiwyg.instances[Drupal.settings.wysiwygFields.activeId].editor].wysiwygGetTextNode)) {
          node = this.wysiwyg[Drupal.wysiwyg.instances[Drupal.settings.wysiwygFields.activeId].editor].wysiwygGetTextNode();
        }
      }

      node = ($(node).parents(this.wrapperElement + '.wysiwyg_fields-' + id).length == 1) ? $(node).parents(this.wrapperElement + '.wysiwyg_fields-' + id).get(0) : node;
      if ($(node).is(this.wrapperElement + '.wysiwyg_fields-' + id)) {
        // Select Wysiwyg Fields wrapper.
        // Invoke appropriate function based on active Wysiwyg editor.
        if ($.isFunction(this.wysiwyg[Drupal.wysiwyg.instances[Drupal.settings.wysiwygFields.activeId].editor].wysiwygIsNode)) {
          this.wysiwyg[Drupal.wysiwyg.instances[Drupal.settings.wysiwygFields.activeId].editor].wysiwygIsNode(node);
        }

        // Store active token in settings.
        Drupal.settings.wysiwygFields.fields[id].active = $(node).attr('id');
      }

      return $(node).parents(this.wrapperElement + '.wysiwyg_fields-' + id).length == 1 || $(node).is(this.wrapperElement + '.wysiwyg_fields-' + id);
    },

    /**
     * Convert tokens to the appropriate rendered preview.
     */
    wysiwygAttach: function(id, content, settings, instanceId) {
      var regex = new RegExp('(\\[wysiwyg_fields-' + id + '-([\\d_])+-(.*?)\\])', 'g');
      if ((matches = content.match(regex))) {
        $.each($(matches), function(i, elem) {
          elemId = elem.substr(1, elem.length - 2);
          wrapperElement = Drupal.wysiwygFields.wrapperElement;
          replacement = '<' + wrapperElement + ' id="' + elemId + '" class="wysiwyg_fields wysiwyg_fields-placeholder wysiwyg_fields-' + id + '">&nbsp;</' + wrapperElement + '>';
          content = content.replace(elem, replacement);
        });
      }
      this._wysiwygAttach();
      return content;
    },

    /**
     *
     */
    _wysiwygAttach: function() {
      if (typeof Drupal.settings.wysiwygFields.timer == 'undefined') {
        Drupal.settings.wysiwygFields.timer = setTimeout(
          function() {
            // Invoke appropriate function based on active Wysiwyg editor.
            if ($.isFunction(Drupal.wysiwygFields.wysiwyg[Drupal.wysiwyg.instances[Drupal.settings.wysiwygFields.activeId].editor].divToWysiwygField)) {
              Drupal.wysiwygFields.wysiwyg[Drupal.wysiwyg.instances[Drupal.settings.wysiwygFields.activeId].editor].divToWysiwygField();
            }
          },
          100
        );
      }
    },

    /**
     * Convert rendered previews to the appropriate token.
     */
    wysiwygDetach: function(id, content, settings, instanceId) {
      if (content.indexOf('wysiwyg_fields-placeholder') == -1) {
        wrapperElement = this.wrapperElement;
        var regex = new RegExp('<' + wrapperElement + '.*?wysiwyg_fields-' + id + '.*?>[\\n\\s\\S]*?</' + wrapperElement + '>', 'g');
        if ((matches = content.match(regex))) {
          $.each($(matches), function(i, elem) {
            var regex = new RegExp('<' + wrapperElement + '.*?>([\\n\\s\\S]*?)</' + wrapperElement + '>');
            var item = elem.match(regex);
            var token = '[' + $(elem).attr('id') + ']';

            // Store replacement in Drupal.settings for wysiwygAttach.
            Drupal.settings.wysiwygFields.replacements = Drupal.settings.wysiwygFields.replacements || {};
            Drupal.settings.wysiwygFields.replacements[token] = item[1];

            content = content.replace(elem, token);
          });
        }
      }
      return content;
    },

    /**
     *
     */
    dialogShow: function(id, op) {
      Drupal.settings.wysiwygFields.activeId = Drupal.wysiwyg.activeId;

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
      this.dialogClose(id);

      // Get field delta.
      delta = 0;
      if (Drupal.settings.wysiwygFields.fields[id].delta !== null) {
        delta = Drupal.settings.wysiwygFields.fields[id].delta;
      }

      if (Drupal.settings.wysiwygFields.fields[id].multiple > 0) {
        $('#' + id.replace('_', '-', 'g') + '-items, #wysiwyg_fields-' + id + '-wrapper table').hide();
        if ($('#edit-' + id.replace('_', '-', 'g') + '-' + delta + '-wysiwyg-fields-ahah-wrapper').parents('table#' + id + '_values').length == 1) {
          $('#edit-' + id.replace('_', '-', 'g') + '-' + delta + '-wysiwyg-fields-ahah-wrapper')
            .before('<div id="edit-' + id.replace('_', '-', 'g') + '-' + delta + '-wysiwyg-fields-ahah-wrapper-placeholder" class="placeholder" />')
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
      this.dialogClose(id);

      if (Drupal.settings.wysiwygFields.fields[id].multiple > 0) {
        token = Drupal.settings.wysiwygFields.fields[id].active.split('-');
        deltas = token[2].split('_');

        if (deltas.length == 1) {
          $('#' + id.replace('_', '-', 'g') + '-items, #wysiwyg_fields-' + id + '-wrapper table').hide();
          if ($('#edit-' + id.replace('_', '-', 'g') + '-' + token[2] + '-wysiwyg-fields-ahah-wrapper').parents('table#' + id + '_values').length == 1) {
            $('#edit-' + id.replace('_', '-', 'g') + '-' + token[2] + '-wysiwyg-fields-ahah-wrapper')
              .before('<div id="edit-' + id.replace('_', '-', 'g') + '-' + token[2] + '-wysiwyg-fields-ahah-wrapper-placeholder" class="placeholder" />')
              .prependTo('#wysiwyg_fields-' + id + '-wrapper');
          }
        }

        else {
          this.dialogShowAll(id);
          $.each(deltas, function(delta) {
            $('#edit-' + id.replace('_', '-', 'g') + '-' + delta + '-wysiwyg-fields-select').attr('checked', 'checked');
          });
        }
      }

      if ($('.wysiwyg_fields-' + id + '-field:first .wysiwyg_fields-widget').length == 1) {
        this.buttonsAttach(id, Drupal.t('Update'));
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
        $('#wysiwyg_fields-' + id + '-wrapper table, #' + id.replace('_', '-', 'g') + '-items').show();
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
      var parent = $('#' + Drupal.settings.wysiwygFields.activeId).parents('.form-item:first');
      if ($('#wysiwyg_fields-' + id + '-dialog').parent() !== parent) {
        $('#wysiwyg_fields-' + id + '-dialog').prependTo(parent);
        $('.ui-widget-overlay, .ui-dialog-overlay').prependTo(parent).css('position', 'fixed');
        parent.css({ position: 'relative' });
        $('#wysiwyg_fields-' + id + '-dialog').css({ left: '10%', top: '20%' });
        $('#wysiwyg_fields-' + id + '-wrapper').css({ height: 'auto', padding: 0, width: '100%' });
      }
    },

    /**
     *
     */
    buttonsAttach: function(id, label) {
      if ($('.wysiwyg_fields-' + id + '-field:first .wysiwyg_fields-widget select').length == 1 && $('#wysiwyg_fields-' + id + '-dialog .ui-dialog-buttonpane select').length == 0) {
        button = $('#wysiwyg_fields-' + id + '-dialog .ui-dialog-buttonpane button');
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
        $('#wysiwyg_fields-' + id + '-dialog .ui-dialog-buttonpane button').html(label);
      }
      $('#wysiwyg_fields-' + id + '-dialog .ui-dialog-buttonpane').show();
    }
  }

  /**
   *
   */
  Drupal.behaviors.wysiwygFields = function(context) {
    if (context !== document) {
      $.each(Drupal.settings.wysiwygFields.fields, function(id) {
        if ($('#wysiwyg_fields-' + id + '-dialog').css('display') == 'block') {
          Drupal.wysiwygFields.buttonsAttach(id);
          if ($('#wysiwyg_fields-' + id + '-dialog .wysiwyg_fields-icon-expand .ui-icon').hasClass('ui-icon-minusthick')) {
            Drupal.wysiwygFields.dialogClose(id);
            Drupal.wysiwygFields.dialogShow(id, 'All');
          }
        }
      });
    }
  }
})(jQuery);
