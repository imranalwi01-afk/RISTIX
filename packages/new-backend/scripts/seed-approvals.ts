#!/usr/bin/env bun
/**
 * Seed Approval Matrices and Permissions
 * 
 * This script seeds the database with default approval matrices and permissions.
 * Run with: bun run scripts/seed-approvals.ts
 */

import { platformDb, tenantDb } from '../src/config/database'
import { tenants } from '../src/db/schema/platform.schema'
import { seedApprovalMatrices, assignApprovalPermissionsToRoles } from '../src/db/seeds/seed-approval-matrices'

async function getTenantId(): Promise<string> {
    // Query tenants from platform database
    const result = await platformDb.select({ id: tenants.id }).from(tenants).limit(1)
    if (!result || result.length === 0) {
        throw new Error('No tenant found in database. Please create a tenant first.')
    }
    return result[0].id
}

async function main() {
    console.log('🚀 Starting approval workflow seeding...')
    console.log('📊 Database: TENANT database (ifrspro_tenant_iaf)\n')

    try {
        // Get actual tenant ID
        const tenantId = await getTenantId()
        console.log(`Using tenant ID: ${tenantId}\n`)

        // Seed approval matrices and permissions
        await seedApprovalMatrices(tenantId)

        // Assign permissions to roles
        await assignApprovalPermissionsToRoles()

        console.log('\n✅ Approval workflow seeding completed successfully!')
        process.exit(0)
    } catch (error) {
        console.error('\n❌ Seeding failed:', error)
        process.exit(1)
    }
}

main()
