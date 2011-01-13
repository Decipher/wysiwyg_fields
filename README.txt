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
  * Email Field module.
  * Video module.
  * Phone (CCK) module.


Required modules
--------------------------

* Content Construction Kit (CCK) module.
* jQuery UI module.
* Wysiwyg module.


Configuration
--------------------------



Frequently asked questions
--------------------------



Known issues
--------------------------

- Following CCK field modules aren't compatible:
  - Date module.
  - Link module.
  - Embedded Media Field module.
- View Field output doesn't get converted into token on Detach event.
- Certain fields can't render the preview due to JavaScript or other reasons:
  - Embed Google Maps Field module.
  - Video module.
