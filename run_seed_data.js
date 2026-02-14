const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Read environment variables
const supabaseUrl = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/frs9pro';
const supabaseKey = process.env.SUPABASE_ANON_KEY || '';

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseKey);

async function runSeedFiles() {
    try {
        console.log('🌱 Starting seed data execution...');
        
        // Read and execute master account seed
        const masterAccountSQL = fs.readFileSync(path.join(__dirname, 'seed_master_account_data.sql'), 'utf8');
        console.log('📊 Executing master account seed...');
        
        const { error: masterError } = await supabase.rpc('exec_sql', { sql: masterAccountSQL });
        if (masterError) {
            console.error('❌ Master account seed failed:', masterError);
        } else {
            console.log('✅ Master account seed executed successfully');
        }
        
        // Read and execute individual impairment seed
        const impairmentSQL = fs.readFileSync(path.join(__dirname, 'seed_individual_impairment_data.sql'), 'utf8');
        console.log('📊 Executing individual impairment seed...');
        
        const { error: impairmentError } = await supabase.rpc('exec_sql', { sql: impairmentSQL });
        if (impairmentError) {
            console.error('❌ Individual impairment seed failed:', impairmentError);
        } else {
            console.log('✅ Individual impairment seed executed successfully');
        }
        
        console.log('🎉 All seed data executed successfully!');
        
    } catch (error) {
        console.error('❌ Seed execution failed:', error);
        process.exit(1);
    }
}

// Alternative: Direct PostgreSQL execution
async function runDirectPostgres() {
    const { Client } = require('pg');
    
    // Connection string from environment
    const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/frs9pro';
    
    const client = new Client({
        connectionString: connectionString,
        ssl: false
    });
    
    try {
        await client.connect();
        console.log('🔗 Connected to database');
        
        // Execute master account seed
        console.log('📊 Executing master account seed...');
        const masterSQL = fs.readFileSync(path.join(__dirname, 'seed_master_account_data.sql'), 'utf8');
        await client.query(masterSQL);
        console.log('✅ Master account seed executed successfully');
        
        // Execute individual impairment seed
        console.log('📊 Executing individual impairment seed...');
        const impairmentSQL = fs.readFileSync(path.join(__dirname, 'seed_individual_impairment_data.sql'), 'utf8');
        await client.query(impairmentSQL);
        console.log('✅ Individual impairment seed executed successfully');
        
        console.log('🎉 All seed data executed successfully!');
        
    } catch (error) {
        console.error('❌ Seed execution failed:', error);
        process.exit(1);
    } finally {
        await client.end();
    }
}

// Run the appropriate method
if (process.env.USE_SUPABASE === 'true') {
    runSeedFiles();
} else {
    runDirectPostgres();
}
