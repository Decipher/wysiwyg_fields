<?php
/**
 * @file
 * Node Reference module integration.
 */

/**
 * Implements hook_wysiwyg_fields_entity_update_alter() on behalf of
 * node_reference.module.
 *
 * Flush the field cache of all fields referencing this node.
 */
function node_reference_wysiwyg_fields_entity_update_alter($entity, $type) {
  if ($type == 'node') {
    $node = $entity;
    foreach (field_info_fields() as $field) {
      if ($field['type'] == 'node_reference' && isset($field['settings']['referenceable_types'][$node->type])) {
        foreach ($field['bundles'] as $entity_type => $bundles) {
          foreach ($bundles as $bundle_name) {
            $instance = field_info_instance($entity_type, $field['field_name'], $bundle_name);
            if (isset($instance['settings']['wysiwyg_fields']) && $instance['settings']['wysiwyg_fields']['status']) {
              $query = new EntityFieldQuery();
              $query->entityCondition('entity_type', $entity_type)
                ->entityCondition('bundle', $bundle_name)
                ->fieldCondition($field['field_name'], 'nid', $node->nid);
              $result = $query->execute();
              if (!empty($result)) {
                foreach (array_keys($result[$entity_type]) as $nid) {
                  cache_clear_all("field:{$entity_type}:{$nid}", 'cache_field');
                }
              }
            }
          }
        }
      }
    }
  }
}
