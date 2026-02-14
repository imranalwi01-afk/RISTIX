
import * as dotenv from 'dotenv';
import path from 'path';

// Load .env file manually
const envPath = path.resolve(__dirname, '../../.env');
console.log(`Loading .env from: ${envPath}`);
dotenv.config({ path: envPath });

async function seedB0012() {
  try {
    const { ParamCommonh, ParamCommond, initializeFRS9Models } = await import('../core/models/frs9-parameter.models');
    
    console.log('Initializing models...');
    await initializeFRS9Models();
    
    // Check if Header exists
    let header = await ParamCommonh.findOne({ where: { param_code: 'B0012' } });
    if (!header) {
      console.log('Creating Header B0012...');
      header = await ParamCommonh.create({
        param_code: 'B0012',
        param_name: 'Segmentation Tables',
        param_usage: 'List of tables available for segmentation',
        param_type: 'S',
        createdby: 'system',
        createddate: new Date(),
        createdhost: 'localhost'
      });
    } else {
      console.log('Header B0012 exists.');
    }

    const records = [
      { seq: 10, value1: 'frs9_master_account', label: 'Master Account', value3: 'CORE' },
      { seq: 20, value1: 'frs9_portfolio_accounts', label: 'Portfolio Accounts', value3: 'CORE' },
      { seq: 30, value1: 'frs9_customer', label: 'Customers', value3: 'CORE' },
      { seq: 40, value1: 'frs9_product', label: 'Products', value3: 'CORE' }
    ];

    for (const rec of records) {
      const exists = await ParamCommond.findOne({
        where: { 
          param_code: 'B0012',
          value1: rec.value1 
        }
      });

      if (!exists) {
        console.log(`Creating record for ${rec.label}...`);
        await ParamCommond.create({
          param_code: 'B0012',
          param_seq: rec.seq,
          value1: rec.value1,
          value2: '', // Description or other
          value3: rec.value3,
          paramdesc: rec.label,
          createdby: 'system',
          createddate: new Date(),
          createdhost: 'localhost'
        });
      } else {
        console.log(`Record for ${rec.label} already exists.`);
      }
    }
    
    console.log('Seeding completed.');
    
  } catch (error) {
    console.error('Error seeding B0012:', error);
  } finally {
    process.exit();
  }
}

seedB0012();
