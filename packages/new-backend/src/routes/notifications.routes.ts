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
            const notifications = yield* _(
                notificationsService.getMyNotifications({
                    tenantId,
                    userId,
                    unreadOnly: query.unreadOnly,
                    limit: query.limit,
                    offset: query.offset,
                })
            )

            const unreadCount = yield* _(
                notificationsService.getMyUnreadNotificationCount(tenantId, userId)
            )

            return {
                success: true,
                data: notifications.map((item: any) => ({
                    ...item,
                    deliveredAt: item.deliveredAt ? new Date(item.deliveredAt).toISOString() : null,
                    readAt: item.readAt ? new Date(item.readAt).toISOString() : null,
                    createdAt: new Date(item.createdAt).toISOString(),
                })),
                meta: { unreadCount },
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
