(function ($) {
  Drupal.settings.wysiwygFields = Drupal.settings.wysiwygFields || {};

  Drupal.wysiwygFields = {
    wrapperElement: 'wysiwyg_field',
    wrapperElementDefault: 'wysiwyg_field',

    /**
     * Initialize Wysiwyg Fields plugin.
     */
    init: function(field_name) {
      Drupal.settings.wysiwygFields.activeId = Drupal.wysiwyg.activeId;

      // Invoke Wysiwyg specific initialization script.
      if ($.isFunction(this.wysiwyg[Drupal.wysiwyg.instances[Drupal.settings.wysiwygFields.activeId].editor].init)) {
        this.wysiwyg[Drupal.wysiwyg.instances[Drupal.settings.wysiwygFields.activeId].editor].init(field_name);
      }

      this.wrapperElement = (typeof this.wysiwyg[Drupal.wysiwyg.instances[Drupal.settings.wysiwygFields.activeId].editor].wrapperElement == 'undefined')
        ? this.wrapperElementDefault
        : this.wysiwyg[Drupal.wysiwyg.instances[Drupal.settings.wysiwygFields.activeId].editor].wrapperElement;

      if (typeof Drupal.settings.wysiwygFields.fields[field_name].init == "undefined") {
        Drupal.settings.wysiwygFields.fields[field_name].init = true;

        // Create jQuery UI dialog.
        $('#wysiwyg_fields-' + field_name + '-wrapper').dialog({
          autoOpen: false,
          buttons: {
            'Insert': function() {
              $('#wysiwyg_fields-' + field_name + '-dialog .wysiwyg_fields-widget input.form-submit:first').trigger('mousedown');
            },
            // @TODO - Implement remove button here.
            //'Remove' : function() {}
          },
          height: 'auto',
          modal: true,
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

        // Setup expand/collapse icon.
        $('#wysiwyg_fields-' + field_name + '-dialog .ui-dialog-titlebar').prepend('<a class="ui-corner-all wysiwyg_fields-icon-expand" href="#" role="button" unselectable="on"><span class="ui-icon ui-icon-plusthick ui-plus-default" unselectable="on">' + Drupal.t('Expand') + '</span></a>');
        $('#wysiwyg_fields-' + field_name + '-dialog .ui-dialog-titlebar .wysiwyg_fields-icon-expand')
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
        Drupal.settings.wysiwygFields.fields[id].active = {
          'wf_deltas': $(node).attr('wf_deltas'),
          'wf_formatter': $(node).attr('wf_formatter')
        }
      }

      return $(node).parents(this.wrapperElement + '.wysiwyg_fields-' + id).length == 1 || $(node).is(this.wrapperElement + '.wysiwyg_fields-' + id);
    },

    /**
     * Convert tokens to the appropriate rendered preview.
     */
    wysiwygAttach: function(id, content, settings, instanceId) {
      wrapperElement = Drupal.wysiwygFields.wrapperElement;

      var regex = new RegExp('(\\[wysiwyg_fields-' + id + '-([\\d_])+-(.*?)\\])', 'g');
      if ((matches = content.match(regex))) {
        $.each($(matches), function(i, elem) {
          elemId = elem.substr(1, elem.length - 2);
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

      // Invoke appropriate function based on 'op'.
      if ($.isFunction(this['dialogShow' + op])) {
        this['dialogShow' + op](id);
      }

      // @TODO - Not sure if this works or if it's even needed, check.
      //if ($('#wysiwyg_fields-' + id + '-dialog').parents('form').length == 0) {
      //  var form = $('#' + Drupal.settings.wysiwygFields.activeId).parents('form:first-item').clone();
      //  form.attr('id', form.attr('id') + '-' + id)
      //    .addClass('wysiwyg_fields-form')
      //    .prepend($('#wysiwyg_fields-' + id + '-dialog'));
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
        $('#' + field_name.replace('_', '-', 'g') + '-items, #wysiwyg_fields-' + field_name + '-wrapper table').hide();
        if ($('#edit-' + field_name.replace('_', '-', 'g') + '-' + delta + '-wysiwyg-fields-ahah-wrapper').parents('table#' + field_name + '_values').length == 1) {
          $('#edit-' + field_name.replace('_', '-', 'g') + '-' + delta + '-wysiwyg-fields-ahah-wrapper')
            .before('<div id="edit-' + field_name.replace('_', '-', 'g') + '-' + delta + '-wysiwyg-fields-ahah-wrapper-placeholder" class="wysiwyg_fields-placeholder" />')
            .prependTo('#wysiwyg_fields-' + field_name + '-wrapper');
        }
      }

      if ($('.wysiwyg_fields-' + field_name + '-field:first .wysiwyg_fields-widget').length == 1) {
        this.buttonsAttach(field_name);
      }
    },

    /**
     *
     */
    dialogShowUpdate: function(field_name) {
      this.dialogClose(field_name);

      if (Drupal.settings.wysiwygFields.fields[field_name].cardinality == -1 || Drupal.settings.wysiwygFields.fields[field_name].cardinality > 0) {
        deltas = Drupal.settings.wysiwygFields.fields[field_name].active.wf_deltas.toString().split(',');

        if (deltas.length == 1) {
          $('#edit-' + field_name.replace('_', '-', 'g') + ' div.fieldset-wrapper').hide();
          field_id = 'wysiwyg_fields-' + field_name + '-' + Drupal.settings.wysiwygFields.fields[field_name].active.wf_deltas;

          if ($('.' + field_id).parents('table[id^="edit-' + field_name.replace('_', '-', 'g') + '"]').length == 1) {
            // Set ID if not present.
            if ($('.' + field_id).attr('id') == '') {
              $('.' + field_id).attr('id', field_id);
            }

            // Move active field.
            $('.' + field_id)
              .before('<div id="' + $('.' + field_id) + '-placeholder"')
              .prependTo('#wysiwyg_fields-' + field_name + '-wrapper');
          }
        }

        else {
          this.dialogShowAll(field_name);
          $.each(deltas, function(delta) {
            $('#edit-' + field_name.replace('_', '-', 'g') + '-' + delta + '-wysiwyg-fields-select').attr('checked', 'checked');
          });
        }
      }

      //if ($('.wysiwyg_fields-' + field_name + '-field:first .wysiwyg_fields-widget').length == 1) {
        this.buttonsAttach(field_name, Drupal.t('Update'));
      //}
    },

    /**
     *
     */
    dialogShowAll: function(id) {
      if ($('#wysiwyg_fields-' + id + '-dialog .ui-dialog-titlebar .wysiwyg_fields-icon-expand .ui-icon').html() == Drupal.t('Expand')) {
        this.dialogClose(id);
        this.buttonsAttach(id);

        // Reposition Multiselect checkboxes.
        if (Drupal.settings.wysiwygFields.fields[id].cardinality == -1 || Drupal.settings.wysiwygFields.fields[id].cardinality > 0) {
          $('#wysiwyg_fields-' + id + '-dialog .wysiwyg_fields_select').each(function() {
            $(this)
              .before('<div id="' + $(this).attr('id') + '-placeholder" class="wysiwyg_fields-placeholder" />')
              .appendTo($(this).parents('tr:first').find('td:first'));
          });
        }

        $('#wysiwyg_fields-' + id + '-dialog .ui-dialog-titlebar .wysiwyg_fields-icon-expand .ui-icon')
          .html(Drupal.t('Contract'))
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
    dialogClose: function(field_name) {
      $('#wysiwyg_fields-' + field_name + '-dialog').appendTo($('#' + Drupal.settings.wysiwygFields.activeId).parents('form').first());
      $('#' + Drupal.settings.wysiwygFields.activeId + '-' + field_name).remove();

      if (Drupal.settings.wysiwygFields.fields[field_name].cardinality == -1 || Drupal.settings.wysiwygFields.fields[field_name].cardinality > 0) {
        $('#wysiwyg_fields-' + field_name + '-wrapper table, #' + field_name.replace('_', '-', 'g') + '-items').show();
      }

      // Undo DOM modificatons.
      $('.wysiwyg_fields-placeholder').each(function() {
        $(this).replaceWith($('#' + $(this).attr('id').substr(0, $(this).attr('id').length - 12)));
      });

      // Reset button pane.
      $('#wysiwyg_fields-' + field_name + '-dialog .ui-dialog-buttonpane').hide();
      $('#wysiwyg_fields-' + field_name + '-dialog .ui-dialog-buttonpane button').html(Drupal.t('Insert'));

      // Reset expand icon.
      $('#wysiwyg_fields-' + field_name + '-dialog .ui-dialog-titlebar .wysiwyg_fields-icon-expand .ui-icon')
        .html(Drupal.t('Expand'))
        .addClass('ui-icon-plusthick')
        .removeClass('ui-icon-minusthick');
    },

    /**
     *
     */
    buttonsAttach: function(field_name, label) {
      //if ($('.wysiwyg_fields-' + field_name + '-field:first .wysiwyg_fields-widget select').length == 1 && $('#wysiwyg_fields-' + field_name + '-dialog .ui-dialog-buttonpane select').length == 0) {
      //  button = $('#wysiwyg_fields-' + field_name + '-dialog .ui-dialog-buttonpane button');
      //  $('.wysiwyg_fields-' + field_name + '-field:first .wysiwyg_fields-widget select')
      //    .css({
      //      fontSize: button.css('font-size'),
      //      float: button.css('float'),
      //      lineHeight: button.css('line-height'),
      //      marginBottom: button.css('margin-bottom'),
      //      marginLeft: button.css('margin-left'),
      //      marginRight: button.css('margin-right'),
      //      marginTop: button.css('margin-top')
      //    })
      //    .before('<div id="' + $('.wysiwyg_fields-' + field_name + '-field:first .wysiwyg_fields-widget select').attr('id') + '-placeholder" class="wysiwyg_fields-placeholder" />')
      //    .appendTo('#wysiwyg_fields-' + field_name + '-dialog .ui-dialog-buttonpane'); // @TODO - Append or Prepend based on jQuery 1.6/1.7
      //}
      //if (label !== undefined) {
      //  token = Drupal.settings.wysiwygFields.fields[field_name].active.split('-');
      //  $('#wysiwyg_fields-' + field_name + '-dialog select.wysiwyg_fields_formatters').val(token[3]);
      //  $('#wysiwyg_fields-' + field_name + '-dialog .ui-dialog-buttonpane button').html(label);
      //}

      // Show button pane.
      $('#wysiwyg_fields-' + field_name + '-dialog .ui-dialog-buttonpane').show();
    },

    insert: function(id, content, delta) {
      console.log(id);
      console.log(content);
      console.log(delta);
      $('#wysiwyg_fields-' + id + '-wrapper').dialog('close');
      Drupal.wysiwygFields.dialogClose(id);

      // Invoke custom insert callback if available.
      if ($.isFunction(this.wysiwyg[Drupal.wysiwyg.instances[Drupal.settings.wysiwygFields.activeId].editor].insert)) {
        this.wysiwyg[Drupal.wysiwyg.instances[Drupal.settings.wysiwygFields.activeId].editor].insert(Drupal.settings.wysiwygFields.activeId, content);
      }
      else {
        Drupal.wysiwyg.instances[Drupal.settings.wysiwygFields.activeId].insert(content);
      }

      Drupal.settings.wysiwygFields.fields[id].delta = delta;
      $('.form-submit[name="' + id + '_add_more"]').trigger('mousedown');
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
            //Drupal.wysiwygFields.buttonsAttach(id);
              //if (!$('#wysiwyg_fields-' + id + '-dialog .wysiwyg_fields-icon-expand .ui-icon').hasClass('ui-icon-minusthick')) {
                Drupal.settings.wysiwygFields.fields[field_name].active = {
                  wf_deltas: Drupal.settings.wysiwygFields.fields[field_name].delta
                }
                Drupal.wysiwygFields.dialogShow(field_name, 'Update');
              //}
              // else {
              //Drupal.wysiwygFields.dialogClose(id);
            //  Drupal.wysiwygFields.dialogShow(id, 'All');
            //}
          }
        });
      }
    }
  }
})(jQuery);
