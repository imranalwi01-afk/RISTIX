#!/usr/bin/env ts-node
// packages/backend/src/scripts/test-db-connection.ts
// ============================================================================
// DATABASE CONNECTION TEST SCRIPT - Verify all connections work
// ============================================================================

import { Pool } from 'pg';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function testDatabaseConnections() {
  console.log('🧪 Testing Database Connections...\n');

  // Test configurations
  const connections = [
    {
      name: 'Platform Admin',
      config: {
        host: String(process.env.DB_HOST || 'localhost').trim(),
        port: parseInt(String(process.env.DB_PORT || '5432')),
        database: 'ifrspro_platform_admin',
        user: String(process.env.DB_USER || 'postgres').trim(),
        password: String(process.env.DB_PASSWORD || 'postgres').trim(),
      }
    },
    {
      name: 'Shared Services', 
      config: {
        host: String(process.env.DB_HOST || 'localhost').trim(),
        port: parseInt(String(process.env.DB_PORT || '5432')),
        database: 'ifrspro_shared_services',
        user: String(process.env.DB_USER || 'postgres').trim(),
        password: String(process.env.DB_PASSWORD || 'postgres').trim(),
      }
    },
    {
      name: 'FRS9PRO (DS2)',
      config: {
        host: String(process.env.FRS9_DB_HOST || '192.168.0.106').trim(),
        port: parseInt(String(process.env.FRS9_DB_PORT || '5433')),
        database: String(process.env.FRS9_DB_NAME || 'FRS9PRO').trim(),
        user: String(process.env.FRS9_DB_USER || 'postgres').trim(),
        password: String(process.env.FRS9_DB_PASSWORD || 'postgres').trim(),
      }
    }
  ];

  let allPassed = true;

  for (const { name, config } of connections) {
    try {
      console.log(`🔗 Testing ${name}...`);
      console.log(`   Host: ${config.host}:${config.port}`);
      console.log(`   Database: ${config.database}`);
      console.log(`   User: ${config.user}`);
      console.log(`   Password: ${config.password.substring(0, 3)}***`);

      // Validate parameters are strings
      if (typeof config.host !== 'string') {
        throw new Error(`Host is not a string: ${typeof config.host} - ${config.host}`);
      }
      if (typeof config.database !== 'string') {
        throw new Error(`Database is not a string: ${typeof config.database} - ${config.database}`);
      }
      if (typeof config.user !== 'string') {
        throw new Error(`User is not a string: ${typeof config.user} - ${config.user}`);
      }
      if (typeof config.password !== 'string') {
        throw new Error(`Password is not a string: ${typeof config.password} - ${config.password}`);
      }

      const pool = new Pool({
        ...config,
        connectionTimeoutMillis: 10000,
        idleTimeoutMillis: 30000,
        max: 1
      });

      const client = await pool.connect();
      await client.query('SELECT 1 as test');
      client.release();
      await pool.end();

      console.log(`   ✅ ${name}: Connection successful\n`);
      
    } catch (error) {
      console.error(`   ❌ ${name}: Connection failed`);
      console.error(`   Error: ${error instanceof Error ? error.message : error}\n`);
      allPassed = false;
    }
  }

  if (allPassed) {
    console.log('🎉 All database connections successful!');
  } else {
    console.log('❌ Some database connections failed!');
    process.exit(1);
  }
}

// Run the test
testDatabaseConnections().catch(console.error);