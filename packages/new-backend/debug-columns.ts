
import { legacyConnection } from './src/config/database';
import postgres from 'postgres';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load .env from ops/local
dotenv.config({ path: path.resolve(__dirname, '../../ops/local/.env') });

async function checkColumns() {
  console.log('🔍 Checking columns for frs9_param_commonh...');
  try {
    const result = await legacyConnection`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'frs9_param_commonh'
      ORDER BY ordinal_position;
    `;
    
    console.log('📋 Columns in frs9_param_commonh:');
    result.forEach(row => {
      console.log(`  - ${row.column_name} (${row.data_type})`);
    });

    const hasIsActive = result.some(r => r.column_name === 'is_active');
    const hasActiveFlag = result.some(r => r.column_name === 'active_flag');

    console.log('\n📊 Findings:');
    console.log(`  - has 'is_active': ${hasIsActive}`);
    console.log(`  - has 'active_flag': ${hasActiveFlag}`);

    if (hasActiveFlag && !hasIsActive) {
      console.log('✅ HYPOTHESIS CONFIRMED: Table uses active_flag but schema expects is_active');
    } else if (hasIsActive) {
      console.log('❌ HYPOTHESIS REJECTED: Table already has is_active');
    } else {
      console.log('⚠️ Neither column found!');
    }

  } catch (error) {
    console.error('❌ Error checking columns:', error);
  } finally {
    await legacyConnection.end();
  }
}

checkColumns();
