# Wysiwyg Fields
----------------

The Wysiwyg Fields module is bridge between Fields and the CKEditor module,
allowing most (if not all) fields to be turned into a Wysiwyg button for a
convenient inline solution.



## Features
-----------





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

Install required modules as per module installation instructions.

Install Wysiwyg Fields as per standard Drupal instructions:
https://www.drupal.org/documentation/install/modules-themes/modules-7

Add a new field or set an existing field with the Wysiwyg Fields **widget** and
configure field settings.

Add Wysiwyg Fields buttons to CKEditor Profiles.


**Note:** If you are using a local installation of the CKEditor javascript
library you will need to install the following plugins into your CKEditor
plugins directory (e.g., sites/all/modules/ckeditor/plugins):
  
  - [Widget](http://ckeditor.com/addons/widget)
  - [Line Utilities](http://ckeditor.com/addons/lineutils)



## Makefile
-----------

For easy downloading of Wysiwyg Fields and it's required modules and/or
libraries, you can use the following entries in your makefile:

```
projects[] = ckeditor

projects[] = formatted_field_tokens

projects[] = icon

projects[] = token_filter

projects[] = token_replace_ajax

projects[] = wysiwyg_fields
```

**Note:** It is highly recommended to specify the version of your projects, the
above format is only for the sake of simplicity.



## Roadmap
----------

- Add javascript caching of token values.
- Add better error/validation handling.
- Add CKEditor classes to field elements.
