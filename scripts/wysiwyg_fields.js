(function ($) {
  Drupal.settings.wysiwygFields = Drupal.settings.wysiwygFields || {};

  Drupal.wysiwygFields = {
    /**
     * Initialize Wysiwyg Fields plugin.
     */
    init: function(field_name) {
      Drupal.settings.wysiwygFields.activeId = Drupal.wysiwyg.activeId;

      // Invoke Wysiwyg specific initialization script.
      if ($.isFunction(this.wysiwyg[Drupal.wysiwyg.instances[Drupal.settings.wysiwygFields.activeId].editor].init)) {
        this.wysiwyg[Drupal.wysiwyg.instances[Drupal.settings.wysiwygFields.activeId].editor].init(field_name);
      }

      // Make sure that the initialization script is only triggered once.
      if (typeof Drupal.settings.wysiwygFields.fields[field_name].init == "undefined") {
        Drupal.settings.wysiwygFields.fields[field_name].init = true;

        // Create jQuery UI dialog.
        $('#wysiwyg_fields-' + field_name + '-wrapper').dialog({
          autoOpen: false,
          buttons: {
            'Insert': function() {
              field = Drupal.settings.wysiwygFields.fields[field_name];
              delta = typeof field.active == 'undefined'
                ? field.delta
                : field.active.wf_deltas;
              delta = delta.toString().split(',')[0];
              $('#wysiwyg_fields-' + field_name + '-dialog .wysiwyg_fields-widget-' + field_name + '-' + delta + ' input.form-submit').trigger('mousedown');
            },
            // @TODO - Implement remove button here.
            //'Remove' : function() {}
          },
          draggable: false,
          height: 'auto',
          modal: true,
          resizable: false,
          title: Drupal.settings.wysiwyg.plugins[Drupal.wysiwyg.instances[Drupal.settings.wysiwygFields.activeId].format].drupal['wysiwyg_fields_' + field_name].title,
          width: '80%',
          zIndex: 999999
        });

        // Bind dialog close function to dialogclose event.
        $('#wysiwyg_fields-' + field_name + '-wrapper').bind('dialogclose', function(event, ui) {
          Drupal.wysiwygFields.dialogClose(field_name);
        });

        // Set ID and class for dialog parent.
        $('#wysiwyg_fields-' + field_name + '-wrapper')
          .parents('.ui-dialog')
          .attr('id', 'wysiwyg_fields-' + field_name + '-dialog')
          .addClass('wysiwyg_fields-dialog');

        // Hide dialog button pane.
        $('#wysiwyg_fields-' + field_name + '-dialog .ui-dialog-buttonpane').hide();

        // Move Dialog inside of Entity form.
        $('#wysiwyg_fields-' + field_name + '-dialog').appendTo($('#' + Drupal.settings.wysiwygFields.activeId).parents('form').first());

        // Setup expand/collapse icon.
        $('#wysiwyg_fields-' + field_name + '-dialog')
          .addClass('wysiwyg_fields-dialog-collapsed')
          .find('.ui-dialog-titlebar')
            .prepend('<a class="ui-corner-all wysiwyg_fields-icon-expand" href="#" role="button" unselectable="on"><span class="ui-icon ui-icon-plusthick ui-plus-default" unselectable="on">' + Drupal.t('Expand') + '</span></a>')
            .end()
          .find(' .ui-dialog-titlebar .wysiwyg_fields-icon-expand')
            .hover(
              function() {
                $(this).addClass('ui-state-hover');
              },
              function() {
                $(this).removeClass('ui-state-hover');
              }
            )
            .bind('click', function() {
              Drupal.wysiwygFields.dialogShow(field_name, 'All');
              return false;
            });
      }
    },

    /**
     * Convert tokens to the appropriate rendered preview.
     */
    wysiwygAttach: function(field_name, content, settings, instanceId) {
      var regex = new RegExp('\\[wysiwyg_field(?=[^>]*wf_field=["\']' + field_name + '["\']).*?\\]', 'g');
      if ((matches = content.match(regex))) {
        $.each($(matches), function(i, elem) {
          var regex = new RegExp('\\[wysiwyg_field(.*?)\\]');
          var attributes = elem.match(regex);

          replacement = '<wysiwyg_field' + attributes[1] + ' class="wysiwyg_fields-placeholder">&nbsp;</wysiwyg_field>';
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
            if ($.isFunction(Drupal.wysiwygFields.wysiwyg[Drupal.wysiwyg.instances[Drupal.settings.wysiwygFields.activeId].editor].wysiwygAttach)) {
              Drupal.wysiwygFields.wysiwyg[Drupal.wysiwyg.instances[Drupal.settings.wysiwygFields.activeId].editor].wysiwygAttach();
            }
          },
          100
        );
      }
    },

    /**
     * Convert rendered previews to the appropriate token.
     */
    wysiwygDetach: function(field_name, content, settings, instanceId) {
      if (content.indexOf('wysiwyg_fields-placeholder') == -1) {
        var regex = new RegExp('<wysiwyg_field(?=[^>]*wf_field=["\']' + field_name + '["\']).*?>[\\n\\s\\S]*?</wysiwyg_field>', 'g');
        if ((matches = content.match(regex))) {
          $.each($(matches), function(i, elem) {
            var regex = new RegExp('<wysiwyg_field(.*?)>([\\n\\s\\S]*?)</wysiwyg_field>');
            var item = elem.match(regex);
            var token = '[wysiwyg_field' + item[1] + ']';

            var regex = new RegExp(/([\w\-]*?)=["\'](.*?)["\']/g);
            var attributes = item[1].match(regex);
            attributes.sort();
            token_data = {};
            $.each(attributes, function (index, attr) {
              var regex = new RegExp(/([\w\-]*?)=["\'](.*?)["\']/);
              attr = attr.match(regex);
              token_data[attr[1]] = attr[2];
            });

            // Store replacement in Drupal.settings for wysiwygAttach.
            Drupal.settings.wysiwygFields.fields[field_name].replacements = Drupal.settings.wysiwygFields.fields[field_name].replacements || {};
            Drupal.settings.wysiwygFields.fields[field_name].replacements[JSON.stringify(token_data)] = '<wysiwyg_field' + item[1] + '>' + item[2] + '</wysiwyg_field>';

            content = content.replace(elem, token);
          });
        }
      }
      return content;
    },

    /**
     * Show the appropriate dialog window.
     */
    dialogShow: function(field_name, op) {
      Drupal.settings.wysiwygFields.activeId = Drupal.wysiwyg.activeId;

      // If there is an active field, render update dialog.
      if (op == undefined && typeof Drupal.settings.wysiwygFields.fields[field_name].active !== "undefined") {
        op = 'Update';
      }

      // If no operation is defined, use default.
      else if (op == undefined) {
        op = 'Default';
      }

      // Open Wysiwyg Field dialog.
      $('#wysiwyg_fields-' + field_name + '-wrapper')
        .dialog('open')
        .focus();

      // Invoke appropriate function based on 'op'.
      if ($.isFunction(this['dialogShow' + op])) {
        this['dialogShow' + op](field_name);
      }
    },

    /**
     * Show the 'default' dialog window.
     */
    dialogShowDefault: function(field_name) {
      this.dialogClose(field_name);

      // Get field delta.
      delta = 0;
      if (Drupal.settings.wysiwygFields.fields[field_name].delta !== null) {
        delta = Drupal.settings.wysiwygFields.fields[field_name].delta;
      }

      if (Drupal.settings.wysiwygFields.fields[field_name].cardinality == -1 || Drupal.settings.wysiwygFields.fields[field_name].cardinality > 0) {
        field_name_dash = field_name.replace(/_/g, '-');
        field_id = 'wysiwyg_fields-' + field_name + '-' + delta;

        // $('#' + field_name_dash + '-items, #wysiwyg_fields-' + field_name + '-wrapper table').hide();
        // if ($('#edit-' + field_name_dash + '-' + delta + '-wysiwyg-fields-ahah-wrapper').parents('table#' + field_name + '_values').length == 1) {
        if ($('table[id^="edit-' + field_name_dash + '"], table[id^="' + field_name_dash + '-values"]').length == 1) {
          target = $('*[class*="form-item-' + field_name_dash + '-und-' + delta + '"]:first');
          if (!target.is('.form-type-managed-file')) {
            target
              .parents('tr:first, table:first')
              .siblings()
              .addClass('wysiwyg_fields-temporary_hide');
            target = target.parents('td:first');
          }
          target
            .siblings()
            .addClass('wysiwyg_fields-temporary_hide');
        }
      }

      if ($('#wysiwyg_fields-' + field_name + '-dialog .wysiwyg_fields-widget-' + field_name + '-' + delta).length == 1) {
        this.buttonsAttach(field_name);
      }
    },

    /**
     * Show the 'update' dialog window.
     */
    dialogShowUpdate: function(field_name) {
      this.dialogClose(field_name);
      active = Drupal.settings.wysiwygFields.fields[field_name].active;
      deltas = Drupal.settings.wysiwygFields.fields[field_name].active.wf_deltas.toString().split(',');

      // Modify the dialog DOM structure when the field allows for more than one
      // value.
      if (Drupal.settings.wysiwygFields.fields[field_name].cardinality == -1 || Drupal.settings.wysiwygFields.fields[field_name].cardinality > 0) {
        field_name_dash = field_name.replace(/_/g, '-');

        if (deltas.length == 1) {
          field_id = 'wysiwyg_fields-' + field_name + '-' + deltas[0];

          if ($('table[id^="edit-' + field_name_dash + '"], table[id^="' + field_name_dash + '-values"]').length == 1) {
            // Hide DOM elements.
            $('table[id^="edit-' + field_name_dash + '"], .' + field_id)
              .siblings()
              .addClass('wysiwyg_fields-temporary_hide');
            $('table[id^="edit-' + field_name_dash + '"] thead, table[id^="edit-' + field_name_dash + '"] .tabledrag-handle')
              .addClass('wysiwyg_fields-temporary_hide');

            // @TODO - This is a temporary workaround until I figure out a sane
            //         way to deal with 'Remove' button clicks.
            $('table[id^="edit-' + field_name_dash + '"] tr > :last-child')
              .hide();

            if ($('.' + field_id).parents('.field-multiple-table').length > 0) {
              $('.' + field_id).closest('tr')
                .siblings()
                .addClass('wysiwyg_fields-temporary_hide');
            }
          }

          // Attach buttons.
          if ($('#wysiwyg_fields-' + field_name + '-dialog .wysiwyg_fields-widget-' + field_name + '-' + deltas[0]).length == 1) {
            this.buttonsAttach(field_name);
          }
        }

        else {
          this.dialogShowAll(field_name);
          $('#wysiwyg_fields-' + field_name + '-dialog .ui-dialog-titlebar .wysiwyg_fields-icon-expand')
            .addClass('wysiwyg_fields-temporary_hide');

          $.each(deltas, function(delta) {
            $('input[id^="edit-' + field_name_dash + '"][id$="' + delta + '-wysiwyg-fields-select"]').attr('checked', 'checked');
          });
        }
      }

      // Set formatter based on previous choice.
      if (typeof active.wf_formatter !== 'undefined') {
        dialog = '#wysiwyg_fields-' + field_name + '-dialog';
        $(dialog + ' .wysiwyg_fields_formatters').val(active.wf_formatter);
        $(dialog + ' .wysiwyg_fields_formatters').trigger('change');
      }
    },

    /**
     * Show the 'all' dialog window.
     */
    dialogShowAll: function(field_name) {
      // Expand all the available items.
      if ($('#wysiwyg_fields-' + field_name + '-dialog .ui-dialog-titlebar .wysiwyg_fields-icon-expand .ui-icon').html() == Drupal.t('Expand')) {
        this.dialogClose(field_name);
        this.buttonsAttach(field_name);

        $('#wysiwyg_fields-' + field_name + '-dialog')
          .removeClass('wysiwyg_fields-dialog-collapsed')
          .addClass('wysiwyg_fields-dialog-expanded')

        // Reposition Multiselect checkboxes.
        if (Drupal.settings.wysiwygFields.fields[field_name].cardinality == -1 || Drupal.settings.wysiwygFields.fields[field_name].cardinality > 0) {
          $('#wysiwyg_fields-' + field_name + '-dialog .wysiwyg_fields_select').each(function() {
            $(this)
              .before('<div id="' + $(this).attr('id') + '-placeholder" class="wysiwyg_fields-placeholder" />')
              .appendTo($(this).parents('tr:first').find('td:first'));
          });
        }

        // Set icon to 'Contract' mode.
        $('#wysiwyg_fields-' + field_name + '-dialog .ui-dialog-titlebar .wysiwyg_fields-icon-expand .ui-icon')
          .html(Drupal.t('Contract'))
          .removeClass('ui-icon-plusthick')
          .addClass('ui-icon-minusthick');
      }

      // Collapse all the available items.
      else {
        this.dialogClose(field_name);
        this.dialogShow(field_name);
      }
    },

    /**
     * Close and reset the dialog window.
     */
    dialogClose: function(field_name) {
      // $('#' + Drupal.settings.wysiwygFields.activeId + '-' + field_name).remove();

      // if (Drupal.settings.wysiwygFields.fields[field_name].cardinality == -1 || Drupal.settings.wysiwygFields.fields[field_name].cardinality > 0) {
      //   $('#wysiwyg_fields-' + field_name + '-wrapper table, #' + field_name.replace(/_/g, '-') + '-items').show();
      // }

      // Remove 'expanded' class from dialog to alter the display.
      $('#wysiwyg_fields-' + field_name + '-dialog')
        .removeClass('wysiwyg_fields-dialog-expanded')
        .addClass('wysiwyg_fields-dialog-collapsed');

      // Undo DOM modificatons.
      $('.wysiwyg_fields-temporary_hide')
        .removeClass('wysiwyg_fields-temporary_hide');
      $('.wysiwyg_fields-placeholder').each(function() {
        $(this)
          .replaceWith($('#' + $(this).attr('id').substr(0, $(this).attr('id').length - 12)));
      });

      // Reset button pane.
      $('#wysiwyg_fields-' + field_name + '-dialog .ui-dialog-buttonpane')
        .hide()
        .find('button')
        .html(Drupal.t('Insert'));

      // Reset expand icon.
      $('#wysiwyg_fields-' + field_name + '-dialog .ui-dialog-titlebar .wysiwyg_fields-icon-expand .ui-icon')
        .html(Drupal.t('Expand'))
        .addClass('ui-icon-plusthick')
        .removeClass('ui-icon-minusthick');
    },

    /**
     * Attach buttons / formatters pane to dialog.
     */
    buttonsAttach: function(field_name) {
      field = Drupal.settings.wysiwygFields.fields[field_name];

      if ($('#wysiwyg_fields-' + field_name + '-dialog .ui-dialog-buttonpane select').length == 0) {
        // Get Delta.
        delta = typeof field.active == 'undefined'
          ? field.delta
          : field.active.wf_deltas;
        delta = delta.toString().split(',')[0];

        // Formatter selection and settings widget.
        $('#wysiwyg_fields-' + field_name + '-dialog .wysiwyg_fields-widget-' + field_name + '-' + delta + ' > .form-wrapper')
          .before('<div id="' + $('#wysiwyg_fields-' + field_name + '-dialog .wysiwyg_fields-widget-' + field_name + '-' + delta + ' > .form-wrapper').attr('id') + '-placeholder" class="wysiwyg_fields-placeholder" />')
          .appendTo('#wysiwyg_fields-' + field_name + '-dialog .ui-dialog-buttonpane');
      }

      // Set button label for Update.
      if (typeof Drupal.settings.wysiwygFields.fields[field_name].active !== "undefined") {
        $('#wysiwyg_fields-' + field_name + '-dialog .ui-dialog-buttonpane button').html(Drupal.t('Update'));
      }

      // Show button pane.
      $('#wysiwyg_fields-' + field_name + '-dialog .ui-dialog-buttonpane').show();
    },

    /**
     *
     */
    insert: function(field_name, content, delta) {
      $('#wysiwyg_fields-' + field_name + '-wrapper').dialog('close');
      Drupal.wysiwygFields.dialogClose(field_name);

      // Invoke custom insert callback if available.
      if ($.isFunction(this.wysiwyg[Drupal.wysiwyg.instances[Drupal.settings.wysiwygFields.activeId].editor].insert)) {
        this.wysiwyg[Drupal.wysiwyg.instances[Drupal.settings.wysiwygFields.activeId].editor].insert(Drupal.settings.wysiwygFields.activeId, content);
      }
      else {
        Drupal.wysiwyg.instances[Drupal.settings.wysiwygFields.activeId].insert(content);
      }

      Drupal.settings.wysiwygFields.fields[field_name].delta = delta;
      if (typeof Drupal.settings.wysiwygFields.fields[field_name].active == 'undefined' || Drupal.settings.wysiwygFields.fields[field_name].active.wf_deltas !== delta - 1) {
        $('.form-submit[name="' + field_name + '_add_more"]').trigger('mousedown');
      }
    },

    /**
     *
     */
    getTokenData: function(token) {
      var keys = new Array();
      var attributes = {};
      $.each(token.attributes, function(index, attr) {
        keys.push(attr.name);
        attributes[attr.name] = attr.value;
      });
      var token_data = {};
      $.each(keys.sort(), function(index, attr) {
        token_data[attr] = attributes[attr];
      });
      delete token_data['class'];
      delete token_data['wf_cache'];
      delete token_data['wf_nid'];

      return token_data;
    }
  }

  /**
   * Drupal behaviours.
   */
  Drupal.behaviors.wysiwygFields = {
    attach: function(context) {
      if (context !== document) {
        $.each(Drupal.settings.wysiwygFields.fields, function(field_name) {
          dialog = '#wysiwyg_fields-' + field_name + '-dialog';
          if ($(dialog).css('display') == 'block') {
            if (!$(dialog + ' .wysiwyg_fields-icon-expand .ui-icon').hasClass('ui-icon-minusthick')) {
              Drupal.wysiwygFields.dialogClose(field_name);

              // Insert
              if (typeof Drupal.settings.wysiwygFields.fields[field_name].active == 'undefined') {
                Drupal.settings.wysiwygFields.fields[field_name].active = {
                  wf_deltas: Drupal.settings.wysiwygFields.fields[field_name].delta
                }
                Drupal.wysiwygFields.dialogShow(field_name, 'Update');
                delete Drupal.settings.wysiwygFields.fields[field_name].active;
              }

              // Update
              else {
                Drupal.wysiwygFields.dialogShow(field_name, 'Update');
              }
            }

            else if (!$(dialog + ' .wysiwyg_fields-icon-expand').hasClass('wysiwyg_fields-temporary_hide')) {
              Drupal.wysiwygFields.dialogClose(field_name);
              Drupal.wysiwygFields.dialogShow(field_name, 'All');
            }

            // Set formatter settings based on previous choice.
            if (context.is('div[id$="formatter-settings-wrapper"]')) {
              $.each(Drupal.settings.wysiwygFields.fields[field_name].active, function(key, value) {
                key = key.split('-');
                if (key[0] == 'wf_settings') {
                  $(dialog + ' .ui-dialog-buttonpane [name$="[' + key[1] + ']"]').val(value);
                }
              });
            }
          }
        });
      }
    },

    detach: function(context) {
      if (typeof context.is != 'undefined' && context.is('form')) {
        $.each(Drupal.settings.wysiwygFields.fields, function(field_name) {
          dialog = '#wysiwyg_fields-' + field_name + '-dialog';
          if ($(dialog).css('display') == 'block' && typeof Drupal.settings.wysiwygFields.fields[field_name].active !== 'undefined') {
            // Remove active field(s) formatter so that it doesn't override
            // users choice.
            delete Drupal.settings.wysiwygFields.fields[field_name].active.wf_formatter;
          }
        });
      }
    }
  }
})(jQuery);
