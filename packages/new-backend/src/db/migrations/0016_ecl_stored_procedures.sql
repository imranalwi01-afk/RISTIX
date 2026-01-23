-- Stored Procedure: Calculate Expected Credit Loss (IFRS 9)
-- Purpose: Run ECL calculations triggered by approval workflow
-- Called from: Bull job queue when approval completes
-- Schema: ecl (new schema for ECL-specific tables)

BEGIN;

-- Create ECL schema if not exists
CREATE SCHEMA IF NOT EXISTS ecl;

-- Table: ECL staging/calculation results
CREATE TABLE IF NOT EXISTS ecl.ecl_calculations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES core.tenants(id) ON DELETE CASCADE,
    entity_id UUID NOT NULL, -- loan, counterparty, portfolio ID
    entity_type VARCHAR(50) NOT NULL, -- 'LOAN', 'PORTFOLIO', 'EXPOSURE'
    
    -- ECL inputs
    principal_amount NUMERIC(18,2) NOT NULL,
    pd_stage_1 NUMERIC(5,4), -- Probability of Default (Stage 1)
    pd_stage_2 NUMERIC(5,4), -- Stage 2
    pd_stage_3 NUMERIC(5,4), -- Stage 3 (default)
    lgd NUMERIC(5,4), -- Loss Given Default
    
    -- ECL outputs
    ecl_stage_1 NUMERIC(18,2),
    ecl_stage_2 NUMERIC(18,2),
    ecl_stage_3 NUMERIC(18,2),
    total_ecl NUMERIC(18,2),
    ecl_percentage NUMERIC(5,4),
    
    -- Compliance flags
    passes_ifrs9_check BOOLEAN,
    audit_notes TEXT,
    
    -- Timestamps
    calculation_date TIMESTAMPTZ NOT NULL DEFAULT now(),
    approved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_ecl_calculations_tenant ON ecl.ecl_calculations(tenant_id);
CREATE INDEX idx_ecl_calculations_entity ON ecl.ecl_calculations(entity_type, entity_id);
CREATE INDEX idx_ecl_calculations_date ON ecl.ecl_calculations(calculation_date);

COMMENT ON TABLE ecl.ecl_calculations IS 'IFRS 9 Expected Credit Loss calculations and results';

-- Stored Procedure: calculate_expected_credit_loss
-- Executes ECL formula and validates against IFRS 9 rules
-- Returns: JSON with ECL breakdown and compliance status
CREATE OR REPLACE FUNCTION ecl.calculate_expected_credit_loss(
    p_entity_id UUID,
    p_entity_type VARCHAR(50),
    p_tenant_id UUID,
    p_principal NUMERIC,
    p_pd_s1 NUMERIC DEFAULT 0.02,
    p_pd_s2 NUMERIC DEFAULT 0.05,
    p_pd_s3 NUMERIC DEFAULT 0.50,
    p_lgd NUMERIC DEFAULT 0.45,
    p_ef NUMERIC DEFAULT 1.0 -- effective factor for adjustments
)
RETURNS jsonb
LANGUAGE plpgsql
AS $$
DECLARE
    v_ecl_s1 NUMERIC;
    v_ecl_s2 NUMERIC;
    v_ecl_s3 NUMERIC;
    v_total_ecl NUMERIC;
    v_ecl_pct NUMERIC;
    v_passes_check BOOLEAN;
    v_audit_notes TEXT;
    v_result JSONB;
BEGIN
    -- Validate inputs
    IF p_principal <= 0 OR p_tenant_id IS NULL THEN
        RAISE EXCEPTION 'Invalid input: principal must be positive and tenant_id required';
    END IF;

    -- Stage 1 ECL: 12-month PD
    v_ecl_s1 := p_principal * p_pd_s1 * p_lgd * p_ef;

    -- Stage 2 ECL: Lifetime PD (no default yet but elevated risk)
    v_ecl_s2 := p_principal * p_pd_s2 * p_lgd * p_ef;

    -- Stage 3 ECL: Lifetime PD (in default)
    v_ecl_s3 := p_principal * p_pd_s3 * p_lgd * p_ef;

    -- Total ECL (typically Stage 1 for performing, Stage 2/3 for non-performing)
    -- Simplified: assume Stage 1 for now (production would use actual staging)
    v_total_ecl := v_ecl_s1;
    v_ecl_pct := (v_total_ecl / p_principal) * 100;

    -- Compliance check: ECL should not exceed LGD * principal
    v_passes_check := v_total_ecl <= (p_principal * p_lgd);

    -- Audit notes
    v_audit_notes := CASE 
        WHEN v_ecl_pct > 10 THEN 'High ECL ratio (' || ROUND(v_ecl_pct, 2) || '%) - requires review'
        WHEN v_ecl_pct > 5 THEN 'Medium ECL ratio (' || ROUND(v_ecl_pct, 2) || '%)'
        ELSE 'Normal ECL ratio (' || ROUND(v_ecl_pct, 2) || '%)'
    END;

    -- Insert calculation result
    INSERT INTO ecl.ecl_calculations (
        tenant_id, entity_id, entity_type, principal_amount,
        pd_stage_1, pd_stage_2, pd_stage_3, lgd,
        ecl_stage_1, ecl_stage_2, ecl_stage_3, total_ecl, ecl_percentage,
        passes_ifrs9_check, audit_notes
    ) VALUES (
        p_tenant_id, p_entity_id, p_entity_type, p_principal,
        p_pd_s1, p_pd_s2, p_pd_s3, p_lgd,
        v_ecl_s1, v_ecl_s2, v_ecl_s3, v_total_ecl, v_ecl_pct,
        v_passes_check, v_audit_notes
    );

    -- Build result JSON
    v_result := jsonb_build_object(
        'entity_id', p_entity_id,
        'entity_type', p_entity_type,
        'principal', p_principal,
        'ecl', jsonb_build_object(
            'stage_1', v_ecl_s1,
            'stage_2', v_ecl_s2,
            'stage_3', v_ecl_s3,
            'total', v_total_ecl,
            'percentage', ROUND(v_ecl_pct::numeric, 4)
        ),
        'pd', jsonb_build_object(
            'stage_1', p_pd_s1,
            'stage_2', p_pd_s2,
            'stage_3', p_pd_s3
        ),
        'lgd', p_lgd,
        'compliance', jsonb_build_object(
            'passes_ifrs9', v_passes_check,
            'audit_notes', v_audit_notes
        ),
        'calculated_at', now()
    );

    RETURN v_result;

EXCEPTION WHEN OTHERS THEN
    -- Log error and re-raise
    RAISE NOTICE 'ECL calculation error: %', SQLERRM;
    RAISE;
END;
$$;

COMMENT ON FUNCTION ecl.calculate_expected_credit_loss IS 
'Calculate IFRS 9 Expected Credit Loss for a given entity (loan, counterparty, etc.). Returns JSON with ECL breakdown, compliance status, and audit trail.';

-- Stored Procedure: get_latest_ecl
-- Retrieve most recent ECL calculation for an entity
CREATE OR REPLACE FUNCTION ecl.get_latest_ecl(
    p_entity_id UUID,
    p_entity_type VARCHAR(50),
    p_tenant_id UUID
)
RETURNS jsonb
LANGUAGE plpgsql
AS $$
DECLARE
    v_result JSONB;
BEGIN
    SELECT jsonb_build_object(
        'id', id,
        'entity_id', entity_id,
        'entity_type', entity_type,
        'principal', principal_amount,
        'total_ecl', total_ecl,
        'ecl_percentage', ecl_percentage,
        'passes_ifrs9', passes_ifrs9_check,
        'calculation_date', calculation_date,
        'audit_notes', audit_notes
    )
    INTO v_result
    FROM ecl.ecl_calculations
    WHERE entity_id = p_entity_id
        AND entity_type = p_entity_type
        AND tenant_id = p_tenant_id
    ORDER BY calculation_date DESC
    LIMIT 1;

    RETURN COALESCE(v_result, jsonb_build_object('error', 'No ECL calculation found'));
END;
$$;

COMMENT ON FUNCTION ecl.get_latest_ecl IS 'Retrieve the most recent ECL calculation for a given entity.';

COMMIT;
