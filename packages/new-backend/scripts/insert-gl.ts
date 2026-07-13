import { sql } from 'drizzle-orm'
import { platformDb } from '../src/config/database'
import { tenantDb } from '../src/config/database'

async function run() {
    try {
        console.log('Inserting GL Outbound into menu_items...')
        await platformDb.execute(sql`
            INSERT INTO platform_admin.menu_items (id, tenant_id, category_id, name, path, icon, sort_order, level, is_active, is_visible, is_external, banking_type, created_by)
            VALUES ('b1000000-0007-4000-8000-000000000008', 'f7b3a087-8a42-40c4-baca-9dc92cc0a2be', 'a0000000-1000-4000-8000-000000000007', 'GL Outbound', '/banking/ifrs9-reports/gl-outbound', 'TableChart', 8, 0, true, true, false, 'both', '550e8400-1111-2222-3333-444455555201')
            ON CONFLICT (id) DO NOTHING;
        `)
        console.log('Done platformDb.')
    } catch (err) {
        console.error('Error platformDb:', err)
    }

    try {
        console.log('Inserting into tenantDb fallback...')
        await tenantDb.execute(sql`
            INSERT INTO menu.menu_items (id, tenant_id, category_id, name, path, icon, sort_order, level, is_active, is_visible, is_external, banking_type, created_by)
            VALUES ('b1000000-0007-4000-8000-000000000008', 'f7b3a087-8a42-40c4-baca-9dc92cc0a2be', 'a0000000-1000-4000-8000-000000000007', 'GL Outbound', '/banking/ifrs9-reports/gl-outbound', 'TableChart', 8, 0, true, true, false, 'both', '550e8400-1111-2222-3333-444455555201')
            ON CONFLICT (id) DO NOTHING;
        `)
        console.log('Done tenantDb.')
    } catch (err) {
        console.error('Error tenantDb:', err)
    }

    process.exit(0)
}

run()
