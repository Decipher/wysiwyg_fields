(function ($) {
  Drupal.settings.wysiwygFields = Drupal.settings.wysiwygFields || {};

  Drupal.behaviors.wysiwygFields = {
    attach: function (context) {
      if (typeof Drupal.settings.wysiwygFields.activeId != 'undefined') {
        var wysiwygField = Drupal.settings.wysiwygFields[Drupal.settings.wysiwygFields.activeId];
        wysiwygField.show(wysiwygField.getDeltas());

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
    bundleName: '',

    // CSS selectors.
    classFieldName: '',
    classDeltas: '',
    idWrapper: '',
    idInner: '',

    // Active information.
    activeDeltas: [],

    // Regular expressions.
    regExpDelta: null,

    /**
     *
     * @param field_name
     * @private
     */
    __construct: function (id) {
      var components = id.split('-');

      // Field info.
      this.id = id;
      this.entityType = components[1];
      this.bundleName = components[2];
      this.fieldName = {
        underscore: components[3].replace(/-/g, '_'),
        dash: components[3].replace(/_/g, '-')
      };

      // CSS selectors.
      this.classFieldName = '.field-name-' + this.fieldName.dash;
      this.classDeltas = '.wysiwyg_fields-' + this.fieldName.underscore + '-delta';
      this.idWrapper = '#' + id + '-wrapper';
      this.idInner = '#' + id + '-inner';

      // Regular expressions.
      this.regExpDelta = new RegExp("wysiwyg_fields-" + this.fieldName.underscore + "-delta-(\\d+)");
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
      if (typeof deltas == 'undefined') {
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
     * @returns {string}
     */
    buildToken: function () {
      // @TODO - Build deltas.
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

      return "[node:" + this.fieldName.underscore + "-formatted:" + deltas + ":" + $(':input[name="' + this.fieldName.underscore + '[wysiwyg_fields][formatter][type]"]').val() + formatterSettings + "]";
    },

    /**
     *
     * @param token
     * @returns {{deltas: Array, formatter: string, formatter_settings: {}}}
     */
    getTokenData: function (token) {
      parts = token.substring(1, token.length - 1).split(':');

      var entity_type = parts.shift();
      var field_name = parts.shift();
      var deltas = parts.shift().split(',');

      var formatter = '';
      if (parts.length > 0) {
        formatter = parts.shift();
      }

      var formatter_settings = {};
      if (parts.length > 0) {
        $.each(parts, function (index, value) {
          setting_parts = value.split('-');
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
     *
     * @returns {*}
     */
    getDeltas: function () {
      if (typeof this.activeDeltas != 'undefined' && this.activeDeltas.length > 0) {
        return this.activeDeltas;
      }

      var match = $(this.classDeltas).last().attr('class').match(this.regExpDelta);
      return [match[1]];
    },

    /**
     *
     * @param deltas
     */
    setDeltas: function (deltas) {
      if (typeof deltas == 'undefined') {
        this.activeDeltas = [];
      }

      this.activeDeltas = deltas;
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
      if (formatter != null && $formatterField.val() != formatter) {
        // Store settings to be set after AJAX callback.
        this.formatterSettings = settings;

        // Set formatter and trigger AJAX callback.
        $formatterField.val(formatter).trigger('change');
      }

      else {
        wysiwygField = this;

        // Reset all settings to default.
        $(':input[name^="' + this.fieldName.underscore + '[wysiwyg_fields][formatter][settings]"]').val(function() {
          return this.defaultValue;
        });

        // Set each setting as specified.
        $.each(settings, function(name, value) {
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
     * Triggers the invisible 'Add another' button.
     *
     * @TODO: Don't add another if latest delta is empty?
     */
    addAnother: function () {
      $(this.idInner).find('.field-add-more-submit').trigger('mousedown');
    }
  };
})(jQuery);
