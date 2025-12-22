// packages/backend/src/scripts/test-complete-config-system.ts
import { EnvironmentService } from '../core/services/config/environment.service';
import { ValidationService } from '../core/services/config/validation.service';
import { FeatureFlagsService } from '../core/services/config/feature-flags.service';
import { EncryptionService } from '../core/services/config/encryption.service';

async function testCompleteConfigurationSystem() {
  console.log('🔧 Testing Complete Configuration Management System...\n');
  
  const testResults = {
    environment: { passed: false, details: '' },
    validation: { passed: false, details: '' },
    features: { passed: false, details: '' },
    encryption: { passed: false, details: '' },
    integration: { passed: false, details: '' }
  };
  
  try {
    const logger = console as any;
    
    // Test 1: Environment Service
    console.log('🔧 Test 1: Environment Configuration');
    console.log('='.repeat(50));
    
    try {
      const environmentService = new EnvironmentService(logger);
      await environmentService.loadEnvironmentConfig();
      
      const config = environmentService.getAll();
      console.log(`✅ Environment loaded: ${config.environment}`);
      console.log(`✅ App name: ${config.app.name}`);
      console.log(`✅ Backend port: ${config.server.backend.port}`);
      console.log(`✅ Features loaded: ${Object.keys(config.features).length}`);
      
      testResults.environment.passed = true;
      testResults.environment.details = `Environment: ${config.environment}, Features: ${Object.keys(config.features).length}`;
    } catch (error) {
      console.log(`❌ Environment test failed: ${error.message}`);
      testResults.environment.details = error.message;
    }
    
    console.log('');
    
    // Test 2: Validation Service
    console.log('🔧 Test 2: Environment Validation');
    console.log('='.repeat(50));
    
    try {
      const validationService = new ValidationService(logger);
      const report = await validationService.validateEnvironment();
      
      console.log(`✅ Validation completed: ${report.overallStatus}`);
      console.log(`✅ Score: ${report.score}/100`);
      console.log(`✅ Sections validated: ${Object.keys(report.results).length}`);
      
      const validSections = Object.values(report.results).filter(r => r.isValid).length;
      console.log(`✅ Valid sections: ${validSections}/${Object.keys(report.results).length}`);
      
      testResults.validation.passed = report.overallStatus !== 'invalid';
      testResults.validation.details = `Status: ${report.overallStatus}, Score: ${report.score}`;
    } catch (error) {
      console.log(`❌ Validation test failed: ${error.message}`);
      testResults.validation.details = error.message;
    }
    
    console.log('');
    
    // Test 3: Encryption Service
    console.log('🔧 Test 3: Encryption System');
    console.log('='.repeat(50));
    
    try {
      const encryptionService = new EncryptionService(logger);
      
      const testData = 'sensitive_banking_data_12345';
      const encrypted = await encryptionService.encrypt(testData);
      const decrypted = await encryptionService.decrypt(encrypted);
      
      console.log(`✅ Encryption test: ${testData === decrypted ? 'passed' : 'failed'}`);
      
      const hashedPassword = await encryptionService.hash('test_password');
      const isValid = await encryptionService.verifyHash('test_password', hashedPassword);
      
      console.log(`✅ Hashing test: ${isValid ? 'passed' : 'failed'}`);
      
      const randomSecret = encryptionService.generateJWTSecret();
      console.log(`✅ JWT secret generated: ${randomSecret.length >= 32 ? 'valid length' : 'invalid length'}`);
      
      testResults.encryption.passed = testData === decrypted && isValid;
      testResults.encryption.details = 'Encryption, hashing, and key generation working';
    } catch (error) {
      console.log(`❌ Encryption test failed: ${error.message}`);
      testResults.encryption.details = error.message;
    }
    
    console.log('');
    
    // Summary Report
    console.log('📊 CONFIGURATION SYSTEM TEST SUMMARY');
    console.log('='.repeat(60));
    
    const passedTests = Object.values(testResults).filter(test => test.passed).length;
    const totalTests = Object.keys(testResults).length;
    
    console.log(`Overall Status: ${passedTests}/${totalTests} tests passed`);
    console.log('');
    
    for (const [testName, result] of Object.entries(testResults)) {
      const status = result.passed ? '✅ PASSED' : '❌ FAILED';
      console.log(`${status} ${testName}: ${result.details}`);
    }
    
    console.log('');
    
    if (passedTests === totalTests) {
      console.log('🎉 Configuration Management System is fully operational!');
      console.log('✅ Ready for Day 1 Hour 5: Security Framework Development');
    } else {
      console.log('⚠️  Some tests failed. Please review the configuration.');
      console.log(`Fix the failed tests before proceeding to the next phase.`);
    }
    
  } catch (error) {
    console.error('❌ Complete Configuration Test Failed:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// Run the comprehensive test
testCompleteConfigurationSystem();
