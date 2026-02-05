import { db } from '@/config'
import { permissions } from '@/db/schema/rbac.schema'
import { sql } from 'drizzle-orm'

export const SIDEBAR_PERMISSIONS = [
    // DASHBOARD
    { code: 'VIEW_DASHBOARD', name: 'View Dashboard', resource: 'dashboard', action: 'view', description: 'Access to main dashboard' },

    // SYSTEM SETUP
    { code: 'VIEW_SYSTEM_SETUP', name: 'View System Setup', resource: 'system_setup', action: 'view', description: 'Access to system setup menu' },
    { code: 'VIEW_APPLICATION_CONFIG', name: 'View Application Config', resource: 'application_config', action: 'view', description: 'View application settings' },
    { code: 'VIEW_BUSINESS_CONFIG', name: 'View Business Config', resource: 'business_config', action: 'view', description: 'View business parameters' },

    // PARAMETER MANAGEMENT
    { code: 'VIEW_PARAMETER_MANAGEMENT', name: 'View Parameter Mgmt', resource: 'parameter_management', action: 'view', description: 'Access to parameter management' },
    { code: 'VIEW_PRODUCT_PARAMS', name: 'View Product Params', resource: 'product_params', action: 'view', description: 'View product parameters' },
    { code: 'VIEW_ACCOUNTING_PARAMS', name: 'View Accounting Params', resource: 'accounting_params', action: 'view', description: 'View accounting parameters' },

    // PORTFOLIO MANAGEMENT
    { code: 'VIEW_PORTFOLIO_MANAGEMENT', name: 'View Portfolio Mgmt', resource: 'portfolio_management', action: 'view', description: 'Access to portfolio management' },
    { code: 'VIEW_PORTFOLIO_ACCOUNTS', name: 'View Portfolio Accounts', resource: 'portfolio_accounts', action: 'view', description: 'View portfolio accounts' },
    { code: 'VIEW_CUSTOMER_MANAGEMENT', name: 'View Customers', resource: 'customers', action: 'view', description: 'View customer list' },
    { code: 'VIEW_BANKING_PRODUCTS', name: 'View Banking Products', resource: 'banking_products', action: 'view', description: 'View banking products' },
    { code: 'VIEW_PORTFOLIO_MONITORING', name: 'View Portfolio Monitoring', resource: 'portfolio_monitoring', action: 'view', description: 'Access portfolio monitoring' },

    // COLLECTIVE IMPAIRMENT
    { code: 'VIEW_COLLECTIVE_IMPAIRMENT', name: 'View Collective Impairment', resource: 'collective_impairment', action: 'view', description: 'Access collective impairment menu' },
    { code: 'VIEW_SEGMENTATION', name: 'View Segmentation', resource: 'segmentation', action: 'view', description: 'View segmentation config' },
    { code: 'VIEW_RULE_BASE', name: 'View Rule Base', resource: 'rule_base', action: 'view', description: 'View rule base settings' },
    { code: 'VIEW_BUCKET', name: 'View Bucket', resource: 'bucket', action: 'view', description: 'View bucket parameters' },
    { code: 'VIEW_PD_SETUP', name: 'View PD Setup', resource: 'pd_setup', action: 'view', description: 'View PD configuration' },
    { code: 'VIEW_LGD_SETUP', name: 'View LGD Setup', resource: 'lgd_setup', action: 'view', description: 'View LGD configuration' },
    { code: 'VIEW_EAD_SETUP', name: 'View EAD Setup', resource: 'ead_setup', action: 'view', description: 'View EAD configuration' },
    { code: 'VIEW_ECL_CONFIG', name: 'View ECL Config', resource: 'ecl_config', action: 'view', description: 'View ECL configuration' },

    // INDIVIDUAL IMPAIRMENT
    { code: 'VIEW_INDIVIDUAL_IMPAIRMENT', name: 'View Individual Impairment', resource: 'individual_impairment', action: 'view', description: 'Access individual impairment menu' },
    { code: 'VIEW_ASSESSMENT_OVERRIDE', name: 'View Assessment Override', resource: 'assessment_override', action: 'view', description: 'Access assessment override' },
    { code: 'VIEW_INDIVIDUAL_REPORTS', name: 'View Individual Reports', resource: 'individual_reports', action: 'view', description: 'View individual reports' },
    { code: 'VIEW_SCENARIO_REVIEW', name: 'View Scenario Review', resource: 'scenario_review', action: 'view', description: 'Review scenarios' },
    { code: 'VIEW_DCF_UPLOAD_REVIEW', name: 'View DCF Review', resource: 'dcf_review', action: 'view', description: 'Review DCF uploads' },
    { code: 'VIEW_IA_DCF_DETAIL', name: 'View IA DCF Detail', resource: 'ia_dcf_detail', action: 'view', description: 'View IA DCF details' },
    { code: 'VIEW_OVERRIDE_HISTORY', name: 'View Override History', resource: 'override_history', action: 'view', description: 'View override history' },

    // IFRS 9 PROCESSING
    { code: 'VIEW_IFRS9_PROCESSING', name: 'View IFRS9 Processing', resource: 'ifrs9_processing', action: 'view', description: 'Access IFRS9 processing menu' },
    { code: 'VIEW_ECL_CALCULATIONS', name: 'View ECL Calculations', resource: 'ecl_calculations', action: 'view', description: 'Access ECL calculations' },
    { code: 'VIEW_IFRS9_STAGING', name: 'View IFRS9 Staging', resource: 'ifrs9_staging', action: 'view', description: 'Access IFRS9 staging' },
    { code: 'VIEW_MODEL_MANAGEMENT', name: 'View Model Mgmt', resource: 'model_management', action: 'view', description: 'Manage models' },
    { code: 'VIEW_FORECAST', name: 'View Forecast', resource: 'forecast', action: 'view', description: 'View forecasts' },

    // IFRS 9 REPORTS
    { code: 'VIEW_IFRS9_REPORTS', name: 'View IFRS9 Reports', resource: 'ifrs9_reports', action: 'view', description: 'Access IFRS9 reports menu' },
    { code: 'VIEW_NOMINATIVE_REPORT', name: 'View Nominative Report', resource: 'nominative_report', action: 'view', description: 'View nominative report' },
    { code: 'VIEW_LIFETIME_PD', name: 'View Lifetime PD', resource: 'lifetime_pd', action: 'view', description: 'View lifetime PD report' },
    { code: 'VIEW_LIFETIME_LGD', name: 'View Lifetime LGD', resource: 'lifetime_lgd', action: 'view', description: 'View lifetime LGD report' },
    { code: 'VIEW_EAD_MODEL_REPORT', name: 'View EAD Model Report', resource: 'ead_model_report', action: 'view', description: 'View EAD model report' },
    { code: 'VIEW_ECL_RESULT', name: 'View ECL Result', resource: 'ecl_result', action: 'view', description: 'View ECL result report' },
    { code: 'VIEW_ECL_MOVEMENT', name: 'View ECL Movement', resource: 'ecl_movement', action: 'view', description: 'View ECL movement' },
    { code: 'VIEW_GCA_MOVEMENT', name: 'View GCA Movement', resource: 'gca_movement', action: 'view', description: 'View GCA movement' },

    // ADVANCED ANALYTICS
    { code: 'VIEW_ADVANCED_ANALYTICS', name: 'View Advanced Analytics', resource: 'advanced_analytics', action: 'view', description: 'Access advanced analytics' },
    { code: 'VIEW_R_ANALYTICS', name: 'View R Analytics', resource: 'r_analytics', action: 'view', description: 'Access R analytics' },
    { code: 'VIEW_FINANCIAL_REPORTS', name: 'View Financial Reports', resource: 'financial_reports', action: 'view', description: 'View financial reports' },
    { code: 'VIEW_EXECUTIVE_DASHBOARD', name: 'View Executive Dashboard', resource: 'executive_dashboard', action: 'view', description: 'View executive dashboard' },
    { code: 'VIEW_ADVANCED_EXPORT', name: 'View Advanced Export', resource: 'advanced_export', action: 'view', description: 'Access advanced export' },

    // WORKFLOW MANAGEMENT
    { code: 'VIEW_WORKFLOW_MANAGEMENT', name: 'View Workflow Mgmt', resource: 'workflow_management', action: 'view', description: 'Access workflow management' },
    { code: 'VIEW_APPROVAL_SYSTEM', name: 'View Approval System', resource: 'approval_system', action: 'view', description: 'Access approval system' },
    { code: 'VIEW_WORKFLOW_CONFIG', name: 'View Workflow Config', resource: 'workflow_config', action: 'view', description: 'Configure workflows' },
    { code: 'VIEW_PROCESS_MONITORING', name: 'View Process Monitoring', resource: 'process_monitoring', action: 'view', description: 'Monitor processes' },
    { code: 'VIEW_STAGING_MANAGEMENT', name: 'View Staging Mgmt', resource: 'staging_management', action: 'view', description: 'Manage staging' },
    { code: 'VIEW_BUSINESS_PROCESS', name: 'View Business Process', resource: 'business_process', action: 'view', description: 'View business processes' },

    // TOOLS
    { code: 'VIEW_TOOLS', name: 'View Tools', resource: 'tools', action: 'view', description: 'Access tools menu' },
    { code: 'VIEW_MANUAL_UPLOAD', name: 'View Manual Upload', resource: 'manual_upload', action: 'view', description: 'Access manual upload' },
    { code: 'VIEW_BULK_IMPORT', name: 'View Bulk Import', resource: 'bulk_import', action: 'view', description: 'Access bulk import' },
    { code: 'VIEW_DATA_EXPORT', name: 'View Data Export', resource: 'data_export', action: 'view', description: 'Access data export' },
    { code: 'VIEW_ETL_TOOLS', name: 'View ETL Tools', resource: 'etl_tools', action: 'view', description: 'Access ETL tools' },
    { code: 'VIEW_DB_CONNECTION', name: 'View DB Connection', resource: 'db_connection', action: 'view', description: 'Access DB connection' },
    { code: 'VIEW_DATA_SCHEDULER', name: 'View Data Scheduler', resource: 'data_scheduler', action: 'view', description: 'Access data scheduler' },

    // ADMIN
    { code: 'VIEW_ADMIN', name: 'View Admin', resource: 'admin', action: 'view', description: 'Access admin menu' },
    { code: 'MANAGE_USERS', name: 'Manage Users', resource: 'users', action: 'manage', description: 'Create, update, delete users' },
    { code: 'MANAGE_ROLES', name: 'Manage Roles', resource: 'roles', action: 'manage', description: 'Manage roles and permissions' },
    { code: 'MANAGE_ASSIGNMENTS', name: 'Manage Assignments', resource: 'assignments', action: 'manage', description: 'Assign roles to users' },
    { code: 'MANAGE_APPROVALS', name: 'Manage Approvals', resource: 'approvals', action: 'manage', description: 'Manage approvals' },
    { code: 'VIEW_USER_ACTIVITY', name: 'View User Activity', resource: 'user_activity', action: 'view', description: 'View user activity logs' },
    { code: 'VIEW_JOB_MONITORING', name: 'View Job Monitoring', resource: 'job_monitoring', action: 'view', description: 'Monitor jobs' },
    { code: 'MANAGE_MENUS', name: 'Manage Menus', resource: 'menus', action: 'manage', description: 'Manage menu configuration' }
];

export async function seedPermissions() {
    console.log('🌱 Seeding Permissions...')

    // 1. Sidebar Permissions
    console.log('   ... Seeding Sidebar Permissions')
    let sidebarCount = 0
    for (const p of SIDEBAR_PERMISSIONS) {
        await db
            .insert(permissions)
            .values({
                code: p.code,
                name: p.name,
                resource: p.resource,
                action: p.action,
                description: p.description,
                module: 'banking',
                category: 'SIDEBAR',
                isActive: true,
            })
            .onConflictDoUpdate({
                target: permissions.code,
                set: {
                    name: p.name,
                    description: p.description,
                    resource: p.resource,
                    action: p.action,
                    module: 'banking',
                    category: 'SIDEBAR',
                },
            })
        sidebarCount++
    }

    // 2. Granular Permissions from Config
    console.log('   ... Seeding Granular Permissions')
    let granularCount = 0
    // Import here to avoid circular deps if any (though config shouldn't depend on db)
    const { PERMISSION_GROUPS } = await import('@/config/permissions')

    for (const [groupKey, group] of Object.entries(PERMISSION_GROUPS)) {
        for (const [permKey, permDef] of Object.entries(group.permissions)) {
            // Split permKey for resource/action
            // e.g. 'users.view' -> resource: 'users', action: 'view'
            const parts = permKey.split('.')
            const resource = parts[0] || groupKey
            const action = parts[1] || 'access'

            await db
                .insert(permissions)
                .values({
                    code: permKey,
                    name: permDef.label,
                    resource: resource,
                    action: action,
                    description: permDef.description,
                    module: 'banking',
                    category: group.label,
                    isActive: true,
                })
                .onConflictDoUpdate({
                    target: permissions.code,
                    set: {
                        name: permDef.label,
                        description: permDef.description,
                        resource: resource,
                        action: action,
                        module: 'banking',
                        category: group.label,
                        isActive: true,
                    },
                })
            granularCount++
        }
    }

    console.log(`✅ Seeded ${sidebarCount} sidebar permissions and ${granularCount} granular permissions.`)
}
