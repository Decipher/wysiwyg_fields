@api @javascript
Feature: Wysiwyg Fields

  Ensure Wysiwyg Fields works as expected.


  Scenario: Upload an Image via Wysiwyg Fields
    Given I am logged in as a user with the "create wysiwyg_fields_test content,use text format wysiwyg_fields_test" permission
    When I am at "node/add/wysiwyg-fields-test"
    And I fill in "title" with "Upload an Image via Wysiwyg Fields"
    And I click "edit-body-und-0-value" CKEditor "wysiwyg_fields-node-wysiwyg_fields_test-wysiwyg_fields_test_image" button
    And I wait for AJAX to finish
    Then I should see an ".cke_dialog #wysiwyg_fields-node-wysiwyg_fields_test-wysiwyg_fields_test_image-inner" element
    And I should see "Image style"
    And I should see "Link image to"
    Then I attach the file "misc/druplicon.png" to "files[wysiwyg_fields_test_image_und_0]"
    And I press "Upload"
    And I wait for AJAX to finish
    Then I should see "druplicon.png"
    Then I click "OK"
    And I wait for AJAX to finish
    And I switch to "edit-body-und-0-value" CKEditor IFrame
    Then the "wysiwyg_fields" element should contain "files/druplicon"
    Then I leave the IFrame
    And I press "Save"
    Then I should see an "#content .field-name-body img" element
    And the "#content .field-name-body img" element content should contain "files/druplicon"
