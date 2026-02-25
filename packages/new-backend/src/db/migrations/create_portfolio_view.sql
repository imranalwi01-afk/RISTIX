
-- Create schema if not exists
CREATE SCHEMA IF NOT EXISTS core;

-- Drop view if exists to update definition
DROP VIEW IF EXISTS core.portfolio_accounts;

-- Create View mapping legacy data to new core structure
CREATE VIEW core.portfolio_accounts AS
SELECT
    m.account_id::text AS account_id,
    m.cif_number AS customer_id,
    'iaf'::text AS tenant_id, -- Default Tenant ID for Legacy Data
    m.cif_name AS customer_name,
    m.prd_type AS product_type,
    m.outstanding AS outstanding_amount,
    m.plafond AS committed_amount,
    m.currency AS currency_code,
    m.start_date AS origination_date,
    m.maturity_date AS maturity_date,
    COALESCE(NULLIF(regexp_replace(m.stage, '[^0-9]', '', 'g'), ''), '1')::integer AS current_stage,
    m.cif_type AS customer_type,
    'Unknown'::text AS industry_sector, -- Placeholder
    m.internal_rating_code AS internal_rating,
    m.ext_rating_code AS external_rating,
    true AS is_active,
    
    -- Islamic Banking Flags
    CASE 
        WHEN m.interest_base = 'SY' THEN true 
        ELSE false 
    END AS is_syariah_compliant,
    
    m.prd_code AS syariah_contract_type,
    m.account_status,
    m.last_payment_date,
    COALESCE(m.dpd, 0) AS days_past_due,
    
    -- Collateral (Mock mapping, ideally join with collateral table)
    0::numeric AS collateral_value,
    'None'::text AS collateral_type

FROM public.frs9_master_account m
WHERE m.prc_date = (SELECT MAX(prc_date) FROM public.frs9_master_account);
