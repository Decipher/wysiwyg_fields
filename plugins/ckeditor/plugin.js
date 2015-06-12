(function ($) {
  /**
   * Provides the Wysiwyg Fields plugin for CKEditor.
   */
  CKEDITOR.plugins.add('wysiwyg_fields', {
    requires: 'widget',
    init: function (editor) {
      var ckeditor = Drupal.settings.ckeditor;
      var buttons = ckeditor.input_formats[ckeditor.elements[editor.name]].loadPlugins.wysiwyg_fields.buttons;
      $.each(buttons, function (id, button) {
        var components = id.split('-');

        // Ensure field exists, otherwise skip this plugin.
        var $wrapper = $('#' + id + '-wrapper');
        if ($wrapper.length == 0) {
          return true;
        }

        // Create instance of Wysiwyg Fields helper class.
        Drupal.settings.wysiwygFields[id] = new Drupal.wysiwygFields(id);

        // Add command.
        editor.addCommand(id, new CKEDITOR.dialogCommand(id));

        // Add toolbar button.
        editor.ui.addButton(id, {
          label: button.label,
          command: id,
          toolbar: 'wysiwyg_fields',
          icon: button.icon_url
        });

        // Register the dialog.
        CKEDITOR.dialog.add(id, function (editor) {
          return {
            title: button.label,
            contents: [
              {
                elements: [
                  {
                    type: 'html',
                    html: '<div id="' + id + '"></div>'
                  }
                ]
              }
            ],

            // On show; place dialog within the bounds of the entity
            // form and move field into the dialog.
            onShow: function (evt) {
              // Store dialog definition in Wysiwyg Fields object.
              Drupal.settings.wysiwygFields[id].dialog = this;

              $(this.parts.dialog.$.parentElement).appendTo($(this._.editor.container.$).parents('form'));
              $(Drupal.settings.wysiwygFields[id].idInner).appendTo('#' + id);

              // Store active Wysiwyg Fields id.
              Drupal.settings.wysiwygFields.activeId = id;
            },

            // On hide; reset dialog and field back to their original
            // placement.
            onHide: function (evt) {
              $(this.parts.dialog.$.parentElement).appendTo('body');
              $(Drupal.settings.wysiwygFields[id].idInner).appendTo(Drupal.settings.wysiwygFields[id].idWrapper);

              // Reset hidden deltas.
              Drupal.settings.wysiwygFields[id].show();

              // Delete active Wysiwyg Fields id.
              delete Drupal.settings.wysiwygFields.activeId;
            },

            // On ok; initiate AJAX callback for rendered token value and
            // validate said callback.
            onOk: function (evt) {
              dialog = this;
              token = Drupal.settings.wysiwygFields[id].buildToken();

              // Send data to Wysiwyg Fields AJAX callback.
              $.post(Drupal.settings.basePath + 'token_replace/ajax/' + token, $('form').serialize(), function (result) {
                widget = dialog._.editor.widgets.focused;

                // Re-enable 'ok' button.
                dialog.enableButton('ok');

                // Set token data.
                widget.setData('token', result.token);

                // If the returned value is the token then something has gone
                // wrong; unset the widget value data if set.
                if (result.token == result.value) {
                  widget.setData('value', undefined);
                }

                // Set value data and close dialog.
                else {
                  widget.setData('value', result.value);

                  // @TODO - Only trigger this after widget creation, not edit.
                  Drupal.settings.wysiwygFields[id].addAnother();

                  dialog.hide();
                }
              }, 'json');

              // Disable 'ok' button.
              // @TODO - Hide/disable cancel/close buttons?.
              dialog.disableButton('ok');

              // Prevent dialog from closing to allow for AJAX callback to
              // return and be validated.
              return false;
            },

            // On cancel; cleanup empty widgets.
            onCancel: function (evt) {
              widget = this._.editor.widgets.focused;
              if (widget != null && typeof widget.data.value == 'undefined') {
                widget.destroy();
                widget.element.remove();
              }
            }
          };
        });

        // Register the widget.
        editor.widgets.add(id, {
          template: '<wysiwyg_fields token=""></wysiwyg_fields>',
          dialog: id,
          button: button.label,
          mask: true,
          inline: true,

          // Upcast; triggered when Wysiwyg is attached (on load, switch to rich
          // text editor, etc).
          //
          // Determine if an element is part of this plugin instance.
          upcast: function (element, data) {
            var token_regex = new RegExp("(\\[" + components[1] + ":" + components[3] + ":\\d.*?\\])", 'g');

            // If we have a Wysiwyg Fields pseudo-field with the correct token
            // format, then we upcast.
            if (element.name == 'wysiwyg_fields' && typeof element.attributes.token !== "undefined" && element.attributes.token.match(token_regex)) {
              data.token = element.attributes.token;
              data.upcast = true;

              return true;
            }

            // Wrap plain text tokens Wysiwyg Fields pseudo-field.
            else if (element.getHtml().match(token_regex)) {
              element.setHtml(element.getHtml().replace(token_regex, "<wysiwyg_fields token='$1'>$1</wysiwyg_fields>"));
            }

            return false;
          },

          // Data; Insert widget markup.
          data: function () {
            editor = this.editor;

            // If no value data, set the token as a placeholder.
            if (typeof this.data.value != 'undefined') {
              this.element.setHtml(this.data.value);
            }
            else if (typeof this.data.token != 'undefined') {
              this.element.setHtml(this.data.token);
            }

            // If this is an upcasted widget, get the value from cache or AJAX.
            if (typeof this.data.upcast != 'undefined') {
              // @TODO - Caching system.
              // @TODO - Target widget by ID instead of iterating.
              delete this.data.upcast;
              $.post(Drupal.settings.basePath + 'token_replace/ajax/' + this.data.token, $('form').serialize(), function (result) {
                $.each(editor.widgets.instances, function () {
                  if (this.data.token == result.token) {
                    this.element.setHtml(result.value);
                  }
                });
              }, 'json');
            }
          },

          // Downcast; triggered when Wysiwyg is detached (prior to submit,
          // Switch to rich text editor, etc).
          //
          // Transform widget markup into filter format.
          downcast: function (widgetElement) {
            return new CKEDITOR.htmlParser.text(this.data.token);
          },

          // Edit; Triggers when a dialog is opened (button click, double click
          // on existing widget).
          edit: function (evt) {
            // If no token data is present then this is a new widget instance.
            if (typeof this.data.token == "undefined") {
              deltas = Drupal.settings.wysiwygFields[id].getDeltas();
              Drupal.settings.wysiwygFields[id].show(deltas);
            }

            // If token data is present, we are updating an existing widget
            // instance.
            else {
              tokenData = Drupal.settings.wysiwygFields[id].getTokenData(this.data.token);
              Drupal.settings.wysiwygFields[id].setFormatter(tokenData.formatter, tokenData.formatter_settings);
              Drupal.settings.wysiwygFields[id].show(tokenData.deltas);
            }
          }
        });
      });
    }
  });
})
(jQuery);
