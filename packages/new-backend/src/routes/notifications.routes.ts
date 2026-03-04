import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi'
import { Effect, pipe } from 'effect'
import type { AppContext } from '../app'
import { authMiddleware, tenantMiddleware } from '../middleware'
import { runEffect } from '../lib/effect'
import * as notificationsService from '../services/notifications.service'

export const notificationsRoutes = new OpenAPIHono<AppContext>()

notificationsRoutes.use('*', authMiddleware)
notificationsRoutes.use('*', tenantMiddleware)

const NotificationItemSchema = z.object({
    id: z.string(),
    notificationId: z.string(),
    type: z.string(),
    category: z.enum(['approval', 'workflow', 'analytics', 'system']),
    severity: z.string(),
    title: z.string(),
    message: z.string(),
    actionUrl: z.string().nullable().optional(),
    workflowId: z.string().nullable().optional(),
    approvalRequestId: z.string().nullable().optional(),
    entityType: z.string().nullable().optional(),
    entityId: z.string().nullable().optional(),
    source: z.string(),
    metadata: z.record(z.unknown()).nullable().optional(),
    deliveryStatus: z.string(),
    deliveredAt: z.string().nullable().optional(),
    readAt: z.string().nullable().optional(),
    createdAt: z.string(),
}).openapi('NotificationItem')

const NotificationPreferencesSchema = z.object({
    muteAll: z.boolean(),
    mutedCategories: z.array(z.enum(['approval', 'workflow', 'analytics', 'system'])),
    quietHoursEnabled: z.boolean(),
    quietHoursStart: z.string().regex(/^([01][0-9]|2[0-3]):[0-5][0-9]$/),
    quietHoursEnd: z.string().regex(/^([01][0-9]|2[0-3]):[0-5][0-9]$/),
    timezone: z.string().min(1),
}).openapi('NotificationPreferences')

const UpdateNotificationPreferencesSchema = NotificationPreferencesSchema.partial()

const BulkReadStatusSchema = z.object({
    notificationIds: z.array(z.string().uuid()).min(1),
    read: z.boolean(),
})

notificationsRoutes.openapi(
    createRoute({
        method: 'get',
        path: '/',
        tags: ['Notifications'],
        summary: 'Get my notifications',
        security: [{ BearerAuth: [] }],
        request: {
            query: z.object({
                unreadOnly: z.coerce.boolean().optional(),
                readStatus: z.enum(['all', 'read', 'unread']).optional(),
                category: z.enum(['approval', 'workflow', 'analytics', 'system']).optional(),
                search: z.string().optional(),
                dateFrom: z.string().datetime().optional(),
                dateTo: z.string().datetime().optional(),
                limit: z.coerce.number().int().min(1).max(200).optional(),
                offset: z.coerce.number().int().min(0).optional(),
            }),
        },
        responses: {
            200: {
                description: 'Notifications for current user',
                content: {
                    'application/json': {
                        schema: z.object({
                            success: z.boolean(),
                            data: z.array(NotificationItemSchema),
                            meta: z.object({
                                unreadCount: z.number().int().min(0),
                                total: z.number().int().min(0),
                            }),
                        }),
                    },
                },
            },
        },
    }),
    async (c) => {
        const userId = c.get('userId')!
        const tenantId = c.get('tenantId')!
        const query = c.req.valid('query')

        const effect = Effect.gen(function* (_) {
            const result = yield* _(
                notificationsService.getMyNotifications({
                    tenantId,
                    userId,
                    unreadOnly: query.unreadOnly,
                    readStatus: query.readStatus,
                    category: query.category,
                    search: query.search,
                    dateFrom: query.dateFrom ? new Date(query.dateFrom) : undefined,
                    dateTo: query.dateTo ? new Date(query.dateTo) : undefined,
                    limit: query.limit,
                    offset: query.offset,
                })
            )

            const unreadCount = yield* _(
                notificationsService.getMyUnreadNotificationCount(tenantId, userId)
            )

            return {
                success: true,
                data: result.rows.map((item: any) => ({
                    ...item,
                    category: notificationsService.deriveNotificationCategory(item.type),
                    deliveredAt: item.deliveredAt ? new Date(item.deliveredAt).toISOString() : null,
                    readAt: item.readAt ? new Date(item.readAt).toISOString() : null,
                    createdAt: new Date(item.createdAt).toISOString(),
                })),
                meta: { unreadCount, total: result.total },
            }
        })

        return runEffect(c, effect)
    }
)

notificationsRoutes.openapi(
    createRoute({
        method: 'get',
        path: '/unread-count',
        tags: ['Notifications'],
        summary: 'Get unread notifications count',
        security: [{ BearerAuth: [] }],
        responses: {
            200: {
                description: 'Unread count',
                content: {
                    'application/json': {
                        schema: z.object({
                            success: z.boolean(),
                            data: z.object({ unreadCount: z.number().int().min(0) }),
                        }),
                    },
                },
            },
        },
    }),
    async (c) => {
        const userId = c.get('userId')!
        const tenantId = c.get('tenantId')!

        const effect = pipe(
            notificationsService.getMyUnreadNotificationCount(tenantId, userId),
            Effect.map((unreadCount) => ({ unreadCount }))
        )

        return runEffect(c, effect)
    }
)

notificationsRoutes.openapi(
    createRoute({
        method: 'post',
        path: '/read-status',
        tags: ['Notifications'],
        summary: 'Bulk update notification read status',
        security: [{ BearerAuth: [] }],
        request: {
            body: {
                content: {
                    'application/json': {
                        schema: BulkReadStatusSchema,
                    },
                },
            },
        },
        responses: {
            200: {
                description: 'Bulk read status updated',
                content: {
                    'application/json': {
                        schema: z.object({
                            success: z.boolean(),
                            data: z.object({ updatedCount: z.number().int().min(0) }),
                        }),
                    },
                },
            },
        },
    }),
    async (c) => {
        const userId = c.get('userId')!
        const tenantId = c.get('tenantId')!
        const body = c.req.valid('json')

        const effect = notificationsService.markManyNotificationsReadStatus({
            tenantId,
            userId,
            notificationIds: body.notificationIds,
            read: body.read,
        })

        return runEffect(c, effect)
    }
)

notificationsRoutes.openapi(
    createRoute({
        method: 'get',
        path: '/preferences',
        tags: ['Notifications'],
        summary: 'Get my notification preferences',
        security: [{ BearerAuth: [] }],
        responses: {
            200: {
                description: 'Current notification preferences',
                content: {
                    'application/json': {
                        schema: z.object({
                            success: z.boolean(),
                            data: NotificationPreferencesSchema,
                        }),
                    },
                },
            },
        },
    }),
    async (c) => {
        const userId = c.get('userId')!
        const tenantId = c.get('tenantId')!
        const effect = notificationsService.getMyNotificationPreferences(tenantId, userId)
        return runEffect(c, effect)
    }
)

notificationsRoutes.openapi(
    createRoute({
        method: 'put',
        path: '/preferences',
        tags: ['Notifications'],
        summary: 'Update my notification preferences',
        security: [{ BearerAuth: [] }],
        request: {
            body: {
                content: {
                    'application/json': {
                        schema: UpdateNotificationPreferencesSchema,
                    },
                },
            },
        },
        responses: {
            200: {
                description: 'Updated preferences',
                content: {
                    'application/json': {
                        schema: z.object({
                            success: z.boolean(),
                            data: NotificationPreferencesSchema,
                        }),
                    },
                },
            },
        },
    }),
    async (c) => {
        const userId = c.get('userId')!
        const tenantId = c.get('tenantId')!
        const body = c.req.valid('json')

        const effect = notificationsService.updateMyNotificationPreferences({
            tenantId,
            userId,
            preferences: body,
        })

        return runEffect(c, effect)
    }
)

notificationsRoutes.openapi(
    createRoute({
        method: 'post',
        path: '/{id}/read',
        tags: ['Notifications'],
        summary: 'Mark one notification as read',
        security: [{ BearerAuth: [] }],
        request: {
            params: z.object({
                id: z.string().min(1),
            }),
        },
        responses: {
            200: {
                description: 'Marked as read',
                content: {
                    'application/json': {
                        schema: z.object({
                            success: z.boolean(),
                            data: z.object({ updated: z.boolean() }),
                        }),
                    },
                },
            },
        },
    }),
    async (c) => {
        const userId = c.get('userId')!
        const tenantId = c.get('tenantId')!
        const { id } = c.req.valid('param')

        const effect = notificationsService.markNotificationAsRead({
            tenantId,
            userId,
            notificationId: id,
        })

        return runEffect(c, effect)
    }
)

notificationsRoutes.openapi(
    createRoute({
        method: 'post',
        path: '/read-all',
        tags: ['Notifications'],
        summary: 'Mark all notifications as read',
        security: [{ BearerAuth: [] }],
        responses: {
            200: {
                description: 'Marked all as read',
                content: {
                    'application/json': {
                        schema: z.object({
                            success: z.boolean(),
                            data: z.object({ updatedCount: z.number().int().min(0) }),
                        }),
                    },
                },
            },
        },
    }),
    async (c) => {
        const userId = c.get('userId')!
        const tenantId = c.get('tenantId')!

        const effect = notificationsService.markAllNotificationsAsRead({
            tenantId,
            userId,
        })

        return runEffect(c, effect)
    }
)
