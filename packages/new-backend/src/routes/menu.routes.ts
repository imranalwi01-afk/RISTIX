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

export const menuRoutes = new OpenAPIHono<AppContext>({ defaultHook: openApiValidationHook })

// GET /menu/hierarchy - Get full menu tree for a tenant
menuRoutes.openapi(
    createRoute({
        method: 'get',
        path: '/hierarchy',
        tags: ['Menu'],
        summary: 'Get full menu hierarchy for the current tenant',
        responses: { 200: { description: 'Menu hierarchy' } },
    }),
    async (c) => {
        const tenantId = c.get('tenantId')
        if (!tenantId) return c.json({ success: false, error: 'No tenant context' }, 400)
        const db = getDatabase(tenantId)

        const [categories, items] = await Promise.all([
            db.select().from(menuCategories).where(eq(menuCategories.tenantId, tenantId)).orderBy(asc(menuCategories.sortOrder)),
            db.select().from(menuItems).where(eq(menuItems.tenantId, tenantId)).orderBy(asc(menuItems.sortOrder)),
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

// GET /menu - Get user's menu (filtered by roles)
menuRoutes.openapi(
    createRoute({
        method: 'get',
        path: '/',
        tags: ['Menu'],
        summary: 'Get menu for current user filtered by roles',
        responses: { 200: { description: 'User menu' } },
    }),
    async (c) => {
        const tenantId = c.get('tenantId')
        const userId = c.get('userId')
        const userPermissions = c.get('permissions') || []
        if (!tenantId) return c.json({ success: false, error: 'No tenant context' }, 400)
        const db = getDatabase(tenantId)

        const [categories, items, perms] = await Promise.all([
            db.select().from(menuCategories).where(and(eq(menuCategories.tenantId, tenantId), eq(menuCategories.isActive, true))).orderBy(asc(menuCategories.sortOrder)),
            db.select().from(menuItems).where(and(eq(menuItems.tenantId, tenantId), eq(menuItems.isActive, true))).orderBy(asc(menuItems.sortOrder)),
            db.select().from(menuPermissions).where(eq(menuPermissions.tenantId, tenantId)),
        ])

        // Filter by user's permissions/roles
        const hasAccess = (itemId: string) => {
            if (userPermissions.includes('admin.super_admin')) return true
            const itemPerms = perms.filter((p) => p.menuItemId === itemId && p.isAllowed)
            if (itemPerms.length === 0) return true // No explicit perms = accessible
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

// POST /menu/admin/initialize - Seed default menus for a tenant
menuRoutes.openapi(
    createRoute({
        method: 'post',
        path: '/admin/initialize',
        tags: ['Menu'],
        summary: 'Initialize default menu structure for the tenant',
        responses: { 200: { description: 'Menu initialized' } },
    }),
    async (c) => {
        const tenantId = c.get('tenantId')
        const userId = c.get('userId') || 'system'
        if (!tenantId) return c.json({ success: false, error: 'No tenant context' }, 400)
        const db = getDatabase(tenantId)

        // Check if already initialized
        const existing = await db.select().from(menuCategories).where(eq(menuCategories.tenantId, tenantId)).limit(1)
        if (existing.length > 0) {
            return c.json({ success: false, error: 'Menu already initialized for this tenant' }, 409)
        }

        const now = new Date()
        const catId = (id: string) => id

        const cats = [
            { id: catId('cat_dashboard'), name: 'Dashboard', icon: 'Dashboard', sortOrder: 1 },
            { id: catId('cat_banking'), name: 'Banking', icon: 'AccountBalance', sortOrder: 2 },
            { id: catId('cat_ifrs9'), name: 'IFRS 9', icon: 'Calculate', sortOrder: 3 },
            { id: catId('cat_analytics'), name: 'Analytics', icon: 'Analytics', sortOrder: 4 },
            { id: catId('cat_reports'), name: 'Reports', icon: 'Assessment', sortOrder: 5 },
            { id: catId('cat_admin'), name: 'Administration', icon: 'AdminPanelSettings', sortOrder: 6 },
        ]

        for (const cat of cats) {
            await db.insert(menuCategories).values({
                id: cat.id, tenantId, name: cat.name, icon: cat.icon, sortOrder: cat.sortOrder,
                isActive: true, createdBy: userId, createdAt: now,
            }).onConflictDoNothing()
        }

        const items = [
            { id: 'item_overview', categoryId: 'cat_dashboard', name: 'Overview', path: '/banking/dashboard', icon: 'Dashboard', sortOrder: 1 },
            { id: 'item_application', categoryId: 'cat_banking', name: 'Application Settings', path: '/banking/setup/application', icon: 'Settings', sortOrder: 1 },
            { id: 'item_business', categoryId: 'cat_banking', name: 'Business Settings', path: '/banking/setup/business', icon: 'Business', sortOrder: 2 },
            { id: 'item_parameters', categoryId: 'cat_banking', name: 'Parameters', path: '/banking/parameters/product', icon: 'Settings', sortOrder: 3 },
            { id: 'item_collective', categoryId: 'cat_ifrs9', name: 'Collective Impairment', path: '/banking/collective/segmentation', icon: 'Visibility', sortOrder: 1 },
            { id: 'item_individual', categoryId: 'cat_ifrs9', name: 'Individual Impairment', path: '/banking/individual/assessment', icon: 'Person', sortOrder: 2 },
            { id: 'item_calculations', categoryId: 'cat_ifrs9', name: 'ECL Calculations', path: '/banking/ifrs9/calculations', icon: 'Calculate', sortOrder: 3 },
            { id: 'item_r_analytics', categoryId: 'cat_analytics', name: 'R Analytics', path: '/banking/analytics/r-analytics', icon: 'Analytics', sortOrder: 1, bankingType: 'both' },
            { id: 'item_reports', categoryId: 'cat_reports', name: 'IFRS 9 Reports', path: '/banking/ifrs9-reports', icon: 'Assessment', sortOrder: 1 },
            { id: 'item_approval', categoryId: 'cat_admin', name: 'Approval', path: '/banking/maintenance/approval', icon: 'Approval', sortOrder: 1 },
            { id: 'item_access', categoryId: 'cat_admin', name: 'Access Management', path: '/banking/maintenance/access-management', icon: 'Security', sortOrder: 2 },
            { id: 'item_jobs', categoryId: 'cat_admin', name: 'Job Monitoring', path: '/banking/maintenance/job-monitoring', icon: 'Build', sortOrder: 3 },
            { id: 'item_menus', categoryId: 'cat_admin', name: 'Menu Management', path: '/banking/maintenance/menus', icon: 'Menu', sortOrder: 4 },
            { id: 'item_audit', categoryId: 'cat_admin', name: 'Audit Log', path: '/banking/maintenance/audit', icon: 'Visibility', sortOrder: 5 },
        ]

        for (const item of items) {
            await db.insert(menuItems).values({
                id: item.id, tenantId, categoryId: item.categoryId,
                name: item.name, path: item.path, icon: item.icon,
                sortOrder: item.sortOrder, level: 0,
                isActive: true, isVisible: true, requiresAuth: true,
                bankingType: (item as any).bankingType || 'both',
                createdBy: userId, createdAt: now,
            }).onConflictDoNothing()
        }

        return c.json({ success: true, data: { categories: cats.length, items: items.length } })
    }
)

// CRUD endpoints
menuRoutes.post('/admin/items', async (c) => {
    const tenantId = c.get('tenantId')
    const userId = c.get('userId') || 'system'
    if (!tenantId) return c.json({ success: false, error: 'No tenant context' }, 400)
    const db = getDatabase(tenantId)
    const body = await c.req.json()
    const id = randomUUID()
    await db.insert(menuItems).values({ id, tenantId, ...body, createdBy: userId, createdAt: new Date() })
    return c.json({ success: true, data: { id } })
})

menuRoutes.put('/admin/items/:id', async (c) => {
    const tenantId = c.get('tenantId')
    if (!tenantId) return c.json({ success: false, error: 'No tenant context' }, 400)
    const db = getDatabase(tenantId)
    const id = c.req.param('id')
    const body = await c.req.json()
    await db.update(menuItems).set({ ...body, updatedAt: new Date() }).where(and(eq(menuItems.id, id), eq(menuItems.tenantId, tenantId)))
    return c.json({ success: true })
})

menuRoutes.delete('/admin/items/:id', async (c) => {
    const tenantId = c.get('tenantId')
    if (!tenantId) return c.json({ success: false, error: 'No tenant context' }, 400)
    const db = getDatabase(tenantId)
    const id = c.req.param('id')
    await db.delete(menuItems).where(and(eq(menuItems.id, id), eq(menuItems.tenantId, tenantId)))
    return c.json({ success: true })
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
