'use client';

import React from 'react';
import {
    // Core Navigation & Layout
    Dashboard,
    Settings,
    Category,
    ExpandLess,
    ExpandMore,
    CheckCircle,
    Warning,
    Error,

    // Business & Banking
    AccountBalance,
    Business,
    Assessment,
    People,
    Visibility,
    AccountCircle,

    // IFRS9 & Calculations
    Calculate,
    TrendingUp,
    Person,
    Timeline,
    Layers,
    Functions,
    MonetizationOn,

    // Banking Operations
    Mosque,
    Security,
    SwapHoriz,
    CurrencyExchange,

    // Analytics & Reporting
    Analytics,
    AutoGraph,
    ShowChart,
    TableChart,
    Speed,
    CloudDownload,

    // Workflow & Process
    AccountTree,
    Approval,
    Monitor,
    Schedule,
    NotificationImportant,
    History,

    // Tools & Utilities
    CloudUpload,
    GetApp,
    Transform,
    Storage,
    PersonSearch,

    // Admin & Maintenance
    AdminPanelSettings,
    SupervisorAccount,
    ManageAccounts,
    HistoryToggleOff,
    Task,
    Menu, // Icon
    VpnKey,
    Email,

    // Additional icons
    BarChart,
    PieChart,
    InsertChart,
    DataUsage,
    TableView,
    ViewModule,
    Build,
    Engineering,
    Computer,
    Memory,
    GroupWork,
    PermIdentity,
    Refresh,
    ErrorOutline,
    MenuBook,
    Folder,
    Description,
} from '@mui/icons-material';

import { MenuItem, DatabaseMenuItem } from './types';
import { getMenuIcon } from '@/config/menu-config';

// IAF-SPECIFIC SITEMAP STRUCTURE - Based on IAF Navigation Requirements
// Default permission mapping for static menu (can be overridden per id/code)
export const PERMISSION_OVERRIDES: Record<string, string | string[]> = {
    dashboard: 'banking.dashboard.view',
    'system-setup': 'banking.setup.application',
    'application-configuration': 'banking.setup.application.view',
    'business-configuration': 'banking.setup.business.view',
    'parameter-management': 'banking.parameter',
    'product-parameters': 'banking.parameter.product.view',
    'accounting-parameters': 'banking.parameter.journal.view',
    'segmentation-configuration': 'banking.collective.segmentation.view',
    'collective-impairment': ['banking.collective.view'],
    'rule-base-setting': 'banking.collective.rule_base.view',
    'bucket-parameter': 'banking.collective.bucket.view',
    'pd-setup-management': 'banking.collective.pd_setup.view',
    'lgd-setup-management': 'banking.collective.lgd_setup.view',
    'ead-setup-management': 'banking.collective.ead_setup.view',
    'ecl-configuration': 'banking.collective.ecl.view',
    'ifrs9': 'banking.reports.ifrs9.view',
    'impairment-module': 'banking.processing.impairment.view',
    'amortization-module': 'banking.processing.amortization.view',
    'ifrs9-report': 'banking.reports.ifrs9.view',
    'nominative-report': 'banking.reports.ifrs9.nominative.view',
    'lifetime-pd-reports': 'banking.reports.ifrs9.lifetime_pd.view',
    'lifetime-lgd-reports': 'banking.reports.ifrs9.lifetime_lgd.view',
    'ead-model-reports': 'banking.reports.ifrs9.ead_model.view',
    'ecl-result': 'banking.reports.ifrs9.ecl_result.view',
    'ecl-movement': 'banking.reports.ifrs9.ecl_movement.view',
    'gca-movement': 'banking.reports.ifrs9.gca_movement.view',
    'advanced-analytics': 'banking.analytics.r.view',
    'r-analytics': 'banking.analytics.r.view',
                'maintenance': 'admin.system.view',
    approval: 'approval.requests.approve',
    'audit-logs': 'admin.maintenance.user_activity.view',
    'access-management': ['admin.users.view', 'admin.roles.view'],
    'user-management': 'admin.users.view',
    'role-management': 'admin.roles.view',
    'job-monitoring': ['jobs.view', 'admin.system.view'],
    'smtp-settings': 'admin.maintenance.smtp.view',
    'menu-matrix': 'admin.maintenance.menu_matrix.view',
    'impersonate-user': 'admin.super_admin',
    'assessment-workspace': 'banking.individual.view',
    'assessment-workspace-v1': 'banking.individual.view',
    'assessment-workspace-v2': 'banking.individual.view',
    'workflow-management': 'approval.requests.approve',
    'approval-system': 'approval.requests.approve',
    'workflow-notifications': ['notifications.view', 'approval.requests.approve'],
    'workflow-configuration': 'approval.requests.approve',
    'process-monitoring': 'approval.requests.approve',
                    };

export const URL_TO_LEGACY_ID_MAP: Record<string, string> = {
    '/banking/dashboard': 'dashboard',
    '/banking/setup/application': 'application-configuration',
    '/banking/setup/business': 'business-configuration',
    '/banking/parameters/product': 'product-parameters',
    '/banking/parameters/journal': 'accounting-parameters',
    '/banking/collective/segmentation': 'segmentation-configuration',
    '/banking/collective/rule-base': 'rule-base-setting',
    '/banking/collective/bucket': 'bucket-parameter',
    '/banking/collective/pd-setup': 'pd-setup-management',

    '/banking/collective/lgd-setup': 'lgd-setup-management',
    '/banking/collective/ead-setup': 'ead-setup-management',
    '/banking/collective/ecl-config': 'ecl-configuration',
    '/banking/individual/assessment': 'assessment-workspace-v1',
    '/banking/individual/assessment-new': 'assessment-workspace-v2',
    '/banking/ifrs9/impairment-module': 'impairment-module',
    '/banking/ifrs9/amortization-module': 'amortization-module',
    '/banking/ifrs9/calculations': 'ecl-calculations',
    '/banking/ifrs9/staging': 'ifrs9-staging',
    '/banking/ifrs9/models': 'model-management',
    '/banking/ifrs9/scenarios': 'forecast',
    '/banking/ifrs9-reports/nominative': 'nominative-report',
    '/banking/ifrs9-reports/lifetime-pd': 'lifetime-pd',
    '/banking/ifrs9-reports/lifetime-lgd': 'lifetime-lgd',
    '/banking/ifrs9-reports/ead-model': 'ead-model',
    '/banking/ifrs9-reports/ecl-result': 'ecl-result',
    '/banking/ifrs9-reports/ecl-movement': 'ecl-movement',
    '/banking/ifrs9-reports/gca-movement': 'gca-movement',
    '/banking/analytics/r-analytics': 'r-analytics',
    '/banking/notifications': 'workflow-notifications',
    '/banking/workflow/configuration': 'workflow-configuration',
    '/banking/workflow/monitoring': 'process-monitoring',
    '/banking/workflow/staging': 'staging-management',
    '/banking/workflow/business': 'business-process',
    '/banking/maintenance/user-management': 'access-management',
    '/banking/maintenance/approval': 'approval',
    '/banking/maintenance/user-activity': 'audit-logs',
    '/banking/maintenance/job-monitoring': 'job-monitoring',
    '/banking/maintenance/menus': 'menu-management',
    '/banking/maintenance/smtp': 'smtp-settings',
};

export const NAME_TO_LEGACY_ID_MAP: Record<string, string> = {
    'Dashboard': 'dashboard',
    'System Setup': 'system-setup',
    'Parameter Management': 'parameter-management',
    'Collective Impairment': 'collective-impairment',
    'Individual Assessment': 'assessment-workspace',
    'IFRS 9 Engine': 'ifrs9',
    'Advanced Analytics': 'advanced-analytics',
    'Workflow Management': 'workflow-management',
    'Admin & Maintenance': 'maintenance'
};

export const derivePermissionCodes = (idOrCode: string | undefined): string[] => {
    if (!idOrCode) return [];
    const key = idOrCode.toLowerCase();
    const override = PERMISSION_OVERRIDES[key];
    if (override) return Array.isArray(override) ? override : [override];
    return [`banking.${idOrCode.replace(/[^a-zA-Z0-9]+/g, '.').toLowerCase()}.view`];
};
const BANKING_MENU_STRUCTURE: MenuItem[] = [
    {
        id: 'dashboard',
        code: 'dashboard',
        label: 'Dashboard',
        href: '/banking/dashboard',
        icon: <Dashboard />,
        description: 'IFRS 9 System Overview',
        sort_order: 1,
        level: 1,
        path: '/dashboard',
        isActive: true,
        status: 'active',
        requiredPermissions: derivePermissionCodes('dashboard')
    },

    // CORE SYSTEM SETUP
    {
        id: 'system-setup',
        code: 'system-setup',
        label: 'System Setup',
        icon: <Settings />,
        description: 'Core System Configuration',
        sort_order: 2,
        level: 1,
        path: '/system-setup',
        isActive: true,
        status: 'active',
        children: [
            {
                id: 'application-configuration',
                code: 'application-configuration',
                label: 'Application Configuration',
                href: '/banking/setup/application',
                icon: <Settings />,
                description: 'System-wide Application Settings',
                sort_order: 3,
                level: 2,
                path: '/application-configuration',
                isActive: true,
                status: 'active'
            },
            {
                id: 'business-configuration',
                code: 'business-configuration',
                label: 'Business Configuration',
                href: '/banking/setup/business',
                icon: <Business />,
                description: 'Business Rules & Parameters',
                sort_order: 4,
                level: 2,
                path: '/business-configuration',
                isActive: true,
                status: 'active'
            }
        ]
    },

    // PARAMETER MANAGEMENT
    {
        id: 'parameter-management',
        code: 'parameter-management',
        label: 'Parameter Management',
        icon: <Category />,
        description: 'Banking Parameters & Configuration',
        sort_order: 5,
        level: 1,
        path: '/parameter-management',
        isActive: true,
        status: 'active',
        children: [
            {
                id: 'product-parameters',
                code: 'product-parameters',
                label: 'Product Parameters',
                href: '/banking/parameters/product',
                icon: <AccountBalance />,
                description: 'Banking Product Configuration',
                sort_order: 6,
                level: 2,
                path: '/product-parameters',
                isActive: true,
                status: 'active'
            },
            {
                id: 'accounting-parameters',
                code: 'accounting-parameters',
                label: 'Accounting Parameters',
                href: '/banking/parameters/journal',
                icon: <Assessment />,
                description: 'Journal & GL Configuration',
                sort_order: 7,
                level: 2,
                path: '/accounting-parameters',
                isActive: true,
                status: 'active'
            },
            // {
            //     id: 'risk-parameters',
            //     code: 'risk-parameters',
            //     label: 'Risk Parameters',
            //     href: '/banking/parameters/risk',
            //     icon: <TrendingUp />,
            //     description: 'Risk Assessment Parameters',
            //     sort_order: 8,
            //     level: 2,
            //     path: '/risk-parameters',
            //     isActive: true,
            //     status: 'active'
            // }
        ]
    },

    //     id: 'portfolio-management',
    //     label: 'Portfolio Management',
    //     icon: <Business />,
    //     description: 'Banking Operations',
    //     children: [
    //         {
    //             id: 'portfolio-accounts',
    //             label: 'Portfolio Accounts',
    //             href: '/banking/portfolio/accounts',
    //             icon: <AccountCircle />,
    //             description: 'Account Management'
    //         },
    //         {
    //             id: 'customer-management',
    //             label: 'Customer Management',
    //             href: '/banking/portfolio/customers',
    //             icon: <People />,
    //             description: 'Client Information'
    //         },
    //         {
    //             id: 'banking-products',
    //             label: 'Banking Products',
    //             href: '/banking/portfolio/products',
    //             icon: <AccountBalance />,
    //             description: 'Product Configuration'
    //         },
    //         {
    //             id: 'portfolio-monitoring',
    //             label: 'Portfolio Monitoring',
    //             href: '/banking/portfolio/overview',
    //             icon: <Visibility />,
    //             description: 'Real-time Tracking'
    //         }
    //     ]
    // },

    // COLLECTIVE IMPAIRMENT
    {
        id: 'collective-impairment',
        label: 'Collective Impairment',
        icon: <TrendingUp />,
        description: 'Portfolio Assessment',
        banking_modes: ['conventional', 'dual'],
        // roles: ['IAF_TENANT_SUPERADMIN', 'ACCESS_MANAGEMENT_OPERATOR', 'IAF Tenant Super Administrator', 'IAF Tenant Administrator', 'IAF_BANK_CRO', 'MODELER_APPROVER', 'MODELER_MAKER'],
        children: [
            {
                id: 'segmentation-configuration',
                label: 'Segmentation Configuration',
                href: '/banking/collective/segmentation',
                icon: <Category />,
                description: '/IFRS9N/ParamSegment'
            },
            {
                id: 'rule-base-setting',
                label: 'Rule Base Setting',
                href: '/banking/collective/rule-base',
                icon: <Assessment />,
                description: '/IFRS9N/ParamScenarioRules'
            },
            {
                id: 'bucket-parameter',
                label: 'Bucket Parameter',
                href: '/banking/collective/bucket',
                icon: <Layers />,
                description: '/IFRS9N/ParamBucket'
            },
            {
                id: 'pd-setup-management',
                label: 'PD Setup Management',
                href: '/banking/collective/pd-setup',
                icon: <TrendingUp />,
                description: '/IFRS9N/PDConfig'
            },
            {
                id: 'lgd-setup-management',
                label: 'LGD Setup Management',
                href: '/banking/collective/lgd-setup',
                icon: <MonetizationOn />,
                description: '/IFRS9N/LGDConfig'
            },
            {
                id: 'ead-setup-management',
                label: 'EAD Setup Management',
                href: '/banking/collective/ead-setup',
                icon: <AccountBalance />,
                description: '/IFRS9N/EADConfig'
            },
            {
                id: 'ecl-configuration',
                label: 'ECL Configuration',
                href: '/banking/collective/ecl-config',
                icon: <Calculate />,
                description: '/IFRS9N/ECLConfig'
            }
        ]
    },

    // INDIVIDUAL IMPAIRMENT
    {
        id: 'individual-impairment',
        label: 'Individual Impairment',
        icon: <Person />,
        description: 'Account Assessment',
        banking_modes: ['conventional', 'dual'],
        roles: ['IAF_TENANT_SUPERADMIN', 'ACCESS_MANAGEMENT_OPERATOR', 'IAF Tenant Super Administrator', 'IAF Tenant Administrator', 'IAF_BANK_CRO', 'MODELER_APPROVER', 'MODELER_MAKER'],
        children: [
            {
                id: 'assessment-workspace-v1',
                code: 'assessment-workspace',
                label: 'Assessment Workspace V1',
                href: '/banking/individual/assessment',
                icon: <Assessment />,
                description: 'Legacy individual impairment workspace',
            },
            {
                id: 'assessment-workspace-v2',
                label: 'Assessment Workspace V2',
                href: '/banking/individual/assessment-new',
                icon: <Assessment />,
                description: 'V2 impairment assessment isolated from legacy API',
                isNew: true
            }
        ]
    },

    // IFRS 9 PROCESSING
    {
        id: 'ifrs9',
        label: 'IFRS 9',
        icon: <Calculate />,
        description: 'Processing Modules',
        banking_modes: ['conventional', 'dual'],
        roles: ['IAF_TENANT_SUPERADMIN', 'ACCESS_MANAGEMENT_OPERATOR', 'IAF Tenant Super Administrator', 'IAF Tenant Administrator', 'IAF_BANK_CRO', 'MODELER_APPROVER', 'MODELER_MAKER'],
        children: [
            {
                id: 'impairment-module',
                label: 'Impairment Module',
                href: '/banking/ifrs9/impairment-module',
                icon: <Warning />,
                description: '/IFRS9N/ifrs'
            },
            {
                id: 'amortization-module',
                label: 'Amortization Module',
                href: '/banking/ifrs9/amortization-module',
                icon: <Schedule />,
                description: '/IFRS9N/LeaseContract'
            },
            {
                id: 'ecl-calculations',
                label: 'ECL Calculations',
                href: '/banking/ifrs9/calculations',
                icon: <Calculate />,
                description: 'Expected Credit Loss Processing',
                status: 'disabled'
            },
            {
                id: 'ifrs9-staging',
                label: 'IFRS9 Staging',
                href: '/banking/ifrs9/staging',
                icon: <Layers />,
                description: 'Stage 1/2/3 Classification',
                status: 'disabled'
            },
            {
                id: 'model-management',
                label: 'Model Management',
                href: '/banking/ifrs9/models',
                icon: <ViewModule />,
                description: 'PD/LGD/EAD Models',
                status: 'disabled'
            },
            {
                id: 'forecast',
                label: 'Forecast',
                href: '/banking/ifrs9/scenarios',
                icon: <AutoGraph />,
                description: 'Economic Scenario Analysis',
                status: 'disabled'
            }
        ]
    },

    // IFRS 9 REPORT
    {
        id: 'ifrs9-report',
        label: 'IFRS 9 Reports',
        icon: <TableChart />,
        description: 'Comprehensive IFRS 9 Reporting Suite',
        banking_modes: ['conventional', 'dual'],
        roles: ['IAF_TENANT_SUPERADMIN', 'ACCESS_MANAGEMENT_OPERATOR', 'IAF Tenant Super Administrator', 'IAF Tenant Administrator', 'IAF_BANK_CRO', 'MODELER_APPROVER', 'MODELER_MAKER'],

        children: [
            {
                id: 'nominative-report',
                label: 'Nominative Report',
                href: '/banking/ifrs9-reports/nominative',
                icon: <TableView />,
                description: 'Detailed account-level IFRS 9 report'
            },
            {
                id: 'lifetime-pd',
                label: 'Lifetime PD',
                href: '/banking/ifrs9-reports/lifetime-pd',
                icon: <TrendingUp />,
                description: 'Lifetime Probability of Default analysis'
            },
            {
                id: 'lifetime-lgd',
                label: 'Lifetime LGD',
                href: '/banking/ifrs9-reports/lifetime-lgd',
                icon: <MonetizationOn />,
                description: 'Lifetime Loss Given Default analysis'
            },
            {
                id: 'ead-model',
                label: 'EAD Model',
                href: '/banking/ifrs9-reports/ead-model',
                icon: <Functions />,
                description: 'Exposure at Default model results'
            },
            {
                id: 'ecl-result',
                label: 'ECL Result',
                href: '/banking/ifrs9-reports/ecl-result',
                icon: <Calculate />,
                description: 'Expected Credit Loss calculation results'
            },
            {
                id: 'ecl-movement',
                label: 'ECL Movement',
                href: '/banking/ifrs9-reports/ecl-movement',
                icon: <SwapHoriz />,
                description: 'ECL movement and reconciliation'
            },
            {
                id: 'gca-movement',
                label: 'GCA Movement',
                href: '/banking/ifrs9-reports/gca-movement',
                icon: <Timeline />,
                description: 'Gross Carrying Amount movement analysis'
            }
        ]
    },

    // ADVANCED ANALYTICS
    {
        id: 'advanced-analytics',
        label: 'Advanced Analytics',
        icon: <Analytics />,
        description: 'R Analytics & BI',
        banking_modes: ['conventional', 'dual'],
        roles: ['IAF_TENANT_SUPERADMIN', 'ACCESS_MANAGEMENT_OPERATOR', 'IAF Tenant Super Administrator', 'IAF Tenant Administrator', 'IAF_BANK_CRO', 'MODELER_APPROVER', 'MODELER_MAKER'],
        children: [
            {
                id: 'r-analytics',
                label: 'R Analytics',
                href: '/banking/analytics/r-analytics',
                icon: <DataUsage />,
                description: 'Statistical Analysis',
            },
        ]
    },

    // WORKFLOW MANAGEMENT
    {
        id: 'workflow-management',
        label: 'Workflow Management',
        icon: <AccountTree />,
        description: 'Business Process & Approval',
        children: [
            {
                id: 'workflow-notifications',
                label: 'Notifications',
                href: '/banking/notifications',
                icon: <NotificationImportant />,
                description: 'Notification center and preferences'
            },
            {
                id: 'workflow-configuration',
                label: 'Workflow Configuration',
                href: '/banking/workflow/configuration',
                icon: <Settings />,
                description: 'Business Process Design'
            },
            {
                id: 'process-monitoring',
                label: 'Process Monitoring',
                href: '/banking/workflow/monitoring',
                icon: <Monitor />,
                description: 'Job & Workflow Status'
            },
            {
                id: 'staging-management',
                label: 'Staging Management',
                href: '/banking/workflow/staging',
                icon: <TableView />,
                description: 'Temp Table & Data Flow'
            },
            {
                id: 'business-process',
                label: 'Business Process',
                href: '/banking/workflow/business',
                icon: <Business />,
                description: 'ECL & Risk Workflows'
            }
        ]
    },

    // TOOLS
        // MAINTENANCE
    {
        id: 'maintenance',
        label: 'Admin & Maintenance',
        icon: <Build />,
        description: 'System Administration',
        children: [
            {
                id: 'access-management',
                label: 'Access Management',
                href: '/banking/maintenance/user-management',
                icon: <ManageAccounts />,
                description: 'Users, roles, permissions, and assignments'
            },
            {
                id: 'approval',
                label: 'Approval',
                href: '/banking/maintenance/approval',
                icon: <Approval />,
                description: '/IFRS9N/Approval'
            },
            {
                id: 'audit-logs',
                label: 'User Activity',
                href: '/banking/maintenance/user-activity',
                icon: <History />,
                description: 'System audit logs'
            },
            {
                id: 'job-monitoring',
                code: 'job-monitoring',
                label: 'Job Monitoring',
                href: '/banking/maintenance/job-monitoring',
                icon: <Monitor />,
                description: '/IFRS9N/JobMonitoring'
            },
            {
                id: 'menu-matrix',
                label: 'Menu Matrix',
                href: '/banking/maintenance/menu-matrix',
                icon: <TableChart />,
                description: 'Configure role-based menu access',
            },
            {
                id: 'impersonate-user',
                label: 'Impersonate',
                href: '/banking/maintenance/impersonate',
                icon: <PersonSearch />,
                description: 'Log in as another user for troubleshooting',
            },
            {
                id: 'menu-management',
                label: 'Menu Management',
                href: '/banking/maintenance/menus',
                icon: <Menu />,
                description: 'Database-driven menu configuration',
            },
            {
                id: 'smtp-settings',
                label: 'SMTP Settings',
                href: '/banking/maintenance/smtp',
                icon: <Email />,
                description: 'Platform email server configuration',
            }
        ]
    }
];

// Ensure every static menu item has requiredPermissions (explicit or derived)
const applyRequiredPermissions = (items: MenuItem[]) => {
    items.forEach((item) => {
        if (!item.requiredPermissions || item.requiredPermissions.length === 0) {
            const codes = derivePermissionCodes(item.code || item.id);
            item.requiredPermissions = codes;
        }
        if (item.children && item.children.length > 0) {
            applyRequiredPermissions(item.children);
        }
    });
};

applyRequiredPermissions(BANKING_MENU_STRUCTURE);

// Convert icon string to React element helper
export const convertIconStringToElement = (iconString: string): React.ReactElement => {
    // Handle undefined/null iconString - return fallback menu icon
    if (!iconString || typeof iconString !== 'string') {
        return <Menu />;
    }
    switch (iconString) {
        case 'dashboard': return <Dashboard />;
        case 'settings': return <Settings />;
        case 'category': return <Category />;
        case 'assessment': return <Assessment />;
        case 'business': return <Business />;
        case 'people': return <People />;
        case 'account_balance': return <AccountBalance />;
        case 'visibility': return <Visibility />;
        case 'account_circle': return <AccountCircle />;
        case 'person': return <Person />;
        case 'calculate': return <Calculate />;
        case 'trending_up': return <TrendingUp />;
        case 'layers': return <Layers />;
        case 'functions': return <Functions />;
        case 'monetization_on': return <MonetizationOn />;
        case 'timeline': return <Timeline />;
        case 'analytics': return <Analytics />;
        case 'auto_graph': return <AutoGraph />;
        case 'table_chart': return <TableChart />;
        case 'data_usage': return <DataUsage />;
        case 'show_chart': return <ShowChart />;
        case 'bar_chart': return <BarChart />;
        case 'pie_chart': return <PieChart />;
        case 'speed': return <Speed />;
        case 'table_view': return <TableView />;
        case 'view_module': return <ViewModule />;
        case 'account_tree': return <AccountTree />;
        case 'approval': return <Approval />;
        case 'monitor': return <Monitor />;
        case 'schedule': return <Schedule />;
        case 'notification_important': return <NotificationImportant />;
        case 'history': return <History />;
        case 'cloud_upload': return <CloudUpload />;
        case 'get_app': return <GetApp />;
        case 'transform': return <Transform />;
        case 'storage': return <Storage />;
        case 'cloud_download': return <CloudDownload />;
        case 'build': return <Build />;
        case 'admin_panel_settings': return <AdminPanelSettings />;
        case 'supervisor_account': return <SupervisorAccount />;
        case 'manage_accounts': return <ManageAccounts />;
        case 'history_toggle_off': return <HistoryToggleOff />;
        case 'task': return <Task />;
        case 'menu': return <Menu />;
        case 'vpn_key': return <VpnKey />;
        case 'email': return <Email />;
        case 'mosque': return <Mosque />;
        case 'security': return <Security />;
        case 'swap_horiz': return <SwapHoriz />;
        case 'currency_exchange': return <CurrencyExchange />;
        case 'engineering': return <Engineering />;
        case 'computer': return <Computer />;
        case 'memory': return <Memory />;
        case 'group_work': return <GroupWork />;
        case 'perm_identity': return <PermIdentity />;
        case 'menu_book': return <MenuBook />;
        case 'folder': return <Folder />;
        case 'description': return <Description />;
        case 'insert_chart': return <InsertChart />;
        case 'error_outline': return <ErrorOutline />;
        case 'refresh': return <Refresh />;
        case 'check_circle': <CheckCircle />;
        case 'warning': <Warning />;
        case 'error': <Error />;
        case 'expand_less': <ExpandLess />;
        case 'expand_more': <ExpandMore />;
        default: return <Menu />;
    }
};

// Enhanced icon conversion function - CENTRALIZED CONFIGURATION
export const getIconFromDatabaseString = (iconString: string, bankingMode?: string): React.ReactElement => {
    // Handle undefined/null iconString - return fallback menu icon
    if (!iconString || typeof iconString !== 'string') {
        return <Menu />;
    }

    // Use centralized configuration first
    const configIcon = getMenuIcon(iconString, bankingMode);
    if (configIcon !== 'menu') {
        // Convert icon string to React element
        return convertIconStringToElement(configIcon);
    }

    // Fallback to local icon mapping for comprehensive coverage
    const fallbackIconMap: Record<string, React.ReactElement> = {
        // Core Navigation
        'dashboard': <Dashboard />,
        'settings': <Settings />,
        'category': <Category />,
        'assessment': <Assessment />,

        // Business & Banking
        'business': <Business />,
        'people': <People />,
        'account_balance': <AccountBalance />,
        'visibility': <Visibility />,
        'account_circle': <AccountCircle />,
        'person': <Person />,

        // IFRS9 & Calculations
        'calculate': <Calculate />,
        'trending_up': <TrendingUp />,
        'layers': <Layers />,
        'functions': <Functions />,
        'monetization_on': <MonetizationOn />,
        'timeline': <Timeline />,

        // Analytics & Reporting
        'analytics': <Analytics />,
        'auto_graph': <AutoGraph />,
        'table_chart': <TableChart />,
        'data_usage': <DataUsage />,
        'show_chart': <ShowChart />,
        'bar_chart': <BarChart />,
        'pie_chart': <PieChart />,
        'speed': <Speed />,
        'table_view': <TableView />,
        'view_module': <ViewModule />,

        // Workflow & Process
        'account_tree': <AccountTree />,
        'approval': <Approval />,
        'monitor': <Monitor />,
        'schedule': <Schedule />,
        'notification_important': <NotificationImportant />,
        'history': <History />,

        // Tools & Utilities
        'cloud_upload': <CloudUpload />,
        'get_app': <GetApp />,
        'transform': <Transform />,
        'storage': <Storage />,
        'cloud_download': <CloudDownload />,

        // Admin & Maintenance
        'build': <Build />,
        'admin_panel_settings': <AdminPanelSettings />,
        'supervisor_account': <SupervisorAccount />,
        'manage_accounts': <ManageAccounts />,
        'history_toggle_off': <HistoryToggleOff />,
        'task': <Task />,
        'menu': <Menu />,
        'vpn_key': <VpnKey />,
        'email': <Email />,

        // Additional icons for comprehensive coverage
        'mosque': <Mosque />,
        'security': <Security />,
        'swap_horiz': <SwapHoriz />,
        'currency_exchange': <CurrencyExchange />,
        'engineering': <Engineering />,
        'computer': <Computer />,
        'memory': <Memory />,
        'group_work': <GroupWork />,
        'perm_identity': <PermIdentity />,
        'menu_book': <MenuBook />,
        'folder': <Folder />,
        'description': <Description />,
        'insert_chart': <InsertChart />,
        'error_outline': <ErrorOutline />,
        'refresh': <Refresh />,
        'check_circle': <CheckCircle />,
        'warning': <Warning />,
        'error': <Error />,
        'expand_less': <ExpandLess />,
        'expand_more': <ExpandMore />
    };

    // Return mapped icon or fallback menu icon
    return fallbackIconMap[iconString.toLowerCase()] || <Menu />;
};

// Get appropriate icon for menu item based on code and level
export const getIconForMenuItem = (code: string, level: number): React.ReactElement => {
    // Map common menu codes to icons
    const iconMap: Record<string, React.ReactElement> = {
        'dashboard': <Dashboard />,
        'application-setting': <Settings />,
        'business-setting': <Business />,
        'product-parameter': <AccountBalance />,
        'journal-parameter': <Assessment />,
            'customer-management': <People />,
        'banking-products': <AccountBalance />,
            'segmentation-configuration': <Category />,
        'rule-base-setting': <Assessment />,
        'bucket-parameter': <Layers />,
        'pd-setup-management': <TrendingUp />,
        'lgd-setup-management': <MonetizationOn />,
        'ead-setup-management': <AccountBalance />,
        'ecl-configuration': <Calculate />,
        'assessment-override': <Assessment />,
        'impairment-module': <Warning />,
        'amortization-module': <Schedule />,
        'ecl-calculations': <Calculate />,
        'ifrs9-staging': <Layers />,
        'model-management': <ViewModule />,
        'stress-testing': <AutoGraph />,
        'nominative-report': <TableView />,
        'lifetime-pd': <TrendingUp />,
        'lifetime-lgd': <MonetizationOn />,
        'ead-model': <Functions />,
        'ecl-result': <Calculate />,
        'ecl-movement': <SwapHoriz />,
        'gca-movement': <Timeline />,
        'r-analytics': <DataUsage />,
                                'approval-system': <Approval />,
        'workflow-configuration': <Settings />,
        'process-monitoring': <Monitor />,
        'job-monitoring': <Monitor />,
        'staging-management': <TableView />,
        'business-process': <Business />,
                                                'access-management': <ManageAccounts />,
        'user-management': <ManageAccounts />,
        'role-management': <VpnKey />,
        'menu-management': <Menu />,
        'smtp-settings': <Email />
    };

    return iconMap[code] || (level === 0 ? <Category /> : <Assessment />);
};

// Map static menu IDs to icon strings for database persistence
const MENU_ICON_MAP: Record<string, string> = {
    'dashboard': 'dashboard',
    'system-setup': 'settings',
    'application-configuration': 'settings',
    'business-configuration': 'business',
    'parameter-management': 'category',
    'product-parameters': 'account_balance',
    'accounting-parameters': 'assessment',
    'collective-impairment': 'trending_up',
    'segmentation-configuration': 'category',
    'rule-base-setting': 'assessment',
    'bucket-parameter': 'layers',
    'pd-setup-management': 'trending_up',
    'lgd-setup-management': 'monetization_on',
    'ead-setup-management': 'account_balance',
    'ecl-configuration': 'calculate',
    'individual-impairment': 'person',
    'assessment-override': 'assessment',
    'list-individual-report': 'table_chart',
    'review-scenario': 'approval',
    'review-dcf-upload': 'cloud_upload',
    'ia-dcf-detail': 'show_chart',
    'override-history': 'history',
    'hist-customer': 'person',
    'hist-provision': 'account_balance',
    'hist-dcf': 'cloud_upload',
    'hist-collateral': 'security',
    'ifrs9': 'calculate',
    'impairment-module': 'warning',
    'amortization-module': 'schedule',
    'ecl-calculations': 'calculate',
    'ifrs9-staging': 'layers',
    'model-management': 'view_module',
    'forecast': 'auto_graph',
    'ifrs9-report': 'table_chart',
    'nominative-report': 'table_view',
    'lifetime-pd': 'trending_up',
    'lifetime-lgd': 'monetization_on',
    'ead-model': 'functions',
    'ecl-result': 'calculate',
    'ecl-movement': 'swap_horiz',
    'gca-movement': 'timeline',
    'advanced-analytics': 'analytics',
    'r-analytics': 'data_usage',
    'financial-reports': 'assessment',
    'executive-dashboard': 'dashboard',
    'advanced-export': 'get_app',
    'workflow-management': 'account_tree',
    'workflow-configuration': 'settings',
    'process-monitoring': 'monitor',
    'staging-management': 'table_view',
    'business-process': 'business',
    'tools': 'cloud_upload',
    'manual-upload': 'cloud_upload',
    'bulk-data-import': 'cloud_upload',
    'data-export': 'get_app',
    'direct-db-connection': 'storage',
    'data-scheduler': 'schedule',
    'maintenance': 'build',
    'access-management': 'manage_accounts',
    'user-management': 'manage_accounts',
    'role-management': 'vpn_key',
    'user-assignments': 'supervisor_account',
    'approval': 'approval',
    'audit-logs': 'history',
    'job-monitoring': 'monitor',
    'menu-management': 'menu',
    'smtp-settings': 'email'
};

// Helper function to convert static menu to database format for fallback
export const convertStaticToDatabaseFormat = (staticMenu: MenuItem[]): DatabaseMenuItem[] => {
    const convertItem = (item: MenuItem, parentId: string | null = null): DatabaseMenuItem => {
        const permissionCodes = item.requiredPermissions && item.requiredPermissions.length > 0
            ? item.requiredPermissions
            : derivePermissionCodes(item.code || item.id);
            
        // Look up correct icon string from map, fallback to folder for groups or dashboard for items
        const iconString = MENU_ICON_MAP[item.id] || (item.children ? 'folder' : 'dashboard');

        const dbItem: DatabaseMenuItem = {
            id: item.id,
            menu_key: item.code || item.id,
            title: item.label,
            description: item.description,
            icon: iconString,
            url: item.href,
            type: item.children && item.children.length > 0 ? 'group' : 'item',
            sort_order: item.sort_order || 999,
            is_active: true,
            user_types: item.roles || [],
            banking_types: item.banking_modes || ['conventional', 'dual'],
            requiredPermissions: permissionCodes,
            parent_id: parentId
        };
        return dbItem;
    };

    const items: DatabaseMenuItem[] = [];

    // Recursive function to process nested children
    const processChildren = (children: MenuItem[], parentId: string) => {
        children.forEach(child => {
            // Add child item
            items.push(convertItem(child, parentId));

            // Process grandchildren recursively
            if (child.children && child.children.length > 0) {
                processChildren(child.children, child.id);
            }
        });
    };

    staticMenu.forEach(item => {
        // Add parent item
        items.push(convertItem(item, null));

        // Process all children recursively
        if (item.children && item.children.length > 0) {
            processChildren(item.children, item.id);
        }
    });

    return items;
};

type BadgeColor = NonNullable<MenuItem['badge']>['color'];

const isBadgeColor = (value: unknown): value is BadgeColor => {
    return (
        value === 'primary' ||
        value === 'secondary' ||
        value === 'error' ||
        value === 'warning' ||
        value === 'info' ||
        value === 'success'
    );
};

// Convert database menu items to MenuItem format - PRESERVE HIERARCHY
export const convertDatabaseMenuToMenuItem = (dbMenuItems: DatabaseMenuItem[], bankingMode: string): MenuItem[] => {
    return dbMenuItems.map(item => {
        const menuItem: MenuItem = {
            id: item.id,
            code: item.key || item.id,
            label: item.title || item.label || 'Unknown',
            href: item.url || undefined,
            description: item.description,
            parent_id: item.parent_id,
            sort_order: item.sort_order,
            level: item.parent_id ? 2 : 1, // Calculate level based on parent_id
            path: item.key,
            // Use centralized icon configuration with banking mode awareness
            icon: item.icon ? getIconFromDatabaseString(item.icon, bankingMode) : <Menu />,
            banking_modes: item.banking_types as ('conventional' | 'dual')[],
            roles: item.user_types,
            requiredPermissions: item.requiredPermissions,
            // ✅ CRITICAL: Preserve children from database - DON'T RECURSIVELY CONVERT
            children: item.children && item.children.length > 0 ? item.children.map(child => ({
                id: child.id,
                code: child.key || child.id,
                label: child.title || child.label || 'Unknown',
                href: child.url || undefined,
                description: child.description,
                parent_id: child.parent_id,
                sort_order: child.sort_order,
                level: 3, // Children are level 3
                path: child.key,
                icon: child.icon ? getIconFromDatabaseString(child.icon, bankingMode) : <Menu />,
                banking_modes: child.banking_types as ('conventional' | 'dual')[],
                roles: child.user_types,
                requiredPermissions: child.requiredPermissions,
                status: child.is_active ? 'active' : 'disabled'
            })) : undefined,
            status: item.is_active ? 'active' : 'disabled'
        };

        // Add optional properties from database
        if (item.isNew) menuItem.isNew = item.isNew;
        // Handle both naming conventions
        if (item.requires_setup !== undefined) menuItem.requiresSetup = item.requires_setup;
        if (item.requiresSetup !== undefined) menuItem.requiresSetup = item.requiresSetup;

        // Handle badge info from database
        if (item.badge_info) {
            menuItem.badge = {
                content: item.badge_info.content || '',
                color: isBadgeColor(item.badge_info.color) ? item.badge_info.color : 'primary'
            };
        }

        return menuItem;
    });
};

export const getStaticFallbackMenu = () => convertStaticToDatabaseFormat(BANKING_MENU_STRUCTURE);