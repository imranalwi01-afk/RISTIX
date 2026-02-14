
import * as dotenv from 'dotenv';
import path from 'path';

// Load .env file manually
const envPath = path.resolve(__dirname, '../../.env');
console.log(`Loading .env from: ${envPath}`);
dotenv.config({ path: envPath });

async function verifyB0013() {
  try {
    const { ParamCommond, initializeFRS9Models } = await import('../core/models/frs9-parameter.models');
    
    console.log('Initializing models...');
    await initializeFRS9Models();
    
    const tables = [
      'frs9_master_account',
      'frs9_portfolio_accounts',
      'frs9_customer',
      'frs9_product'
    ];

    console.log('Checking B0013 columns for seeded tables...');
    
    for (const table of tables) {
      const count = await ParamCommond.count({
        where: { 
          param_code: 'B0013',
          paramdesc: table
        }
      });
      console.log(`- ${table}: ${count} columns found`);
    }
    
  } catch (error) {
    console.error('Error verifying B0013:', error);
  } finally {
    process.exit();
  }
}

verifyB0013();
