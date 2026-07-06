import { platformDb, getDatabase } from '@/config/database'
import { menuItems as platformMenuItems } from '@/db/schema/menu.schema'
import { permissions, rolePermissions } from '@/db/schema'
import { eq, and } from 'drizzle-orm'

/**
 * Maps menu item names to permission stems for view/insert/update/delete/export.
 */
const MENU_TO_PERMISSION_STEM: Record<string, string> = {
  'Overview': 'banking.dashboard',
  'Executive Dashboard': 'banking.dashboard',
  'Application Configuration': 'banking.setup.application',
  'Business Configuration': 'banking.setup.business',
  'Product Parameters': 'banking.parameter.product',
  'Journal Parameter': 'banking.parameter.journal',
  'Accounting Parameters': 'banking.parameter.journal',
  'Segmentation Configuration': 'banking.collective.segmentation',
  'Bucket Parameter': 'banking.collective.bucket',
  'Rule Base Setting': 'banking.collective.rule_base',
  'PD Setup': 'banking.collective.pd_setup',
  'PD Setup Management': 'banking.collective.pd_setup',
  'LGD Setup': 'banking.collective.lgd_setup',
  'LGD Setup Management': 'banking.collective.lgd_setup',
  'EAD Setup': 'banking.collective.ead_setup',
  'EAD Model': 'banking.collective.ead_setup',
  'FL Scalar': 'banking.collective.fl_scalar',
  'ECL Configuration': 'banking.collective.ecl',
  'ECL Calculations': 'banking.collective.ecl',
  'ECL Movement': 'banking.reports.ifrs9.movement',
  'ECL Result': 'banking.reports.ifrs9.ecl_result',
  'GCA Movement': 'banking.reports.ifrs9.gca',
  'Lifetime PD': 'banking.reports.ifrs9.lifetime_pd',
  'Lifetime LGD': 'banking.reports.ifrs9.lifetime_lgd',
  'Nominative Report': 'banking.reports.ifrs9.nominative',
  'Individual Impairment': 'banking.individual',
  'Individual Assessment Override': 'banking.individual',
  'R Analytics': 'banking.analytics.r',
  'Advanced Analytics': 'banking.analytics',
  'Maintenance': 'banking.maintenance',
  'Approval System': 'approval.requests',
  'Notifications': 'notifications',
  'Access Management': 'admin.users',
  'User Activity': 'admin.system',
  'Audit Log': 'admin.system',
  'Menu Matrix': 'admin.system',
  'SMTP': 'admin.system',
  'Job Monitoring': 'jobs',
  'Impersonate': 'admin.super_admin',
}

/**
 * Maps menu item names to their APPROVAL permission stem for approve action.
 * Only applies when permissionType is 'approve' in the Menu Matrix.
 */
const MENU_TO_APPROVAL_STEM: Record<string, string> = {
  'Segmentation Configuration': 'approval.segmentation',
  'Parameter Setup': 'approval.parameter',
  'Product Parameters': 'approval.product_parameter',
  'Journal Parameter': 'approval.journal_parameter',
  'Accounting Parameters': 'approval.journal_parameter',
  'Bucket Parameter': 'approval.bucket_parameter',
  'Rule Base Setting': 'approval.rule_base_setting',
  'PD Setup': 'approval.pd_configuration',
  'PD Setup Management': 'approval.pd_configuration',
  'LGD Setup': 'approval.lgd_configuration',
  'LGD Setup Management': 'approval.lgd_configuration',
  'EAD Setup': 'approval.ead_configuration',
  'EAD Model': 'approval.ead_configuration',
  'ECL Configuration': 'approval.ecl_configuration',
  'ECL Calculations': 'approval.ecl_configuration',
  'Users': 'approval.user',
  'Assignments': 'approval.user',
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

  // 1. Look up menu item name from Platform DB
  const items = await platformDb
    .select({ name: platformMenuItems.name })
    .from(platformMenuItems)
    .where(eq(platformMenuItems.id, menuItemId as any))
    .limit(1)

  const itemName = items[0]?.name
  if (!itemName) return

  // 2. Determine stem — use approval stem for approve action, regular stem otherwise
  let stem: string | undefined
  if (permissionType === 'approve') {
    stem = MENU_TO_APPROVAL_STEM[itemName]
  }
  if (!stem) {
    stem = MENU_TO_PERMISSION_STEM[itemName]
  }
  if (!stem) return

  // 3. Build permission code
  const suffix = permissionType === 'approve' ? 'approve' : (ACTION_TO_PERMISSION_SUFFIX[permissionType] || permissionType)
  const permissionCode = `${stem}.${suffix}`

  try {
    const permRows = await tenantDb
      .select({ id: permissions.id })
      .from(permissions)
      .where(eq(permissions.code, permissionCode))
      .limit(1)

    if (permRows.length === 0) return

    const permissionId = permRows[0].id

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
    console.warn(`[MenuPermissionSync] Failed to sync ${permissionCode} for role:`, error)
  }
}
