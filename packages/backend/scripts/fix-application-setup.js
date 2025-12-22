#!/usr/bin/env node

// Fix Application Setup data in FRS9PRO database
// This script adds missing param_type = 'A' parameters for Application Setup

const { Sequelize } = require('sequelize');
const path = require('path');
const fs = require('fs');

// Load centralized configuration
const { backendEnvironmentLoader } = require('../dist/config/environment-loader-backend');

async function fixApplicationSetup() {
  console.log('🔧 Starting Application Setup data fix...');

  try {
    // Get centralized configuration
    const config = backendEnvironmentLoader.getConfiguration();
    const frs9Config = config.database.frs9;

    console.log(`📊 Connecting to FRS9 database: ${frs9Config.database} at ${frs9Config.host}:${frs9Config.port}`);

    // Create Sequelize instance with centralized configuration
    const sequelize = new Sequelize(
      frs9Config.database,
      frs9Config.user,
      frs9Config.password,
      {
        host: frs9Config.host,
        port: frs9Config.port,
        dialect: 'postgres',
        logging: true,
        ssl: frs9Config.ssl ? {
          require: true,
          rejectUnauthorized: false
        } : false,
        pool: {
          max: 5,
          min: 1,
          acquire: 30000,
          idle: 10000
        }
      }
    );

    // Test connection
    await sequelize.authenticate();
    console.log('✅ Database connection established successfully');

    // Read SQL file
    const sqlPath = path.join(__dirname, 'fix-application-setup-v2.sql');
    const sqlContent = fs.readFileSync(sqlPath, 'utf8');

    // Execute SQL
    console.log('🚀 Executing Application Setup fix...');
    await sequelize.query(sqlContent);

    console.log('✅ Application Setup fix completed successfully');

    // Verify the results
    console.log('📋 Verification - Parameter type distribution:');
    const paramTypeCount = await sequelize.query(`
      SELECT param_type, COUNT(*) as count
      FROM frs9_param_commonh
      GROUP BY param_type
      ORDER BY param_type
    `);

    console.table(paramTypeCount[0]);

    console.log('📋 Verification - Application Setup parameters (param_type = A):');
    const appParams = await sequelize.query(`
      SELECT
        h.param_code,
        h.param_name,
        COUNT(d.pkid) as detail_count
      FROM frs9_param_commonh h
      LEFT JOIN frs9_param_commond d ON h.param_code = d.param_code
      WHERE h.param_type = 'A'
      GROUP BY h.param_code, h.param_name
      ORDER BY h.param_code
    `);

    console.table(appParams[0]);

    // Close connection
    await sequelize.close();
    console.log('✅ Database connection closed');

  } catch (error) {
    console.error('❌ Error fixing Application Setup:', error);
    process.exit(1);
  }
}

// Run the fix
if (require.main === module) {
  fixApplicationSetup();
}

module.exports = { fixApplicationSetup };