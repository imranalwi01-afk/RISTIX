-- ============================================================================
-- Seed default email templates into platform_admin.email_templates
-- ============================================================================

INSERT INTO platform_admin.email_templates (code, subject, body_html, body_text, available_variables) VALUES
('approval_pending', '⏳ New Approval Request: {{workflowName}}', '<p>Hi {{approverName}},</p><p>{{requesterName}} has submitted a new approval request for: <strong>{{workflowName}}</strong>.</p><p>Please review and approve/reject at: <a href="{{approvalUrl}}">{{approvalUrl}}</a></p>', E'Hi {{approverName}},\n\n{{requesterName}} has submitted a new approval request for: {{workflowName}}.\n\nPlease review and approve/reject at: {{approvalUrl}}', '["approverName","requesterName","workflowName","approvalUrl"]')
ON CONFLICT (code) DO UPDATE SET subject = EXCLUDED.subject, body_html = EXCLUDED.body_html, body_text = EXCLUDED.body_text, available_variables = EXCLUDED.available_variables, updated_at = NOW();

INSERT INTO platform_admin.email_templates (code, subject, body_html, body_text, available_variables) VALUES
('approval_approved', '✅ Approval Granted: {{workflowName}}', '<p>Hi {{requesterName}},</p><p>Your approval request has been approved by {{approverName}}.</p><p>Workflow: <strong>{{workflowName}}</strong></p>', E'Hi {{requesterName}},\n\nYour approval request has been approved by {{approverName}}.\n\nWorkflow: {{workflowName}}', '["requesterName","approverName","workflowName"]')
ON CONFLICT (code) DO UPDATE SET subject = EXCLUDED.subject, body_html = EXCLUDED.body_html, body_text = EXCLUDED.body_text, available_variables = EXCLUDED.available_variables, updated_at = NOW();

INSERT INTO platform_admin.email_templates (code, subject, body_html, body_text, available_variables) VALUES
('approval_rejected', '❌ Approval Rejected: {{workflowName}}', '<p>Hi {{requesterName}},</p><p>Your approval request has been rejected by {{approverName}}. Please review feedback and resubmit if needed.</p><p>Workflow: <strong>{{workflowName}}</strong></p>', E'Hi {{requesterName}},\n\nYour approval request has been rejected by {{approverName}}. Please review feedback and resubmit if needed.\n\nWorkflow: {{workflowName}}', '["requesterName","approverName","workflowName"]')
ON CONFLICT (code) DO UPDATE SET subject = EXCLUDED.subject, body_html = EXCLUDED.body_html, body_text = EXCLUDED.body_text, available_variables = EXCLUDED.available_variables, updated_at = NOW();

INSERT INTO platform_admin.email_templates (code, subject, body_html, body_text, available_variables) VALUES
('forgot_password', '🔑 Reset Your Password', '<p>Hi {{userName}},</p><p>We received a request to reset your password. Please click the link below to set a new password:</p><p><a href="{{resetUrl}}">{{resetUrl}}</a></p><p>If you did not request this, please ignore this email.</p><p>This link will expire in 30 minutes.</p>', E'Hi {{userName}},\n\nWe received a request to reset your password. Please click the link below to set a new password:\n\n{{resetUrl}}\n\nIf you did not request this, please ignore this email.\nThis link will expire in 30 minutes.', '["userName","resetUrl"]')
ON CONFLICT (code) DO UPDATE SET subject = EXCLUDED.subject, body_html = EXCLUDED.body_html, body_text = EXCLUDED.body_text, available_variables = EXCLUDED.available_variables, updated_at = NOW();

INSERT INTO platform_admin.email_templates (code, subject, body_html, body_text, available_variables) VALUES
('welcome_email', 'Welcome to IFRS9 Platform', '<p>Hi {{fullName}},</p><p>Your account has been created on the IFRS9 Platform.</p><p><strong>Username:</strong> {{username}}<br/><strong>Password:</strong> {{password}}</p><p>Please login at: <a href="{{loginUrl}}">{{loginUrl}}</a></p><p>We recommend changing your password after your first login.</p>', E'Hi {{fullName}},\n\nYour account has been created on the IFRS9 Platform.\n\nUsername: {{username}}\nPassword: {{password}}\n\nPlease login at: {{loginUrl}}\n\nWe recommend changing your password after your first login.', '["fullName","username","password","loginUrl"]')
ON CONFLICT (code) DO UPDATE SET subject = EXCLUDED.subject, body_html = EXCLUDED.body_html, body_text = EXCLUDED.body_text, available_variables = EXCLUDED.available_variables, updated_at = NOW();
