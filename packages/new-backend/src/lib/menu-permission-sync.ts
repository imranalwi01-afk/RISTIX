import { platformDb, tenantDb, getDatabase } from '@/config/database'
import { menuItems as platformMenuItems } from '@/db/schema/menu.schema'
import { permissions, rolePermissions } from '@/db/schema'
import { eq, and, inArray } from 'drizzle-orm'

/**
 * Maps menu item names to their corresponding permission code stems.
 * The stem is the prefix before the action suffix (.view, .create, etc.).
 * e.g., "Segmentation Configuration" → "banking.parameter.segmentation"
 */
const MENU_TO_PERMISSION_STEM: Record<string, string> = {
  'Overview': 'banking.dashboard',
  'Executive Dashboard': 'banking.dashboard',
  'Dashboard': 'banking.dashboard',
  'Parameter Setup': 'banking.parameter',
  'Application Configuration': 'banking.setup.application',
  'Business Configuration': 'banking.setup.business',
  'Product Parameters': 'banking.parameter.product',
  'Journal Parameter': 'banking.parameter.journal',
  'Accounting Parameters': 'banking.parameter.journal',
  'Segmentation Configuration': 'banking.parameter.segmentation',
  'Bucket Parameter': 'banking.collective.bucket',
  'Rule Base Setting': 'banking.collective.rule_base',
  'PD Setup': 'banking.collective.pd',
  'PD Setup Management': 'banking.collective.pd',
  'LGD Setup': 'banking.collective.lgd',
  'LGD Setup Management': 'banking.collective.lgd',
  'EAD Setup': 'banking.collective.ead',
  'EAD Model': 'banking.collective.ead',
  'ECL Configuration': 'banking.collective.ecl',
  'ECL Calculations': 'banking.collective.ecl',
  'ECL Movement': 'banking.reports.ifrs9.movement',
  'ECL Result': 'banking.reports.ifrs9.ecl_result',
  'GCA Movement': 'banking.reports.ifrs9.gca',
  'Lifetime PD': 'banking.reports.ifrs9.lifetime_pd',
  'Lifetime LGD': 'banking.reports.ifrs9.lifetime_lgd',
  'Nominative Report': 'banking.reports.ifrs9.nominative',
  'Individual Provision': 'banking.individual',
  'Individual Impairment': 'banking.individual',
  'Individual Assessment Override': 'banking.individual',
  'Process Monitoring': 'banking.processing',
  'Impairment Module': 'banking.processing.impairment',
  'Amortization Module': 'banking.processing.amortization',
  'R Analytics': 'banking.analytics.r',
  'Advanced Analytics': 'banking.analytics',
  'Workflow Configuration': 'banking.configuration.ifrs9',
  'Maintenance': 'banking.maintenance',
  'Tools': 'banking.tools',
  'Data Upload': 'banking.tools.upload',
  'Data Validation': 'banking.tools.etl',
  'Approval System': 'approval',
  'Notifications': 'notifications',
  'Access Management': 'admin.maintenance',
  'Users': 'admin.users',
  'Assignments': 'admin.users',
  'User Activity': 'admin.maintenance',
  'Audit Log': 'admin.maintenance',
  'Menu Matrix': 'admin.maintenance',
  'Menu Management': 'admin.maintenance',
  'SMTP': 'admin.maintenance',
  'Job Monitoring': 'jobs',
  'Impersonate': 'admin.super_admin',
}

/**
 * Maps menu permission action types to role permission action suffixes
 */
const ACTION_TO_PERMISSION_SUFFIX: Record<string, string> = {
  view: 'view',
  insert: 'create',
  update: 'update',
  delete: 'delete',
  export: 'export',
  upload: 'create',
  approve: 'approve',
}

/**
 * Sync a menu permission toggle to role permissions in core.role_permissions.
 * When a menu permission is granted/revoked, the corresponding role permission
 * code is also granted/revoked so the user can actually access the feature.
 */
export async function syncMenuPermissionToRole(
  tenantId: string,
  menuItemId: string,
  roleId: string,
  permissionType: string,
  isAllowed: boolean,
): Promise<void> {
  const tenantDb = getDatabase(tenantId)
  if (!tenantDb) return

  // 1. Look up menu item
  const items = await platformDb
    .select({ name: platformMenuItems.name })
    .from(platformMenuItems)
    .where(eq(platformMenuItems.id, menuItemId as any))
    .limit(1)

  const itemName = items[0]?.name
  if (!itemName) return

  // 2. Map to permission stem
  const stem = MENU_TO_PERMISSION_STEM[itemName]
  if (!stem) return

  // 3. Build permission code
  const suffix = ACTION_TO_PERMISSION_SUFFIX[permissionType] || permissionType
  const permissionCode = `${stem}.${suffix}`

  try {
    // 4. Find the permission in core.permissions
    const permRows = await tenantDb
      .select({ id: permissions.id })
      .from(permissions)
      .where(eq(permissions.code, permissionCode))
      .limit(1)

    if (permRows.length === 0) return

    const permissionId = permRows[0].id

    // 5. Grant or revoke
    if (isAllowed) {
      await tenantDb
        .insert(rolePermissions)
        .values({ roleId: roleId as any, permissionId: permissionId as any, grantedAt: new Date() })
        .onConflictDoNothing()
    } else {
      await tenantDb
        .delete(rolePermissions)
        .where(
          and(
            eq(rolePermissions.roleId, roleId as any),
            eq(rolePermissions.permissionId, permissionId as any),
          ),
        )
    }
  } catch (error) {
    console.warn(`[MenuPermissionSync] Failed to sync ${permissionCode} for role ${roleId}:`, error)
  }
}
