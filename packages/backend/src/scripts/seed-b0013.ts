
import * as dotenv from 'dotenv';
import path from 'path';

// Load .env file manually
const envPath = path.resolve(__dirname, '../../.env');
console.log(`Loading .env from: ${envPath}`);
dotenv.config({ path: envPath });

async function seedB0013() {
  try {
    const { ParamCommonh, ParamCommond, initializeFRS9Models, frs9Sequelize } = await import('../core/models/frs9-parameter.models');
    
    console.log('Initializing models...');
    await initializeFRS9Models();
    
    // Check if Header B0013 exists
    let header = await ParamCommonh.findOne({ where: { param_code: 'B0013' } });
    if (!header) {
      console.log('Creating Header B0013...');
      header = await ParamCommonh.create({
        param_code: 'B0013',
        param_name: 'Segmentation Columns',
        param_usage: 'Columns available for segmentation rules',
        param_type: 'S',
        createdby: 'system',
        createddate: new Date(),
        createdhost: 'localhost'
      });
    }

    const targetTables = [
      'frs9_master_account',
      'frs9_portfolio_accounts',
      'frs9_customer',
      'frs9_product'
    ];

    for (const tableName of targetTables) {
      console.log(`Processing table: ${tableName}`);
      
      // Get columns from information_schema
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
        console.warn(`⚠️ Table ${tableName} not found in database or has no columns.`);
        if (tableName === 'frs9_master_account') {
             // Fallback: try removing prefix if table name mismatch
             const altName = 'master_account';
             console.log(`Trying fallback name: ${altName}`);
             const altColumns = await frs9Sequelize.query(`
                SELECT column_name, data_type 
                FROM information_schema.columns 
                WHERE table_name = :tableName 
                AND table_schema = 'public'
            `, { replacements: { tableName: altName }, type: frs9Sequelize.QueryTypes.SELECT }) as any[];
            if (altColumns.length > 0) {
                console.log(`Found columns for ${altName}. Using it but mapping to ${tableName} in B0013.`);
                // We use altColumns but keep tableName as paramdesc for consistency with B0012
                processColumns(altColumns, tableName, ParamCommond);
                continue;
            }
        }
        continue;
      }

      await processColumns(columns, tableName, ParamCommond);
    }
    
    console.log('Seeding B0013 completed.');
    
  } catch (error) {
    console.error('Error seeding B0013:', error);
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
          console.log(` Creating column def for ${tableName}.${colName} (${simpleType})`);
          await ParamCommondModel.create({
            param_code: 'B0013',
            param_seq: seq++,
            value1: colName,
            value2: simpleType, // Data Type
            value3: tableName,
            paramdesc: tableName, // Used for filtering by table
            createdby: 'system',
            createddate: new Date(),
            createdhost: 'localhost'
          });
        }
    }
}

seedB0013();
