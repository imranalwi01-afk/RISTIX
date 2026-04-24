import { and, desc, eq, ne } from 'drizzle-orm'
import { tenantConnection, tenantDb } from '@/config'
import { userTableViews } from '@/db/schema/core'

export type UpsertUserTableViewInput = {
    tenantId: string
    userId: string
    scope: string
    viewKey: string
    name?: string
    isDefault?: boolean
    state: Record<string, unknown>
}

let ensured = false

async function ensureUserTableViewsTable() {
    if (ensured) return
    await tenantConnection.unsafe(`
        CREATE SCHEMA IF NOT EXISTS core;

        CREATE TABLE IF NOT EXISTS core.user_table_views (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            tenant_id VARCHAR(100) NOT NULL,
            user_id UUID NOT NULL,
            scope VARCHAR(160) NOT NULL,
            view_key VARCHAR(160) NOT NULL,
            name VARCHAR(160),
            is_default BOOLEAN NOT NULL DEFAULT FALSE,
            state JSONB NOT NULL DEFAULT '{}'::jsonb,
            created_at TIMESTAMPTZ DEFAULT now(),
            updated_at TIMESTAMPTZ DEFAULT now(),
            CONSTRAINT user_table_views_tenant_user_scope_key_unique
                UNIQUE (tenant_id, user_id, scope, view_key)
        );

        CREATE INDEX IF NOT EXISTS user_table_views_tenant_user_scope_idx
            ON core.user_table_views (tenant_id, user_id, scope);
        CREATE INDEX IF NOT EXISTS user_table_views_default_idx
            ON core.user_table_views (tenant_id, user_id, scope, is_default);
    `)
    ensured = true
}

export const UserTableViewsRepository = {
    async list(tenantId: string, userId: string, scope: string) {
        await ensureUserTableViewsTable()
        return tenantDb.select()
            .from(userTableViews)
            .where(and(
                eq(userTableViews.tenantId, tenantId),
                eq(userTableViews.userId, userId),
                eq(userTableViews.scope, scope),
            ))
            .orderBy(desc(userTableViews.isDefault), desc(userTableViews.updatedAt))
    },

    async upsert(input: UpsertUserTableViewInput) {
        await ensureUserTableViewsTable()
        if (input.isDefault) {
            await tenantDb.update(userTableViews)
                .set({ isDefault: false, updatedAt: new Date() })
                .where(and(
                    eq(userTableViews.tenantId, input.tenantId),
                    eq(userTableViews.userId, input.userId),
                    eq(userTableViews.scope, input.scope),
                    ne(userTableViews.viewKey, input.viewKey),
                ))
        }

        const [view] = await tenantDb.insert(userTableViews)
            .values({
                tenantId: input.tenantId,
                userId: input.userId,
                scope: input.scope,
                viewKey: input.viewKey,
                name: input.name ?? input.viewKey,
                isDefault: input.isDefault ?? false,
                state: input.state,
                updatedAt: new Date(),
            })
            .onConflictDoUpdate({
                target: [
                    userTableViews.tenantId,
                    userTableViews.userId,
                    userTableViews.scope,
                    userTableViews.viewKey,
                ],
                set: {
                    name: input.name ?? input.viewKey,
                    isDefault: input.isDefault ?? false,
                    state: input.state,
                    updatedAt: new Date(),
                },
            })
            .returning()

        return view
    },

    async remove(tenantId: string, userId: string, scope: string, viewKey: string) {
        await ensureUserTableViewsTable()
        const [deleted] = await tenantDb.delete(userTableViews)
            .where(and(
                eq(userTableViews.tenantId, tenantId),
                eq(userTableViews.userId, userId),
                eq(userTableViews.scope, scope),
                eq(userTableViews.viewKey, viewKey),
            ))
            .returning()
        return deleted
    },
}
