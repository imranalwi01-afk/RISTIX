// PostgreSQL seed runner for tenant database
const fs = require('fs');
const path = require('path');

class TenantPostgresClient {
    constructor() {
        // Use tenant database connection from environment
        this.connectionString = `postgresql://${process.env.TENANT_DB_USER}:${process.env.TENANT_DB_PASSWORD}@${process.env.TENANT_DB_HOST}:${process.env.TENANT_DB_PORT}/${process.env.TENANT_DB_NAME}`;
    }

    async connect() {
        const { Client } = require('pg');
        this.client = new Client({
            connectionString: this.connectionString,
            ssl: false
        });
        await this.client.connect();
        console.log('🔗 Connected to tenant database:', process.env.TENANT_DB_NAME);
    }

    async query(sql) {
        return await this.client.query(sql);
    }

    async close() {
        if (this.client) {
            await this.client.end();
        }
    }
}

async function runSeedData() {
    const client = new TenantPostgresClient();

    try {
        await client.connect();
        console.log('🌱 Starting seed data execution for tenant database...');
        
        // Check if tables exist first
        console.log('🔍 Checking table existence...');
        const tableCheck = await client.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name IN ('frs9_master_account', 'frs9_imp_ia_header')
        `);
        
        console.log('📋 Found tables:', tableCheck.rows.map(r => r.table_name));
        
        // Read and execute master account seed
        console.log('📊 Executing master account seed...');
        const masterSQL = fs.readFileSync('./seed_master_account_data.sql', 'utf8');
        await client.query(masterSQL);
        console.log('✅ Master account seed executed successfully');
        
        // Read and execute individual impairment seed
        console.log('📊 Executing individual impairment seed...');
        const impairmentSQL = fs.readFileSync('./seed_individual_impairment_data.sql', 'utf8');
        await client.query(impairmentSQL);
        console.log('✅ Individual impairment seed executed successfully');
        
        console.log('🎉 All seed data executed successfully!');
        
        // Verify data was inserted
        console.log('🔍 Verifying data insertion...');
        
        const masterResult = await client.query("SELECT COUNT(*) as count FROM frs9_master_account WHERE account_id BETWEEN 900000001 AND 900000100");
        console.log(`📊 Master accounts created: ${masterResult.rows[0].count}`);
        
        const impairmentResult = await client.query("SELECT COUNT(*) as count FROM frs9_imp_ia_header WHERE ia_id BETWEEN 1000 AND 1100");
        console.log(`📊 Impairment records created: ${impairmentResult.rows[0].count}`);
        
        // Show sample data
        console.log('📋 Sample master account data:');
        const sampleMaster = await client.query("SELECT account_id, account_number, cif_name, impaired_flag, prc_date FROM frs9_master_account WHERE account_id BETWEEN 900000001 AND 900000005 ORDER BY account_id");
        console.table(sampleMaster.rows);
        
        console.log('📋 Sample impairment data:');
        const sampleImpairment = await client.query("SELECT ia_id, account_id, impaired_flag, status, prc_date FROM frs9_imp_ia_header WHERE ia_id BETWEEN 1001 AND 1005 ORDER BY ia_id");
        console.table(sampleImpairment.rows);
        
    } catch (error) {
        console.error('❌ Seed execution failed:', error);
        process.exit(1);
    } finally {
        await client.close();
    }
}

runSeedData();
