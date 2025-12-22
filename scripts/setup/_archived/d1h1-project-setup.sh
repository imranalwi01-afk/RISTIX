#!/bin/bash
# scripts/setup/d1h1-project-setup.sh
# DAY 1 HOUR 1: Enterprise Project Setup - IFRS 9 Multi-Tenant Platform
# Based on: 001-006-005-TodoList-v2.md and 001-006-008-coding-standards.md

set -e  # Exit on any error
set -u  # Exit on undefined variables

# MANDATORY: Script configuration following coding standards
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"
LOG_FILE="${PROJECT_ROOT}/logs/d1h1-project-setup-$(date +%Y%m%d-%H%M%S).log"

# MANDATORY: Logging functions following coding standards
log_info() {
    echo "[INFO] $(date '+%Y-%m-%d %H:%M:%S') - $1" | tee -a "${LOG_FILE}"
}

log_error() {
    echo "[ERROR] $(date '+%Y-%m-%d %H:%M:%S') - $1" | tee -a "${LOG_FILE}" >&2
}

log_success() {
    echo "[SUCCESS] $(date '+%Y-%m-%d %H:%M:%S') - $1" | tee -a "${LOG_FILE}"
}

# MANDATORY: Error handling following coding standards
handle_error() {
    local exit_code=$?
    log_error "Script failed with exit code: ${exit_code}"
    log_error "Failed command: ${BASH_COMMAND}"
    exit ${exit_code}
}

trap handle_error ERR

# MANDATORY: Environment validation following coding standards
validate_environment() {
    log_info "Validating environment for enterprise project setup..."
    
    # Check Node.js version (required: 18+)
    if ! command -v node &> /dev/null; then
        log_error "Node.js is not installed"
        exit 1
    fi
    
    local node_version=$(node --version | sed 's/v//')
    local required_version="18.0.0"
    
    if ! printf '%s\n%s\n' "${required_version}" "${node_version}" | sort -V -C; then
        log_error "Node.js version ${node_version} is below required ${required_version}"
        exit 1
    fi
    
    # Check pnpm (MANDATORY from coding standards)
    if ! command -v pnpm &> /dev/null; then
        log_info "Installing pnpm..."
        npm install -g pnpm
    fi
    
    log_success "Environment validation completed"
}

# Generate root package.json following monorepo pattern
generate_root_package_json() {
    log_info "Generating root package.json with monorepo configuration..."
    
    cat > "${PROJECT_ROOT}/package.json" << 'EOF'
{
  "name": "ifrs9-platform",
  "version": "1.0.0",
  "description": "IFRS 9 Multi-Tenant Dual Banking Platform - World's First Comprehensive Dual Banking Solution",
  "private": true,
  "license": "PROPRIETARY",
  "author": {
    "name": "IFRS Pro Development Team",
    "email": "dev@ifrspro.id"
  },
  "homepage": "https://ifrs9.ifrspro.id",
  "repository": {
    "type": "git",
    "url": "git+https://github.com/ifrspro/ifrs9-platform.git"
  },
  "engines": {
    "node": ">=18.0.0",
    "pnpm": ">=8.0.0"
  },
  "packageManager": "pnpm@8.15.1",
  "scripts": {
    "dev": "pnpm run --parallel dev",
    "build": "pnpm run --recursive build",
    "start": "pnpm run --parallel start",
    "test": "pnpm run --recursive test",
    "lint": "pnpm run --recursive lint",
    "lint:fix": "pnpm run --recursive lint:fix",
    "type-check": "pnpm run --recursive type-check",
    "clean": "pnpm run --recursive clean && rm -rf node_modules",
    "setup:env": "./scripts/setup/d1h1-environment-setup.sh",
    "setup:packages": "./scripts/setup/d1h1-package-setup.sh",
    "setup:db": "./scripts/database/setup-databases.sh",
    "setup:full": "pnpm run setup:env && pnpm run setup:packages && pnpm run setup:db",
    "db:migrate": "./scripts/database/migrate-databases.sh",
    "db:seed": "./scripts/database/seed-databases.sh",
    "deploy:staging": "./scripts/deployment/deploy-staging.sh",
    "deploy:production": "./scripts/deployment/deploy-production.sh"
  },
  "workspaces": [
    "packages/*"
  ],
  "devDependencies": {
    "@types/node": "^20.11.16",
    "@typescript-eslint/eslint-plugin": "^6.19.1",
    "@typescript-eslint/parser": "^6.19.1",
    "eslint": "^8.56.0",
    "eslint-config-prettier": "^9.1.0",
    "eslint-plugin-prettier": "^5.1.3",
    "husky": "^8.0.3",
    "lint-staged": "^15.2.0",
    "prettier": "^3.2.4",
    "tsx": "^4.7.0",
    "typescript": "^5.3.3",
    "concurrently": "^8.2.2",
    "cross-env": "^7.0.3",
    "dotenv": "^16.4.1",
    "rimraf": "^5.0.5"
  },
  "configuration": {
    "banking_types": ["conventional", "syariah", "dual"],
    "supported_locales": ["en", "id", "ar"],
    "default_ports": {
      "frontend": 4231,
      "backend": 4232,
      "r_analytics": 4236
    },
    "features": {
      "multi_tenant_architecture": true,
      "dual_banking_support": true,
      "ifrs9_calculations": true,
      "r_analytics_integration": true,
      "workflow_automation": true,
      "audit_trail": true
    }
  }
}
EOF
    
    log_success "Root package.json generated"
}

# Generate pnpm workspace configuration
generate_pnpm_workspace() {
    log_info "Generating pnpm workspace configuration..."
    
    cat > "${PROJECT_ROOT}/pnpm-workspace.yaml" << 'EOF'
# pnpm-workspace.yaml
# IFRS 9 Multi-Tenant Platform - Monorepo Workspace Configuration

packages:
  # Main application packages
  - 'packages/backend'
  - 'packages/frontend' 
  - 'packages/shared'
  - 'packages/r-analytics'
  
  # Testing packages
  - 'tests/fixtures'
  - 'tests/e2e'
  - 'tests/performance'

# Workspace catalog for shared dependencies
catalog:
  # Core dependencies
  "@types/node": "^20.11.16"
  "typescript": "^5.3.3"
  "tsx": "^4.7.0"
  "dotenv": "^16.4.1"
  
  # Backend dependencies
  "express": "^4.18.2"
  "sequelize": "^6.35.2"
  "pg": "^8.11.3"
  "redis": "^4.6.12"
  "jsonwebtoken": "^9.0.2"
  "bcryptjs": "^2.4.3"
  
  # Frontend dependencies  
  "next": "^15.0.3"
  "react": "^18.2.0"
  "react-dom": "^18.2.0"
  "@mui/material": "^6.0.2"
  "@mui/icons-material": "^6.0.2"
  "react-admin": "^4.16.13"
  "@reduxjs/toolkit": "^2.0.1"
  "react-redux": "^9.1.0"

# Workspace configuration
catalog-protocol: "workspace:*"
shared-workspace-lockfile: true
save-workspace-protocol: true
prefer-workspace-packages: true
EOF
    
    log_success "pnpm workspace configuration generated"
}

# Generate TypeScript configuration following enterprise standards
generate_typescript_config() {
    log_info "Generating TypeScript configuration with enterprise standards..."
    
    cat > "${PROJECT_ROOT}/tsconfig.json" << 'EOF'
{
  "compilerOptions": {
    // TypeScript compilation target for Node.js 18+
    "target": "ES2022",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "allowJs": true,
    "checkJs": false,
    
    // Output configuration
    "outDir": "./dist",
    "rootDir": "./",
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "removeComments": false,
    "importHelpers": true,
    
    // Module system
    "allowSyntheticDefaultImports": true,
    "esModuleInterop": true,
    "forceConsistentCasingInFileNames": true,
    "isolatedModules": true,
    "preserveWatchOutput": true,
    "skipLibCheck": true,
    "verbatimModuleSyntax": false,
    
    // Type checking - Strict mode for enterprise quality
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "strictBindCallApply": true,
    "strictPropertyInitialization": true,
    "noImplicitThis": true,
    "alwaysStrict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "exactOptionalPropertyTypes": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitOverride": true,
    "useUnknownInCatchVariables": true,
    
    // Advanced options
    "resolveJsonModule": true,
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true,
    "allowUnusedLabels": false,
    "allowUnreachableCode": false,
    "noPropertyAccessFromIndexSignature": false,
    
    // Path mapping for monorepo
    "baseUrl": ".",
    "paths": {
      "@ifrs9/shared": ["./packages/shared/src/index.ts"],
      "@ifrs9/shared/*": ["./packages/shared/src/*"],
      "@ifrs9/backend": ["./packages/backend/src/index.ts"],
      "@ifrs9/backend/*": ["./packages/backend/src/*"],
      "@ifrs9/frontend": ["./packages/frontend/src/index.ts"],
      "@ifrs9/frontend/*": ["./packages/frontend/src/*"],
      "@ifrs9/r-analytics": ["./packages/r-analytics/src/index.ts"],
      "@ifrs9/r-analytics/*": ["./packages/r-analytics/src/*"],
      "@/*": ["./src/*"],
      "~/*": ["./public/*"]
    },
    
    // JSX configuration for React components
    "jsx": "preserve",
    "jsxImportSource": "@emotion/react",
    
    // Emit configuration
    "noEmit": false,
    "incremental": true,
    "tsBuildInfoFile": ".tsbuildinfo",
    
    // Type definitions
    "typeRoots": [
      "./node_modules/@types",
      "./packages/shared/src/types",
      "./types"
    ],
    "types": [
      "node",
      "jest",
      "react",
      "react-dom"
    ]
  },
  
  // Include patterns for all packages
  "include": [
    "./packages/*/src/**/*",
    "./packages/*/**/*.ts",
    "./packages/*/**/*.tsx",
    "./scripts/**/*",
    "./tests/**/*",
    "./types/**/*",
    "./*.ts",
    "./*.js"
  ],
  
  // Exclude patterns
  "exclude": [
    "**/node_modules",
    "**/dist",
    "**/build",
    "**/.next",
    "**/coverage",
    "**/*.test.ts",
    "**/*.test.tsx",
    "**/*.spec.ts",
    "**/*.spec.tsx",
    "**/jest.config.js",
    "**/jest.config.ts",
    "**/playwright.config.ts",
    "**/.git",
    "**/logs",
    "**/temp",
    "**/uploads"
  ],
  
  // Project references for workspace support
  "references": [
    { "path": "./packages/shared" },
    { "path": "./packages/backend" },
    { "path": "./packages/frontend" },
    { "path": "./packages/r-analytics" }
  ]
}
EOF
    
    log_success "TypeScript configuration generated"
}

# Generate backend package.json with actual dependencies
generate_backend_package() {
    log_info "Generating backend package.json with production dependencies..."
    
    mkdir -p "${PROJECT_ROOT}/packages/backend"
    
    cat > "${PROJECT_ROOT}/packages/backend/package.json" << 'EOF'
{
  "name": "@ifrs9/backend",
  "version": "1.0.0",
  "description": "IFRS 9 Platform Backend API - Multi-tenant Express.js Server",
  "private": true,
  "main": "dist/index.js",
  "scripts": {
    "dev": "nodemon --exec tsx src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js",
    "start:prod": "cross-env NODE_ENV=production node dist/index.js",
    "lint": "eslint src --ext .ts,.tsx",
    "lint:fix": "eslint src --ext .ts,.tsx --fix",
    "type-check": "tsc --noEmit",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "clean": "rimraf dist"
  },
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "helmet": "^7.1.0",
    "compression": "^1.7.4",
    "morgan": "^1.10.0",
    "bcryptjs": "^2.4.3",
    "jsonwebtoken": "^9.0.2",
    "sequelize": "^6.35.2",
    "pg": "^8.11.3",
    "pg-hstore": "^2.3.4",
    "redis": "^4.6.12",
    "ioredis": "^5.3.2",
    "multer": "^1.4.5-lts.1",
    "joi": "^17.12.0",
    "uuid": "^9.0.1",
    "lodash": "^4.17.21",
    "date-fns": "^3.3.1",
    "moment": "^2.30.1",
    "moment-hijri": "^2.1.2",
    "dotenv": "^16.4.1",
    "winston": "^3.11.0",
    "csv-parser": "^3.0.0",
    "xlsx": "^0.18.5",
    "zod": "^3.22.4"
  },
  "devDependencies": {
    "@types/node": "^20.11.16",
    "@types/express": "^4.17.21",
    "@types/cors": "^2.8.17",
    "@types/morgan": "^1.9.9",
    "@types/compression": "^1.7.5",
    "@types/jsonwebtoken": "^9.0.5",
    "@types/bcryptjs": "^2.4.6",
    "@types/uuid": "^9.0.7",
    "@types/multer": "^1.4.11",
    "@types/lodash": "^4.14.202",
    "typescript": "^5.3.3",
    "tsx": "^4.7.0",
    "nodemon": "^3.0.2",
    "jest": "^29.7.0",
    "@types/jest": "^29.5.8",
    "ts-jest": "^29.1.1",
    "eslint": "^8.56.0",
    "@typescript-eslint/eslint-plugin": "^6.19.1",
    "@typescript-eslint/parser": "^6.19.1",
    "rimraf": "^5.0.5",
    "cross-env": "^7.0.3"
  },
  "engines": {
    "node": ">=18.0.0"
  }
}
EOF
    
    log_success "Backend package.json generated"
}

# Generate frontend package.json with Next.js 15 + React Admin v4
generate_frontend_package() {
    log_info "Generating frontend package.json with Next.js 15 + React Admin v4..."
    
    mkdir -p "${PROJECT_ROOT}/packages/frontend"
    
    cat > "${PROJECT_ROOT}/packages/frontend/package.json" << 'EOF'
{
  "name": "@ifrs9/frontend",
  "version": "1.0.0",
  "description": "IFRS 9 Platform Frontend - Next.js 15 with Dual Banking Themes",
  "private": true,
  "scripts": {
    "dev": "next dev -p 4231",
    "build": "next build",
    "start": "next start -p 4231",
    "start:prod": "cross-env NODE_ENV=production next start -p 4231",
    "lint": "next lint",
    "lint:fix": "next lint --fix",
    "type-check": "tsc --noEmit",
    "test": "jest",
    "test:watch": "jest --watch",
    "clean": "rimraf .next"
  },
  "dependencies": {
    "next": "^15.0.3",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "@mui/material": "^6.0.2",
    "@mui/icons-material": "^6.0.2",
    "@mui/x-data-grid": "^6.19.1",
    "@mui/x-date-pickers": "^6.19.1",
    "@emotion/react": "^11.11.1",
    "@emotion/styled": "^11.11.0",
    "@reduxjs/toolkit": "^2.0.1",
    "react-redux": "^9.1.0",
    "react-router-dom": "^6.21.3",
    "axios": "^1.6.5",
    "@tanstack/react-query": "^5.17.19",
    "formik": "^2.4.5",
    "yup": "^1.4.0",
    "recharts": "^2.10.3",
    "react-admin": "^4.16.13",
    "ra-data-json-server": "^4.16.13",
    "ra-data-simple-rest": "^4.16.13",
    "react-hook-form": "^7.49.3",
    "lodash": "^4.17.21",
    "date-fns": "^3.3.1",
    "moment": "^2.30.1",
    "moment-hijri": "^2.1.2",
    "uuid": "^9.0.1",
    "zod": "^3.22.4"
  },
  "devDependencies": {
    "@types/node": "^20.11.16",
    "@types/react": "^18.2.48",
    "@types/react-dom": "^18.2.18",
    "@types/lodash": "^4.14.202",
    "@types/uuid": "^9.0.7",
    "typescript": "^5.3.3",
    "eslint": "^8.56.0",
    "eslint-config-next": "^15.0.3",
    "@typescript-eslint/eslint-plugin": "^6.19.1",
    "@typescript-eslint/parser": "^6.19.1",
    "jest": "^29.7.0",
    "@types/jest": "^29.5.8",
    "jest-environment-jsdom": "^29.7.0",
    "rimraf": "^5.0.5",
    "cross-env": "^7.0.3"
  },
  "engines": {
    "node": ">=18.0.0"
  }
}
EOF
    
    log_success "Frontend package.json generated"
}

# Generate shared package.json
generate_shared_package() {
    log_info "Generating shared package.json for types and utilities..."
    
    mkdir -p "${PROJECT_ROOT}/packages/shared"
    
    cat > "${PROJECT_ROOT}/packages/shared/package.json" << 'EOF'
{
  "name": "@ifrs9/shared",
  "version": "1.0.0",
  "description": "IFRS 9 Platform Shared Types and Utilities",
  "private": true,
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "scripts": {
    "build": "tsc",
    "dev": "tsc --watch",
    "lint": "eslint src --ext .ts",
    "lint:fix": "eslint src --ext .ts --fix",
    "type-check": "tsc --noEmit",
    "test": "jest",
    "test:watch": "jest --watch",
    "clean": "rimraf dist"
  },
  "dependencies": {
    "uuid": "^9.0.1",
    "lodash": "^4.17.21",
    "date-fns": "^3.3.1",
    "moment": "^2.30.1",
    "moment-hijri": "^2.1.2",
    "zod": "^3.22.4"
  },
  "devDependencies": {
    "@types/node": "^20.11.16",
    "@types/uuid": "^9.0.7",
    "@types/lodash": "^4.14.202",
    "typescript": "^5.3.3",
    "eslint": "^8.56.0",
    "@typescript-eslint/eslint-plugin": "^6.19.1",
    "@typescript-eslint/parser": "^6.19.1",
    "jest": "^29.7.0",
    "@types/jest": "^29.5.8",
    "ts-jest": "^29.1.1",
    "rimraf": "^5.0.5"
  },
  "engines": {
    "node": ">=18.0.0"
  }
}
EOF
    
    log_success "Shared package.json generated"
}

# Generate R Analytics package.json
generate_r_analytics_package() {
    log_info "Generating R Analytics package.json for statistical computing..."
    
    mkdir -p "${PROJECT_ROOT}/packages/r-analytics"
    
    cat > "${PROJECT_ROOT}/packages/r-analytics/package.json" << 'EOF'
{
  "name": "@ifrs9/r-analytics",
  "version": "1.0.0",
  "description": "IFRS 9 Platform R Analytics Service - Statistical Computing API",
  "private": true,
  "main": "dist/index.js",
  "scripts": {
    "dev": "nodemon --exec tsx src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js",
    "start:prod": "cross-env NODE_ENV=production node dist/index.js",
    "start:r": "./scripts/start-r-service.sh",
    "lint": "eslint src --ext .ts",
    "lint:fix": "eslint src --ext .ts --fix",
    "type-check": "tsc --noEmit",
    "test": "jest",
    "test:watch": "jest --watch",
    "install:r-packages": "Rscript install-r-packages.R",
    "clean": "rimraf dist"
  },
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "helmet": "^7.1.0",
    "morgan": "^1.10.0",
    "uuid": "^9.0.1",
    "lodash": "^4.17.21",
    "multer": "^1.4.5-lts.1",
    "csv-parser": "^3.0.0",
    "xlsx": "^0.18.5",
    "dotenv": "^16.4.1",
    "winston": "^3.11.0",
    "axios": "^1.6.5"
  },
  "devDependencies": {
    "@types/node": "^20.11.16",
    "@types/express": "^4.17.21",
    "@types/cors": "^2.8.17",
    "@types/morgan": "^1.9.9",
    "@types/uuid": "^9.0.7",
    "@types/multer": "^1.4.11",
    "@types/lodash": "^4.14.202",
    "typescript": "^5.3.3",
    "tsx": "^4.7.0",
    "nodemon": "^3.0.2",
    "jest": "^29.7.0",
    "@types/jest": "^29.5.8",
    "ts-jest": "^29.1.1",
    "eslint": "^8.56.0",
    "@typescript-eslint/eslint-plugin": "^6.19.1",
    "@typescript-eslint/parser": "^6.19.1",
    "rimraf": "^5.0.5",
    "cross-env": "^7.0.3"
  },
  "engines": {
    "node": ">=18.0.0"
  }
}
EOF
    
    log_success "R Analytics package.json generated"
}

# Generate ESLint and Prettier configurations
generate_linting_configs() {
    log_info "Generating ESLint and Prettier configurations..."
    
    # ESLint configuration
    cat > "${PROJECT_ROOT}/.eslintrc.js" << 'EOF'
// packages/backend/src/index.ts
module.exports = {
  root: true,
  env: {
    browser: true,
    es2022: true,
    node: true,
    jest: true
  },
  extends: [
    'eslint:recommended',
    '@typescript-eslint/recommended',
    'prettier'
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: 'module',
    project: './tsconfig.json'
  },
  plugins: ['@typescript-eslint', 'prettier'],
  rules: {
    'prettier/prettier': 'error',
    '@typescript-eslint/no-unused-vars': 'error',
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-inferrable-types': 'off',
    '@typescript-eslint/no-non-null-assertion': 'warn',
    'prefer-const': 'error',
    'no-var': 'error'
  },
  ignorePatterns: [
    'dist',
    'build',
    '.next',
    'node_modules',
    'coverage',
    '*.config.js'
  ]
};
EOF

    # Prettier configuration
    cat > "${PROJECT_ROOT}/.prettierrc" << 'EOF'
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 100,
  "tabWidth": 2,
  "useTabs": false,
  "bracketSpacing": true,
  "arrowParens": "always",
  "endOfLine": "lf",
  "quoteProps": "as-needed",
  "jsxSingleQuote": true,
  "bracketSameLine": false
}
EOF
    
    log_success "Linting configurations generated"
}

# Generate initial TypeScript index files
generate_initial_ts_files() {
    log_info "Generating initial TypeScript index files..."
    
    # Backend index.ts
    mkdir -p "${PROJECT_ROOT}/packages/backend/src"
    cat > "${PROJECT_ROOT}/packages/backend/src/index.ts" << 'EOF'
// packages/backend/src/index.ts
// IFRS 9 Multi-Tenant Platform Backend - Main Entry Point

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import dotenv from 'dotenv';

// Load environment configuration
dotenv.config();

const app = express();
const PORT = process.env.BACKEND_PORT || 4232;

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGINS?.split(',') || ['http://localhost:4231'],
  credentials: true
}));

// Basic middleware
app.use(compression());
app.use(morgan('combined'));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'ifrs9-backend',
    version: '1.0.0'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 IFRS 9 Backend running on port ${PORT}`);
  console.log(`📍 Health check: http://localhost:${PORT}/health`);
});

export default app;
EOF

    # Frontend index.ts
    mkdir -p "${PROJECT_ROOT}/packages/frontend/src"
    cat > "${PROJECT_ROOT}/packages/frontend/src/index.ts" << 'EOF'
// packages/frontend/src/index.ts
// IFRS 9 Multi-Tenant Platform Frontend - Main Entry Point

export * from './app';
export * from './components';
export * from './store';
export * from './themes';
export * from './utils';
export * from './types';
EOF

    # Shared index.ts
    mkdir -p "${PROJECT_ROOT}/packages/shared/src"
    cat > "${PROJECT_ROOT}/packages/shared/src/index.ts" << 'EOF'
// packages/shared/src/index.ts
// IFRS 9 Multi-Tenant Platform Shared - Types and Utilities

export * from './types';
export * from './constants';
export * from './utils';
export * from './schemas';
EOF

    # R Analytics index.ts
    mkdir -p "${PROJECT_ROOT}/packages/r-analytics/src"
    cat > "${PROJECT_ROOT}/packages/r-analytics/src/index.ts" << 'EOF'
// packages/r-analytics/src/index.ts
// IFRS 9 Multi-Tenant Platform R Analytics - Statistical Computing Service

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';

// Load environment configuration
dotenv.config();

const app = express();
const PORT = process.env.R_ANALYTICS_PORT || 4236;

// Security middleware
app.use(helmet());
app.use(cors());

// Basic middleware
app.use(morgan('combined'));
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'ifrs9-r-analytics',
    version: '1.0.0'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`📈 IFRS 9 R Analytics running on port ${PORT}`);
  console.log(`📍 Health check: http://localhost:${PORT}/health`);
});

export default app;
EOF
    
    log_success "Initial TypeScript files generated"
}

# Make scripts executable
make_scripts_executable() {
    log_info "Making scripts executable..."
    
    # Make all shell scripts executable
    find "${PROJECT_ROOT}/scripts" -name "*.sh" -type f -exec chmod +x {} \; 2>/dev/null || true
    
    log_success "Scripts made executable"
}

# Main execution function following coding standards
main() {
    log_info "🚀 Starting Day 1 Hour 1: Enterprise Project Setup"
    log_info "Following TodoList-v2.md enterprise project setup requirements"
    
    # Step 1: Validate environment
    validate_environment
    
    # Step 2: Generate root configurations
    generate_root_package_json
    generate_pnpm_workspace
    generate_typescript_config
    
    # Step 3: Generate package configurations
    generate_backend_package
    generate_frontend_package
    generate_shared_package
    generate_r_analytics_package
    
    # Step 4: Generate development configurations
    generate_linting_configs
    
    # Step 5: Generate initial TypeScript files
    generate_initial_ts_files
    
    # Step 6: Make scripts executable
    make_scripts_executable
    
    log_success "✅ Day 1 Hour 1: Enterprise Project Setup completed successfully!"
    log_info "📍 Project location: ${PROJECT_ROOT}"
    log_info "📋 Log file: ${LOG_FILE}"
    log_info "🔄 Next step: Run './scripts/setup/d1h1-environment-setup.sh'"
    
    echo ""
    echo "🎯 DAY 1 HOUR 1 COMPLETED - ENTERPRISE PROJECT SETUP"
    echo "✅ Monorepo configuration with pnpm workspace"
    echo "✅ TypeScript 5+ enterprise configuration"
    echo "✅ Package.json files for all packages"
    echo "✅ ESLint + Prettier configuration"
    echo "✅ Initial TypeScript files with proper imports"
    echo "✅ Scripts made executable"
    echo ""
    echo "📦 Packages configured:"
    echo "   • Backend: Express.js + Sequelize + PostgreSQL"
    echo "   • Frontend: Next.js 15 + Material-UI v6 + React Admin v4"
    echo "   • Shared: TypeScript types and utilities"
    echo "   • R Analytics: Statistical computing service"
    echo ""
    echo "🔄 Next: Run './scripts/setup/d1h1-environment-setup.sh' for environment configuration"
    echo ""
}

# Execute main function with all arguments
main "$@"