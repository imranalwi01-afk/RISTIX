import { platformDb } from '@/config'
import { getDatabase } from '@/config/database'
import { menuCategories, menuItems } from '@/db/schema/menu.schema'
import { tenantMenuCategories, tenantMenuItems } from '@/db/schema'
import { eq, inArray } from 'drizzle-orm'
import { logger } from '@/lib/logger'

/**
 * Sync menu items + categories from Platform DB to each tenant's local core schema.
 * This ensures tenant navigation works even if the Platform DB is down.
 *
 * Called once at server startup, then periodically if needed.
 */
export async function syncMenuToTenants(
  tenantIds: string[],
  signal?: AbortSignal,
): Promise<void> {
  for (const tenantId of tenantIds) {
    if (signal?.aborted) return
    await syncMenuForTenant(tenantId)
  }
}

async function syncMenuForTenant(tenantId: string): Promise<void> {
  const tenantDb = getDatabase(tenantId)
  if (!tenantDb) {
    logger.warn({ tenantId }, '[MenuSync] No tenant DB connection, skipping')
    return
  }

  try {
    // 1. Sync categories
    const platformCategories = await platformDb
      .select()
      .from(menuCategories)
      .where(eq(menuCategories.tenantId, tenantId as any))

    for (const cat of platformCategories) {
      await tenantDb
        .insert(tenantMenuCategories)
        .values({
          id: cat.id,
          tenantId: cat.tenantId,
          name: cat.name,
          description: cat.description,
          icon: cat.icon,
          color: cat.color,
          sortOrder: cat.sortOrder,
          isActive: cat.isActive,
          createdAt: cat.createdAt,
          updatedAt: cat.updatedAt,
          createdBy: cat.createdBy,
          updatedBy: cat.updatedBy,
        } as any)
        .onConflictDoUpdate({
          target: tenantMenuCategories.id,
          set: {
            name: cat.name,
            description: cat.description,
            icon: cat.icon,
            color: cat.color,
            sortOrder: cat.sortOrder,
            isActive: cat.isActive,
            updatedAt: new Date(),
          },
        })
    }

    // 2. Sync menu items
    const platformItems = await platformDb
      .select()
      .from(menuItems)
      .where(eq(menuItems.tenantId, tenantId as any))

    for (const item of platformItems) {
      await tenantDb
        .insert(tenantMenuItems)
        .values({
          id: item.id,
          tenantId: item.tenantId,
          categoryId: item.categoryId,
          parentId: item.parentId,
          name: item.name,
          description: item.description,
          path: item.path,
          icon: item.icon,
          component: item.component,
          externalUrl: item.externalUrl,
          sortOrder: item.sortOrder,
          level: item.level,
          isActive: item.isActive,
          isVisible: item.isVisible,
          isExternal: item.isExternal,
          requiresAuth: item.requiresAuth,
          bankingType: item.bankingType,
          createdAt: item.createdAt,
          updatedAt: item.updatedAt,
          createdBy: item.createdBy,
          updatedBy: item.updatedBy,
        } as any)
        .onConflictDoUpdate({
          target: tenantMenuItems.id,
          set: {
            name: item.name,
            description: item.description,
            path: item.path,
            icon: item.icon,
            sortOrder: item.sortOrder,
            level: item.level,
            isActive: item.isActive,
            isVisible: item.isVisible,
            bankingType: item.bankingType,
            updatedAt: new Date(),
          },
        })
    }



    logger.info(
      { tenantId, categories: platformCategories.length, items: platformItems.length },
      '[MenuSync] Synced menu to tenant',
    )
  } catch (error) {
    logger.error({ tenantId, error }, '[MenuSync] Failed to sync menu to tenant')
  }
}
