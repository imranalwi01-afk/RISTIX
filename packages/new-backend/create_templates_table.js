import pg from 'pg';
const { Client } = pg;

async function main() {
    const client = new Client({
        connectionString: 'postgresql://postgres:postgres@10.8.0.2:5433/ifrspro_platform_admin'
    });
    
    await client.connect();
    console.log('Connected to DB. Creating platform_admin.email_templates table...');
    try {
        await client.query(`
            CREATE TABLE IF NOT EXISTS platform_admin.email_templates (
                id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
                code varchar(100) NOT NULL UNIQUE,
                subject varchar(255) NOT NULL,
                body_html text NOT NULL,
                body_text text NOT NULL,
                available_variables jsonb NOT NULL DEFAULT '[]'::jsonb,
                created_at timestamp with time zone NOT NULL DEFAULT now(),
                updated_at timestamp with time zone NOT NULL DEFAULT now()
            );
        `);
        console.log('Table created successfully.');
        
        console.log('Seeding default templates...');
        await client.query(`
            INSERT INTO platform_admin.email_templates (code, subject, body_html, body_text, available_variables) VALUES 
            ('welcome_email', '🎉 Welcome to IFRS 9 Platform, {{fullName}}', '<p>Hi <strong>{{fullName}}</strong>,</p><p>An administrator has created an account for you on the IFRS 9 Platform.</p><p>Your login credentials are:</p><ul><li>Username: <strong>{{username}}</strong></li><li>Password: <strong>{{password}}</strong></li></ul><p><a href="{{loginUrl}}" style="display:inline-block;padding:10px 20px;background-color:#0055FF;color:#fff;text-decoration:none;border-radius:5px;">Login Now</a></p><p><em>We recommend changing your password after your first login.</em></p>', 'Hi {{fullName}},\n\nAn administrator has created an account for you on the IFRS 9 Platform.\n\nYour login credentials are:\nUsername: {{username}}\nPassword: {{password}}\n\nPlease login at: {{loginUrl}}\n\nWe recommend changing your password after your first login.', '["fullName", "username", "password", "loginUrl"]'),
            ('approval_pending', '⏳ New Approval Request: {{workflowName}}', '<p>Hi <strong>{{approverName}}</strong>,</p><p><strong>{{requesterName}}</strong> has submitted a new approval request for: <strong>{{workflowName}}</strong></p><p><a href="{{approvalUrl}}">Click here to review</a></p>', 'Hi {{approverName}},\n\n{{requesterName}} has submitted a new approval request for: {{workflowName}}.\n\nPlease review and approve/reject at: {{approvalUrl}}', '["approverName", "requesterName", "workflowName", "approvalUrl"]'),
            ('forgot_password', '🔑 Reset Your Password', '<p>Hi <strong>{{userName}}</strong>,</p><p>We received a request to reset your password. Please click the link below to set a new password:</p><p><a href="{{resetUrl}}" style="display:inline-block;padding:10px 20px;background-color:#0055FF;color:#fff;text-decoration:none;border-radius:5px;">Reset Password</a></p><p>If you did not request this, please ignore this email.<br>This link will expire in 30 minutes.</p>', 'Hi {{userName}},\n\nWe received a request to reset your password. Please click the link below to set a new password:\n\n{{resetUrl}}\n\nIf you did not request this, please ignore this email.\nThis link will expire in 30 minutes.', '["userName", "resetUrl"]')
            ON CONFLICT (code) DO NOTHING;
        `);
        console.log('Seeded successfully.');
        
        process.exit(0);
    } catch (e) {
        console.error('Failed to execute query:', e);
        process.exit(1);
    }
}

main();
