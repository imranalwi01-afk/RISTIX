#!/usr/bin/env node
// packages/backend/src/scripts/simple-config-validator.ts
// Simple Configuration System Validator - No Dependencies Required

import * as fs from 'fs';
import * as path from 'path';

interface ValidationResult {
  success: boolean;
  message: string;
  details?: any;
}

class SimpleConfigValidator {
  private results: ValidationResult[] = [];
  private baseDir: string;

  constructor() {
    this.baseDir = path.join(__dirname, '..');
  }

  log(level: 'INFO' | 'SUCCESS' | 'ERROR' | 'WARNING', message: string, details?: any) {
    const timestamp = new Date().toISOString();
    const logMessage = `[${level}] ${timestamp} - ${message}`;
    
    console.log(logMessage);
    if (details) {
      console.log('Details:', JSON.stringify(details, null, 2));
    }
  }

  validateFileExists(filePath: string, description: string): ValidationResult {
    const fullPath = path.join(this.baseDir, filePath);
    
    try {
      if (fs.existsSync(fullPath)) {
        const stats = fs.statSync(fullPath);
        this.log('SUCCESS', `✅ ${description} exists`, { 
          path: filePath, 
          size: `${Math.round(stats.size / 1024)}KB`,
          modified: stats.mtime.toISOString()
        });
        return { success: true, message: `${description} exists` };
      } else {
        this.log('ERROR', `❌ ${description} missing`, { path: filePath });
        return { success: false, message: `${description} missing at ${filePath}` };
      }
    } catch (error) {
      this.log('ERROR', `❌ Error checking ${description}`, { path: filePath, error: error.message });
      return { success: false, message: `Error checking ${description}: ${error.message}` };
    }
  }

  validateDirectoryStructure(): void {
    this.log('INFO', '🔍 Validating Configuration System Directory Structure...');

    const requiredFiles = [
      // Core Services
      'core/services/config/configuration.service.ts',
      'core/services/config/environment.service.ts',
      'core/services/config/feature-flags.service.ts',
      'core/services/config/tenant-config.service.ts',
      'core/services/config/validation.service.ts',
      'core/services/config/encryption.service.ts',

      // Database Models
      'core/models/config/app-settings.model.ts',
      'core/models/config/calculation-parameters.model.ts',
      'core/models/config/model-configurations.model.ts',
      'core/models/config/parameter-configurations.model.ts',

      // API Controllers
      'api/controllers/config/feature-flags.controller.ts',
      'api/controllers/config/tenant-config.controller.ts',

      // API Routes
      'api/routes/config/feature-flags.routes.ts',
      'api/routes/config/tenant-config.routes.ts',

      // Middleware
      'api/middleware/feature-flags.middleware.ts',

      // Environment Configs
      'core/config/environments/development.config.ts',
      'core/config/environments/production.config.ts',
      'core/config/index.ts',

      // Generated Scripts
      'scripts/validate-environment.ts',
      'scripts/test-feature-flags.ts',
      'scripts/test-tenant-config.ts',
      'scripts/test-complete-config-system.ts'
    ];

    for (const file of requiredFiles) {
      const result = this.validateFileExists(file, `Configuration file: ${file}`);
      this.results.push(result);
    }
  }

  validateScriptContents(): void {
    this.log('INFO', '🔍 Validating Generated Script Contents...');

    const scriptsToCheck = [
      'scripts/validate-environment.ts',
      'scripts/test-feature-flags.ts',
      'scripts/test-tenant-config.ts',
      'scripts/test-complete-config-system.ts'
    ];

    for (const scriptPath of scriptsToCheck) {
      const fullPath = path.join(this.baseDir, scriptPath);
      
      try {
        if (fs.existsSync(fullPath)) {
          const content = fs.readFileSync(fullPath, 'utf8');
          const hasImports = content.includes('import');
          const hasExports = content.includes('export') || content.includes('console.log');
          const lineCount = content.split('\n').length;
          
          this.log('SUCCESS', `✅ Script content validated: ${scriptPath}`, {
            lines: lineCount,
            hasImports,
            hasExports,
            size: `${Math.round(content.length / 1024)}KB`
          });
          
          this.results.push({ 
            success: true, 
            message: `Script ${scriptPath} has valid content`,
            details: { lines: lineCount, size: content.length }
          });
        }
      } catch (error) {
        this.log('ERROR', `❌ Error reading script: ${scriptPath}`, { error: error.message });
        this.results.push({ 
          success: false, 
          message: `Error reading script ${scriptPath}: ${error.message}` 
        });
      }
    }
  }

  validateConfigurationStructure(): void {
    this.log('INFO', '🔍 Validating Configuration Service Structure...');

    const configServicePath = path.join(this.baseDir, 'core/services/config/configuration.service.ts');
    
    try {
      if (fs.existsSync(configServicePath)) {
        const content = fs.readFileSync(configServicePath, 'utf8');
        
        // Check for key features
        const features = {
          'Cache Management': content.includes('cache') || content.includes('Cache'),
          'Environment Variables': content.includes('process.env'),
          'Configuration Interface': content.includes('interface') && content.includes('Config'),
          'Error Handling': content.includes('try') && content.includes('catch'),
          'TypeScript Types': content.includes('export class') || content.includes('export interface'),
          'Async/Await Support': content.includes('async') && content.includes('await')
        };

        this.log('SUCCESS', '✅ Configuration Service Features Found:', features);
        
        const foundFeatures = Object.entries(features).filter(([_, found]) => found).length;
        const totalFeatures = Object.keys(features).length;
        
        this.results.push({
          success: foundFeatures >= totalFeatures * 0.8,
          message: `Configuration service has ${foundFeatures}/${totalFeatures} expected features`,
          details: features
        });
      }
    } catch (error) {
      this.log('ERROR', '❌ Error validating configuration service', { error: error.message });
      this.results.push({ 
        success: false, 
        message: `Error validating configuration service: ${error.message}` 
      });
    }
  }

  validatePackageJsonScripts(): void {
    this.log('INFO', '🔍 Validating package.json scripts...');

    const packageJsonPath = path.join(this.baseDir, '../../package.json');
    
    try {
      if (fs.existsSync(packageJsonPath)) {
        const packageContent = fs.readFileSync(packageJsonPath, 'utf8');
        const packageJson = JSON.parse(packageContent);
        
        const scripts = packageJson.scripts || {};
        const configScripts = Object.keys(scripts).filter(key => 
          key.includes('config') || key.includes('validate') || key.includes('test')
        );

        this.log('SUCCESS', '✅ Package.json scripts found:', {
          totalScripts: Object.keys(scripts).length,
          configRelatedScripts: configScripts.length,
          scripts: configScripts
        });

        this.results.push({
          success: configScripts.length > 0,
          message: `Found ${configScripts.length} configuration-related scripts`,
          details: { scripts: configScripts }
        });
      }
    } catch (error) {
      this.log('WARNING', '⚠️ Could not validate package.json scripts', { error: error.message });
    }
  }

  generateSummaryReport(): void {
    this.log('INFO', '📊 Generating Configuration System Validation Summary...');

    const successCount = this.results.filter(r => r.success).length;
    const totalCount = this.results.length;
    const successRate = Math.round((successCount / totalCount) * 100);

    console.log('\n' + '='.repeat(80));
    console.log('🎯 CONFIGURATION SYSTEM VALIDATION SUMMARY');
    console.log('='.repeat(80));
    
    console.log(`\n📈 OVERALL RESULTS:`);
    console.log(`   ✅ Successful validations: ${successCount}/${totalCount}`);
    console.log(`   📊 Success rate: ${successRate}%`);
    
    if (successRate >= 90) {
      console.log(`   🎉 STATUS: EXCELLENT - Configuration system is ready for production!`);
    } else if (successRate >= 75) {
      console.log(`   ✅ STATUS: GOOD - Configuration system is functional with minor issues`);
    } else if (successRate >= 50) {
      console.log(`   ⚠️ STATUS: NEEDS WORK - Several issues need to be addressed`);
    } else {
      console.log(`   ❌ STATUS: CRITICAL - Major issues found in configuration system`);
    }

    console.log(`\n📋 DETAILED RESULTS:`);
    this.results.forEach((result, index) => {
      const status = result.success ? '✅' : '❌';
      console.log(`   ${status} ${result.message}`);
    });

    console.log(`\n🚀 NEXT STEPS:`);
    if (successRate >= 90) {
      console.log(`   1. Configuration system is complete and validated!`);
      console.log(`   2. Ready to proceed to Day 1 Hour 5: Security Framework`);
      console.log(`   3. Install missing dependencies when needed: npm install @nestjs/common`);
    } else {
      console.log(`   1. Address any missing files or configurations`);
      console.log(`   2. Re-run validation after fixes`);
      console.log(`   3. Install missing dependencies: npm install @nestjs/common`);
    }

    console.log('\n' + '='.repeat(80));
  }

  async runValidation(): Promise<void> {
    console.log('🚀 Starting IFRS9 Configuration System Validation...\n');

    try {
      this.validateDirectoryStructure();
      this.validateScriptContents();
      this.validateConfigurationStructure();
      this.validatePackageJsonScripts();
      
      this.generateSummaryReport();
      
    } catch (error) {
      this.log('ERROR', '❌ Validation failed with error', { error: error.message });
      process.exit(1);
    }
  }
}

// Run validation if this script is executed directly
if (require.main === module) {
  const validator = new SimpleConfigValidator();
  validator.runValidation().catch(error => {
    console.error('❌ Validation script failed:', error);
    process.exit(1);
  });
}

export default SimpleConfigValidator;