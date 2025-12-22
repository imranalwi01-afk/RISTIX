// packages/frontend/src/utils/testing/integrationTestRunner.ts
import { multiStakeholderDataProvider, multiStakeholderAuthProvider } from '../admin/providers/data/multiStakeholderDataProvider';
import { platformService, tenantService, consultantService, authService } from '../services';
import { STAKEHOLDER_TYPES, PERMISSIONS } from '../utils/constants';

// =============================================================================
// INTEGRATION TEST CONFIGURATION
// =============================================================================

interface TestConfig {
  apiBaseUrl: string;
  testCredentials: {
    platformAdmin: { email: string; password: string };
    bankAdmin: { email: string; password: string };
    bankUser: { email: string; password: string };
    consultant: { email: string; password: string };
    regulator: { email: string; password: string };
  };
  testTenantId: string;
  testBankingInstitutionId: string;
  testConsultantProjectId: string;
}

const TEST_CONFIG: TestConfig = {
  apiBaseUrl: process.env.NEXT_PUBLIC_API_URL || 'https://bifrs9-iaf.ifrspro.id',
  testCredentials: {
    platformAdmin: { email: 'admin@ifrs9.test', password: 'admin123' },
    bankAdmin: { email: 'bankadmin@demo.bank', password: 'demo123' },
    bankUser: { email: 'user@demo.bank', password: 'demo123' },
    consultant: { email: 'consultant@ifrs9.test', password: 'consultant123' },
    regulator: { email: 'regulator@ojk.go.id', password: 'regulator123' },
  },
  testTenantId: 'tenant-demo-conventional',
  testBankingInstitutionId: 'bank-demo-001',
  testConsultantProjectId: 'project-demo-001',
};

// =============================================================================
// TEST RESULT INTERFACES
// =============================================================================

interface TestResult {
  testName: string;
  status: 'PASS' | 'FAIL' | 'SKIP';
  duration: number;
  error?: string;
  details?: any;
}

interface TestSuite {
  suiteName: string;
  results: TestResult[];
  totalTests: number;
  passedTests: number;
  failedTests: number;
  skippedTests: number;
  totalDuration: number;
}

// =============================================================================
// INTEGRATION TEST RUNNER
// =============================================================================

export class IntegrationTestRunner {
  private config: TestConfig;
  private results: TestSuite[] = [];

  constructor(config: TestConfig = TEST_CONFIG) {
    this.config = config;
  }

  async runAllTests(): Promise<{ 
    overall: 'PASS' | 'FAIL'; 
    suites: TestSuite[]; 
    summary: { total: number; passed: number; failed: number; skipped: number } 
  }> {
    console.log('🚀 Starting IFRS 9 Platform Integration Tests...');
    console.log(`🔗 Testing against: ${this.config.apiBaseUrl}`);

    // Run all test suites
    const authSuite = await this.runAuthenticationTests();
    const dbSuite = await this.runDatabaseConnectionTests();
    const platformSuite = await this.runPlatformAdminTests();
    const tenantSuite = await this.runTenantTests();
    const consultantSuite = await this.runConsultantTests();
    const permissionSuite = await this.runPermissionTests();
    const workflowSuite = await this.runWorkflowTests();

    this.results = [authSuite, dbSuite, platformSuite, tenantSuite, consultantSuite, permissionSuite, workflowSuite];

    // Calculate summary
    const summary = this.results.reduce(
      (acc, suite) => ({
        total: acc.total + suite.totalTests,
        passed: acc.passed + suite.passedTests,
        failed: acc.failed + suite.failedTests,
        skipped: acc.skipped + suite.skippedTests,
      }),
      { total: 0, passed: 0, failed: 0, skipped: 0 }
    );

    const overall = summary.failed > 0 ? 'FAIL' : 'PASS';

    this.printResults(overall, summary);

    return { overall, suites: this.results, summary };
  }

  // =============================================================================
  // AUTHENTICATION TESTS
  // =============================================================================

  private async runAuthenticationTests(): Promise<TestSuite> {
    const suite: TestSuite = {
      suiteName: 'Authentication & Authorization',
      results: [],
      totalTests: 0,
      passedTests: 0,
      failedTests: 0,
      skippedTests: 0,
      totalDuration: 0,
    };

    console.log('\n🔐 Testing Authentication & Authorization...');

    // Test 1: Platform Admin Login
    suite.results.push(await this.runTest('Platform Admin Login', async () => {
      const user = await authService.login(this.config.testCredentials.platformAdmin);
      if (user.stakeholder_type !== 'platform_admin') {
        throw new Error(`Expected platform_admin, got ${user.stakeholder_type}`);
      }
      return { userId: user.id, stakeholderType: user.stakeholder_type };
    }));

    // Test 2: Bank Admin Login
    suite.results.push(await this.runTest('Bank Admin Login', async () => {
      const user = await authService.login(this.config.testCredentials.bankAdmin);
      if (user.stakeholder_type !== 'bank_admin') {
        throw new Error(`Expected bank_admin, got ${user.stakeholder_type}`);
      }
      return { userId: user.id, tenantId: user.tenant_id };
    }));

    // Test 3: Consultant Login
    suite.results.push(await this.runTest('Consultant Login', async () => {
      const user = await authService.login(this.config.testCredentials.consultant);
      if (user.stakeholder_type !== 'consultant') {
        throw new Error(`Expected consultant, got ${user.stakeholder_type}`);
      }
      return { userId: user.id, stakeholderType: user.stakeholder_type };
    }));

    // Test 4: Token Refresh
    suite.results.push(await this.runTest('Token Refresh', async () => {
      await authService.login(this.config.testCredentials.platformAdmin);
      const newToken = await authService.refreshToken();
      if (!newToken || typeof newToken !== 'string') {
        throw new Error('Token refresh failed');
      }
      return { tokenLength: newToken.length };
    }));

    // Test 5: Invalid Credentials
    suite.results.push(await this.runTest('Invalid Credentials Handling', async () => {
      try {
        await authService.login({ email: 'invalid@test.com', password: 'wrongpassword' });
        throw new Error('Login should have failed with invalid credentials');
      } catch (error) {
        if (error instanceof Error && error.message.includes('Login should have failed')) {
          throw error;
        }
        return { errorHandled: true };
      }
    }));

    // Test 6: Logout
    suite.results.push(await this.runTest('User Logout', async () => {
      await authService.login(this.config.testCredentials.platformAdmin);
      await authService.logout();
      const isAuth = authService.isAuthenticated();
      if (isAuth) {
        throw new Error('User should be logged out');
      }
      return { loggedOut: true };
    }));

    this.calculateSuiteStats(suite);
    return suite;
  }

  // =============================================================================
  // DATABASE CONNECTION TESTS
  // =============================================================================

  private async runDatabaseConnectionTests(): Promise<TestSuite> {
    const suite: TestSuite = {
      suiteName: 'Database Connections',
      results: [],
      totalTests: 0,
      passedTests: 0,
      failedTests: 0,
      skippedTests: 0,
      totalDuration: 0,
    };

    console.log('\n🗄️ Testing Database Connections...');

    // Login as platform admin for database tests
    await authService.login(this.config.testCredentials.platformAdmin);

    // Test 1: Platform Admin Database Connection
    suite.results.push(await this.runTest('Platform Admin DB Connection', async () => {
      const users = await platformService.getUsers({ page: 1, per_page: 5 });
      if (!users.data || !Array.isArray(users.data)) {
        throw new Error('Failed to fetch users from platform database');
      }
      return { userCount: users.data.length, totalUsers: users.total };
    }));

    // Test 2: Banking Institutions Table
    suite.results.push(await this.runTest('Banking Institutions Table', async () => {
      const institutions = await platformService.getBankingInstitutions({ page: 1, per_page: 5 });
      if (!institutions.data || !Array.isArray(institutions.data)) {
        throw new Error('Failed to fetch banking institutions');
      }
      return { institutionCount: institutions.data.length, totalInstitutions: institutions.total };
    }));

    // Test 3: Consultant Projects Table
    suite.results.push(await this.runTest('Consultant Projects Table', async () => {
      const projects = await platformService.getConsultantProjects({ page: 1, per_page: 5 });
      if (!projects.data || !Array.isArray(projects.data)) {
        throw new Error('Failed to fetch consultant projects');
      }
      return { projectCount: projects.data.length, totalProjects: projects.total };
    }));

    // Test 4: System Metrics
    suite.results.push(await this.runTest('System Metrics Retrieval', async () => {
      const metrics = await platformService.getSystemMetrics();
      if (!metrics.total_users || !metrics.active_banking_institutions) {
        throw new Error('Invalid system metrics response');
      }
      return metrics;
    }));

    // Test 5: Cross-Tenant Data Access (Platform Admin)
    suite.results.push(await this.runTest('Cross-Tenant Data Access', async () => {
      try {
        const tenantData = await multiStakeholderDataProvider.getTenantData(
          this.config.testTenantId, 
          'portfolio_accounts'
        );
        return { tenantId: this.config.testTenantId, dataAccess: true };
      } catch (error) {
        throw new Error(`Cross-tenant access failed: ${error}`);
      }
    }));

    this.calculateSuiteStats(suite);
    return suite;
  }

  // =============================================================================
  // PLATFORM ADMIN TESTS
  // =============================================================================

  private async runPlatformAdminTests(): Promise<TestSuite> {
    const suite: TestSuite = {
      suiteName: 'Platform Admin Operations',
      results: [],
      totalTests: 0,
      passedTests: 0,
      failedTests: 0,
      skippedTests: 0,
      totalDuration: 0,
    };

    console.log('\n🏢 Testing Platform Admin Operations...');

    // Login as platform admin
    await authService.login(this.config.testCredentials.platformAdmin);

    // Test 1: Create User
    suite.results.push(await this.runTest('Create User', async () => {
      const userData = {
        email: `test-user-${Date.now()}@test.com`,
        full_name: 'Test User',
        first_name: 'Test',
        last_name: 'User',
        stakeholder_type: 'bank_user' as const,
        role: 'analyst',
        tenant_id: this.config.testTenantId,
      };
      
      const createdUser = await platformService.createUser(userData);
      if (!createdUser.id || createdUser.email !== userData.email) {
        throw new Error('User creation failed');
      }
      
      // Cleanup
      await platformService.deleteUser(createdUser.id);
      
      return { userId: createdUser.id, email: createdUser.email };
    }));

    // Test 2: Create Banking Institution
    suite.results.push(await this.runTest('Create Banking Institution', async () => {
      const institutionData = {
        institution_name: `Test Bank ${Date.now()}`,
        institution_code: `TEST${Date.now()}`,
        banking_type: 'conventional' as const,
        license_type: 'Commercial Bank',
        country: 'Indonesia',
        contact_email: 'contact@testbank.com',
        contact_phone: '+62-21-12345678',
        address: 'Test Address',
      };
      
      const createdInstitution = await platformService.createBankingInstitution(institutionData);
      if (!createdInstitution.id || createdInstitution.institution_name !== institutionData.institution_name) {
        throw new Error('Banking institution creation failed');
      }
      
      // Cleanup
      await platformService.deleteBankingInstitution(createdInstitution.id);
      
      return { institutionId: createdInstitution.id, name: createdInstitution.institution_name };
    }));

    // Test 3: Create Consultant Project
    suite.results.push(await this.runTest('Create Consultant Project', async () => {
      const projectData = {
        banking_institution_id: this.config.testBankingInstitutionId,
        consultant_user_id: 'consultant-user-test',
        project_name: `Test Project ${Date.now()}`,
        project_type: 'implementation' as const,
        description: 'Test project description',
        start_date: new Date().toISOString(),
        scope_of_work: 'IFRS 9 implementation and validation',
      };
      
      const createdProject = await platformService.createConsultantProject(projectData);
      if (!createdProject.id || createdProject.project_name !== projectData.project_name) {
        throw new Error('Consultant project creation failed');
      }
      
      // Cleanup
      await platformService.deleteConsultantProject(createdProject.id);
      
      return { projectId: createdProject.id, name: createdProject.project_name };
    }));

    // Test 4: System Health Check
    suite.results.push(await this.runTest('System Health Check', async () => {
      const health = await platformService.getSystemHealth();
      if (!health.status || !health.services) {
        throw new Error('System health check failed');
      }
      return { status: health.status, serviceCount: Object.keys(health.services).length };
    }));

    this.calculateSuiteStats(suite);
    return suite;
  }

  // =============================================================================
  // TENANT TESTS
  // =============================================================================

  private async runTenantTests(): Promise<TestSuite> {
    const suite: TestSuite = {
      suiteName: 'Tenant Operations',
      results: [],
      totalTests: 0,
      passedTests: 0,
      failedTests: 0,
      skippedTests: 0,
      totalDuration: 0,
    };

    console.log('\n🏦 Testing Tenant Operations...');

    // Login as bank admin
    await authService.login(this.config.testCredentials.bankAdmin);

    // Test 1: Portfolio Accounts Access
    suite.results.push(await this.runTest('Portfolio Accounts Access', async () => {
      const accounts = await tenantService.getPortfolioAccounts({ page: 1, per_page: 5 });
      if (!accounts.data || !Array.isArray(accounts.data)) {
        throw new Error('Failed to fetch portfolio accounts');
      }
      return { accountCount: accounts.data.length, totalAccounts: accounts.total };
    }));

    // Test 2: ECL Calculations Access
    suite.results.push(await this.runTest('ECL Calculations Access', async () => {
      const calculations = await tenantService.getECLCalculations({ page: 1, per_page: 5 });
      if (!calculations.data || !Array.isArray(calculations.data)) {
        throw new Error('Failed to fetch ECL calculations');
      }
      return { calculationCount: calculations.data.length, totalCalculations: calculations.total };
    }));

    // Test 3: Model Configurations Access
    suite.results.push(await this.runTest('Model Configurations Access', async () => {
      const models = await tenantService.getModelConfigurations({ page: 1, per_page: 5 });
      if (!models.data || !Array.isArray(models.data)) {
        throw new Error('Failed to fetch model configurations');
      }
      return { modelCount: models.data.length, totalModels: models.total };
    }));

    // Test 4: Create Portfolio Account
    suite.results.push(await this.runTest('Create Portfolio Account', async () => {
      const accountData = {
        account_number: `ACC${Date.now()}`,
        customer_name: 'Test Customer',
        customer_id: `CUST${Date.now()}`,
        product_type: 'Personal Loan',
        product_code: 'PL001',
        outstanding_amount: 100000,
        original_amount: 120000,
        origination_date: new Date().toISOString(),
        interest_rate: 0.12,
        currency: 'IDR',
        ifrs9_stage: 'stage_1' as const,
      };
      
      const createdAccount = await tenantService.createPortfolioAccount(accountData);
      if (!createdAccount.id || createdAccount.account_number !== accountData.account_number) {
        throw new Error('Portfolio account creation failed');
      }
      
      // Cleanup
      await tenantService.deletePortfolioAccount(createdAccount.id);
      
      return { accountId: createdAccount.id, accountNumber: createdAccount.account_number };
    }));

    this.calculateSuiteStats(suite);
    return suite;
  }

  // =============================================================================
  // CONSULTANT TESTS
  // =============================================================================

  private async runConsultantTests(): Promise<TestSuite> {
    const suite: TestSuite = {
      suiteName: 'Consultant Operations',
      results: [],
      totalTests: 0,
      passedTests: 0,
      failedTests: 0,
      skippedTests: 0,
      totalDuration: 0,
    };

    console.log('\n🎓 Testing Consultant Operations...');

    // Login as consultant
    await authService.login(this.config.testCredentials.consultant);

    // Test 1: Consultant Projects Access
    suite.results.push(await this.runTest('Consultant Projects Access', async () => {
      const projects = await consultantService.getMyProjects({ page: 1, per_page: 5 });
      if (!projects.data || !Array.isArray(projects.data)) {
        throw new Error('Failed to fetch consultant projects');
      }
      return { projectCount: projects.data.length, totalProjects: projects.total };
    }));

    // Test 2: Project Access Validation
    suite.results.push(await this.runTest('Project Access Validation', async () => {
      const access = await consultantService.validateProjectAccess(this.config.testConsultantProjectId);
      if (typeof access.has_access !== 'boolean') {
        throw new Error('Project access validation failed');
      }
      return { hasAccess: access.has_access, accessLevel: access.access_level };
    }));

    // Test 3: Validation Assignments
    suite.results.push(await this.runTest('Validation Assignments', async () => {
      const validations = await consultantService.getValidationAssignments({ page: 1, per_page: 5 });
      if (!validations.data || !Array.isArray(validations.data)) {
        throw new Error('Failed to fetch validation assignments');
      }
      return { validationCount: validations.data.length, totalValidations: validations.total };
    }));

    // Test 4: Tenant Data Access Check
    suite.results.push(await this.runTest('Tenant Data Access Check', async () => {
      const access = await consultantService.getTenantDataAccess(
        this.config.testConsultantProjectId, 
        this.config.testTenantId
      );
      if (typeof access.can_access_portfolio !== 'boolean') {
        throw new Error('Tenant data access check failed');
      }
      return { 
        portfolioAccess: access.can_access_portfolio,
        calculationsAccess: access.can_access_calculations,
        modelsAccess: access.can_access_models
      };
    }));

    this.calculateSuiteStats(suite);
    return suite;
  }

  // =============================================================================
  // PERMISSION TESTS
  // =============================================================================

  private async runPermissionTests(): Promise<TestSuite> {
    const suite: TestSuite = {
      suiteName: 'Permission & RBAC',
      results: [],
      totalTests: 0,
      passedTests: 0,
      failedTests: 0,
      skippedTests: 0,
      totalDuration: 0,
    };

    console.log('\n🔒 Testing Permissions & RBAC...');

    // Test 1: Platform Admin Permissions
    suite.results.push(await this.runTest('Platform Admin Permissions', async () => {
      await authService.login(this.config.testCredentials.platformAdmin);
      const permissions = await multiStakeholderAuthProvider.getPermissions();
      if (!permissions.includes('all')) {
        throw new Error('Platform admin should have all permissions');
      }
      return { permissions };
    }));

    // Test 2: Bank Admin Permissions
    suite.results.push(await this.runTest('Bank Admin Permissions', async () => {
      await authService.login(this.config.testCredentials.bankAdmin);
      const permissions = await multiStakeholderAuthProvider.getPermissions();
      if (!permissions.includes('tenant_admin')) {
        throw new Error('Bank admin should have tenant_admin permission');
      }
      return { permissions };
    }));

    // Test 3: Consultant Permissions
    suite.results.push(await this.runTest('Consultant Permissions', async () => {
      await authService.login(this.config.testCredentials.consultant);
      const permissions = await multiStakeholderAuthProvider.getPermissions();
      if (!permissions.includes('project_access')) {
        throw new Error('Consultant should have project_access permission');
      }
      return { permissions };
    }));

    // Test 4: Cross-Tenant Access Control
    suite.results.push(await this.runTest('Cross-Tenant Access Control', async () => {
      // Login as bank user (should NOT have cross-tenant access)
      await authService.login(this.config.testCredentials.bankUser);
      
      try {
        // Try to access another tenant's data (should fail)
        await multiStakeholderDataProvider.getTenantData('different-tenant-id', 'portfolio_accounts');
        throw new Error('Bank user should not have cross-tenant access');
      } catch (error) {
        if (error instanceof Error && error.message.includes('Unauthorized access')) {
          return { accessBlocked: true };
        }
        throw error;
      }
    }));

    this.calculateSuiteStats(suite);
    return suite;
  }

  // =============================================================================
  // WORKFLOW TESTS
  // =============================================================================

  private async runWorkflowTests(): Promise<TestSuite> {
    const suite: TestSuite = {
      suiteName: 'End-to-End Workflows',
      results: [],
      totalTests: 0,
      passedTests: 0,
      failedTests: 0,
      skippedTests: 0,
      totalDuration: 0,
    };

    console.log('\n🔄 Testing End-to-End Workflows...');

    // Test 1: Complete Authentication Flow
    suite.results.push(await this.runTest('Complete Authentication Flow', async () => {
      // Logout if logged in
      await authService.logout();
      
      // Login
      const user = await authService.login(this.config.testCredentials.platformAdmin);
      
      // Get current user
      const currentUser = await authService.getCurrentUser();
      if (currentUser.id !== user.id) {
        throw new Error('Current user mismatch after login');
      }
      
      // Logout
      await authService.logout();
      if (authService.isAuthenticated()) {
        throw new Error('Should be logged out');
      }
      
      return { workflowCompleted: true };
    }));

    // Test 2: Consultant Project Assignment Workflow
    suite.results.push(await this.runTest('Consultant Project Assignment Workflow', async () => {
      // Login as platform admin
      await authService.login(this.config.testCredentials.platformAdmin);
      
      // Create consultant user
      const consultantData = {
        email: `consultant-${Date.now()}@test.com`,
        full_name: 'Test Consultant',
        first_name: 'Test',
        last_name: 'Consultant',
        stakeholder_type: 'consultant' as const,
        role: 'validator',
        consultant_specialization: 'IFRS 9 Model Validation',
      };
      
      const consultant = await platformService.createUser(consultantData);
      
      // Create project
      const projectData = {
        banking_institution_id: this.config.testBankingInstitutionId,
        consultant_user_id: consultant.id,
        project_name: `Test Assignment ${Date.now()}`,
        project_type: 'validation' as const,
        description: 'Test project assignment workflow',
        start_date: new Date().toISOString(),
        scope_of_work: 'Model validation and testing',
      };
      
      const project = await platformService.createConsultantProject(projectData);
      
      // Assign consultant to project
      const assignedProject = await platformService.assignConsultantToProject(project.id, consultant.id);
      
      if (assignedProject.consultant_user_id !== consultant.id) {
        throw new Error('Consultant assignment failed');
      }
      
      // Cleanup
      await platformService.deleteConsultantProject(project.id);
      await platformService.deleteUser(consultant.id);
      
      return { projectId: project.id, consultantId: consultant.id };
    }));

    // Test 3: Data Provider Integration Test
    suite.results.push(await this.runTest('Data Provider Integration', async () => {
      await authService.login(this.config.testCredentials.platformAdmin);
      
      // Test React Admin DataProvider methods
      const listResult = await multiStakeholderDataProvider.getList('users', {
        pagination: { page: 1, perPage: 10 },
        sort: { field: 'created_at', order: 'DESC' },
        filter: {},
      });
      
      if (!listResult.data || listResult.data.length === 0) {
        throw new Error('DataProvider getList failed');
      }
      
      const oneResult = await multiStakeholderDataProvider.getOne('users', { id: listResult.data[0].id });
      
      if (!oneResult.data || oneResult.data.id !== listResult.data[0].id) {
        throw new Error('DataProvider getOne failed');
      }
      
      return { 
        listCount: listResult.data.length, 
        total: listResult.total,
        oneUserId: oneResult.data.id 
      };
    }));

    this.calculateSuiteStats(suite);
    return suite;
  }

  // =============================================================================
  // UTILITY METHODS
  // =============================================================================

  private async runTest(testName: string, testFunction: () => Promise<any>): Promise<TestResult> {
    const startTime = Date.now();
    try {
      const result = await testFunction();
      const duration = Date.now() - startTime;
      console.log(`  ✅ ${testName} (${duration}ms)`);
      return {
        testName,
        status: 'PASS',
        duration,
        details: result,
      };
    } catch (error) {
      const duration = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.log(`  ❌ ${testName} (${duration}ms): ${errorMessage}`);
      return {
        testName,
        status: 'FAIL',
        duration,
        error: errorMessage,
      };
    }
  }

  private calculateSuiteStats(suite: TestSuite): void {
    suite.totalTests = suite.results.length;
    suite.passedTests = suite.results.filter(r => r.status === 'PASS').length;
    suite.failedTests = suite.results.filter(r => r.status === 'FAIL').length;
    suite.skippedTests = suite.results.filter(r => r.status === 'SKIP').length;
    suite.totalDuration = suite.results.reduce((sum, r) => sum + r.duration, 0);
  }

  private printResults(overall: 'PASS' | 'FAIL', summary: { total: number; passed: number; failed: number; skipped: number }): void {
    console.log('\n' + '='.repeat(80));
    console.log('🎯 IFRS 9 PLATFORM INTEGRATION TEST RESULTS');
    console.log('='.repeat(80));
    
    console.log(`\n📊 OVERALL RESULT: ${overall === 'PASS' ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`📈 SUMMARY: ${summary.passed}/${summary.total} tests passed`);
    
    if (summary.failed > 0) {
      console.log(`⚠️  FAILED TESTS: ${summary.failed}`);
    }
    
    if (summary.skipped > 0) {
      console.log(`⏭️  SKIPPED TESTS: ${summary.skipped}`);
    }

    console.log('\n📋 DETAILED RESULTS:');
    this.results.forEach(suite => {
      console.log(`\n${suite.suiteName}: ${suite.passedTests}/${suite.totalTests} passed (${suite.totalDuration}ms)`);
      
      const failedTests = suite.results.filter(r => r.status === 'FAIL');
      if (failedTests.length > 0) {
        failedTests.forEach(test => {
          console.log(`  ❌ ${test.testName}: ${test.error}`);
        });
      }
    });

    console.log('\n' + '='.repeat(80));
  }
}

// =============================================================================
// SIMPLE TEST RUNNER FOR DIRECT EXECUTION
// =============================================================================

export async function runIntegrationTests(): Promise<void> {
  const testRunner = new IntegrationTestRunner();
  const results = await testRunner.runAllTests();
  
  if (results.overall === 'FAIL') {
    process.exit(1);
  }
}

// Export for use in other modules
export { TEST_CONFIG, TestResult, TestSuite };

// =============================================================================
// REACT COMPONENT FOR TESTING UI
// =============================================================================

import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  Button,
  Typography,
  Box,
  LinearProgress,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
  Alert,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import {
  PlayArrow,
  CheckCircle,
  Error,
  ExpandMore,
  Storage,
  Security,
  Business,
  Assignment,
  Group,
  Workflow,
} from '@mui/icons-material';

export const IntegrationTestDashboard: React.FC = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [progress, setProgress] = useState(0);

  const handleRunTests = async () => {
    setIsRunning(true);
    setProgress(0);
    setResults(null);

    try {
      const testRunner = new IntegrationTestRunner();
      
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 10, 90));
      }, 500);

      const testResults = await testRunner.runAllTests();
      
      clearInterval(progressInterval);
      setProgress(100);
      setResults(testResults);
    } catch (error) {
      console.error('Test execution failed:', error);
      setResults({ overall: 'FAIL', error: error instanceof Error ? error.message : 'Unknown error' });
    } finally {
      setIsRunning(false);
    }
  };

  const getSuiteIcon = (suiteName: string) => {
    if (suiteName.includes('Authentication')) return <Security />;
    if (suiteName.includes('Database')) return <Storage />;
    if (suiteName.includes('Platform')) return <Business />;
    if (suiteName.includes('Consultant')) return <Assignment />;
    if (suiteName.includes('Permission')) return <Group />;
    if (suiteName.includes('Workflow')) return <Workflow />;
    return <CheckCircle />;
  };

  return (
    <Card>
      <CardHeader
        title="Integration Test Dashboard"
        subheader="Validate database connections and API integration"
      />
      <CardContent>
        <Box sx={{ mb: 3 }}>
          <Button
            variant="contained"
            size="large"
            startIcon={<PlayArrow />}
            onClick={handleRunTests}
            disabled={isRunning}
            fullWidth
          >
            {isRunning ? 'Running Tests...' : 'Run Integration Tests'}
          </Button>
        </Box>

        {isRunning && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="body2" gutterBottom>
              Running integration tests...
            </Typography>
            <LinearProgress variant="determinate" value={progress} />
          </Box>
        )}

        {results && (
          <Box>
            <Alert 
              severity={results.overall === 'PASS' ? 'success' : 'error'}
              sx={{ mb: 2 }}
            >
              <Typography variant="h6">
                {results.overall === 'PASS' ? '✅ All Tests Passed!' : '❌ Some Tests Failed'}
              </Typography>
              {results.summary && (
                <Typography variant="body2">
                  {results.summary.passed}/{results.summary.total} tests passed
                </Typography>
              )}
            </Alert>

            {results.suites && results.suites.map((suite: any, index: number) => (
              <Accordion key={index}>
                <AccordionSummary expandIcon={<ExpandMore />}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {getSuiteIcon(suite.suiteName)}
                    <Typography variant="h6">{suite.suiteName}</Typography>
                    <Chip
                      label={`${suite.passedTests}/${suite.totalTests}`}
                      color={suite.failedTests === 0 ? 'success' : 'error'}
                      size="small"
                    />
                  </Box>
                </AccordionSummary>
                <AccordionDetails>
                  <List dense>
                    {suite.results.map((test: any, testIndex: number) => (
                      <ListItem key={testIndex}>
                        <ListItemIcon>
                          {test.status === 'PASS' ? (
                            <CheckCircle color="success" />
                          ) : (
                            <Error color="error" />
                          )}
                        </ListItemIcon>
                        <ListItemText
                          primary={test.testName}
                          secondary={
                            test.status === 'FAIL' ? test.error : `${test.duration}ms`
                          }
                        />
                      </ListItem>
                    ))}
                  </List>
                </AccordionDetails>
              </Accordion>
            ))}
          </Box>
        )}
      </CardContent>
    </Card>
  );
};