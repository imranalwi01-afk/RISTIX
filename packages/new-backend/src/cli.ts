import { Command } from 'commander';
import { run as checkTenantUsers } from './scripts/ops/check-tenant-users';
import { run as checkSearchPath } from './scripts/ops/check-search-path';
import { run as createDummyJob } from './scripts/ops/create-dummy-job';
import { run as debugDrizzleSchema } from './scripts/ops/debug-drizzle-schema';
import { run as fixPlatformUsers } from './scripts/ops/fix-platform-users-v2';
import { run as getPasswordHash } from './scripts/ops/get-password-hash';
import { run as inspectPlatformUsers } from './scripts/ops/inspect-platform-users';
import { run as listTenantCoreTables } from './scripts/ops/list-tenant-core-tables';
import { run as listTenantRoles } from './scripts/ops/list-tenant-roles';
import { run as createIafAdmin } from './scripts/ops/create-iaf-admin';
import { run as createPlatformAdmin } from './scripts/ops/create-platform-admin';
import { run as syncPermissions } from './scripts/ops/sync-permissions';
import { run as setupTenantUsers } from './scripts/ops/setup-tenant-users';
import { seedApprovalMatrices, assignApprovalPermissionsToRoles } from './scripts/../db/seeds/seed-approval-matrices';
import { run as resetPassword } from './scripts/ops/reset-password';

const program = new Command();

program
    .name('ops')
    .description('IFRS9 Backend Operations CLI')
    .version('1.0.0');

// Users & Auth Commands
program.command('check-tenant-users')
    .description('Check users table columns in Tenant DB')
    .action(checkTenantUsers);

program.command('fix-platform-users')
    .description('Consolidate legacy platform_admin.platform_users into canonical platform_admin.users')
    .action(fixPlatformUsers);

program.command('get-password-hash')
    .description('Retrieve admin password hash')
    .action(getPasswordHash);

program.command('inspect-platform-users')
    .description('Inspect platform_admin.users table')
    .action(inspectPlatformUsers);

program.command('reset-password')
    .description('Reset password for Platform Admin or Tenant User')
    .requiredOption('-e, --email <email>', 'User email')
    .requiredOption('-p, --password <password>', 'New plain-text password')
    .option('-t, --tenant-id <tenantId>', 'Tenant ID (if resetting a tenant user)')
    .action(resetPassword);

// DB Diagnostics
program.command('check-search-path')
    .description('Show current database search_path')
    .action(checkSearchPath);

program.command('debug-drizzle-schema')
    .description('Debug Drizzle ORM schema configuration')
    .action(debugDrizzleSchema);

program.command('list-tenant-tables')
    .description('List tables in Tenant DB core schema')
    .action(listTenantCoreTables);

program.command('list-tenant-roles')
    .description('List roles in Tenant DB')
    .action(listTenantRoles);

// Job Verification
program.command('verify-job')
    .description('Run e2e test: create and execute a dummy job via API')
    .action(createDummyJob);

// Admin Setup
program.command('create-iaf-admin')
    .description('Create or reset IAF Tenant Superadmin (iaf tenant)')
    .action(createIafAdmin);

program.command('create-platform-admin')
    .description('Create or reset Platform Superadmin (Cross-tenant)')
    .action(createPlatformAdmin);

program.command('sync-permissions')
    .description('Sync all catalog permissions to DB and assign to role')
    .argument('[role]', 'Role code (default: IAF_TENANT_SUPERADMIN)')
    .argument('[tenantId]', 'Tenant ID (default: IAF tenant)')
    .action(syncPermissions);

program.command('setup-tenant-users')
    .description('Create roles (SUPERADMIN, MAKER, CHECKER, APPROVER) + users for any tenant')
    .argument('<tenantCode>', 'Tenant code (e.g., RISTIX)')
    .argument('[password]', 'Password for all users (default: ChangeMe123!)')
    .action(setupTenantUsers);

program.command('seed-approval-matrices')
    .description('Seed approval matrices + permissions for a tenant (idempotent)')
    .argument('[tenantId]', 'Tenant UUID (default: IAF tenant)')
    .action(async (tenantId?: string) => {
        const tid = tenantId || 'f7b3a087-8a42-40c4-baca-9dc92cc0a2be'
        console.log(`🌱 Seeding approval matrices for tenant: ${tid}`)
        await seedApprovalMatrices(tid)
        await assignApprovalPermissionsToRoles()
        console.log('✅ Done!')
        process.exit(0)
    });

program.parse();

