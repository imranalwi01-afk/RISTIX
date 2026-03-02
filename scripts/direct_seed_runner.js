// Direct PostgreSQL seed runner for Node.js environment
const fs = require('fs');
const path = require('path');

// Simple PostgreSQL client using TCP connection
class SimplePostgresClient {
    constructor(connectionString) {
        this.connectionString = connectionString;
    }

    async connect() {
        const { Client } = require('pg');
        this.client = new Client({
            connectionString: this.connectionString,
            ssl: false
        });
        await this.client.connect();
        console.log('🔗 Connected to database');
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
    const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/frs9pro';
    const client = new SimplePostgresClient(connectionString);

    try {
        await client.connect();
        console.log('🌱 Starting seed data execution...');
        
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
        
    } catch (error) {
        console.error('❌ Seed execution failed:', error);
        process.exit(1);
    } finally {
        await client.close();
    }
}

runSeedData();
