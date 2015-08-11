<?php

use Drupal\DrupalExtension\Context\RawDrupalContext;
use Behat\Behat\Context\SnippetAcceptingContext;
use Behat\Testwork\Hook\Scope\BeforeSuiteScope;

/**
 * Defines application features from the specific context.
 */
class WysiwygFieldsFeatureContext extends RawDrupalContext implements SnippetAcceptingContext {
  /**
   * @BeforeSuite
   */
  public static function setup() {
    module_enable(array('wysiwyg_fields_test'));
    drupal_flush_all_caches();
  }

  /**
   * @AfterSuite
   */
  public static function tearDown() {
    module_disable(array('wysiwyg_fields_test'));
    drupal_uninstall_modules(array('wysiwyg_fields_test'));
  }

  /**
   * @param $field
   * @param $button
   *
   * @When I click :field CKEditor :button button
   *
   * @Todo Make arguments more human readable.
   */
  public function ckeditorButton($field, $button) {
    $this->getSession()
      ->wait(5000, "jQuery('#cke_{$field} .cke_button__{$button}').length > 0");
    $this->getSession()
      ->getPage()
      ->find('css', "#cke_{$field} .cke_button__{$button}")
      ->click();
  }

  /**
   * @param $field
   *
   * @Then I switch to :field CKEditor IFrame
   */
  public function ckeditorIFrame($field) {
    $session = $this->getSession();
    if (!$session->getPage()
      ->has('css', "iframe[name='cke_iframe_{$field}']")
    ) {
      $this->getSession()
        ->getDriver()
        ->evaluateScript("jQuery('#cke_{$field} iframe').attr('name', 'cke_iframe_{$field}');");
    }
    $this->getSession()->switchToIFrame("cke_iframe_{$field}");
  }

  /**
   * @Then I leave the IFrame
   */
  public function ckeditorIFrameLeave() {
    $this->getSession()->switchToIFrame();
  }

  /**
   * @param $element
   * @param $value
   *
   * @return bool
   * @throws \Behat\Mink\Exception\ElementNotFoundException
   *
   * @Then the :element element content should contain :value
   */
  public function assertElementContentContains($element, $value) {
    $session = $this->assertSession();
    $element = $session->elementExists('css', $element);
    $actual  = $element->getOuterHtml();
    $regex   = '/' . preg_quote($value, '/') . '/ui';

    return (bool) preg_match($regex, $actual);
  }
}
