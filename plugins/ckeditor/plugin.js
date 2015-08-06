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
        // Ensure field exists, otherwise skip this plugin.
        var $wrapper = $('#' + id + '-wrapper');
        if ($wrapper.length == 0) {
          return true;
        }

        // Create instance of Wysiwyg Fields helper class.
        if (typeof Drupal.settings.wysiwygFields[id] == 'undefined') {
          Drupal.settings.wysiwygFields[id] = new Drupal.wysiwygFields(id);
        }

        // Add command.
        editor.addCommand(id, new CKEDITOR.dialogCommand(id));

        // Add toolbar button.
        editor.ui.addButton(id, {
          label: button.label,
          command: id,
          toolbar: 'wysiwyg_fields',
          icon: Drupal.settings.wysiwygFields[id].settings.icon
        });

        // Register the dialog.
        CKEDITOR.dialog.add(id, function () {
          return {
            title: button.label,
            contents: [
              {
                id: 'basic',
                label: 'Basic',
                title: 'Basic',
                elements: [
                  {
                    type: 'html',
                    html: '',
                    className: 'wysiwyg_fields-dialog-basic'
                  }
                ]
              },
              {
                id: 'advanced',
                label: 'Advanced',
                title: 'Advanced',
                elements: [
                  {
                    type: 'html',
                    html: 'Select one or more fields to be inserted.'
                  },
                  {
                    type: 'html',
                    html: '',
                    className: 'wysiwyg_fields-dialog-advanced'
                  }
                ]
              }
            ],

            // On load; toggle the advanced tab and store dialog definition in
            // Wysiwyg Fields object.
            onLoad: function () {
              if (Drupal.settings.wysiwygFields[id].settings.advancedTab == 0) {
                delete this.hidePage('advanced');
              }

              Drupal.settings.wysiwygFields[id].dialog = this;
            },

            // On show; place dialog within the bounds of the entity
            // form and move field into the dialog.
            onShow: function () {
              // Reset messages.
              Drupal.settings.wysiwygFields[id].setMessages();

              $(this.parts.dialog.$.parentElement).appendTo($(this._.editor.container.$).parents('form'));
              $(Drupal.settings.wysiwygFields[id].idInner).appendTo(this.parts.contents.findOne('.wysiwyg_fields-dialog-basic').$);

              // Store active Wysiwyg Fields id.
              Drupal.settings.wysiwygFields.activeId = id;

              // Attach tab change event listener.
              Drupal.settings.wysiwygFields[id].tabEvent = this.on('selectPage', function (evt) {
                // Set active dialog mode.
                Drupal.settings.wysiwygFields[id].activeMode = evt.data.page;

                var deltas = [];
                var activeDeltas = [];

                // Get deltas and activeDeltas per tab.
                if (evt.data.page == 'basic') {
                  deltas = Drupal.settings.wysiwygFields[id].getDeltas();
                  activeDeltas = deltas;
                }
                else {
                  activeDeltas = Drupal.settings.wysiwygFields[id].getDeltas();
                }

                // Show deltas.
                Drupal.settings.wysiwygFields[id].show(deltas);

                // Select active delta checkboxes.
                Drupal.settings.wysiwygFields[id].selectDeltas(activeDeltas);

                // Move form to new tab.
                $(Drupal.settings.wysiwygFields[id].idInner).appendTo(this.parts.contents.findOne('.wysiwyg_fields-dialog-' + evt.data.page).$);
              });
            },

            // On hide; reset dialog and field back to their original
            // placement.
            onHide: function () {
              $(this.parts.dialog.$.parentElement).appendTo('body');
              $(Drupal.settings.wysiwygFields[id].idInner).appendTo(Drupal.settings.wysiwygFields[id].idWrapper);

              // Reset active delta checkboxes.
              Drupal.settings.wysiwygFields[id].selectDeltas();

              // Reset hidden deltas.
              Drupal.settings.wysiwygFields[id].show();

              // Reset dialog mode.
              Drupal.settings.wysiwygFields[id].activeMode = 'basic';

              // Delete active Wysiwyg Fields id.
              delete Drupal.settings.wysiwygFields.activeId;

              // Remove tab change event listener.
              Drupal.settings.wysiwygFields[id].tabEvent.removeListener();
            },

            // On ok; initiate AJAX callback for rendered token value and
            // validate said callback.
            onOk: function () {
              var dialog = this;
              var token = Drupal.settings.wysiwygFields[id].buildToken();

              // Send data to Wysiwyg Fields AJAX callback.
              $.post(Drupal.settings.basePath + 'token_replace/ajax/' + token, $('form').serialize(), function (result) {
                var widget = dialog._.editor.widgets.focused;

                // Re-enable 'ok' button.
                dialog.enableButton('ok');

                // Set token data.
                widget.setData('token', result.token);

                // If the returned value is the token then something has gone
                // wrong; unset the widget value data if set.
                if (result.token == result.value) {
                  // Show messages.
                  Drupal.settings.wysiwygFields[id].setMessages(result.messages.html);

                  // Reset data.
                  widget.setData('value', undefined);
                }

                // Set value data and close dialog.
                else {
                  // Reset messages.
                  Drupal.settings.wysiwygFields[id].setMessages();

                  // Set data.
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
            onCancel: function () {
              var widget = this._.editor.widgets.focused;
              if (widget != null && typeof widget.data.value == 'undefined') {
                widget.destroy();
                widget.element.remove();
              }
            }
          };
        });

        // Register the widget.
        editor.widgets.add(id, {
          template: '<wysiwyg_fields data-token=""></wysiwyg_fields>',
          dialog: id,
          button: button.label,
          mask: true,
          upcastPriority: 1,

          // Upcast; triggered when Wysiwyg is attached (on load, switch to rich
          // text editor, etc).
          //
          // Determine if an element is part of this plugin instance.
          upcast: function (element, data) {
            // If we have a Wysiwyg Fields pseudo-field with the correct token
            // format, then we upcast.
            if (element.name == 'wysiwyg_fields' && typeof element.attributes['data-token'] !== "undefined" && "[" + element.attributes['data-token'] + "]".match(Drupal.settings.wysiwygFields[id].regExpToken)) {
              data.token = "[" + element.attributes['data-token'] + "]";
              data.upcast = true;

              return true;
            }

            // Wrap plain text tokens Wysiwyg Fields pseudo-field.
            else if (element.getHtml().match(Drupal.settings.wysiwygFields[id].regExpToken)) {
              element.setHtml(element.getHtml().replace(Drupal.settings.wysiwygFields[id].regExpToken, "<wysiwyg_fields data-token='$1'></wysiwyg_fields>"));
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
                    this.setData('value', result.value);
                  }
                });
              }, 'json');
            }
          },

          // Downcast; triggered when Wysiwyg is detached (prior to submit,
          // Switch to rich text editor, etc).
          //
          // Transform widget markup into filter format.
          downcast: function () {
            return new CKEDITOR.htmlParser.text(this.data.token);
          },

          // Edit; Triggers when a dialog is opened (button click, double click
          // on existing widget).
          edit: function () {
            // If no token data is present then this is a new widget instance.
            if (typeof this.data.token == "undefined") {
              var deltas = Drupal.settings.wysiwygFields[id].getDeltas();
              Drupal.settings.wysiwygFields[id].show(deltas);
            }

            // If token data is present, we are updating an existing widget
            // instance.
            else {
              var tokenData = Drupal.settings.wysiwygFields[id].getTokenData(this.data.token);
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
