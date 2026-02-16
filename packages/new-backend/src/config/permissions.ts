/**
 * Centralized Permission Registry
 * Defines all available permissions organized by functional groups
 */

export interface PermissionDefinition {
    label: string
    description: string
}

export interface PermissionGroup {
    label: string
    icon: string
    permissions: Record<string, PermissionDefinition>
}

export const PERMISSION_GROUPS: Record<string, PermissionGroup> = {
    user_management: {
        label: 'User Management',
        icon: 'users',
        permissions: {
            'users.view': {
                label: 'View Users',
                description: 'View user list and details'
            },
            'users.create': {
                label: 'Create Users',
                description: 'Create new users'
            },
            'users.update': {
                label: 'Update Users',
                description: 'Edit user information'
            },
            'users.delete': {
                label: 'Delete Users',
                description: 'Delete users from the system'
            },
            'users.assign_roles': {
                label: 'Assign Roles',
                description: 'Assign roles to users'
            }
        }
    },
    role_management: {
        label: 'Role Management',
        icon: 'shield',
        permissions: {
            'roles.view': {
                label: 'View Roles',
                description: 'View role list and details'
            },
            'roles.create': {
                label: 'Create Roles',
                description: 'Create new roles'
            },
            'roles.update': {
                label: 'Update Roles',
                description: 'Edit role permissions and settings'
            },
            'roles.delete': {
                label: 'Delete Roles',
                description: 'Delete roles from the system'
            }
        }
    },
    ifrs9_calculations: {
        label: 'IFRS9 Calculations',
        icon: 'calculator',
        permissions: {
            'ecl.view': {
                label: 'View ECL',
                description: 'View ECL calculation results'
            },
            'ecl.run': {
                label: 'Run ECL',
                description: 'Trigger ECL calculations'
            },
            'ecl.approve': {
                label: 'Approve ECL',
                description: 'Approve ECL calculation jobs'
            },
            'pd.view': {
                label: 'View PD',
                description: 'View PD configurations'
            },
            'pd.configure': {
                label: 'Configure PD',
                description: 'Modify PD parameters'
            },
            'lgd.view': {
                label: 'View LGD',
                description: 'View LGD configurations'
            },
            'lgd.configure': {
                label: 'Configure LGD',
                description: 'Modify LGD parameters'
            },
            'ead.view': {
                label: 'View EAD',
                description: 'View EAD configurations'
            },
            'ead.configure': {
                label: 'Configure EAD',
                description: 'Modify EAD parameters'
            },
            'impairment.view': {
                label: 'View Impairment',
                description: 'View impairment results'
            },
            'amortization.view': {
                label: 'View Amortization',
                description: 'View amortization schedules'
            }
        }
    },
    data_management: {
        label: 'Data Management',
        icon: 'database',
        permissions: {
            'data.import': {
                label: 'Import Data',
                description: 'Import data files'
            },
            'data.export': {
                label: 'Export Data',
                description: 'Export data to files'
            },
            'data.validate': {
                label: 'Validate Data',
                description: 'Run data validation checks'
            },
            'data.delete': {
                label: 'Delete Data',
                description: 'Delete data records'
            }
        }
    },
    reports: {
        label: 'Reports & Analytics',
        icon: 'chart',
        permissions: {
            'reports.view': {
                label: 'View Reports',
                description: 'Access and view reports'
            },
            'reports.generate': {
                label: 'Generate Reports',
                description: 'Create new reports'
            },
            'reports.export': {
                label: 'Export Reports',
                description: 'Export report data'
            },
            'reports.schedule': {
                label: 'Schedule Reports',
                description: 'Schedule automated report generation'
            }
        }
    },
    approval_management: {
        label: 'Approval Management',
        icon: 'check-circle',
        permissions: {
            'approvals.view': {
                label: 'View Approvals',
                description: 'View approval requests'
            },
            'approvals.approve': {
                label: 'Approve Requests',
                description: 'Approve pending requests'
            },
            'approvals.reject': {
                label: 'Reject Requests',
                description: 'Reject approval requests'
            },
            'approvals.delegate': {
                label: 'Delegate Approvals',
                description: 'Delegate approvals to others'
            }
        }
    },
    job_management: {
        label: 'Job Management',
        icon: 'clock',
        permissions: {
            'jobs.view': {
                label: 'View Jobs',
                description: 'View job definitions and executions'
            },
            'jobs.create': {
                label: 'Create Jobs',
                description: 'Create new job definitions'
            },
            'jobs.run': {
                label: 'Run Jobs',
                description: 'Trigger job executions'
            },
            'jobs.control': {
                label: 'Control Jobs',
                description: 'Pause, resume, or stop jobs'
            },
            'jobs.approve': {
                label: 'Approve Jobs',
                description: 'Approve job execution requests'
            },
            'jobs.runtime.view': {
                label: 'View Job Runtime',
                description: 'View live runtime diagnostics for active jobs'
            }
        }
    },
    system_administration: {
        label: 'System Administration',
        icon: 'settings',
        permissions: {
            'system.view_logs': {
                label: 'View Logs',
                description: 'Access system audit logs'
            },
            'system.manage_tenants': {
                label: 'Manage Tenants',
                description: 'Manage tenant settings'
            },
            'system.configure': {
                label: 'System Configuration',
                description: 'Modify system-wide settings'
            },
            'system.backup': {
                label: 'Backup & Restore',
                description: 'Perform system backups'
            }
        }
    }
}

/**
 * Get all permissions as a flat array
 */
export const getAllPermissions = (): string[] => {
    const permissions: string[] = []
    Object.values(PERMISSION_GROUPS).forEach(group => {
        permissions.push(...Object.keys(group.permissions))
    })
    return permissions
}

/**
 * Check if a permission exists in the registry
 */
export const isValidPermission = (permission: string): boolean => {
    return getAllPermissions().includes(permission)
}

/**
 * Get permission definition by key
 */
export const getPermissionDefinition = (permission: string): PermissionDefinition | null => {
    for (const group of Object.values(PERMISSION_GROUPS)) {
        if (group.permissions[permission]) {
            return group.permissions[permission]
        }
    }
    return null
}

/**
 * Get all permissions for a specific group
 */
export const getGroupPermissions = (groupKey: string): string[] => {
    const group = PERMISSION_GROUPS[groupKey]
    return group ? Object.keys(group.permissions) : []
}
