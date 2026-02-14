
import * as dotenv from 'dotenv';
import path from 'path';

// Load .env file manually
const envPath = path.resolve(__dirname, '../../.env');
console.log(`Loading .env from: ${envPath}`);
dotenv.config({ path: envPath });

async function listTables() {
  try {
    const { initializeFRS9Models, frs9Sequelize } = await import('../core/models/frs9-parameter.models');
    
    console.log('Initializing models...');
    await initializeFRS9Models();
    
    console.log('Listing all tables in public schema...');
    
    const tables = await frs9Sequelize.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        ORDER BY table_name
      `, {
        type: frs9Sequelize.QueryTypes.SELECT
      }) as any[];

    console.log(`Found ${tables.length} tables:`);
    tables.forEach(t => console.log(t.table_name));
    
  } catch (error) {
    console.error('Error listing tables:', error);
  } finally {
    process.exit();
  }
}

listTables();
