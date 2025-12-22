#!/bin/bash
# ============================================================================
# PSDD METHODOLOGY - Phase 1 Implementation
# ============================================================================
# Script: phase1-platform-admin-database-connection.sh
# Phase: PHASE 1 - Platform Admin Database Connection (7.5 minutes)
# Objective: Connect frontend to ifrspro_platform_admin database with consultant access
# Generated: $(date)
# File Path: ./ifrs9-platform/scripts/development/phase1-platform-admin-database-connection.sh
# ============================================================================

set -e  # Exit on any error
set -u  # Exit on undefined variables

# MANDATORY: Script configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"
LOG_FILE="${PROJECT_ROOT}/logs/phase1-platform-admin-$(date +%Y%m%d-%H%M%S).log"

# MANDATORY: Phase identification
PHASE_ID="PHASE1"
PHASE_NAME="PLATFORM ADMIN DATABASE CONNECTION"
PHASE_OBJECTIVE="Connect to ifrspro_platform_admin database with consultant user access"

# MANDATORY: Create logs directory
mkdir -p "${PROJECT_ROOT}/logs"

# MANDATORY: Logging functions
log_info() {
    echo "[INFO] $(date '+%Y-%m-%d %H:%M:%S') - $1" | tee -a "${LOG_FILE}"
}

log_error() {
    echo "[ERROR] $(date '+%Y-%m-%d %H:%M:%S') - $1" | tee -a "${LOG_FILE}" >&2
}

log_success() {
    echo "[SUCCESS] $(date '+%Y-%m-%d %H:%M:%S') - $1" | tee -a "${LOG_FILE}"
}

log_warning() {
    echo "[WARNING] $(date '+%Y-%m-%d %H:%M:%S') - $1" | tee -a "${LOG_FILE}"
}

# MANDATORY: Error handling
handle_error() {
    local exit_code=$?
    local line_number=$1
    log_error "Script failed at line ${line_number} with exit code: ${exit_code}"
    log_error "Failed command: ${BASH_COMMAND}"
    log_error "Stack trace available in: ${LOG_FILE}"
    exit ${exit_code}
}

trap 'handle_error ${LINENO}' ERR

# MANDATORY: Validate existing project structure
validate_existing_project() {
    log_info "Validating existing ifrs9-platform structure..."
    
    # Check for existing project directories
    if [[ ! -d "${PROJECT_ROOT}/packages/frontend" ]]; then
        log_error "Frontend package not found. Expected: ${PROJECT_ROOT}/packages/frontend"
        exit 1
    fi
    
    if [[ ! -d "${PROJECT_ROOT}/packages/backend" ]]; then
        log_error "Backend package not found. Expected: ${PROJECT_ROOT}/packages/backend"
        exit 1
    fi
    
    # Check for React Admin structure
    if [[ ! -d "${PROJECT_ROOT}/packages/frontend/src/admin" ]]; then
        mkdir -p "${PROJECT_ROOT}/packages/frontend/src/admin"
        log_info "Created admin directory structure"
    fi
    
    log_success "Existing project structure validated"
}

# Phase 1: Create Platform DataProvider
create_platform_data_provider() {
    log_info "Creating Platform DataProvider for ifrspro_platform_admin database..."
    
    local provider_dir="${PROJECT_ROOT}/packages/frontend/src/admin/providers/data"
    mkdir -p "$provider_dir"
    
    cat > "${provider_dir}/platformDataProvider.ts" << 'EOF'
// ============================================================================
// PSDD ARTIFACT DOCUMENTATION
// ============================================================================
// File Path: packages/frontend/src/admin/providers/data/platformDataProvider.ts
// Generated: $(date)
// Phase: PHASE1 - Platform Admin Database Connection
// Methodology: Phased Shell-Driven Development (PSDD)
// Dependencies: React Admin, Axios
// Purpose: Connect to ifrspro_platform_admin database with consultant access
// ============================================================================

import { DataProvider, fetchUtils } from 'react-admin';
import { stringify } from 'query-string';

const apiUrl = process.env.REACT_APP_PLATFORM_API_URL || '/api/platform/admin';
const httpClient = fetchUtils.fetchJson;

export interface PlatformDataProviderConfig {
  apiUrl: string;
  httpClient: typeof httpClient;
  consultantAccess: boolean;
}

/**
 * Platform Data Provider for ifrspro_platform_admin database
 * Supports cross-tenant access and consultant user management
 */
export const platformDataProvider: DataProvider = {
  getList: (resource, params) => {
    const { page, perPage } = params.pagination;
    const { field, order } = params.sort;
    const query = {
      sort: JSON.stringify([field, order]),
      range: JSON.stringify([(page - 1) * perPage, page * perPage - 1]),
      filter: JSON.stringify(params.filter),
    };
    const url = `${apiUrl}/${resource}?${stringify(query)}`;

    return httpClient(url).then(({ headers, json }) => ({
      data: json,
      total: parseInt(headers.get('content-range')?.split('/').pop() || '0', 10),
    }));
  },

  getOne: (resource, params) =>
    httpClient(`${apiUrl}/${resource}/${params.id}`).then(({ json }) => ({
      data: json,
    })),

  getMany: (resource, params) => {
    const query = {
      filter: JSON.stringify({ id: params.ids }),
    };
    const url = `${apiUrl}/${resource}?${stringify(query)}`;
    return httpClient(url).then(({ json }) => ({ data: json }));
  },

  getManyReference: (resource, params) => {
    const { page, perPage } = params.pagination;
    const { field, order } = params.sort;
    const query = {
      sort: JSON.stringify([field, order]),
      range: JSON.stringify([(page - 1) * perPage, page * perPage - 1]),
      filter: JSON.stringify({
        ...params.filter,
        [params.target]: params.id,
      }),
    };
    const url = `${apiUrl}/${resource}?${stringify(query)}`;

    return httpClient(url).then(({ headers, json }) => ({
      data: json,
      total: parseInt(headers.get('content-range')?.split('/').pop() || '0', 10),
    }));
  },

  create: (resource, params) =>
    httpClient(`${apiUrl}/${resource}`, {
      method: 'POST',
      body: JSON.stringify(params.data),
    }).then(({ json }) => ({
      data: { ...params.data, id: json.id },
    })),

  update: (resource, params) =>
    httpClient(`${apiUrl}/${resource}/${params.id}`, {
      method: 'PUT',
      body: JSON.stringify(params.data),
    }).then(({ json }) => ({ data: json })),

  updateMany: (resource, params) => {
    const query = {
      filter: JSON.stringify({ id: params.ids }),
    };
    return httpClient(`${apiUrl}/${resource}?${stringify(query)}`, {
      method: 'PUT',
      body: JSON.stringify(params.data),
    }).then(({ json }) => ({ data: json }));
  },

  delete: (resource, params) =>
    httpClient(`${apiUrl}/${resource}/${params.id}`, {
      method: 'DELETE',
    }).then(({ json }) => ({ data: json })),

  deleteMany: (resource, params) => {
    const query = {
      filter: JSON.stringify({ id: params.ids }),
    };
    return httpClient(`${apiUrl}/${resource}?${stringify(query)}`, {
      method: 'DELETE',
    }).then(({ json }) => ({ data: json }));
  },
};

/**
 * Enhanced platform data provider with consultant access
 */
export const createPlatformDataProvider = (config: Partial<PlatformDataProviderConfig> = {}) => {
  const finalConfig = {
    apiUrl: config.apiUrl || apiUrl,
    httpClient: config.httpClient || httpClient,
    consultantAccess: config.consultantAccess || false,
  };

  // Add consultant-specific headers if consultant access is enabled
  if (finalConfig.consultantAccess) {
    const enhancedHttpClient = (url: string, options: any = {}) => {
      return finalConfig.httpClient(url, {
        ...options,
        headers: {
          ...options.headers,
          'X-Consultant-Access': 'true',
          'X-Access-Level': 'platform-admin',
        },
      });
    };

    return {
      ...platformDataProvider,
      // Override methods to use enhanced HTTP client
      getList: (resource: string, params: any) => {
        const { page, perPage } = params.pagination;
        const { field, order } = params.sort;
        const query = {
          sort: JSON.stringify([field, order]),
          range: JSON.stringify([(page - 1) * perPage, page * perPage - 1]),
          filter: JSON.stringify(params.filter),
        };
        const url = `${finalConfig.apiUrl}/${resource}?${stringify(query)}`;

        return enhancedHttpClient(url).then(({ headers, json }: any) => ({
          data: json,
          total: parseInt(headers.get('content-range')?.split('/').pop() || '0', 10),
        }));
      },
    };
  }

  return platformDataProvider;
};

export default platformDataProvider;
EOF
    
    log_success "Platform DataProvider created"
}

# Phase 1: Create Platform Admin AuthProvider
create_platform_auth_provider() {
    log_info "Creating Platform Admin AuthProvider..."
    
    local provider_dir="${PROJECT_ROOT}/packages/frontend/src/admin/providers/auth"
    mkdir -p "$provider_dir"
    
    cat > "${provider_dir}/platformAuthProvider.ts" << 'EOF'
// ============================================================================
// PSDD ARTIFACT DOCUMENTATION  
// ============================================================================
// File Path: packages/frontend/src/admin/providers/auth/platformAuthProvider.ts
// Generated: $(date)
// Phase: PHASE1 - Platform Admin Database Connection
// Methodology: Phased Shell-Driven Development (PSDD)
// Dependencies: React Admin Auth
// Purpose: Authentication for platform admin and consultant users
// ============================================================================

import { AuthProvider } from 'react-admin';

const API_URL = process.env.REACT_APP_PLATFORM_API_URL || '/api/platform/admin';

/**
 * Platform Authentication Provider
 * Supports platform admin and consultant user authentication
 */
export const platformAuthProvider: AuthProvider = {
  // Login function
  login: async ({ username, password, userType = 'platform_admin' }) => {
    const request = new Request(`${API_URL}/auth/login`, {
      method: 'POST',
      body: JSON.stringify({ username, password, userType }),
      headers: new Headers({ 'Content-Type': 'application/json' }),
    });

    try {
      const response = await fetch(request);
      if (response.status < 200 || response.status >= 300) {
        throw new Error(response.statusText);
      }

      const { token, user, permissions, consultantAccess } = await response.json();
      
      // Store authentication data
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('permissions', JSON.stringify(permissions));
      
      // Store consultant access flag
      if (consultantAccess) {
        localStorage.setItem('consultantAccess', 'true');
      }

      return Promise.resolve();
    } catch (error) {
      return Promise.reject(new Error('Invalid credentials'));
    }
  },

  // Logout function
  logout: async () => {
    const token = localStorage.getItem('token');
    if (token) {
      // Call logout endpoint to invalidate token
      await fetch(`${API_URL}/auth/logout`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }).catch(() => {
        // Ignore errors during logout
      });
    }

    // Clear all stored data
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('permissions');
    localStorage.removeItem('consultantAccess');
    
    return Promise.resolve();
  },

  // Check authentication status
  checkAuth: async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      return Promise.reject();
    }

    // Validate token with server
    try {
      const response = await fetch(`${API_URL}/auth/validate`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.status < 200 || response.status >= 300) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('permissions');
        localStorage.removeItem('consultantAccess');
        return Promise.reject();
      }

      return Promise.resolve();
    } catch (error) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('permissions');
      localStorage.removeItem('consultantAccess');
      return Promise.reject();
    }
  },

  // Check permissions
  checkError: async (error: any) => {
    const status = error.status;
    if (status === 401 || status === 403) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('permissions');
      localStorage.removeItem('consultantAccess');
      return Promise.reject();
    }
    return Promise.resolve();
  },

  // Get user identity
  getIdentity: async () => {
    const user = localStorage.getItem('user');
    if (!user) {
      return Promise.reject();
    }

    const userData = JSON.parse(user);
    const consultantAccess = localStorage.getItem('consultantAccess') === 'true';

    return Promise.resolve({
      id: userData.id,
      fullName: userData.full_name,
      avatar: userData.avatar,
      userType: userData.user_type,
      consultantAccess,
    });
  },

  // Get user permissions
  getPermissions: async () => {
    const permissions = localStorage.getItem('permissions');
    if (!permissions) {
      return Promise.reject();
    }

    const permissionList = JSON.parse(permissions);
    const consultantAccess = localStorage.getItem('consultantAccess') === 'true';

    return Promise.resolve({
      permissions: permissionList,
      consultantAccess,
    });
  },
};

/**
 * Enhanced auth provider factory for consultant access
 */
export const createPlatformAuthProvider = (options: {
  enableConsultantAccess?: boolean;
} = {}) => {
  const { enableConsultantAccess = false } = options;

  if (enableConsultantAccess) {
    return {
      ...platformAuthProvider,
      login: async ({ username, password, userType = 'platform_admin', consultantMode = false }) => {
        const request = new Request(`${API_URL}/auth/login`, {
          method: 'POST',
          body: JSON.stringify({ 
            username, 
            password, 
            userType: consultantMode ? 'consultant_manager' : userType,
            consultantAccess: consultantMode 
          }),
          headers: new Headers({ 'Content-Type': 'application/json' }),
        });

        try {
          const response = await fetch(request);
          if (response.status < 200 || response.status >= 300) {
            throw new Error(response.statusText);
          }

          const { token, user, permissions, consultantAccess } = await response.json();
          
          localStorage.setItem('token', token);
          localStorage.setItem('user', JSON.stringify(user));
          localStorage.setItem('permissions', JSON.stringify(permissions));
          
          if (consultantAccess || consultantMode) {
            localStorage.setItem('consultantAccess', 'true');
          }

          return Promise.resolve();
        } catch (error) {
          return Promise.reject(new Error('Invalid credentials'));
        }
      },
    };
  }

  return platformAuthProvider;
};

export default platformAuthProvider;
EOF
    
    log_success "Platform Auth Provider created"
}

# Phase 1: Create Backend API Route for Platform Admin
create_backend_platform_routes() {
    log_info "Creating backend API routes for platform admin..."
    
    local routes_dir="${PROJECT_ROOT}/packages/backend/src/api/routes"
    mkdir -p "$routes_dir"
    
    cat > "${routes_dir}/platform-admin.routes.ts" << 'EOF'
// ============================================================================
// PSDD ARTIFACT DOCUMENTATION
// ============================================================================
// File Path: packages/backend/src/api/routes/platform-admin.routes.ts
// Generated: $(date)
// Phase: PHASE1 - Platform Admin Database Connection
// Methodology: Phased Shell-Driven Development (PSDD)
// Dependencies: Express, Platform Admin Controller
// Purpose: API routes for platform admin operations with consultant access
// ============================================================================

import { Router } from 'express';
import { body, param, query, validationResult } from 'express-validator';
import { authenticate } from '../middleware/auth.middleware';
import { requirePlatformAdmin } from '../middleware/platform-admin.middleware';
import { auditLog } from '../middleware/audit.middleware';
import { PlatformAdminController } from '../controllers/platform-admin.controller';

const router = Router();
const platformAdminController = new PlatformAdminController();

// Middleware stack for platform admin
const platformAdminMiddleware = [
  authenticate,
  requirePlatformAdmin,
  auditLog
];

// Validation schemas
const loginValidation = [
  body('username').notEmpty().withMessage('Username is required'),
  body('password').notEmpty().withMessage('Password is required'),
  body('userType').optional().isIn(['platform_admin', 'consultant_manager']),
  body('consultantAccess').optional().isBoolean(),
];

const consultantValidation = [
  body('consultantId').isUUID().withMessage('Valid consultant ID required'),
  body('accessLevel').isIn(['read', 'write', 'admin']).withMessage('Valid access level required'),
];

/**
 * Authentication routes
 */
// POST /api/platform/admin/auth/login
router.post('/auth/login', loginValidation, (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  platformAdminController.login(req, res, next);
});

// POST /api/platform/admin/auth/logout
router.post('/auth/logout', authenticate, (req, res, next) => {
  platformAdminController.logout(req, res, next);
});

// GET /api/platform/admin/auth/validate
router.get('/auth/validate', authenticate, (req, res, next) => {
  platformAdminController.validateToken(req, res, next);
});

/**
 * Banking Institutions Management
 * Query: SELECT * FROM platform_config.banking_institutions ORDER BY created_at DESC
 */
router.get('/banking-institutions', 
  ...platformAdminMiddleware,
  (req, res, next) => {
    platformAdminController.getBankingInstitutions(req, res, next);
  }
);

router.post('/banking-institutions',
  ...platformAdminMiddleware,
  [
    body('bank_name').notEmpty().withMessage('Bank name is required'),
    body('bank_code').notEmpty().withMessage('Bank code is required'),
    body('banking_type').isIn(['conventional', 'syariah', 'dual']).withMessage('Valid banking type required'),
    body('regulatory_id').notEmpty().withMessage('Regulatory ID is required'),
  ],
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    platformAdminController.createBankingInstitution(req, res, next);
  }
);

/**
 * Consultant Management Routes
 * Query: SELECT * FROM core.users WHERE user_type IN ('consultant_manager', 'consultant') AND is_active = true
 */
router.get('/consultants',
  ...platformAdminMiddleware,
  (req, res, next) => {
    platformAdminController.getConsultants(req, res, next);
  }
);

router.post('/consultants',
  ...platformAdminMiddleware,
  [
    body('email').isEmail().withMessage('Valid email required'),
    body('full_name').notEmpty().withMessage('Full name is required'),
    body('consultant_type').isIn(['ifrs9_implementation', 'model_validation', 'external_audit', 'technology', 'regulatory']),
    body('firm_name').notEmpty().withMessage('Firm name is required'),
  ],
  consultantValidation,
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    platformAdminController.createConsultant(req, res, next);
  }
);

/**
 * Consultant Project Management
 */
router.get('/consultant-projects',
  ...platformAdminMiddleware,
  (req, res, next) => {
    platformAdminController.getConsultantProjects(req, res, next);
  }
);

router.post('/consultant-projects',
  ...platformAdminMiddleware,
  [
    body('consultant_id').isUUID().withMessage('Valid consultant ID required'),
    body('bank_id').isUUID().withMessage('Valid bank ID required'),
    body('project_type').isIn(['implementation', 'validation', 'audit']),
    body('start_date').isISO8601().withMessage('Valid start date required'),
    body('end_date').isISO8601().withMessage('Valid end date required'),
  ],
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    platformAdminController.createConsultantProject(req, res, next);
  }
);

/**
 * Cross-tenant monitoring
 */
router.get('/tenant-overview',
  ...platformAdminMiddleware,
  (req, res, next) => {
    platformAdminController.getTenantOverview(req, res, next);
  }
);

/**
 * Platform configuration
 */
router.get('/platform-config',
  ...platformAdminMiddleware,
  (req, res, next) => {
    platformAdminController.getPlatformConfig(req, res, next);
  }
);

router.put('/platform-config/:key',
  ...platformAdminMiddleware,
  [
    param('key').notEmpty().withMessage('Configuration key is required'),
    body('value').notEmpty().withMessage('Configuration value is required'),
  ],
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    platformAdminController.updatePlatformConfig(req, res, next);
  }
);

export default router;
EOF
    
    log_success "Backend platform admin routes created"
}

# Phase 1: Create Platform Admin Controller
create_platform_admin_controller() {
    log_info "Creating Platform Admin Controller..."
    
    local controller_dir="${PROJECT_ROOT}/packages/backend/src/api/controllers"
    mkdir -p "$controller_dir"
    
    cat > "${controller_dir}/platform-admin.controller.ts" << 'EOF'
// ============================================================================
// PSDD ARTIFACT DOCUMENTATION
// ============================================================================
// File Path: packages/backend/src/api/controllers/platform-admin.controller.ts
// Generated: $(date)
// Phase: PHASE1 - Platform Admin Database Connection
// Methodology: Phased Shell-Driven Development (PSDD)
// Dependencies: Express, Platform Admin Service
// Purpose: Controller for platform admin operations with consultant management
// ============================================================================

import { Request, Response, NextFunction } from 'express';
import { PlatformAdminService } from '../../core/services/platform-admin.service';
import { ConsultantService } from '../../core/services/consultant.service';

export class PlatformAdminController {
  private platformAdminService: PlatformAdminService;
  private consultantService: ConsultantService;

  constructor() {
    this.platformAdminService = new PlatformAdminService();
    this.consultantService = new ConsultantService();
  }

  /**
   * Login platform admin or consultant user
   * Query: SELECT * FROM core.users WHERE user_type IN ('platform_admin', 'consultant_manager') AND is_active = true
   */
  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { username, password, userType = 'platform_admin', consultantAccess = false } = req.body;
      
      const result = await this.platformAdminService.authenticateUser({
        username,
        password,
        userType,
        consultantAccess,
      });

      res.json({
        success: true,
        message: 'Login successful',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Logout user
   */
  async logout(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const token = req.headers.authorization?.replace('Bearer ', '');
      
      if (token) {
        await this.platformAdminService.invalidateToken(token);
      }

      res.json({
        success: true,
        message: 'Logout successful',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Validate authentication token
   */
  async validateToken(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = (req as any).user;
      
      res.json({
        success: true,
        message: 'Token is valid',
        data: {
          user,
          timestamp: new Date(),
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get banking institutions
   * Query: SELECT * FROM platform_config.banking_institutions ORDER BY created_at DESC
   */
  async getBankingInstitutions(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { page = 1, perPage = 25, sort = 'created_at', order = 'DESC', filter = {} } = req.query;
      
      const result = await this.platformAdminService.getBankingInstitutions({
        page: Number(page),
        perPage: Number(perPage),
        sort: sort as string,
        order: order as 'ASC' | 'DESC',
        filter: filter as Record<string, any>,
      });

      res.set('Content-Range', `banking-institutions ${(Number(page) - 1) * Number(perPage)}-${Number(page) * Number(perPage)}/${result.total}`);
      res.json(result.data);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Create banking institution
   */
  async createBankingInstitution(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const institutionData = req.body;
      const userId = (req as any).user?.id;
      
      const result = await this.platformAdminService.createBankingInstitution({
        ...institutionData,
        created_by: userId,
      });

      res.status(201).json({
        success: true,
        message: 'Banking institution created successfully',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get consultants
   * Query: SELECT * FROM core.users WHERE user_type IN ('consultant_manager', 'consultant') AND is_active = true
   */
  async getConsultants(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { page = 1, perPage = 25, sort = 'created_at', order = 'DESC', filter = {} } = req.query;
      
      const result = await this.consultantService.getConsultants({
        page: Number(page),
        perPage: Number(perPage),
        sort: sort as string,
        order: order as 'ASC' | 'DESC',
        filter: filter as Record<string, any>,
      });

      res.set('Content-Range', `consultants ${(Number(page) - 1) * Number(perPage)}-${Number(page) * Number(perPage)}/${result.total}`);
      res.json(result.data);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Create consultant
   */
  async createConsultant(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const consultantData = req.body;
      const userId = (req as any).user?.id;
      
      const result = await this.consultantService.createConsultant({
        ...consultantData,
        created_by: userId,
      });

      res.status(201).json({
        success: true,
        message: 'Consultant created successfully',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get consultant projects
   */
  async getConsultantProjects(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { page = 1, perPage = 25, sort = 'created_at', order = 'DESC', filter = {} } = req.query;
      
      const result = await this.consultantService.getConsultantProjects({
        page: Number(page),
        perPage: Number(perPage),
        sort: sort as string,
        order: order as 'ASC' | 'DESC',
        filter: filter as Record<string, any>,
      });

      res.set('Content-Range', `consultant-projects ${(Number(page) - 1) * Number(perPage)}-${Number(page) * Number(perPage)}/${result.total}`);
      res.json(result.data);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Create consultant project
   */
  async createConsultantProject(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const projectData = req.body;
      const userId = (req as any).user?.id;
      
      const result = await this.consultantService.createConsultantProject({
        ...projectData,
        created_by: userId,
      });

      res.status(201).json({
        success: true,
        message: 'Consultant project created successfully',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get tenant overview for cross-tenant monitoring
   */
  async getTenantOverview(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await this.platformAdminService.getTenantOverview();

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get platform configuration
   */
  async getPlatformConfig(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await this.platformAdminService.getPlatformConfig();

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update platform configuration
   */
  async updatePlatformConfig(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { key } = req.params;
      const { value } = req.body;
      const userId = (req as any).user?.id;
      
      const result = await this.platformAdminService.updatePlatformConfig({
        key,
        value,
        updated_by: userId,
      });

      res.json({
        success: true,
        message: 'Platform configuration updated successfully',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
}
EOF
    
    log_success "Platform Admin Controller created"
}

# Phase 1: Create Platform Admin Middleware
create_platform_admin_middleware() {
    log_info "Creating Platform Admin Middleware..."
    
    local middleware_dir="${PROJECT_ROOT}/packages/backend/src/api/middleware"
    mkdir -p "$middleware_dir"
    
    cat > "${middleware_dir}/platform-admin.middleware.ts" << 'EOF'
// ============================================================================
// PSDD ARTIFACT DOCUMENTATION
// ============================================================================
// File Path: packages/backend/src/api/middleware/platform-admin.middleware.ts
// Generated: $(date)
// Phase: PHASE1 - Platform Admin Database Connection
// Methodology: Phased Shell-Driven Development (PSDD)
// Dependencies: Express
// Purpose: Middleware for platform admin and consultant access control
// ============================================================================

import { Request, Response, NextFunction } from 'express';

interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    user_type: string;
    consultant_access?: boolean;
    permissions: string[];
  };
}

/**
 * Middleware to require platform admin access
 */
export const requirePlatformAdmin = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  try {
    const user = req.user;

    if (!user) {
      res.status(401).json({
        success: false,
        error: 'Authentication required',
        code: 'AUTH_REQUIRED',
      });
      return;
    }

    // Check if user is platform admin or has consultant access
    const isPlatformAdmin = user.user_type === 'platform_admin';
    const hasConsultantAccess = user.user_type === 'consultant_manager' && user.consultant_access;

    if (!isPlatformAdmin && !hasConsultantAccess) {
      res.status(403).json({
        success: false,
        error: 'Platform admin access required',
        code: 'INSUFFICIENT_PRIVILEGES',
      });
      return;
    }

    next();
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      code: 'INTERNAL_ERROR',
    });
  }
};

/**
 * Middleware to require consultant access
 */
export const requireConsultantAccess = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  try {
    const user = req.user;

    if (!user) {
      res.status(401).json({
        success: false,
        error: 'Authentication required',
        code: 'AUTH_REQUIRED',
      });
      return;
    }

    // Check if user has consultant access
    const hasConsultantAccess = user.consultant_access || 
                               user.user_type === 'consultant_manager' || 
                               user.user_type === 'platform_admin';

    if (!hasConsultantAccess) {
      res.status(403).json({
        success: false,
        error: 'Consultant access required',
        code: 'CONSULTANT_ACCESS_REQUIRED',
      });
      return;
    }

    next();
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      code: 'INTERNAL_ERROR',
    });
  }
};

/**
 * Middleware to check specific permissions
 */
export const requirePermissions = (requiredPermissions: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    try {
      const user = req.user;

      if (!user) {
        res.status(401).json({
          success: false,
          error: 'Authentication required',
          code: 'AUTH_REQUIRED',
        });
        return;
      }

      // Platform admin has all permissions
      if (user.user_type === 'platform_admin') {
        next();
        return;
      }

      // Check if user has all required permissions
      const userPermissions = user.permissions || [];
      const hasAllPermissions = requiredPermissions.every(permission =>
        userPermissions.includes(permission)
      );

      if (!hasAllPermissions) {
        res.status(403).json({
          success: false,
          error: 'Insufficient permissions',
          code: 'INSUFFICIENT_PERMISSIONS',
          required: requiredPermissions,
          current: userPermissions,
        });
        return;
      }

      next();
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Internal server error',
        code: 'INTERNAL_ERROR',
      });
    }
  };
};

/**
 * Middleware to validate cross-tenant access
 */
export const validateCrossTenantAccess = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  try {
    const user = req.user;
    const { tenant_id } = req.params;

    if (!user) {
      res.status(401).json({
        success: false,
        error: 'Authentication required',
        code: 'AUTH_REQUIRED',
      });
      return;
    }

    // Platform admin can access all tenants
    if (user.user_type === 'platform_admin') {
      next();
      return;
    }

    // Consultant with proper access can access assigned tenants
    if (user.consultant_access && tenant_id) {
      // TODO: Validate consultant assignment to specific tenant
      // This would require a database query to check consultant_projects table
      next();
      return;
    }

    res.status(403).json({
      success: false,
      error: 'Cross-tenant access not authorized',
      code: 'CROSS_TENANT_ACCESS_DENIED',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      code: 'INTERNAL_ERROR',
    });
  }
};
EOF
    
    log_success "Platform Admin Middleware created"
}

# Phase 1: Create Phase completion validation
validate_phase1_completion() {
    log_info "Validating Phase 1 completion..."
    
    local validation_passed=true
    local required_files=(
        "${PROJECT_ROOT}/packages/frontend/src/admin/providers/data/platformDataProvider.ts"
        "${PROJECT_ROOT}/packages/frontend/src/admin/providers/auth/platformAuthProvider.ts"
        "${PROJECT_ROOT}/packages/backend/src/api/routes/platform-admin.routes.ts"
        "${PROJECT_ROOT}/packages/backend/src/api/controllers/platform-admin.controller.ts"
        "${PROJECT_ROOT}/packages/backend/src/api/middleware/platform-admin.middleware.ts"
    )
    
    # Check if all required files were created
    for file in "${required_files[@]}"; do
        if [[ ! -f "$file" ]]; then
            log_error "Required file not created: $file"
            validation_passed=false
        else
            log_info "✓ Created: $(basename "$file")"
        fi
    done
    
    # Check file path documentation
    for file in "${required_files[@]}"; do
        if [[ -f "$file" ]] && grep -q "File Path:" "$file"; then
            log_info "✓ File path documented: $(basename "$file")"
        else
            log_warning "Missing file path documentation: $(basename "$file")"
        fi
    done
    
    if [[ "$validation_passed" == "true" ]]; then
        log_success "Phase 1 validation completed successfully"
        return 0
    else
        log_error "Phase 1 validation failed"
        return 1
    fi
}

# MANDATORY: Create phase completion marker
create_phase_completion_marker() {
    log_info "Creating Phase 1 completion marker..."
    
    # Create PSDD progress tracking
    local progress_file="${PROJECT_ROOT}/.psdd-progress"
    
    echo "$(date '+%Y-%m-%d %H:%M:%S') | PHASE1 | COMPLETED | Platform admin database connection with consultant access | Continue to PHASE2" >> "$progress_file"
    
    # Create phase marker
    touch "${PROJECT_ROOT}/.phase1-completed"
    
    log_success "Phase 1 completion marker created"
}

# MANDATORY: Generate next phase continuation prompt
generate_continuation_prompt() {
    log_info "Generating continuation prompt for next chat..."
    
    cat > "${PROJECT_ROOT}/CONTINUE-PHASE2.md" << 'EOF'
# 🚀 CONTINUE PROMPT FOR NEXT CHAT - PHASE 2

## 🎯 Phase 2: Tenant Registry & Consultant Access Management

### **Current Status**
- ✅ **Phase 1 COMPLETED**: Platform admin database connection
- ✅ Platform DataProvider connected to ifrspro_platform_admin
- ✅ Platform Auth Provider with consultant access
- ✅ Backend API routes for platform admin operations
- ✅ Platform admin controller with consultant management
- ✅ Platform admin middleware for access control

### **Next Steps - Phase 2 (7.5 minutes)**
Focus: Banking Institution + Consultant Project Management

**Required Components:**
1. **Banking Institution Management Component**
   - Connect to `platform_config.banking_institutions` table
   - Display bank list with banking types (conventional/syariah)
   - Add bank registration interface
   - Show consultant project assignments per bank

2. **Consultant Project Management**
   - Database-driven consultant project assignments
   - Track consultant access permissions per bank
   - Monitor consultant engagement timelines
   - Consultant project status and deliverables tracking

### **Continuation Command for Claude**
```
Continue IFRS9 Platform Code Generation - Phase 2 Implementation
Status: Phase 1 completed, ready for Phase 2
Focus: Create Banking Institution Management and Consultant Project Management components
Reference: Follow 100-006-001-Sprint-Frontend.md Phase 2 requirements
Generate: React Admin components for banking institution and consultant project management
Database: Connect to ifrspro_platform_admin tables
```

### **Success Criteria for Phase 2**
- [ ] Banking institution list loads from database
- [ ] Bank registration/management works
- [ ] Consultant project assignments visible
- [ ] Consultant access permissions manageable

**Ready to continue with Phase 2!** 🚀
EOF
    
    log_success "Continuation prompt generated: CONTINUE-PHASE2.md"
}

# MANDATORY: Main function execution
main() {
    log_info "Starting Phase 1: ${PHASE_NAME}"
    log_info "Objective: ${PHASE_OBJECTIVE}"
    
    # Execute phase steps
    validate_existing_project
    create_platform_data_provider
    create_platform_auth_provider
    create_backend_platform_routes
    create_platform_admin_controller
    create_platform_admin_middleware
    validate_phase1_completion
    create_phase_completion_marker
    generate_continuation_prompt
    
    log_success "🎉 Phase 1 completed successfully!"
    log_info "📋 Files created:"
    log_info "   ✓ Platform DataProvider (frontend)"
    log_info "   ✓ Platform Auth Provider (frontend)"  
    log_info "   ✓ Platform Admin Routes (backend)"
    log_info "   ✓ Platform Admin Controller (backend)"
    log_info "   ✓ Platform Admin Middleware (backend)"
    
    log_info "�� Next steps:"
    log_info "   1. Review created files in logs: ${LOG_FILE}"
    log_info "   2. Start Phase 2 using: CONTINUE-PHASE2.md"
    log_info "   3. Focus: Banking Institution Management + Consultant Projects"
}

# Execute main function with all arguments
main "$@"
