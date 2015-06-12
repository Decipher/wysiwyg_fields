The Wysiwyg Fields module is bridge between Fields and the CKEditor module,
allowing most (if not all) fields to be turned into a Wysiwyg button for a
convenient inline solution.



## Features ##





## Required modules ##

- [CKEditor - WYSIWYG HTML editor](https://drupal.org/project/ckeditor)
- [Formatted Field tokens](https://drupal.org/project/formatted_field_tokens)
- [Icon API](https://drupal.org/project/icon)
- [Token Filter](https://drupal.org/project/token_filter)
- [Token replace AJAX](https://drupal.org/project/token_replace_ajax)



## Recommended modules ##

- [Custom Formatters](https://drupal.org/project/custom_formatters)



## Configuration ##




## Frequently asked questions ##




## Known issues ##

- Following field modules aren't compatible: @TODO - write incompatibility detection code.
    - Embedded Media Field module.
- Certain fields can't render the preview due to JavaScript or other reasons: @TODO - Write hook for alternative preview.
    - Embed Google Maps Field module.
    - Video module.
- Inserted ViewField doesn't respect querystring variables.
- Recursive Node references = infinite loop.
- Error message on non-multi insert doesn't work properly.
- Formatters that use drupal_add_js() or drupal_add_css() don't don't render
  correctly in the Wysiwyg, nor in Node view when with filter caching.


## Roadmap ##

- !Add ability to choose sub-widget.
- Add javascript caching of token values.
- Add better error/validation handling.
- Add CKEditor classes to field elements.



## Makefile entries ##

For easy downloading of Wysiwyg Fields and it's required modules and/or
libraries, you can use the following entries in your makefile:


```
```
