import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi'
import { Effect, pipe } from 'effect'
import { eq, and, asc } from 'drizzle-orm'
import { getDatabase } from '@/config/database'
import { menuCategories, menuItems, menuPermissions, menuConfigurations, menuAnalytics } from '@/db/schema/menu.schema'
import { authMiddleware } from '@/middleware/auth'
import type { AppContext } from '@/app'
import { runEffect } from '@/lib/effect'
import { buildErrorResponse } from '@/lib/http/error-response'
import { openApiValidationHook } from '@/lib/http/openapi-validation-hook'
import { randomUUID } from 'node:crypto'

const platformDb = getDatabase(null)

export const menuRoutes = new OpenAPIHono<AppContext>({ defaultHook: openApiValidationHook })

// GET /menu/hierarchy - Get full menu tree for a tenant (from platform DB)
menuRoutes.openapi(
    createRoute({
        method: 'get',
        path: '/hierarchy',
        tags: ['Menu'],
        summary: 'Get full menu hierarchy for the current tenant',
        responses: { 200: { description: 'Menu hierarchy' } },
    }),
    async (c) => {
        const queryTenantId = c.req.query('tenantId')
        const tenantId = queryTenantId || c.get('tenantId')
        if (!tenantId) return c.json({ success: false, error: 'No tenant context' }, 400)

        const [categories, items] = await Promise.all([
            platformDb.select().from(menuCategories).where(eq(menuCategories.tenantId, tenantId)).orderBy(asc(menuCategories.sortOrder)),
            platformDb.select().from(menuItems).where(eq(menuItems.tenantId, tenantId)).orderBy(asc(menuItems.sortOrder)),
        ])

        const tree = categories.map((cat) => ({
            ...cat,
            items: items.filter((i) => i.categoryId === cat.id).map((item) => ({
                ...item,
                children: buildItemTree(items, item.id),
            })),
        }))

        return c.json({ success: true, data: tree })
    }
)

// GET /menu - Get user's menu (filtered by roles, from platform DB)
menuRoutes.openapi(
    createRoute({
        method: 'get',
        path: '/',
        tags: ['Menu'],
        summary: 'Get menu for current user filtered by roles',
        responses: { 200: { description: 'User menu' } },
    }),
    async (c) => {
        const queryTenantId = c.req.query('tenantId')
        const tenantId = queryTenantId || c.get('tenantId')
        const userPermissions = c.get('permissions') || []
        if (!tenantId) return c.json({ success: false, error: 'No tenant context' }, 400)

        const [categories, items, perms] = await Promise.all([
            platformDb.select().from(menuCategories).where(and(eq(menuCategories.tenantId, tenantId), eq(menuCategories.isActive, true))).orderBy(asc(menuCategories.sortOrder)),
            platformDb.select().from(menuItems).where(and(eq(menuItems.tenantId, tenantId), eq(menuItems.isActive, true))).orderBy(asc(menuItems.sortOrder)),
            platformDb.select().from(menuPermissions).where(eq(menuPermissions.tenantId, tenantId)),
        ])

        const hasAccess = (itemId: string) => {
            if (userPermissions.includes('admin.super_admin')) return true
            const itemPerms = perms.filter((p) => p.menuItemId === itemId && p.isAllowed)
            if (itemPerms.length === 0) return true
            return itemPerms.some((p) => userPermissions.includes(p.roleId))
        }

        const tree = categories.map((cat) => ({
            ...cat,
            items: items.filter((i) => i.categoryId === cat.id && hasAccess(i.id)).map((item) => ({
                ...item,
                children: buildItemTree(items.filter((i) => hasAccess(i.id)), item.id),
            })),
        })).filter((cat) => cat.items.length > 0)

        return c.json({ success: true, data: tree })
    }
)

// POST /menu/admin/initialize - Seed default menus (platform DB)
menuRoutes.openapi(
    createRoute({
        method: 'post',
        path: '/admin/initialize',
        tags: ['Menu'],
        summary: 'Initialize default menu structure for the tenant',
        responses: { 200: { description: 'Menu initialized' } },
    }),
    async (c) => {
        const queryTenantId = c.req.query('tenantId')
        const tenantId = queryTenantId || c.get('tenantId')
        const userId = c.get('userId') || 'system'
        if (!tenantId) return c.json({ success: false, error: 'No tenant context' }, 400)

        const existing = await platformDb.select().from(menuCategories).where(eq(menuCategories.tenantId, tenantId)).limit(1)
        if (existing.length > 0) {
            return c.json({ success: false, error: 'Menu already initialized for this tenant' }, 409)
        }

        const now = new Date()
        const cats = [
            { name: 'Dashboard', icon: 'Dashboard', sortOrder: 1 },
            { name: 'Banking', icon: 'AccountBalance', sortOrder: 2 },
            { name: 'IFRS 9', icon: 'Calculate', sortOrder: 3 },
            { name: 'Analytics', icon: 'Analytics', sortOrder: 4 },
            { name: 'Reports', icon: 'Assessment', sortOrder: 5 },
            { name: 'Administration', icon: 'AdminPanelSettings', sortOrder: 6 },
        ]

        const catIds: Record<string, string> = {}
        for (const cat of cats) {
            const id = randomUUID()
            catIds[cat.name] = id
            await platformDb.insert(menuCategories).values({
                id, tenantId, name: cat.name, icon: cat.icon, sortOrder: cat.sortOrder,
                isActive: true, createdBy: userId, createdAt: now,
            }).onConflictDoNothing()
        }

        const items = [
            { cat: 'Dashboard', name: 'Overview', path: '/banking/dashboard', icon: 'Dashboard', sortOrder: 1 },
            { cat: 'Banking', name: 'Application Settings', path: '/banking/setup/application', icon: 'Settings', sortOrder: 1 },
            { cat: 'Banking', name: 'Business Settings', path: '/banking/setup/business', icon: 'Business', sortOrder: 2 },
            { cat: 'Banking', name: 'Parameters', path: '/banking/parameters/product', icon: 'Settings', sortOrder: 3 },
            { cat: 'IFRS 9', name: 'Collective Impairment', path: '/banking/collective/segmentation', icon: 'Visibility', sortOrder: 1 },
            { cat: 'IFRS 9', name: 'Individual Impairment', path: '/banking/individual/assessment', icon: 'Person', sortOrder: 2 },
            { cat: 'IFRS 9', name: 'ECL Calculations', path: '/banking/ifrs9/calculations', icon: 'Calculate', sortOrder: 3 },
            { cat: 'Analytics', name: 'R Analytics', path: '/banking/analytics/r-analytics', icon: 'Analytics', sortOrder: 1 },
            { cat: 'Reports', name: 'IFRS 9 Reports', path: '/banking/ifrs9-reports', icon: 'Assessment', sortOrder: 1 },
            { cat: 'Administration', name: 'Approval', path: '/banking/maintenance/approval', icon: 'Approval', sortOrder: 1 },
            { cat: 'Administration', name: 'Access Management', path: '/banking/maintenance/access-management', icon: 'Security', sortOrder: 2 },
            { cat: 'Administration', name: 'Job Monitoring', path: '/banking/maintenance/job-monitoring', icon: 'Build', sortOrder: 3 },
            { cat: 'Administration', name: 'Menu Management', path: '/banking/maintenance/menus', icon: 'Menu', sortOrder: 4 },
            { cat: 'Administration', name: 'Audit Log', path: '/banking/maintenance/audit', icon: 'Visibility', sortOrder: 5 },
        ]

        for (const item of items) {
            await platformDb.insert(menuItems).values({
                id: randomUUID(), tenantId, categoryId: catIds[item.cat],
                name: item.name, path: item.path, icon: item.icon,
                sortOrder: item.sortOrder, level: 0, isActive: true,
                isVisible: true, requiresAuth: true, bankingType: 'both',
                createdBy: userId, createdAt: now,
            }).onConflictDoNothing()
        }

        return c.json({ success: true, data: { categories: cats.length, items: items.length } })
    }
)

// CRUD endpoints (platform DB)
menuRoutes.post('/admin/items', async (c) => {
    const qTenant = c.req.query('tenantId')
    const tenantId = qTenant || c.get('tenantId')
    const userId = c.get('userId') || 'system'
    if (!tenantId) return c.json({ success: false, error: 'No tenant context' }, 400)
    const body = await c.req.json()
    const id = randomUUID()
    await platformDb.insert(menuItems).values({ id, tenantId, ...body, createdBy: userId, createdAt: new Date() })
    return c.json({ success: true, data: { id } })
})

menuRoutes.put('/admin/items/:id', async (c) => {
    const qTenant = c.req.query('tenantId')
    const tenantId = qTenant || c.get('tenantId')
    if (!tenantId) return c.json({ success: false, error: 'No tenant context' }, 400)
    const id = c.req.param('id')
    const body = await c.req.json()
    await platformDb.update(menuItems).set({ ...body, updatedAt: new Date() }).where(and(eq(menuItems.id, id), eq(menuItems.tenantId, tenantId)))
    return c.json({ success: true })
})

menuRoutes.delete('/admin/items/:id', async (c) => {
    const qTenant = c.req.query('tenantId')
    const tenantId = qTenant || c.get('tenantId')
    if (!tenantId) return c.json({ success: false, error: 'No tenant context' }, 400)
    const id = c.req.param('id')
    await platformDb.delete(menuItems).where(and(eq(menuItems.id, id), eq(menuItems.tenantId, tenantId)))
    return c.json({ success: true })
})

// GET /menu/permissions - Get all menu permissions for a tenant
menuRoutes.get('/permissions', async (c) => {
    const qTenant = c.req.query('tenantId')
    const tenantId = qTenant || c.get('tenantId')
    if (!tenantId) return c.json({ success: false, error: 'No tenant context' }, 400)
    const perms = await platformDb.select().from(menuPermissions).where(eq(menuPermissions.tenantId, tenantId))
    return c.json({ success: true, data: perms })
})

// POST /menu/permissions - Create/update a menu permission
menuRoutes.post('/permissions', async (c) => {
    const qTenant = c.req.query('tenantId')
    const tenantId = qTenant || c.get('tenantId')
    if (!tenantId) return c.json({ success: false, error: 'No tenant context' }, 400)
    const body = await c.req.json()
    const existing = await platformDb.select().from(menuPermissions)
        .where(and(
            eq(menuPermissions.tenantId, tenantId),
            eq(menuPermissions.menuItemId, body.menuItemId),
            eq(menuPermissions.roleId, body.roleId),
            eq(menuPermissions.permissionType, body.permissionType || 'view'),
        )).limit(1)

    if (existing.length > 0) {
        await platformDb.update(menuPermissions).set({ isAllowed: body.isAllowed !== false })
            .where(eq(menuPermissions.id, existing[0].id))
        return c.json({ success: true, data: existing[0] })
    }

    const id = randomUUID()
    await platformDb.insert(menuPermissions).values({
        id, tenantId, menuItemId: body.menuItemId, roleId: body.roleId,
        permissionType: body.permissionType || 'view',
        isAllowed: body.isAllowed !== false,
        createdBy: c.get('userId') || 'system',
        createdAt: new Date(),
    })
    return c.json({ success: true, data: { id } })
})

// DELETE /menu/permissions/:id
menuRoutes.delete('/permissions/:id', async (c) => {
    const id = c.req.param('id')
    await platformDb.delete(menuPermissions).where(eq(menuPermissions.id, id))
    return c.json({ success: true })
})

// GET /menu/flat - Get flat menu items for sidebar (with banking mode filter)
menuRoutes.get('/flat', async (c) => {
    const qTenant = c.req.query('tenantId')
    const tenantId = qTenant || c.get('tenantId')
    const bankingMode = c.req.query('bankingMode') || 'conventional'
    const includeInactive = c.req.query('includeInactive') !== 'false'
    if (!tenantId) return c.json({ success: false, error: 'No tenant context' }, 400)

    const conditions = [eq(menuItems.tenantId, tenantId)]
    if (!includeInactive) conditions.push(eq(menuItems.isActive, true))
    if (bankingMode !== 'both') conditions.push(eq(menuItems.bankingType, bankingMode))

    const items = await platformDb.select().from(menuItems).where(and(...conditions)).orderBy(asc(menuItems.sortOrder))

    // Transform to flat format with parent_id for sidebar hierarchy building
    const flatItems = items.map(i => ({
        id: i.id,
        menu_key: i.id,
        title: i.name,
        label: i.name,
        description: i.description || '',
        icon: i.icon || 'Circle',
        url: i.path || '',
        href: i.path || '',
        parent_id: i.parentId || null,
        sort_order: i.sortOrder,
        type: i.parentId ? 'item' : 'group',
        level: i.level || 0,
        is_active: i.isActive,
        banking_type: i.bankingType,
    }))

    return c.json({ success: true, data: flatItems })
})

// GET /menu/health
menuRoutes.get('/health', (c) => c.json({ status: 'ok', service: 'menu' }))

// Helper: build nested item tree
function buildItemTree(items: any[], parentId: string): any[] {
    return items.filter((i) => i.parentId === parentId).map((item) => ({
        ...item,
        children: buildItemTree(items, item.id),
    }))
}
