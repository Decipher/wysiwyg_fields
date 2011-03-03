<?php
/**
 * @file
 * Node Reference module integration.
 */

/**
 * Implements hook_wysiwyg_fields_nodeapi_alter() on behalf of
 * nodereference.module.
 *
 * Flush the filter cache of all nodes referencing this node.
 */
function nodereference_wysiwyg_fields_nodeapi_alter($node, $op, $a3 = NULL, $a4 = NULL) {
  switch ($op) {
    case 'update':
      foreach (content_fields() as $field) {
        if ($field['type'] == 'nodereference' && isset($field['referenceable_types'][$node->type]) && isset($field['widget']['wysiwyg_fields_status']) && $field['widget']['wysiwyg_fields_status'] == 1) {
          $db_info = content_database_info($field);

          $results = db_query("SELECT nid FROM {{$db_info['table']}} WHERE {$db_info['columns']['nid']['column']} = %d", $node->nid);
          while ($result = db_fetch_object($results)) {
            $referencing_node = node_load($result->nid);
            filter_wysiwyg_fields_nodeapi_alter($referencing_node, $op);
          }
        }
      }
      break;
  }
}
