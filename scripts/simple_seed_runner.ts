import { postgres } from 'https://deno.land/x/postgresjs@v3.4.4/mod.ts';
import { readFileSync } from 'https://deno.land/std@0.224.0/fs/mod.ts';

// Database connection
const databaseUrl = Deno.env.get('DATABASE_URL') || 'postgresql://postgres:postgres@localhost:5432/frs9pro';
const sql = postgres(databaseUrl, { ssl: false });

async function runSeedData() {
    try {
        console.log('🌱 Starting seed data execution...');
        
        // Read and execute master account seed
        console.log('📊 Executing master account seed...');
        const masterSQL = readFileSync('./seed_master_account_data.sql', { encoding: 'utf8' });
        await sql.unsafe(masterSQL);
        console.log('✅ Master account seed executed successfully');
        
        // Read and execute individual impairment seed
        console.log('📊 Executing individual impairment seed...');
        const impairmentSQL = readFileSync('./seed_individual_impairment_data.sql', { encoding: 'utf8' });
        await sql.unsafe(impairmentSQL);
        console.log('✅ Individual impairment seed executed successfully');
        
        console.log('🎉 All seed data executed successfully!');
        
        // Verify data was inserted
        console.log('🔍 Verifying data insertion...');
        
        const masterCount = await sql`SELECT COUNT(*) as count FROM frs9_master_account WHERE account_id BETWEEN 900000001 AND 900000100`;
        console.log(`📊 Master accounts created: ${masterCount[0].count}`);
        
        const impairmentCount = await sql`SELECT COUNT(*) as count FROM frs9_imp_ia_header WHERE ia_id BETWEEN 1000 AND 1100`;
        console.log(`📊 Impairment records created: ${impairmentCount[0].count}`);
        
    } catch (error) {
        console.error('❌ Seed execution failed:', error);
        Deno.exit(1);
    } finally {
        await sql.end();
    }
}

runSeedData();
