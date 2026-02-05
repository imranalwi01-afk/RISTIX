import { Command } from 'commander';
import { run as checkAdminUser } from './scripts/ops/check-admin-user';
import { run as fixPassword } from './scripts/ops/fix-password';
import { run as checkRemoteUsersColumns } from './scripts/ops/check-remote-users-columns';
import { run as checkTenantUsers } from './scripts/ops/check-tenant-users';
import { run as fixTenantUsers } from './scripts/ops/fix-tenant-users';

import { run as checkSearchPath } from './scripts/ops/check-search-path';
import { run as createDummyJob } from './scripts/ops/create-dummy-job';

import { run as debugDbTables } from './scripts/ops/debug-db-tables';
import { run as debugDrizzleSchema } from './scripts/ops/debug-drizzle-schema';
import { run as findAdminUser } from './scripts/ops/find-admin-user';
import { run as fixAndVerify } from './scripts/ops/fix-and-verify';

import { run as fixDbSchema } from './scripts/ops/fix-db-schema';
import { run as fixPlatformUsers } from './scripts/ops/fix-platform-users-v2';
import { run as fixRemoteSchema } from './scripts/ops/fix-remote-schema';
import { run as getPasswordHash } from './scripts/ops/get-password-hash';

import { run as inspectCoreUsers } from './scripts/ops/inspect-core-users';
import { run as inspectDbSchema } from './scripts/ops/inspect-db-schema';
import { run as inspectPlatformUsers } from './scripts/ops/inspect-platform-users';
import { run as listTenantCoreTables } from './scripts/ops/list-tenant-core-tables';
import { run as listTenantRoles } from './scripts/ops/list-tenant-roles';

const program = new Command();

program
    .name('ops')
    .description('IFRS9 Backend Operations CLI')
    .version('1.0.0');

// Users & Auth Commands
program.command('check-admin-user')
    .description('Check if admin user exists in tenant DB')
    .action(checkAdminUser);

program.command('fix-password')
    .description('Reset admin password manually (Platform DB)')
    .action(fixPassword);

program.command('check-remote-users')
    .description('Check users table columns in Platform DB')
    .action(checkRemoteUsersColumns);

program.command('check-tenant-users')
    .description('Check users table columns in Tenant DB')
    .action(checkTenantUsers);

program.command('fix-tenant-users')
    .description('Fix schema and ensure admin user in Tenant DB')
    .action(fixTenantUsers);

// DB Diagnostics
program.command('check-search-path')
    .description('Show current database search_path')
    .action(checkSearchPath);

program.command('debug-db-tables')
    .description('List schemas and tables in Platform Admin DB')
    .action(debugDbTables);

program.command('debug-drizzle-schema')
    .description('Debug Drizzle ORM schema configuration')
    .action(debugDrizzleSchema);

program.command('find-admin-user')
    .description('Search for admin user in Platform DB')
    .action(findAdminUser);

program.command('fix-and-verify')
    .description('Add missing columns (bank_id, banking_access) to Platform DB')
    .action(fixAndVerify);

program.command('fix-db-schema')
    .description('Fix core.users schema (add bank_id, syariah columns)')
    .action(fixDbSchema);

program.command('fix-platform-users')
    .description('Sync platform_admin.platform_users columns and rebuild core.users view')
    .action(fixPlatformUsers);

program.command('fix-remote-schema')
    .description('Add banking_mode to tenants and fix user columns on remote')
    .action(fixRemoteSchema);

program.command('get-password-hash')
    .description('Retrieve admin password hash')
    .action(getPasswordHash);

program.command('inspect-core-users')
    .description('Inspect core.users view/table definition (Platform DB)')
    .action(inspectCoreUsers);

program.command('inspect-db-schema')
    .description('Inspect columns of core.users and core.tenants')
    .action(inspectDbSchema);

program.command('inspect-platform-users')
    .description('Inspect columns of platform_admin.platform_users')
    .action(inspectPlatformUsers);

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

program.parse();
