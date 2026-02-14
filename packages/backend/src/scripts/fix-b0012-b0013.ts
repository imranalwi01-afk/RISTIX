
import * as dotenv from 'dotenv';
import path from 'path';

// Load .env file manually
const envPath = path.resolve(__dirname, '../../.env');
console.log(`Loading .env from: ${envPath}`);
dotenv.config({ path: envPath });

async function fixB0012B0013() {
  try {
    const { ParamCommond, initializeFRS9Models, frs9Sequelize } = await import('../core/models/frs9-parameter.models');
    
    console.log('Initializing models...');
    await initializeFRS9Models();
    
    // 1. UPDATE B0012 MAPPINGS
    // Update 'frs9_master_account' -> 'frs9_master_account_repo'
    await ParamCommond.update(
      { value1: 'frs9_master_account_repo' },
      { where: { param_code: 'B0012', value1: 'frs9_master_account' } }
    );
    console.log('Updated Master Account to frs9_master_account_repo');

    // Update 'frs9_product' -> 'frs9_param_product'
    await ParamCommond.update(
      { value1: 'frs9_param_product' },
      { where: { param_code: 'B0012', value1: 'frs9_product' } }
    );
    console.log('Updated Products to frs9_param_product');

    // 2. SEED B0013 COLUMNS
    const targetTables = [
      'frs9_master_account_repo',
      'frs9_param_product' 
      // 'frs9_portfolio_accounts', // Not found
      // 'frs9_customer' // Not found
    ];

    for (const tableName of targetTables) {
      console.log(`Processing table: ${tableName}`);
      
      const columns = await frs9Sequelize.query(`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = :tableName 
        AND table_schema = 'public'
        ORDER BY ordinal_position
      `, {
        replacements: { tableName },
        type: frs9Sequelize.QueryTypes.SELECT
      }) as any[];

      if (columns.length === 0) {
        console.warn(`⚠️ Table ${tableName} not found in database.`);
        continue;
      }

      await processColumns(columns, tableName, ParamCommond);
    }
    
    console.log('Fix B0012/B0013 completed.');
    
  } catch (error) {
    console.error('Error fixing B0012/B0013:', error);
  } finally {
    process.exit();
  }
}

async function processColumns(columns: any[], tableName: string, ParamCommondModel: any) {
    let seq = 1;
    for (const col of columns) {
        const colName = col.column_name;
        // Map data type
        let simpleType = 'VARCHAR';
        const dbType = col.data_type.toLowerCase();
        
        if (dbType.includes('int') || dbType.includes('numeric') || dbType.includes('double') || dbType.includes('decimal')) {
          simpleType = 'NUMBER';
        } else if (dbType.includes('date') || dbType.includes('time')) {
          simpleType = 'DATE';
        } else if (dbType.includes('bool')) {
          simpleType = 'BOOLEAN';
        }

        // Check if exists
        const exists = await ParamCommondModel.findOne({
          where: {
            param_code: 'B0013',
            value1: colName,
            paramdesc: tableName
          }
        });

        if (!exists) {
          console.log(` Creating column def for ${tableName}.${colName}`);
          await ParamCommondModel.create({
            param_code: 'B0013',
            param_seq: seq++,
            value1: colName,
            value2: simpleType,
            value3: tableName,
            paramdesc: tableName,
            createdby: 'system',
            createddate: new Date(),
            createdhost: 'localhost'
          });
        }
    }
}

fixB0012B0013();
