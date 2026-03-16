-- ============================================================================
-- SEED DATA: RULE BASE SETTING HEADERS
-- ============================================================================
-- Seed initial rule base setting headers for IAF tenant
-- Based on screenshot: Default Rule, DEFAULT-RULE01, GL-IMP, Stage - EIPH
-- ============================================================================

INSERT INTO ifrs9.rule_base_setting_headers (
    tenant_id,
    rule_name,
    rule_type,
    updated_table,
    updated_column,
    value,
    seq,
    active_flag,
    description
) VALUES
-- Default Rule (Active)
('f7b3a087-8a42-40c4-baca-9dc92cc0a2be', 'Default Rule', 'DEFAULT', 'FRS9_MASTER_ACCOUNT', 'DEFAULT_FLAG', '1', 1, true, 'Default rule for flagging accounts'),

-- DEFAULT-RULE01 (Inactive)
('f7b3a087-8a42-40c4-baca-9dc92cc0a2be', 'DEFAULT-RULE01', 'DEFAULT', 'FRS9_MASTER_ACCOUNT', 'DEFAULT_FLAG', '1', 1, false, 'Alternative default rule'),

-- GL-IMP (Inactive)
('f7b3a087-8a42-40c4-baca-9dc92cc0a2be', 'GL-IMP', 'GL', 'FRS9_MASTER_ACCOUNT', 'GL_GROUP', 'GLIMP', 4, false, 'GL impairment grouping rule'),

-- Stage - EIPH (Active)
('f7b3a087-8a42-40c4-baca-9dc92cc0a2be', 'Stage - EIPH', 'STAGE', 'FRS9_MASTER_ACCOUNT', 'STAGE', 'Stage Rule', 1, true, 'IFRS 9 stage classification rule')

ON CONFLICT (tenant_id, rule_name) DO NOTHING;
