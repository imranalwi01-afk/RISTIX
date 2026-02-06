
try {
  console.log('🔄 internal-debug: Attempting to import routes...');
  const routesModule = require('./src/api/routes/individual-impairment.routes');
  console.log('✅ internal-debug: Routes loaded successfully');
} catch (error) {
  console.error('❌ internal-debug: Failed to load controller:', error);
}
