BEGIN;

CREATE TABLE IF NOT EXISTS approval.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    approval_request_id UUID REFERENCES approval.approval_requests(id) ON DELETE SET NULL,
    workflow_id VARCHAR(100),
    type VARCHAR(50) NOT NULL,
    severity VARCHAR(20) NOT NULL DEFAULT 'info',
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    action_url VARCHAR(500),
    entity_type VARCHAR(100),
    entity_id VARCHAR(100),
    source VARCHAR(100) NOT NULL DEFAULT 'approval_service',
    triggered_by UUID REFERENCES core.users(id) ON DELETE SET NULL,
    metadata JSONB,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS approval.notification_deliveries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    notification_id UUID NOT NULL REFERENCES approval.notifications(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL,
    recipient_user_id UUID REFERENCES core.users(id) ON DELETE CASCADE,
    recipient_role VARCHAR(100),
    channel VARCHAR(20) NOT NULL DEFAULT 'in_app',
    delivery_status VARCHAR(20) NOT NULL DEFAULT 'sent',
    delivered_at TIMESTAMP DEFAULT NOW(),
    read_at TIMESTAMP,
    error_message TEXT,
    metadata JSONB,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

DO $$
BEGIN
    IF to_regclass('core.tenants') IS NOT NULL THEN
        IF NOT EXISTS (
            SELECT 1
            FROM pg_constraint
            WHERE conname = 'notifications_tenant_fk'
              AND conrelid = 'approval.notifications'::regclass
        ) THEN
            ALTER TABLE approval.notifications
                ADD CONSTRAINT notifications_tenant_fk
                FOREIGN KEY (tenant_id) REFERENCES core.tenants(id);
        END IF;

        IF NOT EXISTS (
            SELECT 1
            FROM pg_constraint
            WHERE conname = 'notification_deliveries_tenant_fk'
              AND conrelid = 'approval.notification_deliveries'::regclass
        ) THEN
            ALTER TABLE approval.notification_deliveries
                ADD CONSTRAINT notification_deliveries_tenant_fk
                FOREIGN KEY (tenant_id) REFERENCES core.tenants(id);
        END IF;
    ELSIF to_regclass('core.tenant_info') IS NOT NULL THEN
        IF NOT EXISTS (
            SELECT 1
            FROM pg_constraint
            WHERE conname = 'notifications_tenant_fk'
              AND conrelid = 'approval.notifications'::regclass
        ) THEN
            ALTER TABLE approval.notifications
                ADD CONSTRAINT notifications_tenant_fk
                FOREIGN KEY (tenant_id) REFERENCES core.tenant_info(id);
        END IF;

        IF NOT EXISTS (
            SELECT 1
            FROM pg_constraint
            WHERE conname = 'notification_deliveries_tenant_fk'
              AND conrelid = 'approval.notification_deliveries'::regclass
        ) THEN
            ALTER TABLE approval.notification_deliveries
                ADD CONSTRAINT notification_deliveries_tenant_fk
                FOREIGN KEY (tenant_id) REFERENCES core.tenant_info(id);
        END IF;
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS notifications_tenant_idx ON approval.notifications(tenant_id);
CREATE INDEX IF NOT EXISTS notifications_type_idx ON approval.notifications(type);
CREATE INDEX IF NOT EXISTS notifications_request_idx ON approval.notifications(approval_request_id);
CREATE INDEX IF NOT EXISTS notifications_created_idx ON approval.notifications(created_at);

CREATE INDEX IF NOT EXISTS notification_deliveries_notification_idx ON approval.notification_deliveries(notification_id);
CREATE INDEX IF NOT EXISTS notification_deliveries_tenant_idx ON approval.notification_deliveries(tenant_id);
CREATE INDEX IF NOT EXISTS notification_deliveries_user_status_idx ON approval.notification_deliveries(recipient_user_id, delivery_status);
CREATE INDEX IF NOT EXISTS notification_deliveries_role_idx ON approval.notification_deliveries(recipient_role);
CREATE INDEX IF NOT EXISTS notification_deliveries_created_idx ON approval.notification_deliveries(created_at);

COMMIT;
