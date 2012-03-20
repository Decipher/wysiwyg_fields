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
              delta = typeof Drupal.settings.wysiwygFields.fields[field_name].active == 'undefined'
                ? Drupal.settings.wysiwygFields.fields[field_name].delta
                : Drupal.settings.wysiwygFields.fields[field_name].active.wf_deltas;
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
        $('#wysiwyg_fields-' + field_name + '-wrapper').parents('.ui-dialog')
          .attr('id', 'wysiwyg_fields-' + field_name + '-dialog')
          .addClass('wysiwyg_fields-dialog');

        // Hide dialog button pane.
        $('#wysiwyg_fields-' + field_name + '-dialog .ui-dialog-buttonpane').hide();

        // Move Dialog inside of Entity form.
        $('#wysiwyg_fields-' + field_name + '-dialog').appendTo($('#' + Drupal.settings.wysiwygFields.activeId).parents('form').first());

        // @TODO - Reimplement this functionality.
        // Setup expand/collapse icon.
        $('#wysiwyg_fields-' + field_name + '-dialog').addClass('wysiwyg_fields-dialog-collapsed');
        // $('#wysiwyg_fields-' + field_name + '-dialog .ui-dialog-titlebar').prepend('<a class="ui-corner-all wysiwyg_fields-icon-expand" href="#" role="button" unselectable="on"><span class="ui-icon ui-icon-plusthick ui-plus-default" unselectable="on">' + Drupal.t('Expand') + '</span></a>');
        // $('#wysiwyg_fields-' + field_name + '-dialog .ui-dialog-titlebar .wysiwyg_fields-icon-expand')
        //   .hover(
        //     function() {
        //       $(this).addClass('ui-state-hover');
        //     },
        //     function() {
        //       $(this).removeClass('ui-state-hover');
        //     }
        //   )
        //   .bind('click', function() {
        //     Drupal.wysiwygFields.dialogShow(field_name, 'All');
        //     return false;
        //   });
      }
    },

    /**
     *
     */
    wysiwygInvoke: function(field_name, data, settings, instanceId) {
      Drupal.wysiwyg.activeId = instanceId;
      Drupal.settings.wysiwygFields.activeId = instanceId;
      this.dialogShow(field_name);
    },

    /**
     * @TODO - wysiwygIsNode only fires when the 'node' object changes, so it
     *   will unselect the DIV on a second click of the element.
     */
    wysiwygIsNode: function(field_name, node) {
      delete Drupal.settings.wysiwygFields.fields[field_name].active;

      // Get TextNode if node is empty.
      if (node == null) {
        if ($.isFunction(this.wysiwyg[Drupal.wysiwyg.instances[Drupal.settings.wysiwygFields.activeId].editor].wysiwygGetTextNode)) {
          node = this.wysiwyg[Drupal.wysiwyg.instances[Drupal.settings.wysiwygFields.activeId].editor].wysiwygGetTextNode();
        }
      }

      node = ($(node).parents('wysiwyg_field[wf_field="' + field_name + '"]').length == 1) ? $(node).parents('wysiwyg_field[wf_field="' + field_name + '"]').get(0) : node;
      if ($(node).is('wysiwyg_field[wf_field="' + field_name + '"]')) {
        // Select Wysiwyg Fields wrapper.
        // Invoke appropriate function based on active Wysiwyg editor.
        if ($.isFunction(this.wysiwyg[Drupal.wysiwyg.instances[Drupal.settings.wysiwygFields.activeId].editor].wysiwygIsNode)) {
          this.wysiwyg[Drupal.wysiwyg.instances[Drupal.settings.wysiwygFields.activeId].editor].wysiwygIsNode(node);
        }

        // Store active token in settings.
        Drupal.settings.wysiwygFields.fields[field_name].active = this.getTokenData(node);
      }

      return $(node).parents('wysiwyg_field[wf_field="' + field_name + '"]').length == 1 || $(node).is('wysiwyg_field[wf_field="' + field_name + '"]');
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
     *
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
      $('#wysiwyg_fields-' + field_name + '-wrapper').dialog('open').focus();

      // Invoke appropriate function based on 'op'.
      if ($.isFunction(this['dialogShow' + op])) {
        this['dialogShow' + op](field_name);
      }

      // @TODO - Not sure if this works or if it's even needed, check.
      //if ($('#wysiwyg_fields-' + field_name + '-dialog').parents('form').length == 0) {
      //  var form = $('#' + Drupal.settings.wysiwygFields.activeId).parents('form:first-item').clone();
      //  form.attr('id', form.attr('id') + '-' + field_name)
      //    .addClass('wysiwyg_fields-form')
      //    .prepend($('#wysiwyg_fields-' + field_name + '-dialog'));
      //  $('body').append(form);
      //}
    },

    /**
     *
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
          // $('#edit-' + field_name_dash + '-' + delta + '-wysiwyg-fields-ahah-wrapper')
          //   .before('<div id="edit-' + field_name.replace(/_/g, '-') + '-' + delta + '-wysiwyg-fields-ahah-wrapper-placeholder" class="wysiwyg_fields-placeholder" />')
          //   .prependTo('#wysiwyg_fields-' + field_name + '-wrapper');

          // @TODO - Class doesn't always end at the delta, fix this.
          $('.form-item-' + field_name_dash + '-und-' + delta).siblings().addClass('wysiwyg_fields-temporary_hide').hide();

          if ($('.' + field_id).parents('.field-multiple-table').length > 0) {
            $('.' + field_id).closest('tr').siblings().addClass('wysiwyg_fields-temporary_hide').hide();
          }
        }
      }

      if ($('#wysiwyg_fields-' + field_name + '-dialog .wysiwyg_fields-widget-' + field_name + '-' + delta).length == 1) {
        this.buttonsAttach(field_name);
      }
    },

    /**
     *
     */
    dialogShowUpdate: function(field_name) {
      this.dialogClose(field_name);

      if (Drupal.settings.wysiwygFields.fields[field_name].cardinality == -1 || Drupal.settings.wysiwygFields.fields[field_name].cardinality > 0) {
        // deltas = Drupal.settings.wysiwygFields.fields[field_name].active.wf_deltas.toString().split(',');

        // if (deltas.length == 1) {
          field_name_dash = field_name.replace(/_/g, '-');
          field_id = 'wysiwyg_fields-' + field_name + '-' + Drupal.settings.wysiwygFields.fields[field_name].active.wf_deltas;

          // if ($('.' + field_id).parents('table[id^="edit-' + field_name_dash + '"]').length == 1) {
          if ($('table[id^="edit-' + field_name_dash + '"], table[id^="' + field_name_dash + '-values"]').length == 1) {
            // Set ID if not present.
            // if ($('.' + field_id).attr('id') == '') {
            //   $('.' + field_id).attr('id', field_id);
            // }
            $('table[id^="edit-' + field_name_dash + '"], .' + field_id).siblings().addClass('wysiwyg_fields-temporary_hide').hide();
            $('table[id^="edit-' + field_name_dash + '"] thead, table[id^="edit-' + field_name_dash + '"] .tabledrag-handle').addClass('wysiwyg_fields-temporary_hide').hide();

            // @TODO - This is a temporary workaround until I figure out a sane
            //   way to deal with 'Remove' button clicks.
            $('table[id^="edit-' + field_name_dash + '"] tr > :last-child').hide();

            if ($('.' + field_id).parents('.field-multiple-table').length > 0) {
              $('.' + field_id).closest('tr').siblings().addClass('wysiwyg_fields-temporary_hide').hide();
            }
          }
        // }

        // else {
        //   this.dialogShowAll(field_name);
        //   $.each(deltas, function(delta) {
        //     $('#edit-' + field_name.replace(/_/g, '-') + '-' + delta + '-wysiwyg-fields-select').attr('checked', 'checked');
        //   });
        // }
      }

      // if ($('#wysiwyg_fields-' + field_name + '-dialog .wysiwyg_fields-widget-' + field_name + '-' + delta).length == 1) {
        this.buttonsAttach(field_name, Drupal.t('Update'));
      // }
    },

    /**
     * @TODO - Reimplement this functionality.
     */
    // dialogShowAll: function(field_name) {
    //   if ($('#wysiwyg_fields-' + field_name + '-dialog .ui-dialog-titlebar .wysiwyg_fields-icon-expand .ui-icon').html() == Drupal.t('Expand')) {
    //     this.dialogClose(field_name);
    //     this.buttonsAttach(field_name);

    //     // Reposition Multiselect checkboxes.
    //     // if (Drupal.settings.wysiwygFields.fields[field_name].cardinality == -1 || Drupal.settings.wysiwygFields.fields[field_name].cardinality > 0) {
    //     //   $('#wysiwyg_fields-' + field_name + '-dialog .wysiwyg_fields_select').each(function() {
    //     //     $(this)
    //     //       .before('<div id="' + $(this).attr('id') + '-placeholder" class="wysiwyg_fields-placeholder" />')
    //     //       .appendTo($(this).parents('tr:first').find('td:first'));
    //     //   });
    //     // }

    //     $('#wysiwyg_fields-' + field_name + '-dialog .ui-dialog-titlebar .wysiwyg_fields-icon-expand .ui-icon')
    //       .html(Drupal.t('Contract'))
    //       .removeClass('ui-icon-plusthick')
    //       .addClass('ui-icon-minusthick');
    //   }

    //   else {
    //     this.dialogClose(field_name);
    //     this.dialogShow(field_name);
    //   }
    // },

    /**
     *
     */
    dialogClose: function(field_name) {
      // $('#' + Drupal.settings.wysiwygFields.activeId + '-' + field_name).remove();

      // if (Drupal.settings.wysiwygFields.fields[field_name].cardinality == -1 || Drupal.settings.wysiwygFields.fields[field_name].cardinality > 0) {
      //   $('#wysiwyg_fields-' + field_name + '-wrapper table, #' + field_name.replace(/_/g, '-') + '-items').show();
      // }

      // Undo DOM modificatons.
      $('.wysiwyg_fields-temporary_hide').show().removeClass('wysiwyg_fields-temporary_hide');
      $('.wysiwyg_fields-placeholder').each(function() {
        $(this).replaceWith($('#' + $(this).attr('id').substr(0, $(this).attr('id').length - 12)));
      });

      // Reset button pane.
      $('#wysiwyg_fields-' + field_name + '-dialog .ui-dialog-buttonpane').hide();
      $('#wysiwyg_fields-' + field_name + '-dialog .ui-dialog-buttonpane button').html(Drupal.t('Insert'));

      // Reset expand icon.
      // $('#wysiwyg_fields-' + field_name + '-dialog .ui-dialog-titlebar .wysiwyg_fields-icon-expand .ui-icon')
      //   .html(Drupal.t('Expand'))
      //   .addClass('ui-icon-plusthick')
      //   .removeClass('ui-icon-minusthick');
    },

    /**
     *
     */
    buttonsAttach: function(field_name, label) {
      if ($('#wysiwyg_fields-' + field_name + '-dialog .ui-dialog-buttonpane select').length == 0) {
        delta = typeof Drupal.settings.wysiwygFields.fields[field_name].active == 'undefined'
          ? Drupal.settings.wysiwygFields.fields[field_name].delta
          : Drupal.settings.wysiwygFields.fields[field_name].active.wf_deltas;

        // Formatter selection and settings widget.
        $('#wysiwyg_fields-' + field_name + '-dialog .wysiwyg_fields-widget-' + field_name + '-' + delta + ' > .form-wrapper')
          .before('<div id="' + $('#wysiwyg_fields-' + field_name + '-dialog .wysiwyg_fields-widget-' + field_name + '-' + delta + ' > .form-wrapper').attr('id') + '-placeholder" class="wysiwyg_fields-placeholder" />')
          .appendTo('#wysiwyg_fields-' + field_name + '-dialog .ui-dialog-buttonpane');
      }
      if (typeof Drupal.settings.wysiwygFields.fields[field_name].active !== 'undefined' && typeof Drupal.settings.wysiwygFields.fields[field_name].active.wf_formatter !== 'undefined') {
        // $('#wysiwyg_fields-' + field_name + '-dialog .ui-dialog-buttonpane .wysiwyg_fields_formatters')
        //   .val(Drupal.settings.wysiwygFields.fields[field_name].active.wf_formatter)
        //   .trigger('change');
        $('#wysiwyg_fields-' + field_name + '-dialog .ui-dialog-buttonpane button').html(label);
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
   *
   */
  Drupal.behaviors.wysiwygFields = {
    attach: function(context) {
      if (context !== document) {
        $.each(Drupal.settings.wysiwygFields.fields, function(field_name) {
          if ($('#wysiwyg_fields-' + field_name + '-dialog').css('display') == 'block') {
              Drupal.wysiwygFields.dialogClose(field_name);
            //Drupal.wysiwygFields.buttonsAttach(field_name);
              //if (!$('#wysiwyg_fields-' + field_name + '-dialog .wysiwyg_fields-icon-expand .ui-icon').hasClass('ui-icon-minusthick')) {

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

                // Drupal.wysiwygFields.dialogFocus(field_name, )
              //}
              // else {
              //Drupal.wysiwygFields.dialogClose(field_name);
            //  Drupal.wysiwygFields.dialogShow(field_name, 'All');
            //}
          }
        });
      }
    }
  }
})(jQuery);
