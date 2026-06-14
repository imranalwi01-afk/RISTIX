import { describe, expect, test } from 'bun:test'
import { readFile } from 'node:fs/promises'

const routeSource = await readFile(
    new URL('../../routes/menu.routes.ts', import.meta.url),
    'utf8',
)

describe('menu platform database contract', () => {
    test('uses the platform menu schema and a platform database connection', () => {
        expect(routeSource).toContain("from '@/db/schema/menu.schema'")
        expect(routeSource).toContain('const platformDb = getDatabase(null)')
        expect(routeSource).not.toContain('getDatabase(tenantId)')
        expect(routeSource).not.toContain('tenantDb.')
    })

    test('keeps every menu table operation on platformDb', () => {
        const operations = routeSource
            .split('\n')
            .filter((line) => /\.(select|insert|update|delete)\(/.test(line) && /menu(Categories|Items|Permissions)/.test(line))

        expect(operations.length).toBeGreaterThan(0)
        for (const operation of operations) {
            expect(operation).toContain('platformDb.')
        }
    })

    test('tenant-scopes menu mutations and permission deletion', () => {
        expect(routeSource).toContain('eq(menuItems.tenantId, tenantId)')
        expect(routeSource).toContain('eq(menuCategories.tenantId, tenantId)')
        expect(routeSource).toContain('eq(menuPermissions.tenantId, tenantId)')
        expect(routeSource).toContain("auditDelete('menu_permission'")
    })
})
