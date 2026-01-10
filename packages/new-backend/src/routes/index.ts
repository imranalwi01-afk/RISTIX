
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
import productSegmentsRoutes from './product-segments.routes'
import ruleBaseSettingsRoutes from './rule-base-settings.routes'
import bucketParametersRoutes from './bucket-parameters.routes'
import flScalarRoutes from './fl-scalar.routes'
import pdConfigurationsRoutes from './pd-configurations.routes'
import lgdConfigurationsRoutes from './lgd-configurations.routes'
import eadConfigurationsRoutes from './ead-configurations.routes'
import eclConfigurationsRoutes from './ecl-configurations.routes'
import populationSegmentsRoutes from './population-segments.routes'
import appSettingsRoutes from './app-settings.routes'
import businessSettingsRoutes from './business-settings.routes'
import productParameterRoutes from './product-parameters.routes'
import journalParameterRoutes from './journal-parameters.routes'
import { segmentationRoutes } from './segmentation.routes'
import impairmentRoutes from './impairment.routes'
import amortizationRoutes from './amortization.routes'
import reportsRoutes from './reports.routes'
import jobsRoutes from './jobs.routes'
import { consultantsRoutes } from './consultants.routes'
import { platformUsersRoutes } from './platform-users.routes'

/**
 * Main API router
 * All routes are mounted under /api
 */
export const routes = new OpenAPIHono<AppContext>()

// Mount route groups
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
routes.route('/banking/setup/application', appSettingsRoutes)
routes.route('/banking/setup/business', businessSettingsRoutes)
// routes.route('/banking/parameters/business-settings', businessSettingsRoutes) // Deprecated or kept as alias? Let's keep one source of truth for now.
routes.route('/banking/ifrs9/impairment-module', impairmentRoutes)
routes.route('/banking/ifrs9/amortization-module', amortizationRoutes)
routes.route('/banking/reports', reportsRoutes)
routes.route('/jobs', jobsRoutes)
routes.route('/roles', rbacRoutes) // Alias for frontend compatibility
routes.route('/user', usersRoutes) // Alias for frontend compatibility (singular)
routes.route('/approval', approvalRoutes) // Alias for frontend compatibility (singular)
