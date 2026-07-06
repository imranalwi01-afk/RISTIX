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
        actions: ['view', 'create', 'update', 'delete'],
    }),
    ...createResourcePermissions({
        stem: 'banking.processing.impairment',
        label: 'Impairment Module',
        resource: 'processing.impairment',
        category: 'BANKING_PROCESSING',
        actions: ['view'],
    }),
    ...createResourcePermissions({
        stem: 'banking.processing.amortization',
        label: 'Amortization Module',
        resource: 'processing.amortization',
        category: 'BANKING_PROCESSING',
        actions: ['view'],
    }),
    ...createResourcePermissions({
        stem: 'banking.setup.business',
        label: 'Business Configuration',
        resource: 'setup.business',
        category: 'BANKING_SETUP',
        actions: ['view', 'create', 'update', 'delete'],
    }),
    ...createResourcePermissions({
        stem: 'banking.parameter.product',
        label: 'Product Parameters',
        resource: 'parameter.product',
        category: 'BANKING_PARAMETER',
        actions: ['view', 'create', 'update', 'delete', 'export'],
    }),
    ...createResourcePermissions({
        stem: 'banking.parameter.journal',
        label: 'Accounting Parameters',
        resource: 'parameter.journal',
        category: 'BANKING_PARAMETER',
        actions: ['view', 'create', 'update', 'delete', 'export'],
    }),
    ...createResourcePermissions({
        stem: 'banking.collective.segmentation',
        label: 'Segmentation Configuration',
        resource: 'collective.segmentation',
        category: 'BANKING_COLLECTIVE',
        actions: ['view', 'create', 'update', 'delete', 'export'],
    }),
    ...createResourcePermissions({
        stem: 'banking.collective',
        label: 'Collective Impairment',
        resource: 'collective',
        category: 'BANKING_COLLECTIVE',
        actions: ['view'],
    }),
    ...createResourcePermissions({
        stem: 'banking.collective.rule_base',
        label: 'Rule Base Setting',
        resource: 'collective.rule_base',
        category: 'BANKING_COLLECTIVE',
        actions: ['view', 'create', 'update', 'delete'],
    }),
    ...createResourcePermissions({
        stem: 'banking.collective.bucket',
        label: 'Bucket Parameter',
        resource: 'collective.bucket',
        category: 'BANKING_COLLECTIVE',
        actions: ['view', 'create', 'update', 'delete'],
    }),
    ...createResourcePermissions({
        stem: 'banking.collective.pd_setup',
        label: 'PD Setup Management',
        resource: 'collective.pd_setup',
        category: 'BANKING_COLLECTIVE',
        actions: ['view', 'create', 'update', 'delete'],
    }),
    ...createResourcePermissions({
        stem: 'banking.collective.lgd_setup',
        label: 'LGD Setup Management',
        resource: 'collective.lgd_setup',
        category: 'BANKING_COLLECTIVE',
        actions: ['view', 'create', 'update', 'delete'],
    }),
    ...createResourcePermissions({
        stem: 'banking.collective.ead_setup',
        label: 'EAD Setup Management',
        resource: 'collective.ead_setup',
        category: 'BANKING_COLLECTIVE',
        actions: ['view', 'create', 'update', 'delete'],
    }),
    ...createResourcePermissions({
        stem: 'banking.collective.ecl',
        label: 'ECL Configuration',
        resource: 'collective.ecl',
        category: 'BANKING_COLLECTIVE',
        actions: ['view', 'create', 'update', 'delete'],
    }),
    ...createResourcePermissions({
        stem: 'banking.individual',
        label: 'Individual Impairment',
        resource: 'individual',
        category: 'BANKING_INDIVIDUAL',
        actions: ['view', 'create', 'export', 'approve'],
    }),
    ...createResourcePermissions({
        stem: 'banking.reports.ifrs9.nominative',
        label: 'Nominative Report',
        resource: 'reports.ifrs9.nominative',
        category: 'BANKING_REPORTS',
        actions: ['view', 'export'],
    }),
    ...createResourcePermissions({
        stem: 'banking.reports.ifrs9.lifetime_pd',
        label: 'Lifetime PD Report',
        resource: 'reports.ifrs9.lifetime_pd',
        category: 'BANKING_REPORTS',
        actions: ['view', 'export'],
    }),
    ...createResourcePermissions({
        stem: 'banking.reports.ifrs9.lifetime_lgd',
        label: 'Lifetime LGD Report',
        resource: 'reports.ifrs9.lifetime_lgd',
        category: 'BANKING_REPORTS',
        actions: ['view', 'export'],
    }),
    ...createResourcePermissions({
        stem: 'banking.reports.ifrs9.ead_model',
        label: 'EAD Model Report',
        resource: 'reports.ifrs9.ead_model',
        category: 'BANKING_REPORTS',
        actions: ['view', 'export'],
    }),
    ...createResourcePermissions({
        stem: 'banking.reports.ifrs9.ecl_result',
        label: 'ECL Result Report',
        resource: 'reports.ifrs9.ecl_result',
        category: 'BANKING_REPORTS',
        actions: ['view', 'export'],
    }),
    ...createResourcePermissions({
        stem: 'banking.reports.ifrs9.ecl_movement',
        label: 'ECL Movement Report',
        resource: 'reports.ifrs9.ecl_movement',
        category: 'BANKING_REPORTS',
        actions: ['view', 'export'],
    }),
    ...createResourcePermissions({
        stem: 'banking.reports.ifrs9.gca_movement',
        label: 'GCA Movement Report',
        resource: 'reports.ifrs9.gca_movement',
        category: 'BANKING_REPORTS',
        actions: ['view', 'export'],
    }),
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
        actions: ['view'],
    }),
    ...createResourcePermissions({
        stem: 'admin.roles',
        label: 'Roles',
        resource: 'roles',
        category: 'ADMINISTRATION',
        module: 'admin',
        actions: ['view', 'create'],
    }),
    ...createResourcePermissions({
        stem: 'admin.system',
        label: 'System Administration',
        resource: 'system',
        category: 'ADMINISTRATION',
        module: 'admin',
        actions: ['view'],
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
        'ADMINISTRATION'
    ),
    createPermission(
        'approval.all',
        'Approval Override',
        'Bypass approval restrictions for approval workflow operations',
        'approvals',
        'approve_all',
        'approval',
        'ADMINISTRATION'
    ),
    createPermission(
        'approval.requests.self_approve_override',
        'Self-Approval Override',
        'Approve own approval request only when the platform DB setting is enabled',
        'approvals',
        'self_approve_override',
        'approval',
        'ADMINISTRATION'
    ),
    ...createResourcePermissions({
        stem: 'notifications',
        label: 'Notifications',
        resource: 'notifications',
        category: 'ADMINISTRATION',
        module: 'admin',
        actions: ['view'],
    }),
    ...createResourcePermissions({
        stem: 'jobs',
        label: 'Jobs',
        resource: 'jobs',
        category: 'ADMINISTRATION',
        module: 'admin',
        actions: ['access', 'view', 'create', 'update', 'delete', 'run', 'control', 'approve'],
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
    'banking.setup.application.view',
    'banking.setup.business.view',
    'banking.parameter.product.view',
    'banking.parameter.journal.view',
    'banking.collective.segmentation.view',
    'banking.collective.view',
    'banking.collective.rule_base.view',
    'banking.collective.bucket.view',
    'banking.collective.pd_setup.view',
    'banking.collective.lgd_setup.view',
    'banking.collective.ead_setup.view',
    'banking.collective.ecl.view',
    'banking.individual.view',
    'banking.processing.impairment.view',
    'banking.processing.amortization.view',
    'banking.reports.ifrs9.view',
    'banking.analytics.r.view',
    'admin.maintenance.access',
    'admin.users.view',
    'admin.roles.view',
    'approval.requests.approve',
    'notifications.view',
    'jobs.access',
    'jobs.view',
]

const dedupe = (...permissionSets: string[][]): string[] => [...new Set(permissionSets.flat())]

const DASHBOARD_AND_ANALYTICS_VIEW = [
    'banking.dashboard.view',
    'banking.analytics.view',
    'banking.analytics.r.view',
]

const PROCESSING_VIEW: string[] = []

const SETUP_APPLICATION_VIEW = ['banking.setup.application.view']

const SETUP_BUSINESS_VIEW = ['banking.setup.business.view']

const PRODUCT_PARAMETER_VIEW = ['banking.parameter.product.view']

const JOURNAL_PARAMETER_VIEW = ['banking.parameter.journal.view']

const SEGMENTATION_PARAMETER_VIEW = [
    'banking.collective.segmentation.view',
]

const COLLECTIVE_BASE_VIEW = ['banking.collective.view']

const RULE_BASE_VIEW = ['banking.collective.rule_base.view']

const BUCKET_VIEW = ['banking.collective.bucket.view']

const PD_VIEW = [
    'banking.collective.pd_setup.view',
]

const LGD_VIEW = [
    'banking.collective.lgd_setup.view',
]

const EAD_VIEW = [
    'banking.collective.ead_setup.view',
]

const ECL_VIEW = ['banking.collective.ecl.view']

const INDIVIDUAL_VIEW = ['banking.individual.view']

const IFRS9_REPORTS_VIEW = ['banking.reports.ifrs9.view']

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

const MAINTENANCE_BASE_VIEW = ['admin.maintenance.access']

const ACCESS_MANAGEMENT_VIEW = [
    ...MAINTENANCE_BASE_VIEW,
    'admin.users.view',
    'admin.roles.view',
]

const NOTIFICATION_VIEW = ['notifications.view']

const JOB_VIEW = ['jobs.access', 'jobs.view', 'jobs.runtime.view']

const BUSINESS_APPROVAL_CODES = [
    'approval.requests.approve',
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
        RBAC_APPROVAL_CODES,
        ['SUPER_ADMIN']
    ),
    IAF_TENANT_ADMIN: dedupe(
        DASHBOARD_AND_ANALYTICS_VIEW,
        SETUP_APPLICATION_VIEW,
        SETUP_BUSINESS_VIEW,
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
        ACCESS_MANAGEMENT_VIEW,
        NOTIFICATION_VIEW,
        JOB_VIEW,
        BUSINESS_APPROVAL_CODES
    ),
    IAF_BANK_CRO: dedupe(
        DASHBOARD_AND_ANALYTICS_VIEW,
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
        SETUP_APPLICATION_VIEW,
        SETUP_BUSINESS_VIEW,
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
        MAINTENANCE_BASE_VIEW,
        NOTIFICATION_VIEW,
        JOB_VIEW,
        BUSINESS_APPROVAL_CODES
    ),
    IAF_RISK_ANALYST: dedupe(
        DASHBOARD_AND_ANALYTICS_VIEW,
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
        JOB_VIEW
    ),

    MAKER: dedupe(
        DASHBOARD_AND_ANALYTICS_VIEW,
        SETUP_APPLICATION_VIEW,
        SETUP_BUSINESS_VIEW,
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
        JOB_VIEW
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
// banking.accounting_params, banking.collective.fl,
// approval.requests, admin.users, admin.roles, admin.maintenance
