import { legacyDb as db } from './packages/new-backend/src/config';
import { sql } from 'drizzle-orm';

async function updateColumnLengths() {
    try {
        console.log('🚀 Updating column lengths in frs9_param_product...');
        
        await db.execute(sql`
            ALTER TABLE frs9_param_product 
            ALTER COLUMN data_source TYPE VARCHAR(50),
            ALTER COLUMN prd_group TYPE VARCHAR(50),
            ALTER COLUMN prd_type TYPE VARCHAR(50),
            ALTER COLUMN prd_code TYPE VARCHAR(50),
            ALTER COLUMN currency TYPE VARCHAR(10),
            ALTER COLUMN amortization_type TYPE VARCHAR(50),
            ALTER COLUMN al_flag TYPE VARCHAR(50);
        `);
        
        console.log('✅ Success! Column lengths updated to 50.');
        
        // Verify
        const verifyQuery = sql`
            SELECT column_name, character_maximum_length 
            FROM information_schema.columns 
            WHERE table_name = 'frs9_param_product' 
            AND column_name IN ('amortization_type', 'al_flag', 'prd_group', 'prd_type', 'data_source', 'currency')
        `;
        const result = await db.execute(verifyQuery);
        console.log('--- New Column Lengths ---');
        console.log(JSON.stringify(result, null, 2));
        
    } catch (err) {
        console.error('❌ Error updating columns:', err);
    }
    process.exit(0);
}

updateColumnLengths();
