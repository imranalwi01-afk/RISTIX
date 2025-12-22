// packages/backend/src/scripts/simple-migration.js
// ============================================================================
// 🔧 APPL-007: SIMPLE FRS9 PARAMETER MIGRATION
// ============================================================================

const { Client } = require('pg');

const FRS9_DB_CONFIG = {
  host: process.env.FRS9_DB_HOST || '192.168.0.106',
  port: parseInt(process.env.FRS9_DB_PORT || '5433'),
  database: process.env.FRS9_DB_NAME || 'FRS9PRO',
  user: process.env.FRS9_DB_USER || 'postgres',
  password: process.env.FRS9_DB_PASSWORD || 'postgres',
  connectionTimeoutMillis: 30000
};

async function runSimpleMigration() {
  console.log('🚀 [APPL-007] Starting Simple FRS9 Parameter Migration...');
  
  const client = new Client(FRS9_DB_CONFIG);
  
  try {
    await client.connect();
    console.log('✅ [APPL-007] Connected to FRS9PRO database');
    
    // 1. Add missing columns to frs9_param_commonh if they don't exist
    console.log('📋 [APPL-007] Adding missing columns to frs9_param_commonh...');
    
    const addColumnsQueries = [
      {
        name: 'banking_type',
        sql: `
          DO $$ 
          BEGIN
            IF NOT EXISTS (
              SELECT 1 FROM information_schema.columns 
              WHERE table_name = 'frs9_param_commonh' 
              AND column_name = 'banking_type'
            ) THEN
              ALTER TABLE frs9_param_commonh 
              ADD COLUMN banking_type VARCHAR(20) DEFAULT 'conventional';
              
              ALTER TABLE frs9_param_commonh 
              ADD CONSTRAINT chk_banking_type 
              CHECK (banking_type IN ('conventional', 'syariah', 'dual'));
            END IF;
          END $$;
        `
      },
      {
        name: 'is_active',
        sql: `
          DO $$ 
          BEGIN
            IF NOT EXISTS (
              SELECT 1 FROM information_schema.columns 
              WHERE table_name = 'frs9_param_commonh' 
              AND column_name = 'is_active'
            ) THEN
              ALTER TABLE frs9_param_commonh 
              ADD COLUMN is_active BOOLEAN DEFAULT true;
            END IF;
          END $$;
        `
      },
      {
        name: 'requires_approval',
        sql: `
          DO $$ 
          BEGIN
            IF NOT EXISTS (
              SELECT 1 FROM information_schema.columns 
              WHERE table_name = 'frs9_param_commonh' 
              AND column_name = 'requires_approval'
            ) THEN
              ALTER TABLE frs9_param_commonh 
              ADD COLUMN requires_approval BOOLEAN DEFAULT false;
            END IF;
          END $$;
        `
      }
    ];
    
    for (const query of addColumnsQueries) {
      try {
        await client.query(query.sql);
        console.log(`   ✅ Added column: ${query.name}`);
      } catch (error) {
        console.log(`   ⚠️ Column ${query.name} may already exist: ${error.message}`);
      }
    }
    
    // 2. Create indexes for performance
    console.log('📊 [APPL-007] Creating performance indexes...');
    
    const indexQueries = [
      'CREATE INDEX IF NOT EXISTS idx_frs9_param_commonh_type_code ON frs9_param_commonh(param_type, param_code)',
      'CREATE INDEX IF NOT EXISTS idx_frs9_param_commonh_active ON frs9_param_commonh(is_active)',
      'CREATE INDEX IF NOT EXISTS idx_frs9_param_commond_code_seq ON frs9_param_commond(param_code, param_seq)',
      'CREATE INDEX IF NOT EXISTS idx_frs9_param_product_active ON frs9_param_product(active_flag)',
      'CREATE INDEX IF NOT EXISTS idx_frs9_param_journal_active ON frs9_param_journal(active_flag)'
    ];
    
    for (const indexQuery of indexQueries) {
      try {
        await client.query(indexQuery);
        console.log(`   ✅ Created index`);
      } catch (error) {
        console.log(`   ⚠️ Index may already exist: ${error.message}`);
      }
    }
    
    // 3. Insert sample application parameters
    console.log('📝 [APPL-007] Inserting sample application parameters...');
    
    const sampleParameters = [
      {
        code: 'SYS_001',
        name: 'System Timeout',
        usage: 'Session timeout configuration in minutes',
        details: [
          { seq: 1, value1: '30', value2: 'minutes', value3: 'session', desc: 'Default session timeout: 30 minutes' },
          { seq: 2, value1: '120', value2: 'minutes', value3: 'extended', desc: 'Extended session timeout: 2 hours' }
        ]
      },
      {
        code: 'SYS_002',
        name: 'Max Upload Size',
        usage: 'Maximum file upload size in MB',
        details: [
          { seq: 1, value1: '50', value2: 'MB', value3: 'standard', desc: 'Standard upload limit: 50 MB' },
          { seq: 2, value1: '100', value2: 'MB', value3: 'premium', desc: 'Premium upload limit: 100 MB' }
        ]
      },
      {
        code: 'SYS_003',
        name: 'API Rate Limit',
        usage: 'API request rate limit per minute',
        details: [
          { seq: 1, value1: '1000', value2: 'requests', value3: 'standard', desc: 'Standard API rate: 1000 requests/minute' },
          { seq: 2, value1: '5000', value2: 'requests', value3: 'premium', desc: 'Premium API rate: 5000 requests/minute' }
        ]
      }
    ];
    
    for (const param of sampleParameters) {
      try {
        // Insert header
        const headerQuery = `
          INSERT INTO frs9_param_commonh 
          (param_code, param_name, param_usage, param_type, banking_type, is_active, requires_approval, createdby, createddate, createdhost)
          VALUES ($1, $2, $3, 'A', 'dual', true, false, 'migration', NOW(), 'migration')
          ON CONFLICT (param_code) DO UPDATE SET
            param_name = EXCLUDED.param_name,
            param_usage = EXCLUDED.param_usage,
            banking_type = EXCLUDED.banking_type,
            is_active = EXCLUDED.is_active,
            requires_approval = EXCLUDED.requires_approval,
            updatedby = 'migration',
            updateddate = NOW(),
            updatedhost = 'migration';
        `;
        
        await client.query(headerQuery, [param.code, param.name, param.usage]);
        console.log(`   ✅ Created/updated parameter: ${param.code}`);
        
        // Insert details
        for (const detail of param.details) {
          const detailQuery = `
            INSERT INTO frs9_param_commond 
            (param_code, param_seq, value1, value2, value3, paramdesc, createdby, createddate, createdhost)
            VALUES ($1, $2, $3, $4, $5, $6, 'migration', NOW(), 'migration')
            ON CONFLICT (param_code, param_seq) DO UPDATE SET
              value1 = EXCLUDED.value1,
              value2 = EXCLUDED.value2,
              value3 = EXCLUDED.value3,
              paramdesc = EXCLUDED.paramdesc,
              updatedby = 'migration',
              updateddate = NOW(),
              updatedhost = 'migration';
          `;
          
          await client.query(detailQuery, [param.code, detail.seq, detail.value1, detail.value2, detail.value3, detail.desc]);
        }
        
        console.log(`   📝 Created/updated ${param.details.length} details for ${param.code}`);
        
      } catch (error) {
        console.log(`   ⚠️ Failed to create parameter ${param.code}: ${error.message}`);
      }
    }
    
    // 4. Verify migration results
    console.log('🔍 [APPL-007] Verifying migration results...');
    
    const verificationQueries = [
      { name: 'Application Parameters (Type A)', query: "SELECT COUNT(*) FROM frs9_param_commonh WHERE param_type = 'A'" },
      { name: 'Parameter Details', query: "SELECT COUNT(*) FROM frs9_param_commond" },
      { name: 'Product Parameters', query: "SELECT COUNT(*) FROM frs9_param_product" },
      { name: 'Journal Parameters', query: "SELECT COUNT(*) FROM frs9_param_journal" }
    ];
    
    for (const verification of verificationQueries) {
      try {
        const result = await client.query(verification.query);
        console.log(`   📊 ${verification.name}: ${result.rows[0].count} records`);
      } catch (error) {
        console.log(`   ⚠️ Could not count ${verification.name}: ${error.message}`);
      }
    }
    
    // 5. Test application parameter query
    console.log('🧪 [APPL-007] Testing application parameter query...');
    
    try {
      const testQuery = `
        SELECT h.pkid, h.param_code, h.param_name, h.param_usage, h.banking_type, h.is_active,
               COUNT(d.pkid) as detail_count
        FROM frs9_param_commonh h
        LEFT JOIN frs9_param_commond d ON h.param_code = d.param_code
        WHERE h.param_type = 'A'
        GROUP BY h.pkid, h.param_code, h.param_name, h.param_usage, h.banking_type, h.is_active
        ORDER BY h.param_code
        LIMIT 5;
      `;
      
      const testResult = await client.query(testQuery);
      console.log(`   ✅ Successfully queried ${testResult.rows.length} application parameters`);
      
      testResult.rows.forEach(row => {
        console.log(`   📋 ${row.param_code}: ${row.param_name} (${row.detail_count} details)`);
      });
      
    } catch (error) {
      console.log(`   ❌ Test query failed: ${error.message}`);
    }
    
    console.log('🎉 [APPL-007] Simple migration completed successfully!');
    
  } catch (error) {
    console.error('❌ [APPL-007] Migration failed:', error.message);
    throw error;
  } finally {
    await client.end();
    console.log('🔌 [APPL-007] Database connection closed');
  }
}

// Run migration
if (require.main === module) {
  runSimpleMigration()
    .then(() => {
      console.log('✅ [APPL-007] Migration script completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ [APPL-007] Migration script failed:', error.message);
      process.exit(1);
    });
}

module.exports = { runSimpleMigration };