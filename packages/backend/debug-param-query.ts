
const { ParamCommonh, ParamCommond, frs9Sequelize } = require('./src/core/models/frs9-parameter.models');

async function debugQuery() {
  try {
    console.log('🔍 Testing FRS9 database connection...');
    await frs9Sequelize.authenticate();
    console.log('✅ Connection successful');

    console.log('🔍 Executing ParamCommonh.findAll...');
    const apps = await ParamCommonh.findAll({
      where: {
        param_type: ['A', 'S']
      },
      include: [{
        model: ParamCommond,
        as: 'details',
        required: false,
        order: [['details', 'param_seq', 'ASC']]
      }]
    });
    console.log(`✅ Query successful, found ${apps.length} records`);
    
    // Check columns
    if (apps.length > 0) {
      console.log('📋 First record data:', JSON.stringify(apps[0].toJSON(), null, 2));
    }
  } catch (error) {
    console.error('❌ Query failed:', error);
    if (error.name === 'SequelizeDatabaseError') {
      console.error('📋 SQL state:', error.parent.code);
      console.error('📋 Original error:', error.parent.message);
    }
  } finally {
    process.exit();
  }
}

debugQuery();
