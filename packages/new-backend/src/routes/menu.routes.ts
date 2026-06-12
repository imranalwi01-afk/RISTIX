import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi'
import { Effect, pipe } from 'effect'
import { eq, and, asc } from 'drizzle-orm'
import { getDatabase } from '@/config/database'
import { menuCategories, menuItems, menuPermissions } from '@/db/schema/menu.schema'
import { TenantRepository } from '@/repositories/tenant.repository'
import { authMiddleware } from '@/middleware/auth'
import type { AppContext } from '@/app'
import { runEffect } from '@/lib/effect'
import { buildErrorResponse } from '@/lib/http/error-response'
import { openApiValidationHook } from '@/lib/http/openapi-validation-hook'
import { randomUUID } from 'node:crypto'

const platformDb = getDatabase(null)

// Helper: resolve tenant slug to UUID
async function resolveTenantId(c: any): Promise<string | null> {
    const qTenant = c.req.query('tenantId')
    const tenantId = qTenant || c.get('tenantId')
    if (!tenantId) return null

    // Check if it's already a UUID (contains hyphens)
    if (tenantId.includes('-')) return tenantId

    // Resolve slug to UUID via TenantRepository
    try {
        const tenant = await TenantRepository.findBySlug(tenantId)
        return tenant?.id ?? null
    } catch {
        return null
    }
}

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
            { name: 'System Setup', icon: 'Settings', sortOrder: 2 },
            { name: 'Parameter Management', icon: 'Category', sortOrder: 3 },
            { name: 'Collective Impairment', icon: 'TrendingUp', sortOrder: 4 },
            { name: 'Individual Impairment', icon: 'Person', sortOrder: 5 },
            { name: 'IFRS 9 Processing', icon: 'Calculate', sortOrder: 6 },
            { name: 'IFRS 9 Reports', icon: 'TableChart', sortOrder: 7 },
            { name: 'Advanced Analytics', icon: 'Analytics', sortOrder: 8 },
            { name: 'Workflow Management', icon: 'AccountTree', sortOrder: 9 },
            { name: 'Tools', icon: 'CloudUpload', sortOrder: 10 },
            { name: 'Admin & Maintenance', icon: 'Build', sortOrder: 11 },
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

            // System Setup
            { cat: 'System Setup', name: 'Application Configuration', path: '/banking/setup/application', icon: 'Settings', sortOrder: 1 },
            { cat: 'System Setup', name: 'Business Configuration', path: '/banking/setup/business', icon: 'Business', sortOrder: 2 },

            // Parameter Management
            { cat: 'Parameter Management', name: 'Product Parameters', path: '/banking/parameters/product', icon: 'AccountBalance', sortOrder: 1 },
            { cat: 'Parameter Management', name: 'Accounting Parameters', path: '/banking/parameters/journal', icon: 'Assessment', sortOrder: 2 },

            // Collective Impairment
            { cat: 'Collective Impairment', name: 'Segmentation Configuration', path: '/banking/collective/segmentation', icon: 'Category', sortOrder: 1 },
            { cat: 'Collective Impairment', name: 'Rule Base Setting', path: '/banking/collective/rule-base', icon: 'Assessment', sortOrder: 2 },
            { cat: 'Collective Impairment', name: 'Bucket Parameter', path: '/banking/collective/bucket', icon: 'Layers', sortOrder: 3 },
            { cat: 'Collective Impairment', name: 'PD Setup', path: '/banking/collective/pd-setup', icon: 'TrendingUp', sortOrder: 4 },
            { cat: 'Collective Impairment', name: 'FL Scalar', path: '/banking/collective/fl-scalar', icon: 'Functions', sortOrder: 5 },
            { cat: 'Collective Impairment', name: 'LGD Setup', path: '/banking/collective/lgd-setup', icon: 'MonetizationOn', sortOrder: 6 },
            { cat: 'Collective Impairment', name: 'EAD Setup', path: '/banking/collective/ead-setup', icon: 'AccountBalance', sortOrder: 7 },
            { cat: 'Collective Impairment', name: 'ECL Configuration', path: '/banking/collective/ecl-config', icon: 'Calculate', sortOrder: 8 },

            // Individual Impairment
            { cat: 'Individual Impairment', name: 'Assessment Workspace', path: '/banking/individual/assessment', icon: 'Assessment', sortOrder: 1 },
            { cat: 'Individual Impairment', name: 'Individual Provision', path: '/banking/individual/provision', icon: 'Savings', sortOrder: 2 },
            { cat: 'Individual Impairment', name: 'DCF Upload Report', path: '/banking/individual/review/dcf-upload-report', icon: 'Description', sortOrder: 3 },

            // IFRS 9 Processing
            { cat: 'IFRS 9 Processing', name: 'ECL Calculations', path: '/banking/ifrs9/calculations', icon: 'Calculate', sortOrder: 1 },
            { cat: 'IFRS 9 Processing', name: 'IFRS 9 Staging', path: '/banking/ifrs9/staging', icon: 'Layers', sortOrder: 2 },
            { cat: 'IFRS 9 Processing', name: 'Model Management', path: '/banking/ifrs9/models', icon: 'ViewModule', sortOrder: 3 },
            { cat: 'IFRS 9 Processing', name: 'Forecast', path: '/banking/ifrs9/scenarios', icon: 'AutoGraph', sortOrder: 4 },
            { cat: 'IFRS 9 Processing', name: 'Data Upload', path: '/banking/data/upload', icon: 'UploadFile', sortOrder: 5 },
            { cat: 'IFRS 9 Processing', name: 'Data Validation', path: '/banking/data/validation', icon: 'VerifiedUser', sortOrder: 6 },

            // IFRS 9 Reports
            { cat: 'IFRS 9 Reports', name: 'ECL Movement', path: '/banking/ifrs9-reports/ecl-movement', icon: 'SwapHoriz', sortOrder: 1 },
            { cat: 'IFRS 9 Reports', name: 'GCA Movement', path: '/banking/ifrs9-reports/gca-movement', icon: 'Timeline', sortOrder: 2 },
            { cat: 'IFRS 9 Reports', name: 'Lifetime PD', path: '/banking/ifrs9-reports/lifetime-pd', icon: 'TrendingUp', sortOrder: 3 },
            { cat: 'IFRS 9 Reports', name: 'Lifetime LGD', path: '/banking/ifrs9-reports/lifetime-lgd', icon: 'MonetizationOn', sortOrder: 4 },
            { cat: 'IFRS 9 Reports', name: 'EAD Model', path: '/banking/ifrs9-reports/ead-model', icon: 'Functions', sortOrder: 5 },
            { cat: 'IFRS 9 Reports', name: 'ECL Result', path: '/banking/ifrs9-reports/ecl-result', icon: 'Calculate', sortOrder: 6 },
            { cat: 'IFRS 9 Reports', name: 'Nominative Report', path: '/banking/ifrs9-reports/nominative', icon: 'TableChart', sortOrder: 7 },

            // Advanced Analytics
            { cat: 'Advanced Analytics', name: 'R Analytics', path: '/banking/analytics/r-analytics', icon: 'DataUsage', sortOrder: 1 },
            { cat: 'Advanced Analytics', name: 'Financial Reports', path: '/banking/analytics/reports', icon: 'Assessment', sortOrder: 2 },
            { cat: 'Advanced Analytics', name: 'Executive Dashboard', path: '/banking/analytics/dashboard', icon: 'Dashboard', sortOrder: 3 },
            { cat: 'Advanced Analytics', name: 'Advanced Export', path: '/banking/analytics/export', icon: 'GetApp', sortOrder: 4 },

            // Workflow Management
            { cat: 'Workflow Management', name: 'Approval System', path: '/banking/workflow/approval', icon: 'Approval', sortOrder: 1 },
            { cat: 'Workflow Management', name: 'Notifications', path: '/banking/notifications', icon: 'NotificationImportant', sortOrder: 2 },
            { cat: 'Workflow Management', name: 'Workflow Configuration', path: '/banking/workflow/configuration', icon: 'Settings', sortOrder: 3 },
            { cat: 'Workflow Management', name: 'Process Monitoring', path: '/banking/workflow/monitoring', icon: 'Monitor', sortOrder: 4 },
            { cat: 'Workflow Management', name: 'Staging Management', path: '/banking/workflow/staging', icon: 'TableView', sortOrder: 5 },
            { cat: 'Workflow Management', name: 'Business Process', path: '/banking/workflow/business', icon: 'Business', sortOrder: 6 },

            // Tools
            { cat: 'Tools', name: 'Manual Upload', path: '/banking/tools/upload', icon: 'CloudUpload', sortOrder: 1 },
            { cat: 'Tools', name: 'Data Export', path: '/banking/tools/export', icon: 'GetApp', sortOrder: 2 },
            { cat: 'Tools', name: 'ETL Tools', path: '/banking/tools/etl', icon: 'Transform', sortOrder: 3 },

            // Admin & Maintenance
            { cat: 'Admin & Maintenance', name: 'Access Management', path: '/banking/maintenance/access-management', icon: 'ManageAccounts', sortOrder: 1 },
            { cat: 'Admin & Maintenance', name: 'Approval', path: '/banking/maintenance/approval', icon: 'Approval', sortOrder: 2 },
            { cat: 'Admin & Maintenance', name: 'Job Monitoring', path: '/banking/maintenance/job-monitoring', icon: 'Monitor', sortOrder: 3 },
            { cat: 'Admin & Maintenance', name: 'Menu Management', path: '/banking/maintenance/menus', icon: 'Menu', sortOrder: 4 },
            { cat: 'Admin & Maintenance', name: 'Audit Log', path: '/banking/maintenance/audit', icon: 'History', sortOrder: 5 },
            { cat: 'Admin & Maintenance', name: 'User Activity', path: '/banking/maintenance/user-activity', icon: 'People', sortOrder: 6 },
            { cat: 'Admin & Maintenance', name: 'Assignments', path: '/banking/maintenance/assignments', icon: 'Assignment', sortOrder: 7 },
            { cat: 'Admin & Maintenance', name: 'Users', path: '/banking/maintenance/users', icon: 'Group', sortOrder: 8 },
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

// GET /menu/flat - Get flat menu items for sidebar
menuRoutes.get('/flat', async (c) => {
    const tenantId = await resolveTenantId(c)
    const includeInactive = c.req.query('includeInactive') !== 'false'
    if (!tenantId) return c.json({ success: false, error: 'No tenant context' }, 400)

    const conditions = [eq(menuItems.tenantId, tenantId)]
    if (!includeInactive) conditions.push(eq(menuItems.isActive, true))

    const [categories, items] = await Promise.all([
        platformDb.select().from(menuCategories).where(
            and(eq(menuCategories.tenantId, tenantId), eq(menuCategories.isActive, true))
        ).orderBy(asc(menuCategories.sortOrder)),
        platformDb.select().from(menuItems).where(and(...conditions)).orderBy(asc(menuItems.sortOrder)),
    ])

    // Build hierarchical menu: categories as groups, items as children
    const menuTree = categories.map(cat => {
        const catItems = items.filter(i => i.categoryId === cat.id)
        return {
            id: cat.id,
            menu_key: cat.id,
            title: cat.name,
            label: cat.name,
            description: cat.description || '',
            icon: cat.icon || 'Folder',
            url: '',
            href: '',
            parent_id: null,
            sort_order: cat.sortOrder,
            type: 'group',
            level: 0,
            is_active: cat.isActive,
            banking_type: null,
            children: catItems.map(i => ({
                id: i.id,
                menu_key: i.id,
                title: i.name,
                label: i.name,
                description: i.description || '',
                icon: i.icon || 'Circle',
                url: i.path || '',
                href: i.path || '',
                parent_id: cat.id,
                sort_order: i.sortOrder,
                type: 'item',
                level: 1,
                is_active: i.isActive,
                banking_type: i.bankingType,
                children: [] as any[],
            })),
        }
    })

    return c.json({ success: true, data: menuTree })
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
