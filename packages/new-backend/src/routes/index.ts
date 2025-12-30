import { Hono } from 'hono'
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

/**
 * Main API router
 * All routes are mounted under /api
 */
export const routes = new Hono<AppContext>()

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
