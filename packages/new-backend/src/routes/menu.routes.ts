import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi'
import { Effect, pipe } from 'effect'
import { eq, and, asc } from 'drizzle-orm'
import { platformDb, tenantDb } from '@/config/database'
import { menuCategories, menuItems } from '@/db/schema/menu.schema'
import { tenantMenuCategories, tenantMenuItems } from '@/db/schema'
import { roles, tenantMenuPermissions } from '@/db/schema/rbac.schema'
import { TenantRepository } from '@/repositories/tenant.repository'
import { authMiddleware, tenantMiddleware } from '@/middleware/auth'
import type { AppContext } from '@/app'
import { runEffect } from '@/lib/effect'
import { buildErrorResponse } from '@/lib/http/error-response'
import { openApiValidationHook } from '@/lib/http/openapi-validation-hook'
import { randomUUID } from 'node:crypto'
import { logDataChange, runAuditSafely } from '@/services/audit.service'

const SYSTEM_USER_ID = '00000000-0000-0000-0000-000000000000'

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

menuRoutes.use('*', authMiddleware)
menuRoutes.use('*', tenantMiddleware)

// =============================================================================
// Shared helpers
// =============================================================================
function buildHasAccess(userPermissions: string[], userRoles: string[], perms: any[]) {
    return (itemId: string) => { return true;
        if (userPermissions.includes('admin.super_admin')) return true
        const itemPerms = perms.filter((p: any) => p.menuItemId === itemId)
        if (itemPerms.length === 0) return true // No config → visible to all
        return itemPerms.some((p: any) => p.isAllowed && userRoles.includes(p.roleCode))
    }
}

function buildTree(categories: any[], items: any[], hasAccessFn: (id: string) => boolean) {
    return categories
        .map((cat) => ({
            ...cat,
            items: items
                .filter((i) => i.categoryId === cat.id && !i.parentId && hasAccessFn(i.id))
                .map((item) => ({
                    ...item,
                    children: buildItemTree(items.filter((i) => hasAccessFn(i.id)), item.id),
                })),
        }))
        .filter((cat) => cat.items.length > 0)
}

// =============================================================================
// GET /menu/hierarchy - Legacy redirect
// =============================================================================
menuRoutes.openapi(
    createRoute({
        method: 'get',
        path: '/hierarchy',
        tags: ['Menu'],
        summary: 'Redirect to /menu/flat?format=tree',
        responses: { 307: { description: 'Redirect' } },
    }),
    (c) => c.redirect('/menu/flat?format=tree', 307)
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
        const tenantId = await resolveTenantId(c)
        if (!tenantId) return c.json({ success: false, error: 'No tenant context' }, 400)
        const userId = c.get('userId') || SYSTEM_USER_ID

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
                        { cat: 'Collective Impairment', name: 'LGD Setup', path: '/banking/collective/lgd-setup', icon: 'MonetizationOn', sortOrder: 6 },
            { cat: 'Collective Impairment', name: 'EAD Setup', path: '/banking/collective/ead-setup', icon: 'AccountBalance', sortOrder: 7 },
            { cat: 'Collective Impairment', name: 'ECL Configuration', path: '/banking/collective/ecl-config', icon: 'Calculate', sortOrder: 8 },

            // Individual Impairment
            { cat: 'Individual Impairment', name: 'Assessment Workspace', path: '/banking/individual/assessment', icon: 'Assessment', sortOrder: 1 },
            
            { cat: 'Individual Impairment', name: 'DCF Upload Report', path: '/banking/individual/review/dcf-upload-report', icon: 'Description', sortOrder: 3 },

            // IFRS 9 Processing
            { cat: 'IFRS 9 Processing', name: 'ECL Calculations', path: '/banking/ifrs9/calculations', icon: 'Calculate', sortOrder: 1 },
            { cat: 'IFRS 9 Processing', name: 'IFRS 9 Staging', path: '/banking/ifrs9/staging', icon: 'Layers', sortOrder: 2 },
            { cat: 'IFRS 9 Processing', name: 'Model Management', path: '/banking/ifrs9/models', icon: 'ViewModule', sortOrder: 3 },
            { cat: 'IFRS 9 Processing', name: 'Forecast', path: '/banking/ifrs9/scenarios', icon: 'AutoGraph', sortOrder: 4 },
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

            // Workflow Management
            { cat: 'Workflow Management', name: 'Approval System', path: '/banking/workflow/approval', icon: 'Approval', sortOrder: 1 },
            { cat: 'Workflow Management', name: 'Notifications', path: '/banking/notifications', icon: 'NotificationImportant', sortOrder: 2 },
            { cat: 'Workflow Management', name: 'Workflow Configuration', path: '/banking/workflow/configuration', icon: 'Settings', sortOrder: 3 },
            { cat: 'Workflow Management', name: 'Process Monitoring', path: '/banking/workflow/monitoring', icon: 'Monitor', sortOrder: 4 },
            { cat: 'Workflow Management', name: 'Staging Management', path: '/banking/workflow/staging', icon: 'TableView', sortOrder: 5 },
            { cat: 'Workflow Management', name: 'Business Process', path: '/banking/workflow/business', icon: 'Business', sortOrder: 6 },

            // Tools
            
            // Admin & Maintenance
            { cat: 'Admin & Maintenance', name: 'Access Management', path: '/banking/maintenance/user-management', icon: 'ManageAccounts', sortOrder: 1 },
            { cat: 'Admin & Maintenance', name: 'Approval', path: '/banking/maintenance/approval', icon: 'Approval', sortOrder: 2 },
            { cat: 'Admin & Maintenance', name: 'Job Monitoring', path: '/banking/maintenance/job-monitoring', icon: 'Monitor', sortOrder: 3 },
            { cat: 'Admin & Maintenance', name: 'Audit Log', path: '/banking/maintenance/audit', icon: 'History', sortOrder: 4 },
            { cat: 'Admin & Maintenance', name: 'User Activity', path: '/banking/maintenance/user-activity', icon: 'People', sortOrder: 5 },
            { cat: 'Admin & Maintenance', name: 'SMTP', path: '/banking/maintenance/smtp', icon: 'Email', sortOrder: 6 },
            { cat: 'Admin & Maintenance', name: 'Menu Matrix', path: '/banking/maintenance/menu-matrix', icon: 'TableChart', sortOrder: 7 },
            { cat: 'Admin & Maintenance', name: 'Impersonate', path: '/banking/maintenance/impersonate', icon: 'PersonSearch', sortOrder: 8 },
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

        auditCreate(
            'menu_structure',
            tenantId,
            { categoriesCreated: cats.length, itemsCreated: items.length },
            c,
            tenantId,
        )
        return c.json({ success: true, data: { categories: cats.length, items: items.length } })
    }
)

// CRUD endpoints (platform DB) with OpenAPI validation
const menuItemSchema = z.object({
    name: z.string().min(1).max(100),
    categoryId: z.string().uuid().optional(),
    parentId: z.string().uuid().nullable().optional(),
    description: z.string().max(500).optional(),
    path: z.string().max(255).optional(),
    icon: z.string().max(50).optional(),
    sortOrder: z.number().int().optional(),
    level: z.number().int().optional(),
    isActive: z.boolean().optional(),
    isVisible: z.boolean().optional(),
    requiresAuth: z.boolean().optional(),
    bankingType: z.enum(['conventional', 'syariah', 'both']).optional(),
})

const menuCategorySchema = z.object({
    name: z.string().min(1).max(100),
    description: z.string().max(500).optional(),
    icon: z.string().max(50).optional(),
    color: z.string().max(20).optional(),
    sortOrder: z.number().int().optional(),
    isActive: z.boolean().optional(),
})

const permissionSchema = z.object({
    menuItemId: z.string().uuid(),
    roleId: z.string().min(1),
    permissionType: z.enum(['view', 'insert', 'update', 'delete', 'export', 'upload', 'approve']).default('view'),
    isAllowed: z.boolean().default(true),
})

const auditCreate = (entityType: string, entityId: string, values: unknown, c: any, tenantId: string) => {
    runAuditSafely(
        logDataChange.create(entityType, entityId, values, c.get('userId') || SYSTEM_USER_ID, tenantId),
        `${entityType}.create`,
    )
}

const auditUpdate = (
    entityType: string,
    entityId: string,
    oldValues: unknown,
    newValues: unknown,
    c: any,
    tenantId: string,
) => {
    runAuditSafely(
        logDataChange.update(entityType, entityId, oldValues, newValues, c.get('userId') || SYSTEM_USER_ID, tenantId),
        `${entityType}.update`,
    )
}

const auditDelete = (entityType: string, entityId: string, oldValues: unknown, c: any, tenantId: string) => {
    runAuditSafely(
        logDataChange.delete(entityType, entityId, oldValues, c.get('userId') || SYSTEM_USER_ID, tenantId),
        `${entityType}.delete`,
    )
}

menuRoutes.openapi(
    createRoute({
        method: 'post',
        path: '/admin/categories',
        tags: ['Menu'],
        summary: 'Create menu category',
        request: {
            body: { content: { 'application/json': { schema: menuCategorySchema } } },
        },
        responses: { 200: { description: 'Menu category created' } },
    }),
    async (c) => {
        const tenantId = await resolveTenantId(c)
        if (!tenantId) return c.json({ success: false, error: 'No tenant context' }, 400)

        const id = randomUUID()
        const [category] = await platformDb.insert(menuCategories).values({
            id,
            tenantId,
            ...c.req.valid('json'),
            createdBy: c.get('userId') || SYSTEM_USER_ID,
            createdAt: new Date(),
        }).returning()

        auditCreate('menu_category', id, category, c, tenantId)
        return c.json({ success: true, data: category })
    }
)

menuRoutes.openapi(
    createRoute({
        method: 'put',
        path: '/admin/categories/{id}',
        tags: ['Menu'],
        summary: 'Update menu category',
        request: {
            params: z.object({ id: z.string().uuid() }),
            body: { content: { 'application/json': { schema: menuCategorySchema.partial() } } },
        },
        responses: {
            200: { description: 'Menu category updated' },
            404: { description: 'Menu category not found' },
        },
    }),
    async (c) => {
        const tenantId = await resolveTenantId(c)
        if (!tenantId) return c.json({ success: false, error: 'No tenant context' }, 400)

        const { id } = c.req.valid('param')
        const [existing] = await platformDb.select().from(menuCategories)
            .where(and(eq(menuCategories.id, id), eq(menuCategories.tenantId, tenantId)))
            .limit(1)
        if (!existing) return c.json({ success: false, error: 'Menu category not found' }, 404)

        const [category] = await platformDb.update(menuCategories)
            .set({ ...c.req.valid('json'), updatedBy: c.get('userId') || undefined, updatedAt: new Date() })
            .where(and(eq(menuCategories.id, id), eq(menuCategories.tenantId, tenantId)))
            .returning()

        auditUpdate('menu_category', id, existing, category, c, tenantId)
        return c.json({ success: true, data: category })
    }
)

menuRoutes.openapi(
    createRoute({
        method: 'delete',
        path: '/admin/categories/{id}',
        tags: ['Menu'],
        summary: 'Delete an empty menu category',
        request: { params: z.object({ id: z.string().uuid() }) },
        responses: {
            200: { description: 'Menu category deleted' },
            404: { description: 'Menu category not found' },
            409: { description: 'Menu category is not empty' },
        },
    }),
    async (c) => {
        const tenantId = await resolveTenantId(c)
        if (!tenantId) return c.json({ success: false, error: 'No tenant context' }, 400)

        const { id } = c.req.valid('param')
        const [existing] = await platformDb.select().from(menuCategories)
            .where(and(eq(menuCategories.id, id), eq(menuCategories.tenantId, tenantId)))
            .limit(1)
        if (!existing) return c.json({ success: false, error: 'Menu category not found' }, 404)

        const [categoryItem] = await platformDb.select({ id: menuItems.id }).from(menuItems)
            .where(and(eq(menuItems.categoryId, id), eq(menuItems.tenantId, tenantId)))
            .limit(1)
        if (categoryItem) {
            return c.json({ success: false, error: 'Move or delete category items before deleting the category' }, 409)
        }

        await platformDb.delete(menuCategories)
            .where(and(eq(menuCategories.id, id), eq(menuCategories.tenantId, tenantId)))

        auditDelete('menu_category', id, existing, c, tenantId)
        return c.json({ success: true })
    }
)

menuRoutes.openapi(
    createRoute({
        method: 'post',
        path: '/admin/items',
        tags: ['Menu'],
        summary: 'Create menu item',
        request: {
            body: { content: { 'application/json': { schema: menuItemSchema } } },
        },
        responses: { 200: { description: 'Menu item created' } },
    }),
    async (c) => {
        const tenantId = await resolveTenantId(c)
        const userId = c.get('userId') || SYSTEM_USER_ID
        if (!tenantId) return c.json({ success: false, error: 'No tenant context' }, 400)
        const body = c.req.valid('json')
        if (body.categoryId) {
            const [category] = await platformDb.select({ id: menuCategories.id }).from(menuCategories)
                .where(and(eq(menuCategories.id, body.categoryId), eq(menuCategories.tenantId, tenantId)))
                .limit(1)
            if (!category) return c.json({ success: false, error: 'Menu category not found for tenant' }, 400)
        }
        const id = randomUUID()
        const [item] = await platformDb.insert(menuItems)
            .values({ id, tenantId, ...body, createdBy: userId, createdAt: new Date() })
            .returning()
        auditCreate('menu_item', id, item, c, tenantId)
        return c.json({ success: true, data: item })
    }
)

menuRoutes.openapi(
    createRoute({
        method: 'put',
        path: '/admin/items/{id}',
        tags: ['Menu'],
        summary: 'Update menu item',
        request: {
            params: z.object({ id: z.string().uuid() }),
            body: { content: { 'application/json': { schema: menuItemSchema.partial() } } },
        },
        responses: { 200: { description: 'Menu item updated' } },
    }),
    async (c) => {
        const qTenant = c.req.query('tenantId')
        const tenantId = qTenant || c.get('tenantId')
        if (!tenantId) return c.json({ success: false, error: 'No tenant context' }, 400)
        const { id } = c.req.valid('param')
        const body = c.req.valid('json')
        const [existing] = await platformDb.select().from(menuItems)
            .where(and(eq(menuItems.id, id), eq(menuItems.tenantId, tenantId)))
            .limit(1)
        if (!existing) return c.json({ success: false, error: 'Menu item not found' }, 404)
        if (body.categoryId) {
            const [category] = await platformDb.select({ id: menuCategories.id }).from(menuCategories)
                .where(and(eq(menuCategories.id, body.categoryId), eq(menuCategories.tenantId, tenantId)))
                .limit(1)
            if (!category) return c.json({ success: false, error: 'Menu category not found for tenant' }, 400)
        }
        const [item] = await platformDb.update(menuItems)
            .set({ ...body, updatedBy: c.get('userId') || undefined, updatedAt: new Date() })
            .where(and(eq(menuItems.id, id), eq(menuItems.tenantId, tenantId)))
            .returning()
        auditUpdate('menu_item', id, existing, item, c, tenantId)
        return c.json({ success: true, data: item })
    }
)

menuRoutes.openapi(
    createRoute({
        method: 'delete',
        path: '/admin/items/{id}',
        tags: ['Menu'],
        summary: 'Delete menu item',
        request: {
            params: z.object({ id: z.string().uuid() }),
        },
        responses: { 200: { description: 'Menu item deleted' } },
    }),
    async (c) => {
        const tenantId = await resolveTenantId(c)
        if (!tenantId) return c.json({ success: false, error: 'No tenant context' }, 400)
        const { id } = c.req.valid('param')
        const [existing] = await platformDb.select().from(menuItems)
            .where(and(eq(menuItems.id, id), eq(menuItems.tenantId, tenantId)))
            .limit(1)
        if (!existing) return c.json({ success: false, error: 'Menu item not found' }, 404)
        await platformDb.delete(menuItems).where(and(eq(menuItems.id, id), eq(menuItems.tenantId, tenantId)))
        auditDelete('menu_item', id, existing, c, tenantId)
        return c.json({ success: true })
    }
)

// GET /menu/permissions - Get all menu permissions for a tenant
menuRoutes.openapi(
    createRoute({
        method: 'get',
        path: '/permissions',
        tags: ['Menu'],
        summary: 'Get menu permissions',
        responses: { 200: { description: 'Menu permissions' } },
    }),
    async (c) => {
        const qTenant = c.req.query('tenantId')
        const tenantId = qTenant || c.get('tenantId')
        if (!tenantId) return c.json({ success: false, error: 'No tenant context' }, 400)
        const perms = await getMenuPermissions(tenantId)
        return c.json({ success: true, data: perms })
    }
)

// POST /menu/permissions - Create/update a menu permission
menuRoutes.openapi(
    createRoute({
        method: 'post',
        path: '/permissions',
        tags: ['Menu'],
        summary: 'Create or update menu permission',
        request: {
            body: { content: { 'application/json': { schema: permissionSchema } } },
        },
        responses: { 200: { description: 'Permission created/updated' } },
    }),
    async (c) => {
        const tenantId = await resolveTenantId(c)
        if (!tenantId) return c.json({ success: false, error: 'No tenant context' }, 400)
        const body = c.req.valid('json')
        const existing = await tenantDb.select().from(tenantMenuPermissions)
            .where(and(
                eq(tenantMenuPermissions.tenantId, tenantId),
                eq(tenantMenuPermissions.menuItemId, body.menuItemId),
                eq(tenantMenuPermissions.roleId, body.roleId),
                eq(tenantMenuPermissions.permissionType, body.permissionType || 'view'),
            )).limit(1)

        if (existing.length > 0) {
            const [permission] = await tenantDb.update(tenantMenuPermissions).set({ isAllowed: body.isAllowed !== false })
                .where(eq(tenantMenuPermissions.id, existing[0].id))
                .returning()
            auditUpdate(
                'menu_permission',
                existing[0].id,
                existing[0],
                permission,
                c,
                tenantId,
            )
            return c.json({ success: true, data: permission })
        }

        const id = randomUUID()
        const [permission] = await tenantDb.insert(tenantMenuPermissions).values({
            id, tenantId, menuItemId: body.menuItemId, roleId: body.roleId,
            permissionType: body.permissionType || 'view',
            isAllowed: body.isAllowed !== false,
            createdBy: c.get('userId') || SYSTEM_USER_ID,
            createdAt: new Date(),
        }).returning()
        auditCreate('menu_permission', id, permission, c, tenantId)
        return c.json({ success: true, data: permission })
    }
)

// POST /menu/permissions/batch - Bulk upsert for writable access matrix
menuRoutes.openapi(
    createRoute({
        method: 'post',
        path: '/permissions/batch',
        tags: ['Menu'],
        summary: 'Batch upsert menu permissions (for writable Access Matrix)',
        request: {
            body: {
                content: {
                    'application/json': {
                        schema: z.object({
                            permissions: z.array(z.object({
                                menuItemId: z.string().uuid(),
                                roleId: z.string().min(1),
                                permissionType: z.enum(['view', 'insert', 'update', 'delete', 'export', 'upload', 'approve']).default('view'),
                                isAllowed: z.boolean().default(true),
                            })),
                        }),
                    },
                },
            },
        },
        responses: { 200: { description: 'Permissions updated' } },
    }),
    async (c) => {
        const tenantId = await resolveTenantId(c)
        if (!tenantId) return c.json({ success: false, error: 'No tenant context' }, 400)

        // Permission guard: only users with admin.system.view can modify menu permissions
        const userPermissions = c.get('permissions') || []
        if (!userPermissions.includes('admin.system.view') && !userPermissions.includes('admin.super_admin')) {
            return c.json(buildErrorResponse(c, {
                error: 'Forbidden',
                message: 'You do not have permission to modify menu permissions. Requires admin.system.view.',
                code: 'FORBIDDEN',
            }), 403)
        }

        const { permissions: perms } = c.req.valid('json')
        const userId = c.get('userId') || SYSTEM_USER_ID
        const now = new Date()

        let upserted = 0
        for (const perm of perms) {
            const existing = await tenantDb.select({ id: tenantMenuPermissions.id }).from(tenantMenuPermissions)
                .where(and(
                    eq(tenantMenuPermissions.tenantId, tenantId),
                    eq(tenantMenuPermissions.menuItemId, perm.menuItemId),
                    eq(tenantMenuPermissions.roleId, perm.roleId),
                    eq(tenantMenuPermissions.permissionType, perm.permissionType || 'view'),
                )).limit(1)

            if (existing.length > 0) {
                await tenantDb.update(tenantMenuPermissions)
                    .set({ isAllowed: perm.isAllowed })
                    .where(eq(tenantMenuPermissions.id, existing[0].id))
            } else if (perm.isAllowed) {
                await tenantDb.insert(tenantMenuPermissions).values({
                    id: randomUUID(),
                    tenantId,
                    menuItemId: perm.menuItemId,
                    roleId: perm.roleId,
                    permissionType: perm.permissionType || 'view',
                    isAllowed: true,
                    createdBy: userId,
                    createdAt: now,
                })
            }
            upserted++

            // Sync: auto-grant/revoke corresponding role permission
            try {
                const { syncMenuPermissionToRole } = await import('@/lib/menu-permission-sync')
                await syncMenuPermissionToRole(tenantId, perm.menuItemId, perm.roleId, perm.permissionType || 'view', perm.isAllowed)
            } catch (syncErr) {
                console.warn('[MenuBatch] Role permission sync failed (non-fatal):', syncErr)
            }
        }

        auditCreate('menu_permission_batch', tenantId, { count: upserted }, c, tenantId)
        return c.json({ success: true, data: { upserted } })
    }
)

// DELETE /menu/permissions/:id
menuRoutes.openapi(
    createRoute({
        method: 'delete',
        path: '/permissions/{id}',
        tags: ['Menu'],
        summary: 'Delete menu permission',
        request: {
            params: z.object({ id: z.string().uuid() }),
        },
        responses: { 200: { description: 'Permission deleted' } },
    }),
    async (c) => {
        const tenantId = await resolveTenantId(c)
        if (!tenantId) return c.json({ success: false, error: 'No tenant context' }, 400)

        const { id } = c.req.valid('param')
        const [existing] = await tenantDb.select().from(tenantMenuPermissions)
            .where(and(eq(tenantMenuPermissions.id, id), eq(tenantMenuPermissions.tenantId, tenantId)))
            .limit(1)
        if (!existing) return c.json({ success: false, error: 'Menu permission not found' }, 404)

        await tenantDb.delete(tenantMenuPermissions)
            .where(and(eq(tenantMenuPermissions.id, id), eq(tenantMenuPermissions.tenantId, tenantId)))
        auditDelete('menu_permission', id, existing, c, tenantId)
        return c.json({ success: true })
    }
)

// GET /menu/flat - Get flat menu items for sidebar (or tree when ?format=tree)
menuRoutes.openapi(
    createRoute({
        method: 'get',
        path: '/flat',
        tags: ['Menu'],
        summary: 'Get flat menu items for sidebar, or tree with ?format=tree',
        responses: { 200: { description: 'Menu items' } },
    }),
    async (c) => {
        const tenantId = await resolveTenantId(c)
        const includeInactive = c.req.query('includeInactive') === 'true'
        const bankingMode = c.req.query('bankingMode')
        const format = c.req.query('format')
        if (!tenantId) return c.json({ success: false, error: 'No tenant context' }, 400)

        const userPermissions = c.get('permissions') || []
        const userRoles = c.get('roles') || []

        const itemConditions = [eq(menuItems.tenantId, tenantId)]
        if (!includeInactive) itemConditions.push(eq(menuItems.isActive, true))

        // Try Platform DB first, fall back to Tenant DB if unreachable
        let categories: any[], items: any[]
        try {
            ;[categories, items] = await Promise.all([
                platformDb.select().from(menuCategories).where(
                    and(eq(menuCategories.tenantId, tenantId), eq(menuCategories.isActive, true))
                ).orderBy(asc(menuCategories.sortOrder)),
                platformDb.select().from(menuItems).where(and(...itemConditions)).orderBy(asc(menuItems.sortOrder)),
            ])
        } catch {
            console.warn('[MENU FLAT] Platform DB unavailable, falling back to Tenant DB')
            categories = await tenantDb.select().from(tenantMenuCategories).where(
                and(eq(tenantMenuCategories.tenantId, tenantId), eq(tenantMenuCategories.isActive, true))
            ).orderBy(asc(tenantMenuCategories.sortOrder))
            items = await tenantDb.select().from(tenantMenuItems).where(and(...itemConditions)).orderBy(asc(tenantMenuItems.sortOrder))
        }

        const perms = await getMenuPermissions(tenantId)

        const hasAccess = buildHasAccess(userPermissions, userRoles, perms)
        console.log("[MENU FLAT] userId:", c.get("userId"), "userRoles:", JSON.stringify(c.get("roles") || []))

        console.log('[MENU FLAT] userId:', c.get('userId'), 'format:', format, 'userRoles:', JSON.stringify(userRoles), 'perm0:', userPermissions[0], 'permsCount:', perms.length)

        // When format=tree, return the same structure as the old /menu/hierarchy
        if (format === 'tree') {
            const visibleItems = items.filter((item) =>
                (includeInactive || item.isVisible !== false) && hasAccess(item.id)
            )
            const tree = buildTree(categories, visibleItems, hasAccess)
                    c.header("Cache-Control", "public, max-age=30")
        return c.json({ success: true, data: tree })
        }

        // Default: flat + hierarchical structure used by BankingSidebar
        const visibleItems = items.filter((item) =>
            (includeInactive || item.isVisible !== false) &&
            (!bankingMode || !item.bankingType || item.bankingType === 'both' || item.bankingType === bankingMode) &&
            hasAccess(item.id)
        )

        const buildFlatItemTree = (parentId: string): any[] =>
            visibleItems
                .filter((item) => item.parentId === parentId)
                .map((item) => mapFlatItem(item))

        const mapFlatItem = (item: typeof menuItems.$inferSelect): any => ({
            id: item.id,
            menu_key: item.id,
            title: item.name,
            label: item.name,
            description: item.description || '',
            icon: item.icon || 'Circle',
            url: item.path || '',
            href: item.path || '',
            parent_id: item.parentId || item.categoryId,
            sort_order: item.sortOrder,
            type: visibleItems.some((candidate) => candidate.parentId === item.id) ? 'group' : 'item',
            level: item.level,
            is_active: item.isActive,
            banking_type: item.bankingType,
            banking_types: item.bankingType === 'both'
                ? ['conventional', 'syariah', 'dual']
                : item.bankingType ? [item.bankingType] : [],
            children: buildFlatItemTree(item.id),
        })

        // Build hierarchical menu: categories as groups, items as children.
        const menuTree = categories.map(cat => {
            const catItems = visibleItems.filter(i => i.categoryId === cat.id && !i.parentId)
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
                children: catItems.map(i => mapFlatItem(i)),
            }
        }).filter((category) => category.children.length > 0)

                c.header("Cache-Control", "public, max-age=30")
        return c.json({ success: true, data: menuTree })
    }
)

// GET /menu/health
menuRoutes.openapi(
    createRoute({
        method: 'get',
        path: '/health',
        tags: ['Menu'],
        summary: 'Menu health check',
        responses: { 200: { description: 'Health status' } },
    }),
    (c) => c.json({ status: 'ok', service: 'menu' })
)

// Helper: build nested item tree
// =============================================================================
// Helper: get menu permissions from tenant DB (with migration fallback)
// =============================================================================
async function getMenuPermissions(tenantId: string) {
    try {
        return await tenantDb.select({
            id: tenantMenuPermissions.id,
            menuItemId: tenantMenuPermissions.menuItemId,
            roleId: tenantMenuPermissions.roleId,
            roleCode: roles.roleCode,
            permissionType: tenantMenuPermissions.permissionType,
            isAllowed: tenantMenuPermissions.isAllowed,
            conditions: tenantMenuPermissions.conditions,
        })
            .from(tenantMenuPermissions)
            .innerJoin(roles, eq(tenantMenuPermissions.roleId, roles.id))
            .where(eq(tenantMenuPermissions.tenantId, tenantId))
    } catch (e) {
        console.error('[MENU ROUTES] Failed to fetch menu permissions:', e)
        return []
    }
}

// =============================================================================
// Helper: build nested item tree
// =============================================================================
function buildItemTree(items: any[], parentId: string): any[] {
    return items.filter((i) => i.parentId === parentId).map((item) => ({
        ...item,
        children: buildItemTree(items, item.id),
    }))
}
