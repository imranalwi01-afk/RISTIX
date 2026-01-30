-- SQL setup: Create stored procedure handlers for Bull job callbacks
-- Purpose: Bridge between Bull queue results and workflow DB updates

BEGIN;

-- Stored Procedure: handle_approval_completion
-- Called from Bull job handler after approval action
-- Updates workflow state and logs transition
CREATE OR REPLACE FUNCTION core.handle_approval_completion(
    p_workflow_id UUID,
    p_tenant_id UUID,
    p_action VARCHAR, -- 'APPROVED' or 'REJECTED'
    p_approver_id UUID,
    p_notes TEXT DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
AS $$
DECLARE
    v_workflow core.workflows%ROWTYPE;
    v_new_state VARCHAR;
    v_result JSONB;
BEGIN
    -- Get current workflow
    SELECT * INTO v_workflow FROM core.workflows WHERE id = p_workflow_id AND tenant_id = p_tenant_id;
    
    IF v_workflow.id IS NULL THEN
        RAISE EXCEPTION 'Workflow % not found', p_workflow_id;
    END IF;

    -- Determine new state
    v_new_state := CASE 
        WHEN p_action = 'APPROVED' THEN 'COMPLETED'
        WHEN p_action = 'REJECTED' THEN 'REJECTED'
        ELSE 'IN_PROGRESS'
    END;

    -- Update workflow
    UPDATE core.workflows 
    SET 
        current_state = v_new_state,
        previous_state = v_workflow.current_state,
        completed_at = CASE WHEN v_new_state IN ('COMPLETED', 'REJECTED') THEN now() ELSE NULL END,
        updated_at = now()
    WHERE id = p_workflow_id;

    -- Log transition
    INSERT INTO core.workflow_transitions (
        workflow_id, tenant_id, from_state, to_state, 
        approval_action, triggered_by, triggered_at
    ) VALUES (
        p_workflow_id, p_tenant_id, v_workflow.current_state, v_new_state,
        p_action, p_approver_id, now()
    );

    -- Build result
    v_result := jsonb_build_object(
        'workflow_id', p_workflow_id,
        'old_state', v_workflow.current_state,
        'new_state', v_new_state,
        'action', p_action,
        'updated_at', now()
    );

    RETURN v_result;
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Approval completion handler error: %', SQLERRM;
    RAISE;
END;
$$;

-- Stored Procedure: handle_ecl_job_result
-- Called from Bull ECL job handler
-- Updates workflow and ECL calculation records
CREATE OR REPLACE FUNCTION core.handle_ecl_job_result(
    p_workflow_id UUID,
    p_tenant_id UUID,
    p_job_id UUID,
    p_ecl_result JSONB,
    p_status VARCHAR -- 'COMPLETED' or 'FAILED'
)
RETURNS jsonb
LANGUAGE plpgsql
AS $$
DECLARE
    v_workflow core.workflows%ROWTYPE;
    v_result JSONB;
BEGIN
    -- Get workflow
    SELECT * INTO v_workflow FROM core.workflows WHERE id = p_workflow_id AND tenant_id = p_tenant_id;
    
    IF v_workflow.id IS NULL THEN
        RAISE EXCEPTION 'Workflow % not found', p_workflow_id;
    END IF;

    -- Update workflow job
    UPDATE core.workflow_jobs
    SET 
        status = p_status,
        result = p_ecl_result,
        completed_at = CASE WHEN p_status IN ('COMPLETED', 'FAILED') THEN now() ELSE NULL END,
        updated_at = now()
    WHERE id = p_job_id;

    -- If ECL result successful, update workflow metadata
    IF p_status = 'COMPLETED' AND p_ecl_result IS NOT NULL THEN
        UPDATE core.workflows
        SET 
            metadata = jsonb_set(metadata, '{ecl_result}', p_ecl_result),
            current_state = 'COMPLETED',
            completed_at = now(),
            updated_at = now()
        WHERE id = p_workflow_id;

        -- Log successful ECL calculation
        INSERT INTO core.workflow_transitions (
            workflow_id, tenant_id, from_state, to_state,
            transition_reason, triggered_at
        ) VALUES (
            p_workflow_id, p_tenant_id, v_workflow.current_state, 'COMPLETED',
            'ECL calculation completed successfully', now()
        );
    ELSIF p_status = 'FAILED' THEN
        UPDATE core.workflows
        SET 
            current_state = 'FAILED',
            completed_at = now(),
            updated_at = now()
        WHERE id = p_workflow_id;

        -- Log failure
        INSERT INTO core.workflow_transitions (
            workflow_id, tenant_id, from_state, to_state,
            transition_reason, triggered_at
        ) VALUES (
            p_workflow_id, p_tenant_id, v_workflow.current_state, 'FAILED',
            'ECL calculation job failed', now()
        );
    END IF;

    -- Build result
    v_result := jsonb_build_object(
        'workflow_id', p_workflow_id,
        'job_id', p_job_id,
        'status', p_status,
        'updated_at', now()
    );

    RETURN v_result;
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'ECL job result handler error: %', SQLERRM;
    RAISE;
END;
$$;

COMMENT ON FUNCTION core.handle_approval_completion IS 'Handle approval action completion; update workflow state and log transition';
COMMENT ON FUNCTION core.handle_ecl_job_result IS 'Handle ECL calculation job result; update workflow and job records';

COMMIT;
