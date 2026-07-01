import type { NewPermission } from '@/db/schema'

export type SeedPermissionDefinition = Pick<
    NewPermission,
    'code' | 'name' | 'description' | 'resource' | 'action' | 'module' | 'category'
>

type PermissionAction =
    | 'access'
    | 'view'
    | 'create'
    | 'update'
    | 'delete'
    | 'manage'
    | 'export'
    | 'run'
    | 'control'
    | 'approve'
    | 'approve_all'
    | 'super_admin'
    | 'approve_create'
    | 'approve_update'
    | 'approve_delete'
    | 'self_approve_override'

const ACTION_LABELS: Record<PermissionAction, string> = {
    access: 'Access',
    view: 'View',
    create: 'Create',
    update: 'Update',
    delete: 'Delete',
    manage: 'Manage',
    export: 'Export',
    run: 'Run',
    control: 'Control',
    approve: 'Approve',
    approve_all: 'Approval Override',
    super_admin: 'Super Admin',
    approve_create: 'Approve Creation',
    approve_update: 'Approve Update',
    approve_delete: 'Approve Deletion',
    self_approve_override: 'Self-Approval Override',
}

const createPermission = (
    code: string,
    name: string,
    description: string,
    resource: string,
    action: PermissionAction,
    module: string,
    category: string
): SeedPermissionDefinition => ({
    code,
    name,
    description,
    resource,
    action,
    module,
    category,
})

const createResourcePermissions = ({
    stem,
    label,
    resource,
    category,
    module = 'banking',
    actions,
}: {
    stem: string
    label: string
    resource: string
    category: string
    module?: string
    actions: PermissionAction[]
}): SeedPermissionDefinition[] =>
    actions.map((action) => {
        const code = action === 'access' ? stem : `${stem}.${action}`
        const actionLabel = ACTION_LABELS[action]
        const name = action === 'access' ? `${label} Access` : `${actionLabel} ${label}`
        const description =
            action === 'access'
                ? `Access ${label.toLowerCase()} menu and related pages`
                : `${actionLabel} ${label.toLowerCase()}`

        return createPermission(code, name, description, resource, action, module, category)
    })

const createApprovalPermission = (
    stem: string,
    label: string,
    resource: string
): SeedPermissionDefinition[] => [
    createPermission(
        `${stem}.approve`,
        `Approve ${label}`,
        `Approve ${label.toLowerCase()} (all operations)`,
        resource,
        'approve',
        'approval',
        'APPROVAL_OPERATION'
    ),
]

export const BANKING_PERMISSION_CATALOG: SeedPermissionDefinition[] = [
    ...createResourcePermissions({
        stem: 'banking.dashboard',
        label: 'Dashboard',
        resource: 'dashboard',
        category: 'BANKING_DASHBOARD',
        actions: ['view', 'manage'],
    }),
    ...createResourcePermissions({
        stem: 'banking.analytics',
        label: 'Advanced Analytics',
        resource: 'analytics',
        category: 'BANKING_ANALYTICS',
        actions: ['view'],
    }),
    ...createResourcePermissions({
        stem: 'banking.analytics.r',
        label: 'R Analytics',
        resource: 'analytics.r',
        category: 'BANKING_ANALYTICS',
        actions: ['view'],
    }),
    ...createResourcePermissions({
        stem: 'banking.processing',
        label: 'IFRS 9 Processing',
        resource: 'processing',
        category: 'BANKING_PROCESSING',
        actions: ['access', 'view', 'manage'],
    }),
    ...createResourcePermissions({
        stem: 'banking.processing.impairment',
        label: 'Impairment Module',
        resource: 'processing.impairment',
        category: 'BANKING_PROCESSING',
        actions: ['access', 'view', 'manage'],
    }),
    ...createResourcePermissions({
        stem: 'banking.processing.amortization',
        label: 'Amortization Module',
        resource: 'processing.amortization',
        category: 'BANKING_PROCESSING',
        actions: ['access', 'view', 'manage'],
    }),
    ...createResourcePermissions({
        stem: 'banking.setup',
        label: 'System Setup',
        resource: 'setup',
        category: 'BANKING_SETUP',
        actions: ['access'],
    }),
    ...createResourcePermissions({
        stem: 'banking.setup.application',
        label: 'Application Configuration',
        resource: 'setup.application',
        category: 'BANKING_SETUP',
        actions: ['access', 'view', 'create', 'update', 'delete', 'manage'],
    }),
    ...createResourcePermissions({
        stem: 'banking.setup.business',
        label: 'Business Configuration',
        resource: 'setup.business',
        category: 'BANKING_SETUP',
        actions: ['access', 'view', 'create', 'update', 'delete', 'manage'],
    }),
    ...createResourcePermissions({
        stem: 'banking.parameter',
        label: 'Parameter Management',
        resource: 'parameter',
        category: 'BANKING_PARAMETER',
        actions: ['access', 'view', 'create', 'update', 'delete', 'manage'],
    }),
    ...createResourcePermissions({
        stem: 'banking.parameter.product',
        label: 'Product Parameters',
        resource: 'parameter.product',
        category: 'BANKING_PARAMETER',
        actions: ['access', 'view', 'create', 'update', 'delete', 'manage', 'export'],
    }),
    ...createResourcePermissions({
        stem: 'banking.parameter.journal',
        label: 'Accounting Parameters',
        resource: 'parameter.journal',
        category: 'BANKING_PARAMETER',
        actions: ['access', 'view', 'create', 'update', 'delete', 'manage', 'export'],
    }),
    ...createResourcePermissions({
        stem: 'banking.collective.segmentation',
        label: 'Segmentation Configuration',
        resource: 'collective.segmentation',
        category: 'BANKING_COLLECTIVE',
        actions: ['access', 'view', 'create', 'update', 'delete', 'manage', 'export'],
    }),
    ...createResourcePermissions({
        stem: 'banking.collective',
        label: 'Collective Impairment',
        resource: 'collective',
        category: 'BANKING_COLLECTIVE',
        actions: ['access', 'view', 'manage'],
    }),
    ...createResourcePermissions({
        stem: 'banking.collective.rule_base',
        label: 'Rule Base Setting',
        resource: 'collective.rule_base',
        category: 'BANKING_COLLECTIVE',
        actions: ['access', 'view', 'create', 'update', 'delete', 'manage'],
    }),
    ...createResourcePermissions({
        stem: 'banking.collective.bucket',
        label: 'Bucket Parameter',
        resource: 'collective.bucket',
        category: 'BANKING_COLLECTIVE',
        actions: ['access', 'view', 'create', 'update', 'delete', 'manage'],
    }),
    ...createResourcePermissions({
        stem: 'banking.collective.pd',
        label: 'PD Setup Management',
        resource: 'collective.pd',
        category: 'BANKING_COLLECTIVE',
        actions: ['access', 'view', 'create', 'update', 'delete', 'manage'],
    }),
    ...createResourcePermissions({
        stem: 'banking.collective.pd_setup',
        label: 'PD Setup Management',
        resource: 'collective.pd',
        category: 'BANKING_COLLECTIVE',
        actions: ['view', 'create', 'update', 'delete', 'manage'],
    }),
    ...createResourcePermissions({
        stem: 'banking.collective.lgd',
        label: 'LGD Setup Management',
        resource: 'collective.lgd',
        category: 'BANKING_COLLECTIVE',
        actions: ['access', 'view', 'create', 'update', 'delete', 'manage'],
    }),
    ...createResourcePermissions({
        stem: 'banking.collective.lgd_setup',
        label: 'LGD Setup Management',
        resource: 'collective.lgd',
        category: 'BANKING_COLLECTIVE',
        actions: ['view', 'create', 'update', 'delete', 'manage'],
    }),
    ...createResourcePermissions({
        stem: 'banking.collective.ead',
        label: 'EAD Setup Management',
        resource: 'collective.ead',
        category: 'BANKING_COLLECTIVE',
        actions: ['access', 'view', 'create', 'update', 'delete', 'manage'],
    }),
    ...createResourcePermissions({
        stem: 'banking.collective.ead_setup',
        label: 'EAD Setup Management',
        resource: 'collective.ead',
        category: 'BANKING_COLLECTIVE',
        actions: ['view', 'create', 'update', 'delete', 'manage'],
    }),
    ...createResourcePermissions({
        stem: 'banking.collective.ecl',
        label: 'ECL Configuration',
        resource: 'collective.ecl',
        category: 'BANKING_COLLECTIVE',
        actions: ['access', 'view', 'create', 'update', 'delete', 'manage'],
    }),
    ...createResourcePermissions({
        stem: 'banking.individual',
        label: 'Individual Impairment',
        resource: 'individual',
        category: 'BANKING_INDIVIDUAL',
        actions: ['access', 'view', 'create', 'manage', 'export', 'approve'],
    }),
    ...createResourcePermissions({
        stem: 'banking.reports.ifrs9',
        label: 'IFRS 9 Reports',
        resource: 'reports.ifrs9',
        category: 'BANKING_REPORTS',
        actions: ['access', 'view', 'manage', 'export'],
    }),
    ...createResourcePermissions({
        stem: 'banking.reports.ifrs9.nominative',
        label: 'Nominative Report',
        resource: 'reports.ifrs9.nominative',
        category: 'BANKING_REPORTS',
        actions: ['access', 'view'],
    }),
    ...createResourcePermissions({
        stem: 'banking.reports.ifrs9.lifetime_pd',
        label: 'Lifetime PD Report',
        resource: 'reports.ifrs9.lifetime_pd',
        category: 'BANKING_REPORTS',
        actions: ['access', 'view'],
    }),
    ...createResourcePermissions({
        stem: 'banking.reports.ifrs9.lifetime_lgd',
        label: 'Lifetime LGD Report',
        resource: 'reports.ifrs9.lifetime_lgd',
        category: 'BANKING_REPORTS',
        actions: ['access', 'view'],
    }),
    ...createResourcePermissions({
        stem: 'banking.reports.ifrs9.ead_model',
        label: 'EAD Model Report',
        resource: 'reports.ifrs9.ead_model',
        category: 'BANKING_REPORTS',
        actions: ['access', 'view'],
    }),
    ...createResourcePermissions({
        stem: 'banking.reports.ifrs9.ecl_result',
        label: 'ECL Result Report',
        resource: 'reports.ifrs9.ecl_result',
        category: 'BANKING_REPORTS',
        actions: ['access', 'view', 'export'],
    }),
    ...createResourcePermissions({
        stem: 'banking.reports.ifrs9.ecl_movement',
        label: 'ECL Movement Report',
        resource: 'reports.ifrs9.ecl_movement',
        category: 'BANKING_REPORTS',
        actions: ['access', 'view'],
    }),
    ...createResourcePermissions({
        stem: 'banking.reports.ifrs9.gca_movement',
        label: 'GCA Movement Report',
        resource: 'reports.ifrs9.gca_movement',
        category: 'BANKING_REPORTS',
        actions: ['access', 'view'],
    }),
    createPermission(
        'banking.configuration.ifrs9',
        'IFRS 9 Tools Access',
        'Access IFRS 9 tools and utilities menu',
        'configuration.ifrs9',
        'access',
        'banking',
        'BANKING_CONFIGURATION'
    ),
    createPermission(
        'banking.configuration.ifrs9.manage',
        'Manage IFRS 9 Tools',
        'Manage IFRS 9 configuration tools and menu access',
        'configuration.ifrs9',
        'manage',
        'banking',
        'BANKING_CONFIGURATION'
    ),
    createPermission(
        'banking.tools.manage',
        'Manage Tools',
        'Manage banking tools and utilities',
        'tools',
        'manage',
        'banking',
        'BANKING_TOOLS'
    ),
    createPermission(
        'admin.maintenance.access',
        'Maintenance Access',
        'Access banking maintenance menu and pages',
        'maintenance',
        'access',
        'admin',
        'ADMINISTRATION'
    ),
    ...createResourcePermissions({
        stem: 'admin.users',
        label: 'Users',
        resource: 'users',
        category: 'ADMINISTRATION',
        module: 'admin',
        actions: ['view', 'manage'],
    }),
    ...createResourcePermissions({
        stem: 'admin.roles',
        label: 'Roles',
        resource: 'roles',
        category: 'ADMINISTRATION',
        module: 'admin',
        actions: ['view', 'create', 'manage'],
    }),
    ...createResourcePermissions({
        stem: 'admin.system',
        label: 'System Administration',
        resource: 'system',
        category: 'ADMINISTRATION',
        module: 'admin',
        actions: ['view', 'manage'],
    }),
    createPermission(
        'admin.super_admin',
        'Super Admin',
        'Full system access across all banking and platform modules',
        'system',
        'super_admin',
        'admin',
        'ADMINISTRATION'
    ),
    createPermission(
        'approval.requests.approve',
        'Approve Requests',
        'Review and approve pending approval requests',
        'approvals',
        'approve',
        'approval',
        'WORKFLOW'
    ),
    createPermission(
        'approval.all',
        'Approval Override',
        'Bypass approval restrictions for approval workflow operations',
        'approvals',
        'approve_all',
        'approval',
        'WORKFLOW'
    ),
    createPermission(
        'approval.requests.self_approve_override',
        'Self-Approval Override',
        'Approve own approval request only when the platform DB setting is enabled',
        'approvals',
        'self_approve_override',
        'approval',
        'WORKFLOW'
    ),
    ...createResourcePermissions({
        stem: 'notifications',
        label: 'Notifications',
        resource: 'notifications',
        category: 'ADMINISTRATION',
        module: 'admin',
        actions: ['view', 'manage'],
    }),
    createPermission(
        'notifications.preferences.manage',
        'Manage Notification Preferences',
        'Manage muted categories and quiet hours',
        'notifications.preferences',
        'manage',
        'admin',
        'ADMINISTRATION'
    ),
    createPermission(
        'jobs.access',
        'Job Monitoring Access',
        'Access job monitoring menu and related pages',
        'jobs',
        'access',
        'admin',
        'ADMINISTRATION'
    ),
    ...createResourcePermissions({
        stem: 'jobs',
        label: 'Jobs',
        resource: 'jobs',
        category: 'ADMINISTRATION',
        module: 'admin',
        actions: ['view', 'create', 'update', 'delete', 'run', 'control', 'manage', 'approve'],
    }),
    createPermission(
        'jobs.runtime.view',
        'View Job Runtime',
        'View runtime diagnostics for active jobs',
        'jobs.runtime',
        'view',
        'admin',
        'ADMINISTRATION'
    ),
    ...createApprovalPermission('approval.user', 'User Changes', 'users'),
    ...createApprovalPermission('approval.configuration', 'Configuration Changes', 'configurations'),
    ...createApprovalPermission('approval.parameter', 'Parameter Changes', 'parameters'),
    ...createApprovalPermission('approval.product_parameter', 'Product Parameters', 'product_parameter'),
    ...createApprovalPermission('approval.journal_parameter', 'Journal Parameters', 'journal_parameter'),
    ...createApprovalPermission('approval.segmentation', 'Segmentation', 'segmentation'),
    ...createApprovalPermission('approval.rule_base_setting', 'Rule Base Setting', 'rule_base_setting'),
    ...createApprovalPermission('approval.bucket_parameter', 'Bucket Parameter', 'bucket_parameter'),
    ...createApprovalPermission('approval.pd_configuration', 'PD Configuration', 'pd_configuration'),
    ...createApprovalPermission('approval.lgd_configuration', 'LGD Configuration', 'lgd_configuration'),
    ...createApprovalPermission('approval.ead_configuration', 'EAD Configuration', 'ead_configuration'),
    ...createApprovalPermission('approval.ecl_configuration', 'ECL Configuration', 'ecl_configuration'),
    ]

export const BANKING_PERMISSION_CODES = BANKING_PERMISSION_CATALOG.map((permission) => permission.code)

export const MAKER_CHECKER_FRONTEND_PERMISSION_CODES = [
    'banking.dashboard.view',
    'banking.setup.application',
    'banking.setup.application.view',
    'banking.setup.business',
    'banking.setup.business.view',
    'banking.parameter',
    'banking.parameter.product',
    'banking.parameter.product.view',
    'banking.parameter.journal',
    'banking.parameter.journal.view',
    'banking.parameter.segmentation',
    'banking.parameter.segmentation.view',
    'banking.collective',
    'banking.collective.view',
    'banking.collective.rule_base.view',
    'banking.collective.bucket.view',
    'banking.collective.pd.view',
    'banking.collective.lgd.view',
    'banking.collective.ead.view',
    'banking.collective.ecl.view',
    'banking.individual.view',
    'banking.processing',
    'banking.processing.view',
    'banking.processing.impairment',
    'banking.processing.impairment.view',
    'banking.processing.amortization',
    'banking.processing.amortization.view',
    'banking.reports.ifrs9.view',
    'banking.analytics.view',
    'banking.analytics.r.view',
    'admin.maintenance.access',
    'admin.users.view',
    'admin.roles.view',
    'approval.requests.approve',
    'notifications.view',
    'jobs.access',
    'jobs.view',
    'banking.configuration.ifrs9.manage',
]

const dedupe = (...permissionSets: string[][]): string[] => [...new Set(permissionSets.flat())]

const DASHBOARD_AND_ANALYTICS_VIEW = [
    'banking.dashboard.view',
    'banking.analytics.view',
    'banking.analytics.r.view',
]

const PROCESSING_VIEW = [
    'banking.processing',
    'banking.processing.view',
    'banking.processing.impairment',
    'banking.processing.impairment.view',
    'banking.processing.amortization',
    'banking.processing.amortization.view',
]

const PROCESSING_MANAGE = [
    ...PROCESSING_VIEW,
    'banking.processing.manage',
    'banking.processing.impairment.manage',
    'banking.processing.amortization.manage',
]

const SETUP_APPLICATION_VIEW = ['banking.setup.application', 'banking.setup.application.view']

const SETUP_APPLICATION_MANAGE = [
    ...SETUP_APPLICATION_VIEW,
    'banking.setup.application.create',
    'banking.setup.application.update',
    'banking.setup.application.delete',
    'banking.setup.application.manage',
]

const SETUP_BUSINESS_VIEW = ['banking.setup.business', 'banking.setup.business.view']

const SETUP_BUSINESS_MANAGE = [
    ...SETUP_BUSINESS_VIEW,
    'banking.setup.business.create',
    'banking.setup.business.update',
    'banking.setup.business.delete',
    'banking.setup.business.manage',
]

const PARAMETER_BASE_VIEW = ['banking.parameter', 'banking.parameter.view']

const PRODUCT_PARAMETER_VIEW = ['banking.parameter.product', 'banking.parameter.product.view']
const PRODUCT_PARAMETER_MANAGE = [
    ...PRODUCT_PARAMETER_VIEW,
    'banking.parameter.product.create',
    'banking.parameter.product.update',
    'banking.parameter.product.delete',
    'banking.parameter.product.manage',
    'banking.parameter.product.export',
]

const JOURNAL_PARAMETER_VIEW = ['banking.parameter.journal', 'banking.parameter.journal.view']
const JOURNAL_PARAMETER_MANAGE = [
    ...JOURNAL_PARAMETER_VIEW,
    'banking.parameter.journal.create',
    'banking.parameter.journal.update',
    'banking.parameter.journal.delete',
    'banking.parameter.journal.manage',
    'banking.parameter.journal.export',
]

const SEGMENTATION_PARAMETER_VIEW = [
    'banking.parameter.segmentation',
    'banking.parameter.segmentation.view',
]
const SEGMENTATION_PARAMETER_MANAGE = [
    ...SEGMENTATION_PARAMETER_VIEW,
    'banking.parameter.segmentation.create',
    'banking.parameter.segmentation.update',
    'banking.parameter.segmentation.delete',
    'banking.parameter.segmentation.manage',
    'banking.parameter.segmentation.export',
]

const PARAMETER_MANAGE = [
    ...PARAMETER_BASE_VIEW,
    'banking.parameter.create',
    'banking.parameter.update',
    'banking.parameter.delete',
    'banking.parameter.manage',
]

const COLLECTIVE_BASE_VIEW = ['banking.collective', 'banking.collective.view']
const COLLECTIVE_BASE_MANAGE = [...COLLECTIVE_BASE_VIEW, 'banking.collective.manage']

const RULE_BASE_VIEW = ['banking.collective.rule_base', 'banking.collective.rule_base.view']
const RULE_BASE_MANAGE = [
    ...RULE_BASE_VIEW,
    'banking.collective.rule_base.create',
    'banking.collective.rule_base.update',
    'banking.collective.rule_base.delete',
    'banking.collective.rule_base.manage',
]

const BUCKET_VIEW = ['banking.collective.bucket', 'banking.collective.bucket.view']
const BUCKET_MANAGE = [
    ...BUCKET_VIEW,
    'banking.collective.bucket.create',
    'banking.collective.bucket.update',
    'banking.collective.bucket.delete',
    'banking.collective.bucket.manage',
]

const PD_VIEW = [
    'banking.collective.pd',
    'banking.collective.pd.view',
    'banking.collective.pd_setup.view',
]
const PD_MANAGE = [
    ...PD_VIEW,
    'banking.collective.pd.create',
    'banking.collective.pd.update',
    'banking.collective.pd.delete',
    'banking.collective.pd.manage',
    'banking.collective.pd_setup.create',
    'banking.collective.pd_setup.update',
    'banking.collective.pd_setup.delete',
    'banking.collective.pd_setup.manage',
]

const LGD_VIEW = [
    'banking.collective.lgd',
    'banking.collective.lgd.view',
    'banking.collective.lgd_setup.view',
]
const LGD_MANAGE = [
    ...LGD_VIEW,
    'banking.collective.lgd.create',
    'banking.collective.lgd.update',
    'banking.collective.lgd.delete',
    'banking.collective.lgd.manage',
    'banking.collective.lgd_setup.create',
    'banking.collective.lgd_setup.update',
    'banking.collective.lgd_setup.delete',
    'banking.collective.lgd_setup.manage',
]

const EAD_VIEW = [
    'banking.collective.ead',
    'banking.collective.ead.view',
    'banking.collective.ead_setup.view',
]
const EAD_MANAGE = [
    ...EAD_VIEW,
    'banking.collective.ead.create',
    'banking.collective.ead.update',
    'banking.collective.ead.delete',
    'banking.collective.ead.manage',
    'banking.collective.ead_setup.create',
    'banking.collective.ead_setup.update',
    'banking.collective.ead_setup.delete',
    'banking.collective.ead_setup.manage',
]

const ECL_VIEW = ['banking.collective.ecl', 'banking.collective.ecl.view']
const ECL_MANAGE = [
    ...ECL_VIEW,
    'banking.collective.ecl.create',
    'banking.collective.ecl.update',
    'banking.collective.ecl.delete',
    'banking.collective.ecl.manage',
]


const INDIVIDUAL_VIEW = ['banking.individual', 'banking.individual.view']
const INDIVIDUAL_MANAGE = [
    ...INDIVIDUAL_VIEW,
    'banking.individual.create',
    'banking.individual.manage',
    'banking.individual.export',
    'banking.individual.approve',
]

const IFRS9_REPORTS_VIEW = ['banking.reports.ifrs9', 'banking.reports.ifrs9.view']
const IFRS9_REPORTS_MANAGE = [
    ...IFRS9_REPORTS_VIEW,
    'banking.reports.ifrs9.manage',
    'banking.reports.ifrs9.export',
]

const IFRS9_REPORT_DETAIL_VIEWS = [
    'banking.reports.ifrs9.nominative',
    'banking.reports.ifrs9.nominative.view',
    'banking.reports.ifrs9.lifetime_pd',
    'banking.reports.ifrs9.lifetime_pd.view',
    'banking.reports.ifrs9.lifetime_lgd',
    'banking.reports.ifrs9.lifetime_lgd.view',
    'banking.reports.ifrs9.ead_model',
    'banking.reports.ifrs9.ead_model.view',
    'banking.reports.ifrs9.ecl_result',
    'banking.reports.ifrs9.ecl_result.view',
    'banking.reports.ifrs9.ecl_movement',
    'banking.reports.ifrs9.ecl_movement.view',
    'banking.reports.ifrs9.gca_movement',
    'banking.reports.ifrs9.gca_movement.view',
]

const IFRS9_TOOLS_MANAGE = [
    'banking.configuration.ifrs9',
    'banking.configuration.ifrs9.manage',
    'banking.tools.manage',
]

const MAINTENANCE_BASE_VIEW = ['admin.maintenance.access']

const ACCESS_MANAGEMENT_VIEW = [
    ...MAINTENANCE_BASE_VIEW,
    'admin.users.view',
    'admin.roles.view',
]

const ACCESS_MANAGEMENT_MANAGE = [
    ...ACCESS_MANAGEMENT_VIEW,
    'admin.users.manage',
    'admin.roles.create',
    'admin.roles.manage',
]

const SYSTEM_MANAGE = ['admin.system.view', 'admin.system.manage']

const NOTIFICATION_VIEW = ['notifications.view']
const NOTIFICATION_MANAGE = [
    ...NOTIFICATION_VIEW,
    'notifications.manage',
    'notifications.preferences.manage',
]

const JOB_VIEW = ['jobs.access', 'jobs.view', 'jobs.runtime.view']
const JOB_MANAGE = [
    ...JOB_VIEW,
    'jobs.create',
    'jobs.update',
    'jobs.delete',
    'jobs.run',
    'jobs.control',
    'jobs.manage',
]

const BUSINESS_APPROVAL_CODES = [
    'approval.requests.approve',
    'approval.parameter.approve',
    'approval.configuration.approve',
    'approval.product_parameter.approve',
    'approval.journal_parameter.approve',
    'approval.segmentation.approve',
    'approval.rule_base_setting.approve',
    'approval.bucket_parameter.approve',
    'approval.pd_configuration.approve',
    'approval.lgd_configuration.approve',
    'approval.ead_configuration.approve',
    'approval.ecl_configuration.approve',
]

const ADMIN_APPROVAL_CODES = [
    'approval.requests.approve',
    'approval.user.approve',
]

const RBAC_APPROVAL_CODES = [
    'approval.user_status.create',
    'approval.user_status.update',
    'approval.user_status.delete',
    'approval.role.create',
    'approval.role.update',
    'approval.role.delete',
    'approval.role_permission.create',
    'approval.role_permission.update',
    'approval.role_permission.delete',
    'approval.role_assignment.create',
    'approval.role_assignment.update',
    'approval.role_assignment.delete',
]

export const DEFAULT_ROLE_PERMISSION_MAP: Record<string, string[]> = {
    IAF_TENANT_SUPERADMIN: dedupe(
        BANKING_PERMISSION_CODES,
        ADMIN_APPROVAL_CODES,
        RBAC_APPROVAL_CODES,
        ['SUPER_ADMIN']
    ),
    IAF_TENANT_ADMIN: dedupe(
        DASHBOARD_AND_ANALYTICS_VIEW,
        PROCESSING_MANAGE,
        SETUP_APPLICATION_MANAGE,
        SETUP_BUSINESS_MANAGE,
        PARAMETER_MANAGE,
        PRODUCT_PARAMETER_MANAGE,
        JOURNAL_PARAMETER_MANAGE,
        SEGMENTATION_PARAMETER_MANAGE,
        COLLECTIVE_BASE_MANAGE,
        RULE_BASE_MANAGE,
        BUCKET_MANAGE,
        PD_MANAGE,
        LGD_MANAGE,
        EAD_MANAGE,
        ECL_MANAGE,
        INDIVIDUAL_MANAGE,
        IFRS9_REPORTS_MANAGE,
        IFRS9_REPORT_DETAIL_VIEWS,
        IFRS9_TOOLS_MANAGE,
        ACCESS_MANAGEMENT_MANAGE,
        SYSTEM_MANAGE,
        NOTIFICATION_MANAGE,
        JOB_MANAGE,
        ADMIN_APPROVAL_CODES
    ),
    IAF_BANK_CRO: dedupe(
        DASHBOARD_AND_ANALYTICS_VIEW,
        PROCESSING_VIEW,
        COLLECTIVE_BASE_VIEW,
        RULE_BASE_VIEW,
        BUCKET_VIEW,
        PD_VIEW,
        LGD_VIEW,
        EAD_VIEW,
        ECL_VIEW,
        INDIVIDUAL_VIEW,
        IFRS9_REPORTS_VIEW,
        IFRS9_REPORT_DETAIL_VIEWS,
        MAINTENANCE_BASE_VIEW,
        NOTIFICATION_VIEW,
        BUSINESS_APPROVAL_CODES
    ),
    IAF_IFRS_MANAGER: dedupe(
        DASHBOARD_AND_ANALYTICS_VIEW,
        PROCESSING_VIEW,
        SETUP_APPLICATION_VIEW,
        SETUP_BUSINESS_VIEW,
        PARAMETER_BASE_VIEW,
        PRODUCT_PARAMETER_VIEW,
        JOURNAL_PARAMETER_VIEW,
        SEGMENTATION_PARAMETER_VIEW,
        COLLECTIVE_BASE_VIEW,
        RULE_BASE_VIEW,
        BUCKET_VIEW,
        PD_VIEW,
        LGD_VIEW,
        EAD_VIEW,
        ECL_VIEW,
        INDIVIDUAL_VIEW,
        IFRS9_REPORTS_VIEW,
        IFRS9_REPORT_DETAIL_VIEWS,
        IFRS9_TOOLS_MANAGE,
        MAINTENANCE_BASE_VIEW,
        NOTIFICATION_VIEW,
        JOB_VIEW,
        BUSINESS_APPROVAL_CODES
    ),
    IAF_RISK_ANALYST: dedupe(
        DASHBOARD_AND_ANALYTICS_VIEW,
        PROCESSING_VIEW,
        PARAMETER_BASE_VIEW,
        SEGMENTATION_PARAMETER_MANAGE,
        COLLECTIVE_BASE_MANAGE,
        RULE_BASE_MANAGE,
        BUCKET_MANAGE,
        PD_MANAGE,
        LGD_MANAGE,
        EAD_MANAGE,
        ECL_MANAGE,
        INDIVIDUAL_VIEW,
        IFRS9_REPORTS_VIEW,
        IFRS9_REPORT_DETAIL_VIEWS,
        IFRS9_TOOLS_MANAGE,
        JOB_VIEW
    ),
    IAF_PORTFOLIO_MANAGER: dedupe(
        DASHBOARD_AND_ANALYTICS_VIEW,
        PROCESSING_VIEW,
        INDIVIDUAL_VIEW,
        IFRS9_REPORTS_VIEW,
        IFRS9_REPORT_DETAIL_VIEWS,
        JOB_VIEW
    ),
    IAF_DATA_ADMIN: dedupe(
        DASHBOARD_AND_ANALYTICS_VIEW,
        PROCESSING_VIEW,
        SETUP_APPLICATION_MANAGE,
        SETUP_BUSINESS_MANAGE,
        PARAMETER_MANAGE,
        PRODUCT_PARAMETER_MANAGE,
        JOURNAL_PARAMETER_MANAGE,
        SEGMENTATION_PARAMETER_MANAGE,
        COLLECTIVE_BASE_VIEW,
        INDIVIDUAL_VIEW,
        IFRS9_REPORTS_VIEW,
        JOB_VIEW
    ),
    IAF_REPORT_ANALYST: dedupe(
        DASHBOARD_AND_ANALYTICS_VIEW,
        IFRS9_REPORTS_MANAGE,
        IFRS9_REPORT_DETAIL_VIEWS,
        INDIVIDUAL_VIEW,
        NOTIFICATION_VIEW
    ),
    IAF_AUDITOR: dedupe(
        DASHBOARD_AND_ANALYTICS_VIEW,
        IFRS9_REPORTS_MANAGE,
        IFRS9_REPORT_DETAIL_VIEWS,
        INDIVIDUAL_VIEW,
        COLLECTIVE_BASE_VIEW,
        MAINTENANCE_BASE_VIEW,
        ACCESS_MANAGEMENT_VIEW,
        JOB_VIEW
    ),
    IAF_VIEWER: dedupe(
        DASHBOARD_AND_ANALYTICS_VIEW,
        COLLECTIVE_BASE_VIEW,
        INDIVIDUAL_VIEW,
        IFRS9_REPORTS_VIEW,
        IFRS9_REPORT_DETAIL_VIEWS
    ),
    MAKER: dedupe(
        DASHBOARD_AND_ANALYTICS_VIEW,
        PROCESSING_VIEW,
        SETUP_APPLICATION_MANAGE,
        SETUP_BUSINESS_MANAGE,
        PARAMETER_MANAGE,
        PRODUCT_PARAMETER_MANAGE,
        JOURNAL_PARAMETER_MANAGE,
        SEGMENTATION_PARAMETER_MANAGE,
        COLLECTIVE_BASE_MANAGE,
        RULE_BASE_MANAGE,
        BUCKET_MANAGE,
        PD_MANAGE,
        LGD_MANAGE,
        EAD_MANAGE,
        ECL_MANAGE,
        INDIVIDUAL_MANAGE,
        JOB_MANAGE
    ),
    CHECKER: dedupe(
        MAKER_CHECKER_FRONTEND_PERMISSION_CODES,
        MAINTENANCE_BASE_VIEW,
        JOB_VIEW,
        BUSINESS_APPROVAL_CODES
    ),
    APPROVER: dedupe(
        MAKER_CHECKER_FRONTEND_PERMISSION_CODES,
        MAINTENANCE_BASE_VIEW,
        JOB_VIEW,
        BUSINESS_APPROVAL_CODES
    ),
}

// Legacy aliases intentionally not seeded here:
// banking.application_config, banking.business_config, banking.product_params,
// banking.accounting_params, banking.collective.fl, banking.portfolio.loans.*,
// approval.requests, admin.users, admin.roles, admin.maintenance
