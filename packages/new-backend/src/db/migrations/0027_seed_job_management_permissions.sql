-- Seed canonical job-management permissions (idempotent)
-- Enables granular authorization for job monitoring routes.

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
    ('jobs.view', 'View Jobs', 'View job definitions, executions, and metrics', 'jobs', 'view', 'admin', 'ADMINISTRATION', true),
    ('jobs.create', 'Create Jobs', 'Create new job definitions', 'jobs', 'create', 'admin', 'ADMINISTRATION', true),
    ('jobs.run', 'Run Jobs', 'Trigger on-demand job executions', 'jobs', 'run', 'admin', 'ADMINISTRATION', true),
    ('jobs.control', 'Control Jobs', 'Pause, resume, stop, and toggle job definitions', 'jobs', 'control', 'admin', 'ADMINISTRATION', true),
    ('jobs.approve', 'Approve Jobs', 'Approve or reject pending job executions', 'jobs', 'approve', 'admin', 'ADMINISTRATION', true),
    ('jobs.runtime.view', 'View Job Runtime', 'View runtime diagnostics for active SQL jobs', 'jobs.runtime', 'view', 'admin', 'ADMINISTRATION', true)
ON CONFLICT (code) DO UPDATE
SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    resource = EXCLUDED.resource,
    action = EXCLUDED.action,
    module = EXCLUDED.module,
    category = EXCLUDED.category,
    is_active = EXCLUDED.is_active;
