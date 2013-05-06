The Wysiwyg Fields module is bridge between Fields and the Wysiwyg module,
allowing most (if not all) fields to be turned into a Wysiwyg button for a
convenient inline solution.

Wysiwyg Fields is the successor to the Wysiwyg ImageField module.

Wysiwyg Fields was written and is maintained by Stuart Clark (deciphered).
- http://stuar.tc/lark



Features
--------------------------------------------------------------------------------

* Support for Wysiwyg module libraries:
  * CKEditor.
  * TinyMCE.
* Supports for most CCK fields, including but not limited to:
  * Fields modules - File, Image, Text, Number, etc.
  * Date module.
  * Link module.
  * Email Field module.



Required modules
--------------------------------------------------------------------------------

* Wysiwyg module.



Recommended modules
--------------------------------------------------------------------------------

* Custom Formatters module.



Configuration
--------------------------------------------------------------------------------

Wysiwyg Fields settings can be found with the standard CCK field settings:
  Administer > Content management > Content types > [content type] > Manage fields > [field] > Configure
  http://[www.yoursite.com/path/to/drupal]/admin/content/node-type/[content-type]/fields/[field]

- Expand the 'Wysiwyg Fields settings' fieldset.
- Check the 'Attach to Wysiwyg?' checkbox.
- Choose or upload icon for the Wysiwyg Field.
- Select at least one (1) formatter.
- (optional) Expand and configure the 'Advanced settings'.



Frequently asked questions
--------------------------------------------------------------------------------

Q. Where did my field go?

A. For usability purposes, Wysiwyg Fields consumes the fields that it is enabled
   on. If the field is required for use outside of the Wysiwyg it is recommended
   that you create a second field specifically for use with Wysiwyg Fields.


Q. How can I see all the items on a Wysiwyg Field?

A. While the Wysiwyg Fields dialog is active you will see a '+' icon to the left
   of the dialog title, simply click the '+' to display the full CCK field view.



Known issues
--------------------------------------------------------------------------------

- Following field modules aren't compatible: @TODO - write incompatibility detection code.
  - Embedded Media Field module.
- Certain fields can't render the preview due to JavaScript or other reasons: @TODO - Write hook for alternative preview.
  - Embed Google Maps Field module.
  - Video module.
- Inserted ViewField doesn't respect querystring variables.
- Recursive Node references = infinite loop.
- Error message on non-multi insert doesn't work properly.
- Formatters that use drupal_add_js() or drupal_add_css() don't don't render correctly in the Wysiwyg, nor in Node view when with filter caching.



Makefile entries
--------------------------------------------------------------------------------

For easy downloading of Wysiwyg Fields and it's required modules and/or
libraries, you can use the following entries in your makefile:


  projects[libraries][subdir] = contrib
  projects[libraries][version] = 2.0

  projects[wysiwyg][subdir] = contrib
  projects[wysiwyg][version] = 2.2

  libraries[ckeditor][download][type] = file
  libraries[ckeditor][download][url] = http://download.cksource.com/CKEditor/CKEditor/CKEditor%203.6.6.1/ckeditor_3.6.6.1.zip

  libraries[famfamfam_silk_icons][download][type] = file
  libraries[famfamfam_silk_icons][download][url] = http://www.famfamfam.com/lab/icons/silk/famfamfam_silk_icons_v013.zip
