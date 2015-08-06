(function ($) {
  Drupal.settings.wysiwygFields = Drupal.settings.wysiwygFields || {};

  Drupal.behaviors.wysiwygFields = {
    attach: function () {
      if (typeof Drupal.settings.wysiwygFields.activeId != 'undefined') {
        var wysiwygField = Drupal.settings.wysiwygFields[Drupal.settings.wysiwygFields.activeId];
        if (wysiwygField.activeMode == 'basic') {
          wysiwygField.show(wysiwygField.getDeltas());
        }

        if (typeof wysiwygField.formatterSettings != 'undefined') {
          wysiwygField.setFormatter(null, wysiwygField.formatterSettings);
          delete wysiwygField.formatterSettings;
        }
      }
    }
  };

  Drupal.wysiwygFields = function (field_name) {
    this.__construct(field_name);
  };

  Drupal.wysiwygFields.prototype = {
    // Field info.
    id: '',
    fieldName: {},
    entityType: '',
    entityTokenType: '',
    bundleName: '',

    // Wysiwyg settings.
    settings: {},

    // CSS selectors.
    classFieldName: '',
    classDeltas: '',
    idWrapper: '',
    idInner: '',

    // Active information.
    activeDeltas: [],
    activeMode: 'basic',

    // Regular expressions.
    regExpDelta: null,
    regExpToken: null,

    /**
     * Construct; Builds the Wysiwyg Fields javascript object.
     *
     * @param id
     * @private
     */
    __construct: function (id) {
      var components = id.split('-');

      // Field info.
      this.id = id;
      this.entityType = components[1];
      Drupal.settings.wysiwygFields.tokenTypes = Drupal.settings.wysiwygFields.tokenTypes || [];
      this.entityTokenType = Drupal.settings.wysiwygFields.tokenTypes[components[1]];
      this.bundleName = components[2];
      this.fieldName = {
        underscore: components[3].replace(/-/g, '_'),
        dash: components[3].replace(/_/g, '-')
      };

      // Wysiwyg settings.
      this.settings = Drupal.settings.wysiwygFields.settings[id];

      // CSS selectors.
      this.classFieldName = '.field-name-' + this.fieldName.dash;
      this.classDeltas = '.wysiwyg_fields-' + this.fieldName.underscore + '-delta';
      this.idWrapper = '#' + id + '-wrapper';
      this.idInner = '#' + id + '-inner';

      // Regular expressions.
      this.regExpDelta = new RegExp("wysiwyg_fields-" + this.fieldName.underscore + "-delta-(\\d+)");
      this.regExpToken = new RegExp("\\[(" + this.entityTokenType + ":" + components[3] + "-formatted:\\d.*?)\\]");
    },

    /**
     * This function allows you to choose one field item and show it while
     * hiding all others. Reset values of the field by leaving the delta empty.
     *
     * Example: Drupal.wysiwygFields.show("field_entity", [1, 2, 3]);
     *
     * If there is a add file button, that will be the last delta.
     *
     * @param deltas
     */
    show: function (deltas) {
      var wysiwygField = this;

      // If no delta specified, show all and return.
      if (typeof deltas == 'undefined' || deltas.length == 0) {
        $(this.classDeltas).show();
        this.setDeltas();
        return;
      }

      // Hide all non-specified deltas.
      $(this.classDeltas).hide();

      // Show each delta specified.
      $.each(deltas, function (index, value) {
        $(wysiwygField.classDeltas + '-' + value).show();
      });

      // Store active deltas.
      this.setDeltas(deltas);
    },

    /**
     * Build token; Returns the correct token based on user choices in the
     * Wysiwyg Fields UI.
     *
     * @returns {string}
     */
    buildToken: function () {
      var deltas = this.getDeltas();

      // Build formatter settings.
      var formatterSettings = [];
      var formData = $(':input[name^="' + this.fieldName.underscore + '[wysiwyg_fields][formatter][settings]"]').serializeArray();

      $.each(formData, function (index, field) {
        if (field.value !== "") {
          var parts = field.name.replace(/]/g, '').split('[');
          formatterSettings.push(parts[4] + "-" + field.value);
        }
      });
      if (formatterSettings.length > 0) {
        formatterSettings = ":" + formatterSettings.join(':');
      }
      else {
        formatterSettings = '';
      }

      return "[" + this.entityTokenType + ":" + this.fieldName.underscore + "-formatted:" + deltas + ":" + $(':input[name="' + this.fieldName.underscore + '[wysiwyg_fields][formatter][type]"]').val() + formatterSettings + "]";
    },

    /**
     * Get token data; Splits the provided token into it's relevant components:
     * deltas, formatter and formatter settings.
     *
     * @param token
     * @returns {{deltas: Array, formatter: string, formatter_settings: {}}}
     */
    getTokenData: function (token) {
      var parts = token.substring(1, token.length - 1).split(':');

      parts.shift();
      parts.shift();
      var deltas = parts.shift().split(',');

      var formatter = '';
      if (parts.length > 0) {
        formatter = parts.shift();
      }

      var formatter_settings = {};
      if (parts.length > 0) {
        $.each(parts, function (index, value) {
          var setting_parts = value.split('-');
          if (setting_parts.length == 2) {
            formatter_settings[setting_parts[0]] = setting_parts[1];
          }
        });
      }

      return {
        deltas: deltas,
        formatter: formatter,
        formatter_settings: formatter_settings
      };
    },

    /**
     * Get deltas; Returns the active deltas based on the stored values, the
     * checked multi-select checkboxes or the last available delta.
     *
     * @returns {*}
     */
    getDeltas: function () {
      // Return activeDeltas if set.
      if (typeof this.activeDeltas != 'undefined' && this.activeDeltas.length > 0) {
        return this.activeDeltas;
      }

      // Return deltas list based on 'select' checkboxes.
      var $selects = $(this.idInner).find(':checkbox[name^="' + this.fieldName.underscore + '[wysiwyg_fields][select]"]:checked');
      if ($selects.length > 0) {
        var selected = [];
        $selects.each(function (index, item) {
          var parts = $(item).attr('name').split('[');
          var delta = parts[3].substring(0, parts[3].length - 1);
          selected.push(delta);
        });
        return selected;
      }

      // Return last delta.
      var match = $(this.classDeltas).last().attr('class').match(this.regExpDelta);
      return [match[1]];
    },

    /**
     * Set deltas; Stores the provided deltas as the active deltas.
     *
     * @param deltas
     */
    setDeltas: function (deltas) {
      if (typeof deltas == 'undefined' || deltas.length == 0) {
        this.activeDeltas = [];
      }

      this.activeDeltas = deltas;
    },

    /**
     * Select deltas; Sets the multi-select checkboxes as per the provided
     * deltas or resets all checkboxes if no deltas provided.
     *
     * @param deltas
     */
    selectDeltas: function (deltas) {
      // If not deltas provided, un-check all 'select' checkboxes.
      if (typeof deltas == 'undefined' || deltas.length == 0) {
        $(this.idInner).find(':checkbox[name^="' + this.fieldName.underscore + '[wysiwyg_fields][select]"]').removeAttr('checked');
      }

      // Check 'select' checkboxes as per provided deltas.
      else {
        var wysiwygField = this;
        $.each(deltas, function (index, delta) {
          $(wysiwygField.idInner).find(':checkbox[name$="[wysiwyg_fields][select][' + delta + ']"]').attr('checked', 'checked');
        });
      }
    },

    /**
     * Set formatter and formatter settings for this Wysiwyg Field.
     *
     * @param formatter
     * @param settings
     */
    setFormatter: function (formatter, settings) {
      // Set formatter if required.
      var $formatterField = $(':input[name="' + this.fieldName.underscore + '[wysiwyg_fields][formatter][type]"]');
      if (formatter != null) {
        // Store settings to be set after AJAX callback.
        this.formatterSettings = settings;

        // Set formatter and trigger AJAX callback.
        $formatterField.val(formatter).trigger('change');
      }

      else {
        var wysiwygField = this;

        // Reset all settings to default.
        $(':input[name^="' + this.fieldName.underscore + '[wysiwyg_fields][formatter][settings]"]').val(function () {
          return this.defaultValue;
        });

        // Set each setting as specified.
        $.each(settings, function (name, value) {
          selector = ':input[name="' + wysiwygField.fieldName.underscore + '[wysiwyg_fields][formatter][settings][' + name + ']"]';
          if ($(selector).is(':radio')) {
            $(selector + '[value=' + value + ']').attr('checked', 'checked');
          }
          else {
            $(selector).val(value);
          }
        });
      }
    },

    /**
     * Display messages in Wysiwyg field.
     *
     * @param messages
     */
    setMessages: function (messages) {
      $(this.idInner).find('.messages').remove();
      if (typeof messages !== 'undefined') {
        $(this.idInner).prepend(messages);
      }
    },

    /**
     * Triggers the invisible 'Add another' button.
     *
     * @TODO: Don't add another if latest delta is empty?
     */
    addAnother: function () {
      $(this.idInner).find('.field-add-more-submit').trigger('mousedown');
    }
  };
})(jQuery);
