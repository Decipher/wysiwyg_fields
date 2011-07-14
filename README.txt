The Wysiwyg Fields module is bridge between CCK Fields and the Wysiwyg module,
allowing most (if not all) CCK fields to be turned into a Wysiwyg button for a
convenient inline solution.

Wysiwyg Fields is the successor to the Wysiwyg ImageField module.

Wysiwyg Fields was written and is maintained by Stuart Clark (deciphered).
- http://stuar.tc/lark


Testing
--------------------------

Setup a test site with all dependencies (plus some extra modules for testing
purposes) with the following Drush Make command:

  drush make http://dl.dropbox.com/u/1804559/wysiwyg_fields.make [destination]


A feature is also included with the make file - 'Wysiwyg Fields test' - which if
enabled will install the the necessary module, setup a Content Type, create an
ImageField preconfigured for use with Wysiwyg Fields, setup your Input Formats
and attach Wysiwyg libraries to them and have you ready to start testing in a
matter of seconds. The feature will be at the very top of you module list so you
can't miss it.

Notes:
  * [destination] should be replaced with the directory you wish the site to
    live in, e.g. wysiwyg_fields)

  * The jQuery UI 1.7 library is downloaded in this make file, so jQuery Update
    is required (this is enabled with the 'Wysiwyg Fields test' feature).


Features
--------------------------

* Support for Wysiwyg module libraries:
  * CKEditor/FCKEditor.
  * TinyMCE.
* Supports for most CCK fields, including but not limited to:
  * CCK modules - Text, Number, Node reference and User reference.
  * FileField module.
  * ImageField module.
  * Date module.
  * Link module.
  * Email Field module.


Required modules
--------------------------

* Content Construction Kit (CCK) module.
* jQuery UI module.
* Wysiwyg module.


Recommended modules
--------------------------

* Custom Formatters module.
* jQuery Update module (in conjunction with jQuery UI 1.7).
* Node Relationships.


Configuration
--------------------------

Wysiwyg Fields settings can be found with the standard CCK field settings:
  Administer > Content management > Content types > [content type] > Manage fields > [field] > Configure
  http://[www.yoursite.com/path/to/drupal]/admin/content/node-type/[content-type]/fields/[field]

- Expand the 'Wysiwyg Fields settings' fieldset.
- Check the 'Attach to Wysiwyg?' checkbox.
- Choose or upload icon for the Wysiwyg Field.
- Select at least one (1) formatter.
- (optional) Expand and configure the 'Advanced settings'.


Frequently asked questions
--------------------------

Q. Where did my CCK field go?

A. For usability purposes, Wysiwyg Fields consumes the fields that it is enabled
   on. If the field is required for use outside of the Wysiwyg it is recommended
   that you create a second field specifically for use with Wysiwyg Fields.


Q. How can I see all the items on a Wysiwyg Field?

A. While the Wysiwyg Fields dialog is active you will see a '+' icon to the left
   of the dialog title, simply click the '+' to display the full CCK field view.


Known issues
--------------------------

- Following CCK field modules aren't compatible: @TODO - write incompatibility detection code.
  - Embedded Media Field module.
- Certain fields can't render the preview due to JavaScript or other reasons: @TODO - Write hook for alternative preview.
  - Embed Google Maps Field module.
  - Video module.
- Inserted ViewField doesn't respect querystring variables.
- Recursive Node references = infinite loop.
- Error message on non-multi insert doesn't work properly.
- Formatters that use drupal_add_js() or drupal_add_css() don't don't render correctly in the Wysiwyg, nor in Node view when with filter caching.
- jQuery 1.6:
  - Overflow is hidden, should scroll or Dialog should grow.
  - Firefox - Form elements unclickable.
- Firefox issues:
  - Images and DIVs are resizable.
- Rubik theme:
  - Description tooltip causes scrolling in dialog.
- Chameleon and Marvin theme:
  - jQuery UI 1.7 Dialog conflict.
