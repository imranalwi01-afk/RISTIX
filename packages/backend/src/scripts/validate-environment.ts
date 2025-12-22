// packages/backend/src/scripts/validate-environment.ts
import { ValidationService } from '../core/services/config/validation.service';

async function runValidation() {
  const logger = console as any; // Simple logger for script
  const validationService = new ValidationService(logger);
  
  try {
    console.log('🔍 Starting comprehensive environment validation...\n');
    
    const report = await validationService.validateEnvironment();
    
    // Print summary
    console.log('='.repeat(60));
    console.log('ENVIRONMENT VALIDATION REPORT');
    console.log('='.repeat(60));
    console.log(`Environment: ${report.environment}`);
    console.log(`Node.js Version: ${report.nodeVersion}`);
    console.log(`Platform: ${report.platform}`);
    console.log(`Overall Status: ${report.overallStatus.toUpperCase()}`);
    console.log(`Score: ${report.score}/100`);
    console.log(`Timestamp: ${report.timestamp.toISOString()}\n`);
    
    // Print detailed results
    for (const [section, result] of Object.entries(report.results)) {
      console.log(`📋 ${section.toUpperCase()}`);
      console.log('-'.repeat(40));
      
      if (result.isValid) {
        console.log('✅ Status: VALID');
      } else {
        console.log('❌ Status: INVALID');
      }
      
      if (result.errors.length > 0) {
        console.log('❌ Errors:');
        result.errors.forEach(error => console.log(`   - ${error}`));
      }
      
      if (result.warnings.length > 0) {
        console.log('⚠️  Warnings:');
        result.warnings.forEach(warning => console.log(`   - ${warning}`));
      }
      
      if (result.recommendations.length > 0) {
        console.log('💡 Recommendations:');
        result.recommendations.forEach(rec => console.log(`   - ${rec}`));
      }
      
      console.log('');
    }
    
    // Exit with appropriate code
    if (report.overallStatus === 'invalid') {
      console.log('❌ Environment validation failed. Please fix the errors above.');
      process.exit(1);
    } else if (report.overallStatus === 'warnings') {
      console.log('⚠️  Environment validation passed with warnings. Consider addressing them.');
      process.exit(0);
    } else {
      console.log('✅ Environment validation passed successfully!');
      process.exit(0);
    }
    
  } catch (error) {
    console.error('❌ Validation failed:', error.message);
    process.exit(1);
  }
}

runValidation();
