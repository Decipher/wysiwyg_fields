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
        this.wysiwyg[Drupal.wysiwyg.instances[Drupal.settings.wysiwygFields.activeId].editor].init(id);
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
          width: '80%',
          zIndex: 999999
        });
        $('#wysiwyg_fields-' + id + '-wrapper').bind('dialogclose', function(event, ui) {
          Drupal.wysiwygFields.dialogClose(id);
        });
        $('#wysiwyg_fields-' + id + '-wrapper').parents('.ui-dialog')
          .attr('id', 'wysiwyg_fields-' + id + '-dialog')
          .addClass('wysiwyg_fields-dialog');
        $('#wysiwyg_fields-' + id + '-dialog .ui-dialog-buttonpane').hide();

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

      node = ($(node).parents(this.wrapperElement + '[wf_field="' + id + '"]').length == 1) ? $(node).parents(this.wrapperElement + '[wf_field="' + id + '"]').get(0) : node;
      if ($(node).is(this.wrapperElement + '[wf_field="' + id + '"]')) {
        // Select Wysiwyg Fields wrapper.
        // Invoke appropriate function based on active Wysiwyg editor.
        if ($.isFunction(this.wysiwyg[Drupal.wysiwyg.instances[Drupal.settings.wysiwygFields.activeId].editor].wysiwygIsNode)) {
          this.wysiwyg[Drupal.wysiwyg.instances[Drupal.settings.wysiwygFields.activeId].editor].wysiwygIsNode(node);
        }

        // Store active token in settings.
        Drupal.settings.wysiwygFields.fields[id].active = {
          'wf_deltas': $(node).attr('wf_deltas'),
          'wf_formatter': $(node).attr('wf_formatter')
        }
      }

      return $(node).parents(this.wrapperElement + '[wf_field="' + id + '"]').length == 1 || $(node).is(this.wrapperElement + '[wf_field="' + id + '"]');
    },

    /**
     * Convert tokens to the appropriate rendered preview.
     */
    wysiwygAttach: function(id, content, settings, instanceId) {
      wrapperElement = Drupal.wysiwygFields.wrapperElement;

      var regex = new RegExp('\\[wysiwyg_field(?=[^>]*wf_field=["\']' + id + '["\']).*?\\]', 'g');
      if ((matches = content.match(regex))) {
        $.each($(matches), function(i, elem) {
          var regex = new RegExp('\\[wysiwyg_field(.*?)\\]');
          var attributes = elem.match(regex);

          replacement = '<' + wrapperElement + attributes[1] + '><' + wrapperElement + ' class="wysiwyg_fields-placeholder">&nbsp;</' + wrapperElement + '></' + wrapperElement + '>';
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
        var regex = new RegExp('<' + wrapperElement + '(?=[^>]*wf_field=["\']' + id + '["\']).*?>[\\n\\s\\S]*?</' + wrapperElement + '>', 'g');
        if ((matches = content.match(regex))) {
          $.each($(matches), function(i, elem) {
            var regex = new RegExp('<' + wrapperElement + '(.*?)>([\\n\\s\\S]*?)</' + wrapperElement + '>');
            var item = elem.match(regex);
            var token = '[wysiwyg_field' + item[1] + ']';

            // Store replacement in Drupal.settings for wysiwygAttach.
            Drupal.settings.wysiwygFields.fields[id].replacements = Drupal.settings.wysiwygFields.fields[id].replacements || {};
            Drupal.settings.wysiwygFields.fields[id].replacements[$(elem).attr('wf_deltas')] = Drupal.settings.wysiwygFields.fields[id].replacements[$(elem).attr('wf_deltas')] || {};
            Drupal.settings.wysiwygFields.fields[id].replacements[$(elem).attr('wf_deltas')][$(elem).attr('wf_formatter')] = '<' + wrapperElement + item[1] + '>' + item[2] + '</' + wrapperElement + '>';

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

      // Invoke appropriate function based on 'op'.
      if ($.isFunction(this['dialogShow' + op])) {
        this['dialogShow' + op](id);
      }

      if ($('#wysiwyg_fields-' + id + '-dialog').parents('form').length == 0) {
        var form = $('#' + Drupal.settings.wysiwygFields.activeId).parents('form:first-item').clone();
        form.attr('id', form.attr('id') + '-' + id)
          .addClass('wysiwyg_fields-form')
          .prepend($('#wysiwyg_fields-' + id + '-dialog'));
        $('body').append(form);
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
            .before('<div id="edit-' + id.replace('_', '-', 'g') + '-' + delta + '-wysiwyg-fields-ahah-wrapper-placeholder" class="wysiwyg_fields-placeholder" />')
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
        deltas = Drupal.settings.wysiwygFields.fields[id].active.wf_deltas.split(',');

        if (deltas.length == 1) {
          $('#' + id.replace('_', '-', 'g') + '-items, #wysiwyg_fields-' + id + '-wrapper table').hide();
          if ($('#edit-' + id.replace('_', '-', 'g') + '-' + Drupal.settings.wysiwygFields.fields[id].active.wf_deltas + '-wysiwyg-fields-ahah-wrapper').parents('table#' + id + '_values').length == 1) {
            $('#edit-' + id.replace('_', '-', 'g') + '-' + Drupal.settings.wysiwygFields.fields[id].active.wf_deltas + '-wysiwyg-fields-ahah-wrapper')
              .before('<div id="edit-' + id.replace('_', '-', 'g') + '-' + Drupal.settings.wysiwygFields.fields[id].active.wf_deltas + '-wysiwyg-fields-ahah-wrapper-placeholder" class="wysiwyg_fields-placeholder" />')
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
              .before('<div id="' + $(this).attr('id') + '-placeholder" class="wysiwyg_fields-placeholder" />')
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
      $('#wysiwyg_fields-' + id + '-dialog').appendTo($('#' + Drupal.settings.wysiwygFields.activeId).parents('form').get(0));
      $('#' + Drupal.settings.wysiwygFields.activeId + '-' + id).remove();

      if (Drupal.settings.wysiwygFields.fields[id].multiple > 0) {
        $('#wysiwyg_fields-' + id + '-wrapper table, #' + id.replace('_', '-', 'g') + '-items').show();
      }

      // Undo DOM modificatons.
      $('.wysiwyg_fields-placeholder').each(function() {
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
          .before('<div id="' + $('.wysiwyg_fields-' + id + '-field:first .wysiwyg_fields-widget select').attr('id') + '-placeholder" class="wysiwyg_fields-placeholder" />')
          .appendTo('#wysiwyg_fields-' + id + '-dialog .ui-dialog-buttonpane'); // @TODO - Append or Prepend based on jQuery 1.6/1.7
      }
      if (label !== undefined) {
        $('#wysiwyg_fields-' + id + '-dialog select.wysiwyg_fields_formatters').val(Drupal.settings.wysiwygFields.fields[id].active.wf_formatter);
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
