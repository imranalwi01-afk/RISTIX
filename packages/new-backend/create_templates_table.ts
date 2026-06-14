import { db } from './src/config/database';
import { sql } from 'drizzle-orm';

async function main() {
    console.log('Creating platform_admin.email_templates table...');
    try {
        await db.execute(sql`
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
        process.exit(0);
    } catch (e) {
        console.error('Failed to create table:', e);
        process.exit(1);
    }
}

main();
