# Wysiwyg Fields
----------------

Wysiwyg Fields is an Inline field management system, a module that bridges the
gap between Drupal fields and CKEditor, giving the power of Drupal's field
system via the simple usability of a CKEditor dialog.

What that means is that Wysiwyg Fields allows for any Drupal field to be
embedded directly into CKEditor and behave as a native CKEditor plugin, removing
unnecessary clutter from your Drupal entity forms.



## Required modules
-------------------

- [CKEditor - WYSIWYG HTML editor](https://drupal.org/project/ckeditor)
- [Formatted Field tokens](https://drupal.org/project/formatted_field_tokens)
- [Icon API](https://drupal.org/project/icon)
- [Token Filter](https://drupal.org/project/token_filter)
- [Token replace AJAX](https://drupal.org/project/token_replace_ajax)



## Recommended modules
----------------------

- [Custom Formatters](https://drupal.org/project/custom_formatters)



## Installation
---------------

1. Install the module and dependencies as per
   [standard Drupal instructions](https://www.drupal.org/documentation/install/modules-themes/modules-7).

2. Create or update a field so that it uses the Wysiwyg field widget.

3. Add your Wysiwyg field button to a CKEditor profile.


**Note:** If you are using a local installation of the CKEditor javascript
library you will need to install the following plugins into your CKEditor
plugins directory (e.g., sites/all/modules/ckeditor/plugins):
  
  - [Widget](http://ckeditor.com/addons/widget)
  - [Line Utilities](http://ckeditor.com/addons/lineutils)



## Makefile
-----------

For easy downloading of Wysiwyg Fields and it's required modules and/or
libraries, you can use the following entries in your makefile:


    projects[] = ckeditor

    projects[] = formatted_field_tokens

    projects[] = icon

    projects[] = token_filter

    projects[] = token_replace_ajax

    projects[] = wysiwyg_fields


**Note:** It is highly recommended to specify the version of your projects, the
above format is only for the sake of simplicity.



## Roadmap
----------

- Add javascript caching of token values.
- Add better error/validation handling.
