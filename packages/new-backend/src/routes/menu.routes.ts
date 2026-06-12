import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi'
import { Effect, pipe } from 'effect'
import { eq, and, asc } from 'drizzle-orm'
import { getDatabase } from '@/config/database'
import { menuCategories, menuItems, menuPermissions } from '@/db/schema/menu.schema'
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
            // Dashboard
            { cat: 'Dashboard', name: 'Overview', path: '/banking/dashboard', icon: 'Dashboard', sortOrder: 1 },
            // Banking - Setup
            { cat: 'Banking', name: 'Application Settings', path: '/banking/setup/application', icon: 'Settings', sortOrder: 1 },
            { cat: 'Banking', name: 'Business Settings', path: '/banking/setup/business', icon: 'Business', sortOrder: 2 },
            // Banking - Parameters
            { cat: 'Banking', name: 'Product Parameters', path: '/banking/parameters/product', icon: 'Inventory2', sortOrder: 3 },
            { cat: 'Banking', name: 'Journal Parameters', path: '/banking/parameters/journal', icon: 'Book', sortOrder: 4 },
            // Banking - Modes
            { cat: 'Banking', name: 'Conventional Mode', path: '/banking/mode/conventional', icon: 'AccountBalance', sortOrder: 5 },
            { cat: 'Banking', name: 'Syariah Mode', path: '/banking/mode/syariah', icon: 'Mosque', sortOrder: 6 },
            { cat: 'Banking', name: 'Compliance', path: '/banking/mode/compliance', icon: 'Verified', sortOrder: 7 },
            // Banking - Tools
            { cat: 'Banking', name: 'Upload Data', path: '/banking/tools/upload', icon: 'Upload', sortOrder: 8 },
            { cat: 'Banking', name: 'Export Data', path: '/banking/tools/export', icon: 'Download', sortOrder: 9 },
            // IFRS 9 - Collective
            { cat: 'IFRS 9', name: 'Segmentation', path: '/banking/collective/segmentation', icon: 'AccountTree', sortOrder: 1 },
            { cat: 'IFRS 9', name: 'Bucket Parameter', path: '/banking/collective/bucket', icon: 'Layers', sortOrder: 2 },
            { cat: 'IFRS 9', name: 'PD Setup', path: '/banking/collective/pd-setup', icon: 'TrendingUp', sortOrder: 3 },
            { cat: 'IFRS 9', name: 'LGD Setup', path: '/banking/collective/lgd-setup', icon: 'MoneyOff', sortOrder: 4 },
            { cat: 'IFRS 9', name: 'EAD Setup', path: '/banking/collective/ead-setup', icon: 'CreditCard', sortOrder: 5 },
            { cat: 'IFRS 9', name: 'FL Scalar', path: '/banking/collective/fl-scalar', icon: 'Tune', sortOrder: 6 },
            { cat: 'IFRS 9', name: 'Rule Base', path: '/banking/collective/rule-base', icon: 'Rule', sortOrder: 7 },
            { cat: 'IFRS 9', name: 'ECL Config', path: '/banking/collective/ecl-config', icon: 'SettingsApplications', sortOrder: 8 },
            // IFRS 9 - Individual
            { cat: 'IFRS 9', name: 'Individual Assessment', path: '/banking/individual/assessment', icon: 'Person', sortOrder: 9 },
            { cat: 'IFRS 9', name: 'Individual Provision', path: '/banking/individual/provision', icon: 'Savings', sortOrder: 10 },
            { cat: 'IFRS 9', name: 'DCF Upload Report', path: '/banking/individual/review/dcf-upload-report', icon: 'Description', sortOrder: 11 },
            // IFRS 9 - Processing
            { cat: 'IFRS 9', name: 'ECL Calculations', path: '/banking/ifrs9/calculations', icon: 'Calculate', sortOrder: 12 },
            { cat: 'IFRS 9', name: 'Staging', path: '/banking/ifrs9/staging', icon: 'Schema', sortOrder: 13 },
            { cat: 'IFRS 9', name: 'Models', path: '/banking/ifrs9/models', icon: 'ModelTraining', sortOrder: 14 },
            { cat: 'IFRS 9', name: 'Scenarios', path: '/banking/ifrs9/scenarios', icon: 'Science', sortOrder: 15 },
            // IFRS 9 - Data
            { cat: 'IFRS 9', name: 'Data Upload', path: '/banking/data/upload', icon: 'UploadFile', sortOrder: 16 },
            { cat: 'IFRS 9', name: 'Data Validation', path: '/banking/data/validation', icon: 'VerifiedUser', sortOrder: 17 },
            // Analytics
            { cat: 'Analytics', name: 'Dashboard', path: '/banking/analytics/dashboard', icon: 'Dashboard', sortOrder: 1 },
            { cat: 'Analytics', name: 'R Analytics', path: '/banking/analytics/r-analytics', icon: 'Analytics', sortOrder: 2 },
            { cat: 'Analytics', name: 'Reports', path: '/banking/analytics/reports', icon: 'Assessment', sortOrder: 3 },
            { cat: 'Analytics', name: 'Export', path: '/banking/analytics/export', icon: 'Download', sortOrder: 4 },
            // Reports
            { cat: 'Reports', name: 'ECL Movement', path: '/banking/ifrs9-reports/ecl-movement', icon: 'Timeline', sortOrder: 1 },
            { cat: 'Reports', name: 'GCA Movement', path: '/banking/ifrs9-reports/gca-movement', icon: 'ShowChart', sortOrder: 2 },
            { cat: 'Reports', name: 'Lifetime PD', path: '/banking/ifrs9-reports/lifetime-pd', icon: 'TrendingUp', sortOrder: 3 },
            { cat: 'Reports', name: 'Lifetime LGD', path: '/banking/ifrs9-reports/lifetime-lgd', icon: 'MoneyOff', sortOrder: 4 },
            { cat: 'Reports', name: 'EAD Model', path: '/banking/ifrs9-reports/ead-model', icon: 'CreditCard', sortOrder: 5 },
            { cat: 'Reports', name: 'ECL Result', path: '/banking/ifrs9-reports/ecl-result', icon: 'Summarize', sortOrder: 6 },
            { cat: 'Reports', name: 'Nominative', path: '/banking/ifrs9-reports/nominative', icon: 'TableChart', sortOrder: 7 },
            // Workflow
            { cat: 'Administration', name: 'Workflow - Business', path: '/banking/workflow/business', icon: 'Business', sortOrder: 1 },
            { cat: 'Administration', name: 'Workflow - Approval', path: '/banking/workflow/approval', icon: 'Approval', sortOrder: 2 },
            { cat: 'Administration', name: 'Workflow - Monitoring', path: '/banking/workflow/monitoring', icon: 'Monitoring', sortOrder: 3 },
            { cat: 'Administration', name: 'Workflow - Configuration', path: '/banking/workflow/configuration', icon: 'Settings', sortOrder: 4 },
            { cat: 'Administration', name: 'Access Management', path: '/banking/maintenance/access-management', icon: 'Security', sortOrder: 5 },
            { cat: 'Administration', name: 'Job Monitoring', path: '/banking/maintenance/job-monitoring', icon: 'Build', sortOrder: 6 },
            { cat: 'Administration', name: 'Menu Management', path: '/banking/maintenance/menus', icon: 'Menu', sortOrder: 7 },
            { cat: 'Administration', name: 'Approval Matrix', path: '/banking/maintenance/approval', icon: 'Checklist', sortOrder: 8 },
            { cat: 'Administration', name: 'User Activity', path: '/banking/maintenance/user-activity', icon: 'People', sortOrder: 9 },
            { cat: 'Administration', name: 'Audit Log', path: '/banking/maintenance/audit', icon: 'Visibility', sortOrder: 10 },
            { cat: 'Administration', name: 'Assignments', path: '/banking/maintenance/assignments', icon: 'Assignment', sortOrder: 11 },
            { cat: 'Administration', name: 'Users', path: '/banking/maintenance/users', icon: 'Group', sortOrder: 12 },
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
    const includeInactive = c.req.query('includeInactive') !== 'false'
    if (!tenantId) return c.json({ success: false, error: 'No tenant context' }, 400)

    const conditions = [eq(menuItems.tenantId, tenantId)]
    if (!includeInactive) conditions.push(eq(menuItems.isActive, true))

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
