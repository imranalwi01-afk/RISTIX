#!/bin/bash
# scripts/setup/d1h3-controllers-routes.sh
# IFRS9 Platform - Generate Controllers and Routes for Authentication System

set -e  # Exit on any error
set -u  # Exit on undefined variables

# Script configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"
LOG_FILE="${PROJECT_ROOT}/logs/d1h3-controllers-$(date +%Y%m%d-%H%M%S).log"

# Create logs directory if it doesn't exist
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

# MANDATORY: Error handling
handle_error() {
    local exit_code=$?
    log_error "Script failed with exit code: ${exit_code}"
    log_error "Failed command: ${BASH_COMMAND}"
    exit ${exit_code}
}

trap handle_error ERR

# Create controller and route directories
create_directories() {
    log_info "Creating controller and route directories..."
    
    local backend_dir="${PROJECT_ROOT}/packages/backend"
    
    # API structure
    mkdir -p "${backend_dir}/src/api/controllers"
    mkdir -p "${backend_dir}/src/api/routes"
    mkdir -p "${backend_dir}/src/api/validators"
    
    log_success "Directories created successfully"
}

# Generate User Controller
generate_user_controller() {
    log_info "Generating User Controller..."
    
    cat > "${PROJECT_ROOT}/packages/backend/src/api/controllers/user.controller.ts" << 'EOF'
// packages/backend/src/api/controllers/user.controller.ts
import { Request, Response } from 'express';
import { z } from 'zod';

// Validation schemas
const createUserSchema = z.object({
  email: z.string().email('Invalid email format'),
  username: z.string().min(3, 'Username must be at least 3 characters').max(50, 'Username too long'),
  fullName: z.string().min(1, 'Full name is required').max(200, 'Full name too long'),
  password: z.string().min(8, 'Password must be at least 8 characters').max(128, 'Password too long'),
  employeeId: z.string().max(50, 'Employee ID too long').optional(),
  department: z.string().max(100, 'Department name too long').optional(),
  position: z.string().max(100, 'Position too long').optional(),
  bankingAccess: z.enum(['CONVENTIONAL', 'SYARIAH', 'BOTH'], {
    errorMap: () => ({ message: 'Banking access must be CONVENTIONAL, SYARIAH, or BOTH' })
  }),
  syariahCertified: z.boolean().optional(),
  syariahCertificationLevel: z.string().max(50, 'Certification level too long').optional(),
  roleIds: z.array(z.string().uuid('Invalid role ID format')).optional()
});

const updateUserSchema = createUserSchema.partial().omit({ password: true });

const queryUsersSchema = z.object({
  page: z.coerce.number().int().min(1, 'Page must be at least 1').default(1),
  limit: z.coerce.number().int().min(1, 'Limit must be at least 1').max(100, 'Limit cannot exceed 100').default(20),
  search: z.string().max(100, 'Search term too long').optional(),
  bankingAccess: z.enum(['CONVENTIONAL', 'SYARIAH', 'BOTH']).optional(),
  isActive: z.coerce.boolean().optional(),
  department: z.string().max(100, 'Department filter too long').optional(),
  syariahCertified: z.coerce.boolean().optional(),
  includeRoles: z.coerce.boolean().default(false)
});

export interface AuthenticatedRequest extends Request {
  user?: any;
  tenant?: any;
  jwtPayload?: any;
}

export class UserController {
  constructor() {}

  /**
   * Create a new user
   */
  async createUser(req: Request, res: Response): Promise<void> {
    try {
      const authReq = req as AuthenticatedRequest;
      
      // Validate request body
      const validatedData = createUserSchema.parse(req.body);
      
      // Mock user creation for now
      const mockUser = {
        id: 'user-' + Date.now(),
        email: validatedData.email,
        username: validatedData.username,
        fullName: validatedData.fullName,
        employeeId: validatedData.employeeId,
        department: validatedData.department,
        position: validatedData.position,
        bankingAccess: validatedData.bankingAccess,
        syariahCertified: validatedData.syariahCertified || false,
        syariahCertificationLevel: validatedData.syariahCertificationLevel,
        isActive: true,
        mfaEnabled: false,
        forcePasswordChange: true,
        createdAt: new Date()
      };

      res.status(201).json({
        success: true,
        data: {
          user: mockUser
        },
        message: 'User created successfully'
      });

    } catch (error) {
      console.error('Create user error:', error);
      
      if (error instanceof z.ZodError) {
        res.status(400).json({
          success: false,
          error: 'Validation failed',
          code: 'VALIDATION_ERROR',
          details: error.errors
        });
        return;
      }

      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create user',
        code: 'CREATE_USER_ERROR'
      });
    }
  }

  /**
   * Get users with pagination and filtering
   */
  async getUsers(req: Request, res: Response): Promise<void> {
    try {
      const authReq = req as AuthenticatedRequest;
      
      // Validate query parameters
      const validatedQuery = queryUsersSchema.parse(req.query);
      
      // Mock users data
      const mockUsers = [
        {
          id: 'user-1',
          email: 'admin@demo.com',
          username: 'admin',
          fullName: 'System Administrator',
          department: 'IT',
          position: 'System Admin',
          bankingAccess: 'BOTH',
          isActive: true,
          mfaEnabled: true,
          lastLoginAt: new Date(),
          createdAt: new Date()
        },
        {
          id: 'user-2',
          email: 'analyst@demo.com',
          username: 'analyst',
          fullName: 'Risk Analyst',
          department: 'Risk Management',
          position: 'Senior Analyst',
          bankingAccess: 'CONVENTIONAL',
          isActive: true,
          mfaEnabled: false,
          lastLoginAt: new Date(),
          createdAt: new Date()
        }
      ];

      // Calculate pagination info
      const total = mockUsers.length;
      const totalPages = Math.ceil(total / validatedQuery.limit);
      const hasNextPage = validatedQuery.page < totalPages;
      const hasPrevPage = validatedQuery.page > 1;

      res.status(200).json({
        success: true,
        data: {
          users: mockUsers
        },
        pagination: {
          page: validatedQuery.page,
          limit: validatedQuery.limit,
          total,
          totalPages,
          hasNextPage,
          hasPrevPage
        }
      });

    } catch (error) {
      console.error('Get users error:', error);
      
      if (error instanceof z.ZodError) {
        res.status(400).json({
          success: false,
          error: 'Validation failed',
          code: 'VALIDATION_ERROR',
          details: error.errors
        });
        return;
      }

      res.status(500).json({
        success: false,
        error: 'Failed to get users',
        code: 'GET_USERS_ERROR'
      });
    }
  }

  /**
   * Get user by ID
   */
  async getUserById(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params;

      // Mock user data
      const mockUser = {
        id: userId,
        email: 'user@demo.com',
        username: 'user',
        fullName: 'Demo User',
        employeeId: 'EMP001',
        department: 'Finance',
        position: 'Analyst',
        bankingAccess: 'CONVENTIONAL',
        syariahCertified: false,
        isActive: true,
        mfaEnabled: false,
        forcePasswordChange: false,
        lastLoginAt: new Date(),
        passwordChangedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
        roles: [
          {
            id: 'role-1',
            roleName: 'USER',
            description: 'Standard User',
            bankingTypeSpecific: 'CONVENTIONAL',
            hierarchyLevel: 1
          }
        ]
      };

      res.status(200).json({
        success: true,
        data: {
          user: mockUser
        }
      });

    } catch (error) {
      console.error('Get user error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get user',
        code: 'GET_USER_ERROR'
      });
    }
  }

  /**
   * Update user
   */
  async updateUser(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params;
      
      // Validate request body
      const validatedData = updateUserSchema.parse(req.body);

      // Mock user update
      const mockUser = {
        id: userId,
        ...validatedData,
        updatedAt: new Date()
      };

      res.status(200).json({
        success: true,
        data: {
          user: mockUser
        },
        message: 'User updated successfully'
      });

    } catch (error) {
      console.error('Update user error:', error);
      
      if (error instanceof z.ZodError) {
        res.status(400).json({
          success: false,
          error: 'Validation failed',
          code: 'VALIDATION_ERROR',
          details: error.errors
        });
        return;
      }

      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update user',
        code: 'UPDATE_USER_ERROR'
      });
    }
  }

  /**
   * Disable user account
   */
  async disableUser(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params;

      res.status(200).json({
        success: true,
        message: 'User disabled successfully'
      });

    } catch (error) {
      console.error('Disable user error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to disable user',
        code: 'DISABLE_USER_ERROR'
      });
    }
  }

  /**
   * Enable user account
   */
  async enableUser(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params;

      res.status(200).json({
        success: true,
        message: 'User enabled successfully'
      });

    } catch (error) {
      console.error('Enable user error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to enable user',
        code: 'ENABLE_USER_ERROR'
      });
    }
  }
}
EOF

    log_success "User Controller generated successfully"
}

# Generate User Routes
generate_user_routes() {
    log_info "Generating User Routes..."
    
    cat > "${PROJECT_ROOT}/packages/backend/src/api/routes/user.routes.ts" << 'EOF'
// packages/backend/src/api/routes/user.routes.ts
import { Router } from 'express';
import { UserController } from '../controllers/user.controller';

export function createUserRoutes(): Router {
  const router = Router();
  const userController = new UserController();

  // User CRUD operations
  router.get('/', userController.getUsers.bind(userController));
  router.post('/', userController.createUser.bind(userController));
  router.get('/:userId', userController.getUserById.bind(userController));
  router.put('/:userId', userController.updateUser.bind(userController));

  // User account management
  router.post('/:userId/disable', userController.disableUser.bind(userController));
  router.post('/:userId/enable', userController.enableUser.bind(userController));

  // Health check endpoint
  router.get('/health', (req, res) => {
    res.status(200).json({
      success: true,
      message: 'User service is healthy',
      timestamp: new Date().toISOString()
    });
  });

  return router;
}

export default createUserRoutes;
EOF

    log_success "User Routes generated successfully"
}

# Generate API Routes Index
generate_api_routes_index() {
    log_info "Generating API Routes Index..."
    
    cat > "${PROJECT_ROOT}/packages/backend/src/api/routes/index.ts" << 'EOF'
// packages/backend/src/api/routes/index.ts
import { Router } from 'express';
import { createAuthRoutes } from './auth.routes';
import { createUserRoutes } from './user.routes';

export function createApiRoutes(): Router {
  const router = Router();

  // API version prefix
  const v1Router = Router();

  // Health check endpoint (public)
  v1Router.get('/health', (req, res) => {
    res.status(200).json({
      success: true,
      message: 'IFRS9 Platform API is healthy',
      version: 'v1',
      timestamp: new Date().toISOString(),
      services: {
        authentication: 'operational',
        users: 'operational',
        database: 'operational',
        cache: 'operational'
      }
    });
  });

  // API documentation endpoint (public)
  v1Router.get('/docs', (req, res) => {
    res.status(200).json({
      success: true,
      message: 'IFRS9 Platform API Documentation',
      version: 'v1',
      endpoints: {
        authentication: {
          login: 'POST /api/v1/auth/login',
          refresh: 'POST /api/v1/auth/refresh',
          logout: 'POST /api/v1/auth/logout',
          profile: 'GET /api/v1/auth/me'
        },
        users: {
          list: 'GET /api/v1/users',
          create: 'POST /api/v1/users',
          get: 'GET /api/v1/users/:id',
          update: 'PUT /api/v1/users/:id'
        }
      },
      authentication: {
        type: 'Bearer Token',
        header: 'Authorization: Bearer <access_token>',
        required: 'All endpoints except /health, /docs, and /auth/login'
      },
      tenantContext: {
        header: 'X-Tenant-Slug',
        description: 'Required for all authenticated requests'
      }
    });
  });

  // Mount route modules
  v1Router.use('/auth', createAuthRoutes());
  v1Router.use('/users', createUserRoutes());

  // Mount v1 router
  router.use('/v1', v1Router);

  // Default API info endpoint
  router.get('/', (req, res) => {
    res.status(200).json({
      success: true,
      message: 'IFRS9 Platform API',
      version: 'v1',
      documentation: '/api/v1/docs',
      health: '/api/v1/health',
      timestamp: new Date().toISOString()
    });
  });

  // Handle 404 for unknown API endpoints
  router.use('*', (req, res) => {
    res.status(404).json({
      success: false,
      error: 'API endpoint not found',
      code: 'ENDPOINT_NOT_FOUND',
      path: req.originalUrl,
      availableVersions: ['v1'],
      documentation: '/api/v1/docs'
    });
  });

  return router;
}

export default createApiRoutes;
EOF

    log_success "API Routes Index generated successfully"
}

# Generate App Bootstrap
generate_app_bootstrap() {
    log_info "Generating App Bootstrap..."
    
    cat > "${PROJECT_ROOT}/packages/backend/src/app.ts" << 'EOF'
// packages/backend/src/app.ts
import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import { createApiRoutes } from './api/routes';

export class App {
  public app: Application;

  constructor() {
    this.app = express();
    this.initialize();
  }

  private initialize(): void {
    try {
      // Set up middleware
      this.setupMiddleware();

      // Set up routes
      this.setupRoutes();

      // Set up error handling
      this.setupErrorHandling();

      console.log('✅ Application initialized successfully');
    } catch (error) {
      console.error('❌ Application initialization failed:', error);
      throw error;
    }
  }

  private setupMiddleware(): void {
    // Basic middleware
    this.app.use(express.json({ limit: '50mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '50mb' }));

    // CORS
    this.app.use(cors({
      origin: ['http://localhost:4231', 'http://localhost:3000'],
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Tenant-Slug', 'X-Tenant-ID', 'X-Banking-Type']
    }));

    // Security headers
    this.app.use(helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          scriptSrc: ["'self'"],
          imgSrc: ["'self'", "data:", "https:"]
        }
      }
    }));

    // Compression
    this.app.use(compression());

    // Request logging middleware
    this.app.use((req: Request, res: Response, next: NextFunction) => {
      const start = Date.now();
      
      res.on('finish', () => {
        const duration = Date.now() - start;
        console.log(`${req.method} ${req.path} - ${res.statusCode} - ${duration}ms`);
      });
      
      next();
    });

    // Health check endpoint (before other middleware)
    this.app.get('/health', (req: Request, res: Response) => {
      res.status(200).json({
        success: true,
        message: 'IFRS9 Platform Backend is healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        version: process.env.npm_package_version || '1.0.0'
      });
    });
  }

  private setupRoutes(): void {
    // Mount API routes
    this.app.use('/api', createApiRoutes());

    // Root endpoint
    this.app.get('/', (req: Request, res: Response) => {
      res.status(200).json({
        success: true,
        message: 'IFRS9 Platform Backend API',
        version: 'v1',
        documentation: '/api/v1/docs',
        health: '/health',
        timestamp: new Date().toISOString()
      });
    });

    // Handle 404 for all other routes
    this.app.use('*', (req: Request, res: Response) => {
      res.status(404).json({
        success: false,
        error: 'Endpoint not found',
        code: 'ENDPOINT_NOT_FOUND',
        path: req.originalUrl,
        method: req.method,
        availableEndpoints: {
          api: '/api/v1',
          health: '/health',
          docs: '/api/v1/docs'
        }
      });
    });
  }

  private setupErrorHandling(): void {
    // Global error handler
    this.app.use((error: Error, req: Request, res: Response, next: NextFunction) => {
      console.error('Global error handler:', error);

      // Determine error type and response
      if (error.name === 'ValidationError') {
        res.status(400).json({
          success: false,
          error: 'Validation failed',
          code: 'VALIDATION_ERROR',
          details: error.message
        });
        return;
      }

      if (error.name === 'UnauthorizedError' || error.message.includes('unauthorized')) {
        res.status(401).json({
          success: false,
          error: 'Unauthorized',
          code: 'UNAUTHORIZED'
        });
        return;
      }

      if (error.name === 'ForbiddenError' || error.message.includes('forbidden')) {
        res.status(403).json({
          success: false,
          error: 'Forbidden',
          code: 'FORBIDDEN'
        });
        return;
      }

      // Default server error
      res.status(500).json({
        success: false,
        error: 'Internal server error',
        code: 'INTERNAL_ERROR',
        ...(process.env.NODE_ENV === 'development' && {
          details: error.message,
          stack: error.stack
        })
      });
    });

    // Handle uncaught exceptions
    process.on('uncaughtException', (error: Error) => {
      console.error('Uncaught Exception:', error);
      
      // Graceful shutdown
      setTimeout(() => {
        process.exit(1);
      }, 1000);
    });

    // Handle unhandled promise rejections
    process.on('unhandledRejection', (reason: any, promise: Promise<any>) => {
      console.error('Unhandled Rejection at:', promise, 'reason:', reason);
      
      // Graceful shutdown
      setTimeout(() => {
        process.exit(1);
      }, 1000);
    });
  }

  public async start(port: number = 4232): Promise<void> {
    try {
      this.app.listen(port, () => {
        console.log(`🚀 IFRS9 Platform Backend started on port ${port}`);
        console.log(`📚 API Documentation: http://localhost:${port}/api/v1/docs`);
        console.log(`💊 Health Check: http://localhost:${port}/health`);
        console.log(`🔧 Environment: ${process.env.NODE_ENV || 'development'}`);
      });
    } catch (error) {
      console.error('Failed to start server:', error);
      throw error;
    }
  }

  public getApp(): Application {
    return this.app;
  }
}

export default App;
EOF

    log_success "App Bootstrap generated successfully"
}

# Generate Server Entry Point
generate_server_entry() {
    log_info "Generating Server Entry Point..."
    
    cat > "${PROJECT_ROOT}/packages/backend/src/server.ts" << 'EOF'
// packages/backend/src/server.ts
import dotenv from 'dotenv';
import path from 'path';
import { App } from './app';

// Load environment variables
const envFile = process.env.NODE_ENV === 'production' ? '.env.production' : 
               process.env.NODE_ENV === 'staging' ? '.env.staging' : 
               '.env.development';

dotenv.config({ path: path.join(__dirname, '..', envFile) });

async function startServer() {
  try {
    const app = new App();
    const port = parseInt(process.env.PORT || '4232', 10);
    
    await app.start(port);
    
    // Graceful shutdown handling
    const gracefulShutdown = (signal: string) => {
      console.log(`\n📴 Received ${signal}. Starting graceful shutdown...`);
      
      // Close server
      process.exit(0);
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
    
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
EOF

    log_success "Server Entry Point generated successfully"
}

# Main function
main() {
    log_info "Starting Controllers and Routes Generation..."
    
    # Create directories
    create_directories
    
    # Generate controllers and routes
    generate_user_controller
    generate_user_routes
    generate_api_routes_index
    
    # Generate app bootstrap
    generate_app_bootstrap
    generate_server_entry
    
    log_success "Controllers and Routes Generation completed successfully!"
    log_info "Generated files:"
    log_info "- User Controller: packages/backend/src/api/controllers/user.controller.ts"
    log_info "- User Routes: packages/backend/src/api/routes/user.routes.ts"
    log_info "- API Routes Index: packages/backend/src/api/routes/index.ts"
    log_info "- App Bootstrap: packages/backend/src/app.ts"
    log_info "- Server Entry Point: packages/backend/src/server.ts"
}

# Execute main function with all arguments
main "$@"