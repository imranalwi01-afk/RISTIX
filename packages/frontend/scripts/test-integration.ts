#!/usr/bin/env ts-node
// packages/frontend/scripts/test-integration.ts

/**
 * Integration Test Runner Script
 * Run with: npm run test:integration
 */

import { runIntegrationTests } from '../src/utils/testing/integrationTestRunner';

async function main() {
  console.log('🚀 Starting IFRS 9 Platform Integration Tests...');
  console.log('🔗 Make sure your backend is running (auto-detects environment)');
  console.log('🗄️ Make sure your database is set up with test data');
  console.log('');

  try {
    await runIntegrationTests();
    console.log('✅ All integration tests completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Integration tests failed:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

// packages/frontend/src/utils/testing/testDataSetup.ts

/**
 * Test Data Setup Utilities
 * Creates test data for integration testing
 */

export interface TestDataConfig {
  platformAdminUser: {
    email: string;
    password: string;
    full_name: string;
    stakeholder_type: 'platform_admin';
  };
  testTenant: {
    id: string;
    name: string;
    banking_type: 'conventional' | 'syariah';
    database_name: string;
  };
  testBankingInstitution: {
    institution_name: string;
    institution_code: string;
    banking_type: 'conventional' | 'syariah';
    country: string;
  };
  testUsers: Array<{
    email: string;
    password: string;
    full_name: string;
    stakeholder_type: 'bank_admin' | 'bank_user' | 'consultant' | 'regulator';
    tenant_id?: string;
  }>;
}

export const DEFAULT_TEST_DATA: TestDataConfig = {
  platformAdminUser: {
    email: 'admin@ifrs9.test',
    password: 'admin123',
    full_name: 'Platform Administrator',
    stakeholder_type: 'platform_admin',
  },
  testTenant: {
    id: 'tenant-demo-conventional',
    name: 'Demo Conventional Bank',
    banking_type: 'conventional',
    database_name: 'ifrs9_tenant_demo_conventional',
  },
  testBankingInstitution: {
    institution_name: 'Demo Conventional Bank',
    institution_code: 'DEMO001',
    banking_type: 'conventional',
    country: 'Indonesia',
  },
  testUsers: [
    {
      email: 'bankadmin@demo.bank',
      password: 'demo123',
      full_name: 'Bank Administrator',
      stakeholder_type: 'bank_admin',
      tenant_id: 'tenant-demo-conventional',
    },
    {
      email: 'user@demo.bank',
      password: 'demo123',
      full_name: 'Bank Risk Analyst',
      stakeholder_type: 'bank_user',
      tenant_id: 'tenant-demo-conventional',
    },
    {
      email: 'consultant@ifrs9.test',
      password: 'consultant123',
      full_name: 'IFRS 9 Consultant',
      stakeholder_type: 'consultant',
    },
    {
      email: 'regulator@ojk.go.id',
      password: 'regulator123',
      full_name: 'OJK Supervisor',
      stakeholder_type: 'regulator',
    },
  ],
};

export class TestDataSetup {
  private apiBaseUrl: string;

  constructor(apiBaseUrl?: string) {
    // Use centralized dual-mode configuration
    if (!apiBaseUrl) {
      if (typeof window !== 'undefined' && window.location.hostname.includes('danafin.com')) {
        apiBaseUrl = 'https://iaf-ifrs-be.danafin.com';
      } else {
        apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://bifrs9-iaf.ifrspro.id';
      }
    }
    this.apiBaseUrl = apiBaseUrl;
  }

  async setupTestData(config: TestDataConfig = DEFAULT_TEST_DATA): Promise<void> {
    console.log('🛠️ Setting up test data...');

    try {
      // 1. Setup platform admin user
      await this.setupPlatformAdmin(config.platformAdminUser);
      console.log('✅ Platform admin user created');

      // 2. Setup test tenant
      await this.setupTestTenant(config.testTenant);
      console.log('✅ Test tenant created');

      // 3. Setup banking institution
      await this.setupBankingInstitution(config.testBankingInstitution);
      console.log('✅ Banking institution created');

      // 4. Setup test users
      await this.setupTestUsers(config.testUsers);
      console.log('✅ Test users created');

      // 5. Setup sample data
      await this.setupSamplePortfolioData();
      console.log('✅ Sample portfolio data created');

      console.log('🎉 Test data setup completed successfully!');
    } catch (error) {
      console.error('❌ Test data setup failed:', error);
      throw error;
    }
  }

  async cleanupTestData(): Promise<void> {
    console.log('🧹 Cleaning up test data...');

    try {
      await fetch(`${this.apiBaseUrl}/api/test/cleanup-all`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      console.log('✅ Test data cleanup completed');
    } catch (error) {
      console.error('❌ Test data cleanup failed:', error);
      throw error;
    }
  }

  private async setupPlatformAdmin(adminData: TestDataConfig['platformAdminUser']): Promise<void> {
    const response = await fetch(`${this.apiBaseUrl}/api/test/setup-platform-admin`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(adminData),
    });

    if (!response.ok) {
      throw new Error(`Failed to setup platform admin: ${response.statusText}`);
    }
  }

  private async setupTestTenant(tenantData: TestDataConfig['testTenant']): Promise<void> {
    const response = await fetch(`${this.apiBaseUrl}/api/test/setup-tenant`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(tenantData),
    });

    if (!response.ok) {
      throw new Error(`Failed to setup test tenant: ${response.statusText}`);
    }
  }

  private async setupBankingInstitution(institutionData: TestDataConfig['testBankingInstitution']): Promise<void> {
    const response = await fetch(`${this.apiBaseUrl}/api/test/setup-banking-institution`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(institutionData),
    });

    if (!response.ok) {
      throw new Error(`Failed to setup banking institution: ${response.statusText}`);
    }
  }

  private async setupTestUsers(usersData: TestDataConfig['testUsers']): Promise<void> {
    const response = await fetch(`${this.apiBaseUrl}/api/test/setup-users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ users: usersData }),
    });

    if (!response.ok) {
      throw new Error(`Failed to setup test users: ${response.statusText}`);
    }
  }

  private async setupSamplePortfolioData(): Promise<void> {
    const sampleData = {
      portfolioAccounts: [
        {
          account_number: 'ACC001',
          customer_name: 'PT. Demo Company',
          product_type: 'Corporate Loan',
          outstanding_amount: 1000000,
          ifrs9_stage: 'stage_1',
        },
        {
          account_number: 'ACC002',
          customer_name: 'John Doe',
          product_type: 'Personal Loan',
          outstanding_amount: 50000,
          ifrs9_stage: 'stage_2',
        },
      ],
      eclCalculations: [
        {
          account_id: 'ACC001',
          ecl_amount: 5000,
          calculation_date: new Date().toISOString(),
          validation_status: 'pending',
        },
      ],
      modelConfigurations: [
        {
          model_type: 'pd_model',
          model_name: 'Basic PD Model',
          parameters: { threshold: 0.05, lookback_period: 12 },
          validation_status: 'validated',
        },
      ],
    };

    const response = await fetch(`${this.apiBaseUrl}/api/test/setup-sample-data`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(sampleData),
    });

    if (!response.ok) {
      throw new Error(`Failed to setup sample portfolio data: ${response.statusText}`);
    }
  }
}

// packages/frontend/src/utils/testing/mockApiServer.ts

/**
 * Mock API Server for Testing
 * Provides mock responses when backend is not available
 */

import { rest } from 'msw';
import { setupServer } from 'msw/node';

export const mockApiHandlers = [
  // Authentication endpoints
  rest.post('/api/v1/auth/login', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        success: true,
        token: 'mock-jwt-token',
        refresh_token: 'mock-refresh-token',
        user: {
          id: 'user-123',
          email: 'admin@ifrs9.test',
          full_name: 'Platform Administrator',
          stakeholder_type: 'platform_admin',
          permissions: ['all'],
        },
      })
    );
  }),

  rest.post('/api/v1/auth/logout', (req, res, ctx) => {
    return res(ctx.status(200), ctx.json({ success: true }));
  }),

  rest.get('/api/v1/auth/me', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        id: 'user-123',
        email: 'admin@ifrs9.test',
        full_name: 'Platform Administrator',
        stakeholder_type: 'platform_admin',
        permissions: ['all'],
      })
    );
  }),

  // Platform admin endpoints
  rest.get('/api/v1/platform/users', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        data: [
          {
            id: 'user-123',
            email: 'admin@ifrs9.test',
            full_name: 'Platform Administrator',
            stakeholder_type: 'platform_admin',
            is_active: true,
            created_at: new Date().toISOString(),
          },
        ],
        total: 1,
        page: 1,
        per_page: 10,
      })
    );
  }),

  rest.get('/api/v1/platform/banking-institutions', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        data: [
          {
            id: 'bank-001',
            institution_name: 'Demo Bank',
            institution_code: 'DEMO001',
            banking_type: 'conventional',
            country: 'Indonesia',
            is_active: true,
            created_at: new Date().toISOString(),
          },
        ],
        total: 1,
      })
    );
  }),

  rest.get('/api/v1/platform/consultant-projects', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        data: [
          {
            id: 'project-001',
            project_name: 'IFRS 9 Implementation',
            banking_institution_id: 'bank-001',
            consultant_user_id: 'consultant-001',
            project_type: 'implementation',
            status: 'active',
            created_at: new Date().toISOString(),
          },
        ],
        total: 1,
      })
    );
  }),

  rest.get('/api/v1/platform/metrics', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        total_users: 10,
        active_banking_institutions: 3,
        active_consultant_projects: 5,
        total_tenants: 3,
        system_uptime: '99.9%',
        platform_version: 'v1.0.0',
      })
    );
  }),

  // Tenant endpoints
  rest.get('/api/v1/tenants/:tenantId/portfolio/accounts', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        data: [
          {
            id: 'acc-001',
            account_number: 'ACC001',
            customer_name: 'Test Customer',
            outstanding_amount: 100000,
            ifrs9_stage: 'stage_1',
            created_at: new Date().toISOString(),
          },
        ],
        total: 1,
      })
    );
  }),

  rest.get('/api/v1/tenants/:tenantId/ecl/calculations', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        data: [
          {
            id: 'calc-001',
            account_id: 'acc-001',
            ecl_amount: 5000,
            calculation_date: new Date().toISOString(),
            validation_status: 'pending',
          },
        ],
        total: 1,
      })
    );
  }),

  // Consultant endpoints
  rest.get('/api/v1/consultant/projects', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        data: [
          {
            id: 'project-001',
            project_name: 'IFRS 9 Implementation',
            status: 'active',
            project_type: 'implementation',
          },
        ],
        total: 1,
      })
    );
  }),

  rest.get('/api/v1/consultant/projects/:projectId/validate-access', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        has_access: true,
        access_level: 'full',
        accessible_modules: ['portfolio', 'calculations', 'models'],
        restrictions: [],
      })
    );
  }),
];

export const mockApiServer = setupServer(...mockApiHandlers);

// packages/frontend/src/utils/testing/testEnvironmentSetup.ts

/**
 * Test Environment Setup
 * Configures testing environment and utilities
 */

import { mockApiServer } from './mockApiServer';

export interface TestEnvironmentConfig {
  useMockApi: boolean;
  apiBaseUrl: string;
  skipSlowTests: boolean;
  logLevel: 'debug' | 'info' | 'warn' | 'error';
}

export class TestEnvironmentSetup {
  private config: TestEnvironmentConfig;

  constructor(config: Partial<TestEnvironmentConfig> = {}) {
    this.config = {
      useMockApi: process.env.USE_MOCK_API === 'true',
      apiBaseUrl: process.env.NEXT_PUBLIC_API_URL || 'https://bifrs9-iaf.ifrspro.id',
      skipSlowTests: process.env.SKIP_SLOW_TESTS === 'true',
      logLevel: (process.env.LOG_LEVEL as any) || 'info',
      ...config,
    };
  }

  async setup(): Promise<void> {
    console.log('🛠️ Setting up test environment...');

    // Setup mock API server if needed
    if (this.config.useMockApi) {
      console.log('🎭 Starting mock API server...');
      mockApiServer.listen({
        onUnhandledRequest: 'warn',
      });
    }

    // Configure console logging
    this.setupLogging();

    // Verify backend connectivity
    if (!this.config.useMockApi) {
      await this.verifyBackendConnectivity();
    }

    console.log('✅ Test environment setup completed');
  }

  async teardown(): Promise<void> {
    console.log('🧹 Tearing down test environment...');

    if (this.config.useMockApi) {
      mockApiServer.close();
    }

    console.log('✅ Test environment teardown completed');
  }

  private setupLogging(): void {
    const logLevels = { debug: 0, info: 1, warn: 2, error: 3 };
    const currentLevel = logLevels[this.config.logLevel];

    // Override console methods based on log level
    if (currentLevel > 0) {
      console.debug = () => {}; // Disable debug logs
    }
    if (currentLevel > 1) {
      console.info = () => {}; // Disable info logs
    }
    if (currentLevel > 2) {
      console.warn = () => {}; // Disable warn logs
    }
  }

  private async verifyBackendConnectivity(): Promise<void> {
    try {
      console.log(`🔗 Verifying backend connectivity to ${this.config.apiBaseUrl}...`);
      
      const response = await fetch(`${this.config.apiBaseUrl}/api/health`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Backend health check failed: ${response.status} ${response.statusText}`);
      }

      const healthData = await response.json();
      console.log(`✅ Backend is healthy: ${healthData.status}`);
    } catch (error) {
      console.error('❌ Backend connectivity check failed:', error);
      console.log('💡 Make sure your backend is running on the correct port');
      console.log('💡 Or set USE_MOCK_API=true to use mock responses');
      throw error;
    }
  }

  getConfig(): TestEnvironmentConfig {
    return { ...this.config };
  }
}

// packages/frontend/package.json (add these scripts)
/*
{
  "scripts": {
    "test:integration": "ts-node scripts/test-integration.ts",
    "test:integration:mock": "USE_MOCK_API=true ts-node scripts/test-integration.ts",
    "test:setup": "ts-node scripts/setup-test-data.ts",
    "test:cleanup": "ts-node scripts/cleanup-test-data.ts"
  }
}
*/

// packages/frontend/.env.test (environment variables for testing)
/*
NEXT_PUBLIC_API_URL=https://bifrs9-iaf.ifrspro.id
USE_MOCK_API=false
SKIP_SLOW_TESTS=false
LOG_LEVEL=info
TEST_TIMEOUT=30000
*/

// packages/frontend/scripts/setup-test-data.ts
#!/usr/bin/env ts-node

/**
 * Test Data Setup Script
 * Run with: npm run test:setup
 */

import { TestDataSetup } from '../src/utils/testing/testDataSetup';

async function main() {
  console.log('🛠️ Setting up test data for IFRS 9 platform...');

  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://bifrs9-iaf.ifrspro.id';
  const testDataSetup = new TestDataSetup(apiBaseUrl);

  try {
    await testDataSetup.setupTestData();
    console.log('✅ Test data setup completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Test data setup failed:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

// packages/frontend/scripts/cleanup-test-data.ts
#!/usr/bin/env ts-node

/**
 * Test Data Cleanup Script
 * Run with: npm run test:cleanup
 */

import { TestDataSetup } from '../src/utils/testing/testDataSetup';

async function main() {
  console.log('🧹 Cleaning up test data for IFRS 9 platform...');

  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://bifrs9-iaf.ifrspro.id';
  const testDataSetup = new TestDataSetup(apiBaseUrl);

  try {
    await testDataSetup.cleanupTestData();
    console.log('✅ Test data cleanup completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Test data cleanup failed:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}