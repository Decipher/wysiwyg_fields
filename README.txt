// $Id$

The Wysiwyg Fields module is bridge between CCK Fields and the Wysiwyg module,
allowing any CCK field to be turned into a Wysiwyg button for a convenient
inline solution.

Wysiwyg Fields is the successor to the Wysiwyg ImageField module.

Wysiwyg Fields was written and is maintained by Stuart Clark (deciphered).
- http://stuar.tc/lark


Features
--------------------------

* Support for Wysiwyg module libraries:
  * CKEditor/FCKEditor.
  * TinyMCE.
* Supports for a large variety of CCK fields, including but not limited to:
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


Configuration
--------------------------



Frequently asked questions
--------------------------



Known issues
--------------------------

- Following CCK field modules aren't compatible: @TODO - write incompatability detection code.
  - Embedded Media Field module.
- Certain fields can't render the preview due to JavaScript or other reasons: @TODO - Write hook for alternative preview.
  - Embed Google Maps Field module.
  - Video module.
- Inserted ViewField doesn't respect querystring variables.
- Recursive Node references = infinite loop.
- Locale can't read dynamic JS files.
- Error message on non-multi insert doesn't work properly.
- jQuery 1.6:
  - Button bar position.
  - Overflow is hidden, should scroll or Dialog should grow.
- Firefox issues:
  - Images and DIVs are resizable.
- Rubik theme:
  - Description tooltip causes scrolling in dialog.
- Chameleon and Marvin theme:
  - jQuery UI 1.7 Dialog conflict.
