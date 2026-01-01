-- ============================================================================
-- SEED DATA: PD CONFIGURATIONS
-- ============================================================================
-- Seed initial PD configurations for IAF tenant
-- Based on CSV export: 7 PD models
-- ============================================================================

INSERT INTO ifrs9.pd_configurations (
    tenant_id,
    model_name,
    population_segment,
    population_segment_desc,
    selected_method,
    selected_method_desc,
    migration_interval,
    population_type,
    population_type_desc,
    historical_month,
    first_historical_date,
    first_historical_date_string,
    multiplication,
    multiplication_string,
    fl_flag,
    fl_scalar,
    ia_flag,
    bucket,
    bucket_desc,
    is_active,
    seq
) VALUES
-- 1. PD Model All Segment (NOA Migration with Window Moving Period)
('a24af6d2-3032-4d53-ae82-9cfa84f97a20', 'PD Model All Segment', 2, 'PD Lending All Segment', 
 1, 'NOA Migration', 12, 2, 'Window Moving Period', 120, '2017-01-31', '31 Jan 2017', 
 12, '12', true, 'PD Model Scalar', true, 'DPD', 'DPD', true, 1),

-- 2. PD Repo (Proxy PD)
('a24af6d2-3032-4d53-ae82-9cfa84f97a20', 'PD Repo', 14, 'PD Repo', 
 3, 'Proxy PD', 0, NULL, NULL, 0, NULL, NULL, 
 NULL, NULL, false, NULL, false, 'DPD', 'DPD', true, 2),

-- 3. PD Factoring (Proxy PD)
('a24af6d2-3032-4d53-ae82-9cfa84f97a20', 'PD Factoring', 11, 'PD Factoring', 
 3, 'Proxy PD', 0, NULL, NULL, 0, NULL, NULL, 
 NULL, NULL, false, NULL, false, 'DPD', 'DPD', true, 3),

-- 4. PD Treasury Fitch (Proxy PD)
('a24af6d2-3032-4d53-ae82-9cfa84f97a20', 'PD Treasury Fitch', 21, 'PD Treasury Fitch', 
 3, 'Proxy PD', 0, NULL, NULL, 0, NULL, NULL, 
 NULL, NULL, false, NULL, false, 'FITCH', 'Fitch Rating', true, 4),

-- 5. PD Treasury Pefindo (Proxy PD)
('a24af6d2-3032-4d53-ae82-9cfa84f97a20', 'PD Treasury Pefindo', 20, 'PD Treasury Pefindo', 
 3, 'Proxy PD', 0, NULL, NULL, 0, NULL, NULL, 
 NULL, NULL, false, NULL, false, 'PEFINDO', 'Pefindo Rating', true, 5),

-- 6. PD Treasury Moodys (Proxy PD)
('a24af6d2-3032-4d53-ae82-9cfa84f97a20', 'PD Treasury Moodys', 19, 'PD Treasury Moodys', 
 3, 'Proxy PD', 0, NULL, NULL, 0, NULL, NULL, 
 NULL, NULL, false, NULL, false, 'MOODYS', 'Moodys Rating', true, 6),

-- 7. PD Treasury S&P (Proxy PD)
('a24af6d2-3032-4d53-ae82-9cfa84f97a20', 'PD Treasury S&P', 22, 'PD Treasury S&P', 
 3, 'Proxy PD', 0, NULL, NULL, 0, NULL, NULL, 
 NULL, NULL, false, NULL, false, 'S&P', 'S&P Rating', true, 7)

ON CONFLICT (tenant_id, model_name) DO NOTHING;
