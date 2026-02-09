
import { OpenAPIHono } from '@hono/zod-openapi'
import type { AppContext } from '../app'
import { healthRoutes } from './health.routes'
import { rbacRoutes } from './rbac.routes'
import { auditRoutes } from './audit.routes'
import { authRoutes } from './auth.routes'
import { usersRoutes } from './users.routes'
import { tenantsRoutes } from './tenants.routes'
import { platformAdminRoutes } from './platform-admin.routes'
import { approvalRoutes } from './approval.routes'
import { menuRoutes } from './menu.routes'
import { productSegmentsRoutes } from './product-segments.routes'
import { ruleBaseSettingsRoutes } from './rule-base-settings.routes'
import { bucketParametersRoutes } from './bucket-parameters.routes'
import { flScalarRoutes } from './fl-scalar.routes'
import { pdConfigurationsRoutes } from './pd-configurations.routes'
import { lgdConfigurationsRoutes } from './lgd-configurations.routes'
import { eadConfigurationsRoutes } from './ead-configurations.routes'
import { eclConfigurationsRoutes } from './ecl-configurations.routes'
import { populationSegmentsRoutes } from './population-segments.routes'
import { appSettingsRoutes } from './app-settings.routes'
import { businessSettingsRoutes } from './business-settings.routes'
import { productParameterRoutes } from './product-parameters.routes'
import { journalParameterRoutes } from './journal-parameters.routes'
import { segmentationRoutes } from './segmentation.routes'
import { impairmentRoutes } from './impairment.routes'
import { amortizationRoutes } from './amortization.routes'
import { reportsRoutes } from './reports.routes'
import { jobsRoutes } from './jobs.routes'
import { consultantsRoutes } from './consultants.routes'
import { platformUsersRoutes } from './platform-users.routes'
import { individualImpairmentRoutes } from './individual-impairment.routes'

// NEW STUB ROUTES
import { bankingRoutes } from './banking.routes'
import { portfolioRoutes } from './portfolio-management.routes'
import { workflowRoutes } from './workflow.routes'
import { rAnalyticsRoutes } from './r-analytics.routes'
import { formsRoutes } from './forms.routes'
import { securityRoutes } from './security.routes'
import { userActivityRoutes } from './user-activity.routes'
import { userRegistrationRoutes } from './user-registration.routes'
import { tenantRegistryRoutes } from './tenant-registry.routes'
import { platformInfrastructureRoutes } from './platform-infrastructure.routes'
import { adminDashboardRoutes } from './admin-dashboard.routes'
import { ifrs9Routes } from './ifrs9.routes'
import { securityConfigRoutes } from './security-config.routes'
import { bankingResourceRoutes } from './banking-resource.routes'

// DEBUG ROUTE
const debugRoutes = new OpenAPIHono<AppContext>()
debugRoutes.get('/check', (c) => c.json({ success: true, message: 'Routes are loaded correctly', timestamp: new Date().toISOString() }))

/**
 * Main API router
 * All routes are mounted under /api/v1
 */
export const routes = new OpenAPIHono<AppContext>()

// Core routes
routes.route('/health', healthRoutes)
routes.route('/auth', authRoutes)
routes.route('/users', usersRoutes)
routes.route('/tenants', tenantsRoutes)
routes.route('/platform-admin', platformAdminRoutes)
routes.route('/approvals', approvalRoutes)
routes.route('/rbac', rbacRoutes)
routes.route('/audit', auditRoutes)
routes.route('/menu', menuRoutes)
routes.route('/consultants', consultantsRoutes)
routes.route('/platform-users', platformUsersRoutes)

// Banking routes (existing)
routes.route('/banking/parameters/product-segments', productSegmentsRoutes)
routes.route('/banking/collective/rule-base', ruleBaseSettingsRoutes)
routes.route('/banking/collective/bucket', bucketParametersRoutes)
routes.route('/banking/collective/fl-scalar', flScalarRoutes)
routes.route('/banking/collective/pd-configurations', pdConfigurationsRoutes)
routes.route('/banking/collective/lgd-configurations', lgdConfigurationsRoutes)
routes.route('/banking/collective/ead-configurations', eadConfigurationsRoutes)
routes.route('/banking/collective/ecl-config', eclConfigurationsRoutes)
routes.route('/banking/parameters/population-segments', populationSegmentsRoutes)
routes.route('/banking/parameters/app-settings', appSettingsRoutes)
routes.route('/banking/parameters/product', productParameterRoutes)
routes.route('/banking/parameters/journal', journalParameterRoutes)
routes.route('/banking/setup/application', appSettingsRoutes)
routes.route('/banking/setup/business', businessSettingsRoutes)
routes.route('/banking/business-settings', businessSettingsRoutes)
routes.route('/banking/parameters/segmentation', segmentationRoutes)
routes.route('/banking/individual/impairment', individualImpairmentRoutes)
routes.route('/banking/ifrs9/impairment-module', impairmentRoutes)
routes.route('/banking/ifrs9/amortization-module', amortizationRoutes)

// NEW STUB ROUTES - Main banking operations
routes.route('/banking', bankingRoutes)
routes.route('/banking-resource', bankingResourceRoutes)

// NEW STUB ROUTES - Portfolio & Workflow
routes.route('/portfolio-management', portfolioRoutes)
routes.route('/workflow', workflowRoutes)

// NEW STUB ROUTES - Analytics & Forms
routes.route('/r-analytics', rAnalyticsRoutes)
routes.route('/forms', formsRoutes)

// NEW STUB ROUTES - Security
routes.route('/security', securityRoutes)
routes.route('/security-config', securityConfigRoutes)

// NEW STUB ROUTES - User Management
routes.route('/user-activity', userActivityRoutes)
routes.route('/user-registration', userRegistrationRoutes)

// NEW STUB ROUTES - Platform Management
routes.route('/tenant-registry', tenantRegistryRoutes)
routes.route('/platform-infrastructure', platformInfrastructureRoutes)
routes.route('/admin-dashboard', adminDashboardRoutes)

// NEW STUB ROUTES - IFRS9
routes.route('/ifrs9', ifrs9Routes)
routes.route('/ifrs9/reports', reportsRoutes)

// Jobs
routes.route('/jobs', jobsRoutes)

// Aliases for frontend compatibility
routes.route('/roles', rbacRoutes)
routes.route('/user', usersRoutes)
routes.route('/approval', approvalRoutes)
routes.route('/debug-routes', debugRoutes)
