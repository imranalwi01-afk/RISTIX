-- Seed hierarchical banking permissions (menu-style) + collective CRUD/approval operation codes
-- Idempotent: safe to run multiple times.

INSERT INTO core.permissions (
  code,
  name,
  description,
  resource,
  action,
  module,
  category,
  is_active
)
VALUES
  -- -------------------------------------------------------------------------
  -- Hierarchical menu-style permissions (used by matrix grouping UI)
  -- -------------------------------------------------------------------------
  ('banking.setup.application', 'Application Setup Access', 'Access Application Setup menu', 'setup.application', 'access', 'banking', 'BANKING_SETUP', true),
  ('banking.setup.application.view', 'View Application Setup', 'View Application Setup data', 'setup.application', 'view', 'banking', 'BANKING_SETUP', true),
  ('banking.setup.application.create', 'Create Application Setup', 'Create Application Setup records', 'setup.application', 'create', 'banking', 'BANKING_SETUP', true),
  ('banking.setup.application.update', 'Update Application Setup', 'Update Application Setup records', 'setup.application', 'update', 'banking', 'BANKING_SETUP', true),
  ('banking.setup.application.delete', 'Delete Application Setup', 'Delete Application Setup records', 'setup.application', 'delete', 'banking', 'BANKING_SETUP', true),

  ('banking.setup.business', 'Business Setup Access', 'Access Business Setup menu', 'setup.business', 'access', 'banking', 'BANKING_SETUP', true),
  ('banking.setup.business.view', 'View Business Setup', 'View Business Setup data', 'setup.business', 'view', 'banking', 'BANKING_SETUP', true),
  ('banking.setup.business.create', 'Create Business Setup', 'Create Business Setup records', 'setup.business', 'create', 'banking', 'BANKING_SETUP', true),
  ('banking.setup.business.update', 'Update Business Setup', 'Update Business Setup records', 'setup.business', 'update', 'banking', 'BANKING_SETUP', true),
  ('banking.setup.business.delete', 'Delete Business Setup', 'Delete Business Setup records', 'setup.business', 'delete', 'banking', 'BANKING_SETUP', true),

  ('banking.parameter', 'Parameter Access', 'Access Parameter menu', 'parameter', 'access', 'banking', 'BANKING_PARAMETER', true),
  ('banking.parameter.view', 'View Parameters', 'View parameter data', 'parameter', 'view', 'banking', 'BANKING_PARAMETER', true),
  ('banking.parameter.create', 'Create Parameters', 'Create parameter records', 'parameter', 'create', 'banking', 'BANKING_PARAMETER', true),
  ('banking.parameter.update', 'Update Parameters', 'Update parameter records', 'parameter', 'update', 'banking', 'BANKING_PARAMETER', true),
  ('banking.parameter.delete', 'Delete Parameters', 'Delete parameter records', 'parameter', 'delete', 'banking', 'BANKING_PARAMETER', true),

  ('banking.parameter.product', 'Product Parameter Access', 'Access Product Parameter menu', 'parameter.product', 'access', 'banking', 'BANKING_PARAMETER', true),
  ('banking.parameter.product.view', 'View Product Parameters', 'View Product Parameter data', 'parameter.product', 'view', 'banking', 'BANKING_PARAMETER', true),
  ('banking.parameter.product.create', 'Create Product Parameters', 'Create Product Parameter records', 'parameter.product', 'create', 'banking', 'BANKING_PARAMETER', true),
  ('banking.parameter.product.update', 'Update Product Parameters', 'Update Product Parameter records', 'parameter.product', 'update', 'banking', 'BANKING_PARAMETER', true),
  ('banking.parameter.product.delete', 'Delete Product Parameters', 'Delete Product Parameter records', 'parameter.product', 'delete', 'banking', 'BANKING_PARAMETER', true),

  ('banking.parameter.journal', 'Journal Parameter Access', 'Access Journal Parameter menu', 'parameter.journal', 'access', 'banking', 'BANKING_PARAMETER', true),
  ('banking.parameter.journal.view', 'View Journal Parameters', 'View Journal Parameter data', 'parameter.journal', 'view', 'banking', 'BANKING_PARAMETER', true),
  ('banking.parameter.journal.create', 'Create Journal Parameters', 'Create Journal Parameter records', 'parameter.journal', 'create', 'banking', 'BANKING_PARAMETER', true),
  ('banking.parameter.journal.update', 'Update Journal Parameters', 'Update Journal Parameter records', 'parameter.journal', 'update', 'banking', 'BANKING_PARAMETER', true),
  ('banking.parameter.journal.delete', 'Delete Journal Parameters', 'Delete Journal Parameter records', 'parameter.journal', 'delete', 'banking', 'BANKING_PARAMETER', true),

  ('banking.parameter.segmentation', 'Segmentation Parameter Access', 'Access Segmentation menu', 'parameter.segmentation', 'access', 'banking', 'BANKING_PARAMETER', true),
  ('banking.parameter.segmentation.view', 'View Segmentation Parameters', 'View Segmentation parameter data', 'parameter.segmentation', 'view', 'banking', 'BANKING_PARAMETER', true),
  ('banking.parameter.segmentation.create', 'Create Segmentation Parameters', 'Create Segmentation parameter records', 'parameter.segmentation', 'create', 'banking', 'BANKING_PARAMETER', true),
  ('banking.parameter.segmentation.update', 'Update Segmentation Parameters', 'Update Segmentation parameter records', 'parameter.segmentation', 'update', 'banking', 'BANKING_PARAMETER', true),
  ('banking.parameter.segmentation.delete', 'Delete Segmentation Parameters', 'Delete Segmentation parameter records', 'parameter.segmentation', 'delete', 'banking', 'BANKING_PARAMETER', true),

  ('banking.collective.rule_base', 'Collective Rule Base Access', 'Access Collective Rule Base menu', 'collective.rule_base', 'access', 'banking', 'BANKING_COLLECTIVE', true),
  ('banking.collective.rule_base.view', 'View Collective Rule Base', 'View Collective Rule Base data', 'collective.rule_base', 'view', 'banking', 'BANKING_COLLECTIVE', true),
  ('banking.collective.rule_base.create', 'Create Collective Rule Base', 'Create Collective Rule Base records', 'collective.rule_base', 'create', 'banking', 'BANKING_COLLECTIVE', true),
  ('banking.collective.rule_base.update', 'Update Collective Rule Base', 'Update Collective Rule Base records', 'collective.rule_base', 'update', 'banking', 'BANKING_COLLECTIVE', true),
  ('banking.collective.rule_base.delete', 'Delete Collective Rule Base', 'Delete Collective Rule Base records', 'collective.rule_base', 'delete', 'banking', 'BANKING_COLLECTIVE', true),

  ('banking.collective.bucket', 'Collective Bucket Access', 'Access Collective Bucket menu', 'collective.bucket', 'access', 'banking', 'BANKING_COLLECTIVE', true),
  ('banking.collective.bucket.view', 'View Collective Bucket', 'View Collective Bucket data', 'collective.bucket', 'view', 'banking', 'BANKING_COLLECTIVE', true),
  ('banking.collective.bucket.create', 'Create Collective Bucket', 'Create Collective Bucket records', 'collective.bucket', 'create', 'banking', 'BANKING_COLLECTIVE', true),
  ('banking.collective.bucket.update', 'Update Collective Bucket', 'Update Collective Bucket records', 'collective.bucket', 'update', 'banking', 'BANKING_COLLECTIVE', true),
  ('banking.collective.bucket.delete', 'Delete Collective Bucket', 'Delete Collective Bucket records', 'collective.bucket', 'delete', 'banking', 'BANKING_COLLECTIVE', true),

  ('banking.collective.pd', 'Collective PD Access', 'Access Collective PD Configuration menu', 'collective.pd', 'access', 'banking', 'BANKING_COLLECTIVE', true),
  ('banking.collective.pd.view', 'View Collective PD', 'View Collective PD Configuration data', 'collective.pd', 'view', 'banking', 'BANKING_COLLECTIVE', true),
  ('banking.collective.pd.create', 'Create Collective PD', 'Create Collective PD Configuration records', 'collective.pd', 'create', 'banking', 'BANKING_COLLECTIVE', true),
  ('banking.collective.pd.update', 'Update Collective PD', 'Update Collective PD Configuration records', 'collective.pd', 'update', 'banking', 'BANKING_COLLECTIVE', true),
  ('banking.collective.pd.delete', 'Delete Collective PD', 'Delete Collective PD Configuration records', 'collective.pd', 'delete', 'banking', 'BANKING_COLLECTIVE', true),

  ('banking.collective.lgd', 'Collective LGD Access', 'Access Collective LGD Configuration menu', 'collective.lgd', 'access', 'banking', 'BANKING_COLLECTIVE', true),
  ('banking.collective.lgd.view', 'View Collective LGD', 'View Collective LGD Configuration data', 'collective.lgd', 'view', 'banking', 'BANKING_COLLECTIVE', true),
  ('banking.collective.lgd.create', 'Create Collective LGD', 'Create Collective LGD Configuration records', 'collective.lgd', 'create', 'banking', 'BANKING_COLLECTIVE', true),
  ('banking.collective.lgd.update', 'Update Collective LGD', 'Update Collective LGD Configuration records', 'collective.lgd', 'update', 'banking', 'BANKING_COLLECTIVE', true),
  ('banking.collective.lgd.delete', 'Delete Collective LGD', 'Delete Collective LGD Configuration records', 'collective.lgd', 'delete', 'banking', 'BANKING_COLLECTIVE', true),

  ('banking.collective.ead', 'Collective EAD Access', 'Access Collective EAD Configuration menu', 'collective.ead', 'access', 'banking', 'BANKING_COLLECTIVE', true),
  ('banking.collective.ead.view', 'View Collective EAD', 'View Collective EAD Configuration data', 'collective.ead', 'view', 'banking', 'BANKING_COLLECTIVE', true),
  ('banking.collective.ead.create', 'Create Collective EAD', 'Create Collective EAD Configuration records', 'collective.ead', 'create', 'banking', 'BANKING_COLLECTIVE', true),
  ('banking.collective.ead.update', 'Update Collective EAD', 'Update Collective EAD Configuration records', 'collective.ead', 'update', 'banking', 'BANKING_COLLECTIVE', true),
  ('banking.collective.ead.delete', 'Delete Collective EAD', 'Delete Collective EAD Configuration records', 'collective.ead', 'delete', 'banking', 'BANKING_COLLECTIVE', true),

  ('banking.collective.ecl', 'Collective ECL Access', 'Access Collective ECL Configuration menu', 'collective.ecl', 'access', 'banking', 'BANKING_COLLECTIVE', true),
  ('banking.collective.ecl.view', 'View Collective ECL', 'View Collective ECL Configuration data', 'collective.ecl', 'view', 'banking', 'BANKING_COLLECTIVE', true),
  ('banking.collective.ecl.create', 'Create Collective ECL', 'Create Collective ECL Configuration records', 'collective.ecl', 'create', 'banking', 'BANKING_COLLECTIVE', true),
  ('banking.collective.ecl.update', 'Update Collective ECL', 'Update Collective ECL Configuration records', 'collective.ecl', 'update', 'banking', 'BANKING_COLLECTIVE', true),
  ('banking.collective.ecl.delete', 'Delete Collective ECL', 'Delete Collective ECL Configuration records', 'collective.ecl', 'delete', 'banking', 'BANKING_COLLECTIVE', true),

  ('banking.collective.fl_scalar', 'Collective FL Scalar Access', 'Access Collective Forward-Looking Scalar menu', 'collective.fl_scalar', 'access', 'banking', 'BANKING_COLLECTIVE', true),
  ('banking.collective.fl_scalar.view', 'View Collective FL Scalar', 'View Collective FL Scalar data', 'collective.fl_scalar', 'view', 'banking', 'BANKING_COLLECTIVE', true),
  ('banking.collective.fl_scalar.create', 'Create Collective FL Scalar', 'Create Collective FL Scalar records', 'collective.fl_scalar', 'create', 'banking', 'BANKING_COLLECTIVE', true),
  ('banking.collective.fl_scalar.update', 'Update Collective FL Scalar', 'Update Collective FL Scalar records', 'collective.fl_scalar', 'update', 'banking', 'BANKING_COLLECTIVE', true),
  ('banking.collective.fl_scalar.delete', 'Delete Collective FL Scalar', 'Delete Collective FL Scalar records', 'collective.fl_scalar', 'delete', 'banking', 'BANKING_COLLECTIVE', true),

  -- -------------------------------------------------------------------------
  -- Approval operation permissions for collective/parameter entities
  -- -------------------------------------------------------------------------
  ('approval.product_parameter.create', 'Approve Product Parameter Creation', 'Approve create operation for product parameters', 'product_parameter', 'approve_create', 'core', 'approval', true),
  ('approval.product_parameter.update', 'Approve Product Parameter Updates', 'Approve update operation for product parameters', 'product_parameter', 'approve_update', 'core', 'approval', true),
  ('approval.product_parameter.delete', 'Approve Product Parameter Deletion', 'Approve delete operation for product parameters', 'product_parameter', 'approve_delete', 'core', 'approval', true),

  ('approval.journal_parameter.create', 'Approve Journal Parameter Creation', 'Approve create operation for journal parameters', 'journal_parameter', 'approve_create', 'core', 'approval', true),
  ('approval.journal_parameter.update', 'Approve Journal Parameter Updates', 'Approve update operation for journal parameters', 'journal_parameter', 'approve_update', 'core', 'approval', true),
  ('approval.journal_parameter.delete', 'Approve Journal Parameter Deletion', 'Approve delete operation for journal parameters', 'journal_parameter', 'approve_delete', 'core', 'approval', true),

  ('approval.segmentation.create', 'Approve Segmentation Creation', 'Approve create operation for segmentation', 'segmentation', 'approve_create', 'core', 'approval', true),
  ('approval.segmentation.update', 'Approve Segmentation Updates', 'Approve update operation for segmentation', 'segmentation', 'approve_update', 'core', 'approval', true),
  ('approval.segmentation.delete', 'Approve Segmentation Deletion', 'Approve delete operation for segmentation', 'segmentation', 'approve_delete', 'core', 'approval', true),

  ('approval.rule_base_setting.create', 'Approve Rule Base Setting Creation', 'Approve create operation for rule base settings', 'rule_base_setting', 'approve_create', 'core', 'approval', true),
  ('approval.rule_base_setting.update', 'Approve Rule Base Setting Updates', 'Approve update operation for rule base settings', 'rule_base_setting', 'approve_update', 'core', 'approval', true),
  ('approval.rule_base_setting.delete', 'Approve Rule Base Setting Deletion', 'Approve delete operation for rule base settings', 'rule_base_setting', 'approve_delete', 'core', 'approval', true),

  ('approval.bucket_parameter.create', 'Approve Bucket Parameter Creation', 'Approve create operation for bucket parameters', 'bucket_parameter', 'approve_create', 'core', 'approval', true),
  ('approval.bucket_parameter.update', 'Approve Bucket Parameter Updates', 'Approve update operation for bucket parameters', 'bucket_parameter', 'approve_update', 'core', 'approval', true),
  ('approval.bucket_parameter.delete', 'Approve Bucket Parameter Deletion', 'Approve delete operation for bucket parameters', 'bucket_parameter', 'approve_delete', 'core', 'approval', true),

  ('approval.pd_configuration.create', 'Approve PD Configuration Creation', 'Approve create operation for PD configurations', 'pd_configuration', 'approve_create', 'core', 'approval', true),
  ('approval.pd_configuration.update', 'Approve PD Configuration Updates', 'Approve update operation for PD configurations', 'pd_configuration', 'approve_update', 'core', 'approval', true),
  ('approval.pd_configuration.delete', 'Approve PD Configuration Deletion', 'Approve delete operation for PD configurations', 'pd_configuration', 'approve_delete', 'core', 'approval', true),

  ('approval.lgd_configuration.create', 'Approve LGD Configuration Creation', 'Approve create operation for LGD configurations', 'lgd_configuration', 'approve_create', 'core', 'approval', true),
  ('approval.lgd_configuration.update', 'Approve LGD Configuration Updates', 'Approve update operation for LGD configurations', 'lgd_configuration', 'approve_update', 'core', 'approval', true),
  ('approval.lgd_configuration.delete', 'Approve LGD Configuration Deletion', 'Approve delete operation for LGD configurations', 'lgd_configuration', 'approve_delete', 'core', 'approval', true),

  ('approval.ead_configuration.create', 'Approve EAD Configuration Creation', 'Approve create operation for EAD configurations', 'ead_configuration', 'approve_create', 'core', 'approval', true),
  ('approval.ead_configuration.update', 'Approve EAD Configuration Updates', 'Approve update operation for EAD configurations', 'ead_configuration', 'approve_update', 'core', 'approval', true),
  ('approval.ead_configuration.delete', 'Approve EAD Configuration Deletion', 'Approve delete operation for EAD configurations', 'ead_configuration', 'approve_delete', 'core', 'approval', true),

  ('approval.ecl_configuration.create', 'Approve ECL Configuration Creation', 'Approve create operation for ECL configurations', 'ecl_configuration', 'approve_create', 'core', 'approval', true),
  ('approval.ecl_configuration.update', 'Approve ECL Configuration Updates', 'Approve update operation for ECL configurations', 'ecl_configuration', 'approve_update', 'core', 'approval', true),
  ('approval.ecl_configuration.delete', 'Approve ECL Configuration Deletion', 'Approve delete operation for ECL configurations', 'ecl_configuration', 'approve_delete', 'core', 'approval', true),

  ('approval.fl_scalar.create', 'Approve FL Scalar Creation', 'Approve create operation for forward-looking scalars', 'fl_scalar', 'approve_create', 'core', 'approval', true),
  ('approval.fl_scalar.update', 'Approve FL Scalar Updates', 'Approve update operation for forward-looking scalars', 'fl_scalar', 'approve_update', 'core', 'approval', true),
  ('approval.fl_scalar.delete', 'Approve FL Scalar Deletion', 'Approve delete operation for forward-looking scalars', 'fl_scalar', 'approve_delete', 'core', 'approval', true)
ON CONFLICT (code) DO UPDATE
SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  resource = EXCLUDED.resource,
  action = EXCLUDED.action,
  module = EXCLUDED.module,
  category = EXCLUDED.category,
  is_active = EXCLUDED.is_active;
