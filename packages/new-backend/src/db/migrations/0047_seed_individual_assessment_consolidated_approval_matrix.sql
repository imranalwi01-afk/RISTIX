BEGIN;

DO $$
DECLARE
    tenant_record RECORD;
    v_matrix_id UUID;
BEGIN
    FOR tenant_record IN
        SELECT DISTINCT tenant_id AS id
        FROM approval.approval_matrices
        WHERE tenant_id IS NOT NULL
        UNION
        SELECT DISTINCT tenant_id AS id
        FROM approval.approval_requests
        WHERE tenant_id IS NOT NULL
        UNION
        SELECT DISTINCT tenant_id::uuid AS id
        FROM core.users
        WHERE tenant_id IS NOT NULL
          AND tenant_id ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
    LOOP
        SELECT id
        INTO v_matrix_id
        FROM approval.approval_matrices
        WHERE tenant_id = tenant_record.id
          AND lower(entity_type) = 'individual_assessment_consolidated'
        ORDER BY created_at
        LIMIT 1;

        IF v_matrix_id IS NULL THEN
            INSERT INTO approval.approval_matrices (
                tenant_id,
                name,
                description,
                entity_type,
                operation_type,
                auto_approval_rules,
                is_active,
                created_at,
                updated_at
            )
            VALUES (
                tenant_record.id,
                'Individual Assessment Consolidated Approval',
                'Approval workflow for consolidated individual impairment assessment packages',
                'individual_assessment_consolidated',
                'update',
                '{"bypassPermissions":[],"autoApproveImpactLevels":[]}'::jsonb,
                true,
                now(),
                now()
            )
            RETURNING id INTO v_matrix_id;
        ELSE
            UPDATE approval.approval_matrices
            SET
                name = 'Individual Assessment Consolidated Approval',
                description = 'Approval workflow for consolidated individual impairment assessment packages',
                entity_type = 'individual_assessment_consolidated',
                operation_type = 'update',
                auto_approval_rules = '{"bypassPermissions":[],"autoApproveImpactLevels":[]}'::jsonb,
                is_active = true,
                updated_at = now()
            WHERE id = v_matrix_id;
        END IF;

        DELETE FROM approval.approval_levels
        WHERE approval_levels.matrix_id = v_matrix_id;

        INSERT INTO approval.approval_levels (
            matrix_id,
            level,
            name,
            description,
            required_role_codes,
            required_permission_codes,
            role_match_mode,
            permission_match_mode,
            required_count,
            timeout_hours,
            can_delegate,
            created_at
        )
        VALUES
            (
                v_matrix_id,
                1,
                'IFRS Checker Review',
                'First-level review for consolidated individual impairment assessment packages',
                '["CHECKER","IAF_IFRS_MANAGER"]'::jsonb,
                '["approval.requests.approve"]'::jsonb,
                'ANY',
                'ANY',
                1,
                24,
                true,
                now()
            ),
            (
                v_matrix_id,
                2,
                'Risk Final Approval',
                'Final approval for consolidated individual impairment assessment packages',
                '["APPROVER","IAF_BANK_CRO"]'::jsonb,
                '["approval.requests.approve"]'::jsonb,
                'ANY',
                'ANY',
                1,
                24,
                true,
                now()
            );

        UPDATE approval.approval_requests
        SET
            matrix_id = v_matrix_id,
            entity_type = 'individual_assessment_consolidated',
            approvals_required = GREATEST(approvals_required, 2)
        WHERE tenant_id = tenant_record.id
          AND lower(entity_type) = 'individual_assessment_consolidated'
          AND status = 'pending';
    END LOOP;
END
$$;

COMMIT;
