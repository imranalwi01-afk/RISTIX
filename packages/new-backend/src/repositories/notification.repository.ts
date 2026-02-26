import { and, desc, eq, gte, ilike, inArray, isNotNull, isNull, like, lte, not, or, sql } from 'drizzle-orm'
import { getDatabase } from '@/config/database'
import {
    notifications,
    notificationDeliveries,
    type Notification,
    type NotificationDelivery,
} from '@/db/schema'

export interface CreateNotificationInput {
    tenantId: string
    approvalRequestId?: string
    workflowId?: string
    type: string
    severity: 'info' | 'warning' | 'success' | 'error'
    title: string
    message: string
    actionUrl?: string
    entityType?: string
    entityId?: string
    source?: string
    triggeredBy?: string
    metadata?: Record<string, unknown>
    userTargets?: string[]
    roleTargets?: string[]
    channel?: 'in_app' | 'socket' | 'email' | 'webhook'
    deliveryStatus?: 'pending' | 'sent' | 'failed' | 'read'
    deliveredAt?: Date
    errorMessage?: string
}

export interface UserNotificationRow {
    id: string
    notificationId: string
    type: string
    severity: string
    title: string
    message: string
    actionUrl: string | null
    workflowId: string | null
    approvalRequestId: string | null
    entityType: string | null
    entityId: string | null
    source: string
    metadata: Record<string, unknown> | null
    deliveryStatus: string
    deliveredAt: Date | null
    readAt: Date | null
    createdAt: Date
}

export type NotificationCategory = 'approval' | 'workflow' | 'analytics' | 'system'
export type NotificationReadStatus = 'all' | 'read' | 'unread'

const buildCategoryPredicate = (category?: NotificationCategory) => {
    if (!category || category === 'system') {
        if (!category) return undefined
        return not(
            or(
                like(notifications.type, 'APPROVAL_%'),
                like(notifications.type, 'WORKFLOW_%'),
                like(notifications.type, 'ECL_%'),
                like(notifications.type, 'ANALYTICS_%'),
            )!
        )
    }

    if (category === 'approval') {
        return like(notifications.type, 'APPROVAL_%')
    }

    if (category === 'workflow') {
        return like(notifications.type, 'WORKFLOW_%')
    }

    return or(
        like(notifications.type, 'ECL_%'),
        like(notifications.type, 'ANALYTICS_%')
    )
}

export const NotificationRepository = {
    async createWithDeliveries(input: CreateNotificationInput): Promise<{
        notification: Notification
        deliveries: NotificationDelivery[]
    }> {
        const dbx = getDatabase(input.tenantId)

        return dbx.transaction(async (tx) => {
            const [notification] = await tx
                .insert(notifications)
                .values({
                    tenantId: input.tenantId,
                    approvalRequestId: input.approvalRequestId,
                    workflowId: input.workflowId,
                    type: input.type,
                    severity: input.severity,
                    title: input.title,
                    message: input.message,
                    actionUrl: input.actionUrl,
                    entityType: input.entityType,
                    entityId: input.entityId,
                    source: input.source || 'approval_service',
                    triggeredBy: input.triggeredBy,
                    metadata: input.metadata,
                })
                .returning()

            const userTargets = Array.from(new Set((input.userTargets || []).filter(Boolean)))
            const roleTargets = Array.from(new Set((input.roleTargets || []).filter(Boolean)))

            const values: (typeof notificationDeliveries.$inferInsert)[] = []

            userTargets.forEach((userId) => {
                values.push({
                    notificationId: notification.id,
                    tenantId: input.tenantId,
                    recipientUserId: userId,
                    channel: input.channel || 'socket',
                    deliveryStatus: input.deliveryStatus || 'sent',
                    deliveredAt: input.deliveredAt || new Date(),
                    errorMessage: input.errorMessage,
                    metadata: input.metadata,
                })
            })

            roleTargets.forEach((role) => {
                values.push({
                    notificationId: notification.id,
                    tenantId: input.tenantId,
                    recipientRole: role,
                    channel: input.channel || 'socket',
                    deliveryStatus: input.deliveryStatus || 'sent',
                    deliveredAt: input.deliveredAt || new Date(),
                    errorMessage: input.errorMessage,
                    metadata: input.metadata,
                })
            })

            if (values.length === 0) {
                values.push({
                    notificationId: notification.id,
                    tenantId: input.tenantId,
                    channel: input.channel || 'socket',
                    deliveryStatus: input.deliveryStatus || 'sent',
                    deliveredAt: input.deliveredAt || new Date(),
                    errorMessage: input.errorMessage,
                    metadata: input.metadata,
                })
            }

            const deliveries = await tx
                .insert(notificationDeliveries)
                .values(values)
                .returning()

            return { notification, deliveries }
        })
    },

    async listForUser(input: {
        tenantId: string
        userId: string
        unreadOnly?: boolean
        readStatus?: NotificationReadStatus
        category?: NotificationCategory
        search?: string
        dateFrom?: Date
        dateTo?: Date
        limit?: number
        offset?: number
    }): Promise<{ rows: UserNotificationRow[]; total: number }> {
        const dbx = getDatabase(input.tenantId)
        const limit = Math.max(1, Math.min(200, Number(input.limit || 50)))
        const offset = Math.max(0, Number(input.offset || 0))
        const normalizedSearch = typeof input.search === 'string' ? input.search.trim() : ''
        const normalizedReadStatus = input.readStatus || (input.unreadOnly ? 'unread' : 'all')

        const predicates: any[] = [
            eq(notificationDeliveries.tenantId, input.tenantId),
            eq(notificationDeliveries.recipientUserId, input.userId),
        ]

        if (normalizedReadStatus === 'unread') {
            predicates.push(isNull(notificationDeliveries.readAt))
        } else if (normalizedReadStatus === 'read') {
            predicates.push(isNotNull(notificationDeliveries.readAt))
        }

        if (normalizedSearch) {
            predicates.push(
                or(
                    ilike(notifications.title, `%${normalizedSearch}%`),
                    ilike(notifications.message, `%${normalizedSearch}%`)
                )
            )
        }

        if (input.dateFrom instanceof Date && !Number.isNaN(input.dateFrom.getTime())) {
            predicates.push(gte(notifications.createdAt, input.dateFrom))
        }

        if (input.dateTo instanceof Date && !Number.isNaN(input.dateTo.getTime())) {
            predicates.push(lte(notifications.createdAt, input.dateTo))
        }

        const categoryPredicate = buildCategoryPredicate(input.category)
        if (categoryPredicate) {
            predicates.push(categoryPredicate)
        }

        const whereClause = and(...predicates)

        const rows = await dbx
            .select({
                id: notificationDeliveries.id,
                notificationId: notifications.id,
                type: notifications.type,
                severity: notifications.severity,
                title: notifications.title,
                message: notifications.message,
                actionUrl: notifications.actionUrl,
                workflowId: notifications.workflowId,
                approvalRequestId: notifications.approvalRequestId,
                entityType: notifications.entityType,
                entityId: notifications.entityId,
                source: notifications.source,
                metadata: notifications.metadata,
                deliveryStatus: notificationDeliveries.deliveryStatus,
                deliveredAt: notificationDeliveries.deliveredAt,
                readAt: notificationDeliveries.readAt,
                createdAt: notifications.createdAt,
            })
            .from(notificationDeliveries)
            .innerJoin(notifications, eq(notificationDeliveries.notificationId, notifications.id))
            .where(whereClause)
            .orderBy(desc(notifications.createdAt), desc(notificationDeliveries.createdAt))
            .limit(limit)
            .offset(offset)

        const [countRow] = await dbx
            .select({ value: sql<number>`count(*)::int` })
            .from(notificationDeliveries)
            .innerJoin(notifications, eq(notificationDeliveries.notificationId, notifications.id))
            .where(whereClause)

        return {
            rows: rows as UserNotificationRow[],
            total: Number(countRow?.value || 0),
        }
    },

    async getUnreadCount(tenantId: string, userId: string): Promise<number> {
        const dbx = getDatabase(tenantId)
        const [row] = await dbx
            .select({ value: sql<number>`count(*)::int` })
            .from(notificationDeliveries)
            .where(
                and(
                    eq(notificationDeliveries.tenantId, tenantId),
                    eq(notificationDeliveries.recipientUserId, userId),
                    isNull(notificationDeliveries.readAt),
                )
            )

        return Number(row?.value || 0)
    },

    async markAsRead(input: {
        tenantId: string
        userId: string
        notificationId: string
    }): Promise<boolean> {
        const dbx = getDatabase(input.tenantId)
        const rows = await dbx
            .update(notificationDeliveries)
            .set({
                deliveryStatus: 'read',
                readAt: new Date(),
                updatedAt: new Date(),
            })
            .where(
                and(
                    eq(notificationDeliveries.tenantId, input.tenantId),
                    eq(notificationDeliveries.recipientUserId, input.userId),
                    eq(notificationDeliveries.notificationId, input.notificationId),
                )
            )
            .returning({ id: notificationDeliveries.id })

        return rows.length > 0
    },

    async markAllAsRead(input: {
        tenantId: string
        userId: string
    }): Promise<number> {
        const dbx = getDatabase(input.tenantId)
        const rows = await dbx
            .update(notificationDeliveries)
            .set({
                deliveryStatus: 'read',
                readAt: new Date(),
                updatedAt: new Date(),
            })
            .where(
                and(
                    eq(notificationDeliveries.tenantId, input.tenantId),
                    eq(notificationDeliveries.recipientUserId, input.userId),
                    isNull(notificationDeliveries.readAt),
                )
            )
            .returning({ id: notificationDeliveries.id })

        return rows.length
    },

    async markManyReadStatus(input: {
        tenantId: string
        userId: string
        notificationIds: string[]
        read: boolean
    }): Promise<number> {
        const dbx = getDatabase(input.tenantId)
        const uniqueIds = Array.from(new Set((input.notificationIds || []).filter(Boolean)))
        if (uniqueIds.length === 0) return 0

        const rows = await dbx
            .update(notificationDeliveries)
            .set({
                deliveryStatus: input.read ? 'read' : 'sent',
                readAt: input.read ? new Date() : null,
                updatedAt: new Date(),
            })
            .where(
                and(
                    eq(notificationDeliveries.tenantId, input.tenantId),
                    eq(notificationDeliveries.recipientUserId, input.userId),
                    inArray(notificationDeliveries.notificationId, uniqueIds),
                )
            )
            .returning({ id: notificationDeliveries.id })

        return rows.length
    },
}
