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
('a24af6d2-3032-4d53-ae82-9cfa84f97a20', 'Default Rule', 'DEFAULT', 'FRS9_MASTER_ACCOUNT', 'DEFAULT_FLAG', '1', 1, true, 'Default rule for flagging accounts'),

-- DEFAULT-RULE01 (Inactive)
('a24af6d2-3032-4d53-ae82-9cfa84f97a20', 'DEFAULT-RULE01', 'DEFAULT', 'FRS9_MASTER_ACCOUNT', 'DEFAULT_FLAG', '1', 1, false, 'Alternative default rule'),

-- GL-IMP (Inactive)
('a24af6d2-3032-4d53-ae82-9cfa84f97a20', 'GL-IMP', 'GL', 'FRS9_MASTER_ACCOUNT', 'GL_GROUP', 'GLIMP', 4, false, 'GL impairment grouping rule'),

-- Stage - EIPH (Active)
('a24af6d2-3032-4d53-ae82-9cfa84f97a20', 'Stage - EIPH', 'STAGE', 'FRS9_MASTER_ACCOUNT', 'STAGE', 'Stage Rule', 1, true, 'IFRS 9 stage classification rule')

ON CONFLICT (tenant_id, rule_name) DO NOTHING;
