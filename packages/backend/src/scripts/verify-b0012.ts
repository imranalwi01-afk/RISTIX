
import * as dotenv from 'dotenv';
import path from 'path';

// Load .env file manually
const envPath = path.resolve(__dirname, '../../.env');
console.log(`Loading .env from: ${envPath}`);
dotenv.config({ path: envPath });

async function verifyB0012() {
  try {
    const { ParamCommond, initializeFRS9Models } = await import('../core/models/frs9-parameter.models');
    
    console.log('Initializing models...');
    await initializeFRS9Models();
    
    console.log('Querying B0012...');
    const tables = await ParamCommond.findAll({
      where: { param_code: 'B0012' },
      raw: true,
      order: [['param_seq', 'ASC']]
    });
    
    console.log(`Found ${tables.length} tables for B0012.`);
    
    const expectedTables = [
      'Master Account', 
      'Portfolio Accounts', 
      'Customers', 
      'Products'
    ];
    
    const presentLabels = tables.map(t => t.paramdesc);
    const missing = expectedTables.filter(e => !presentLabels.some(p => p && p.includes(e)));
    
    if (missing.length > 0) {
      console.log('Missing expected tables:', missing);
    } else {
      console.log('All expected tables found.');
    }

    console.log('Existing tables (top 20):');
    tables.slice(0, 20).forEach(t => console.log(`- Label: "${t.paramdesc}", Value: "${t.value1}"`));
    
  } catch (error) {
    console.error('Error verifying B0012:', error);
  } finally {
    process.exit();
  }
}

verifyB0012();
