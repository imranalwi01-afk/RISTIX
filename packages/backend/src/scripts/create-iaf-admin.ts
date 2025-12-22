// packages/backend/src/scripts/create-iaf-admin.ts
// Simple script to create IAF admin user directly in database

import bcrypt from 'bcryptjs';
import { Pool } from 'pg';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Database configuration from environment
const dbConfig = {
  host: process.env.TENANT_DB_HOST || '192.168.0.85',
  port: parseInt(process.env.TENANT_DB_PORT || '5432'),
  database: process.env.TENANT_DB_NAME || 'ifrspro_tenant_iaf',
  user: process.env.TENANT_DB_USER || 'postgres',
  password: process.env.TENANT_DB_PASSWORD || 'postgres',
  ssl: process.env.TENANT_DB_SSL === 'true'
};

// IAF Admin user configuration
const IAF_ADMIN = {
  email: 'admin@iaf.co.id',
  password: '1019181716',
  fullName: 'IAF System Administrator',
  role: 'PLATFORM_SUPER_ADMIN',
  stakeholderType: 'platform_admin',
  department: 'IT',
  position: 'System Administrator',
  isActive: true
};

async function createIAFAdmin(): Promise<void> {
  let pool: Pool | null = null;

  try {
    console.log('🔧 Creating IAF admin user...');
    console.log('Database config:', {
      host: dbConfig.host,
      port: dbConfig.port,
      database: dbConfig.database,
      user: dbConfig.user,
      ssl: dbConfig.ssl
    });

    // Create database connection pool
    pool = new Pool(dbConfig);

    // Test connection
    const client = await pool.connect();
    console.log('✅ Database connection established');

    // Check if users table exists
    const tableCheckResult = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_schema = 'core'
        AND table_name = 'users'
      );
    `);

    if (!tableCheckResult.rows[0].exists) {
      console.log('❌ Users table does not exist. Please run database migrations first.');
      client.release();
      return;
    }

    console.log('✅ Users table exists');

    // Check if admin user already exists
    const existingUserResult = await client.query(`
      SELECT id FROM core.users WHERE email = $1
    `, [IAF_ADMIN.email]);

    if (existingUserResult.rows.length > 0) {
      console.log(`⚠️ Admin user ${IAF_ADMIN.email} already exists`);
      client.release();
      return;
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(IAF_ADMIN.password, 12);
    console.log('🔒 Password hashed successfully');

    // Insert the admin user
    const insertResult = await client.query(`
      INSERT INTO core.users (
        id,
        email,
        password,
        full_name,
        stakeholder_type,
        role,
        department,
        position,
        is_active,
        created_at,
        updated_at
      ) VALUES (
        gen_random_uuid(),
        $1,
        $2,
        $3,
        $4,
        $5,
        $6,
        $7,
        $8,
        NOW(),
        NOW()
      ) RETURNING id, email
    `, [
      IAF_ADMIN.email,
      hashedPassword,
      IAF_ADMIN.fullName,
      IAF_ADMIN.stakeholderType,
      IAF_ADMIN.role,
      IAF_ADMIN.department,
      IAF_ADMIN.position,
      IAF_ADMIN.isActive
    ]);

    console.log('✅ IAF admin user created successfully:');
    console.log('   Email:', insertResult.rows[0].email);
    console.log('   Role:', IAF_ADMIN.role);
    console.log('   Password:', IAF_ADMIN.password);

    client.release();

  } catch (error) {
    console.error('❌ Failed to create IAF admin user:', error);
    throw error;
  } finally {
    if (pool) {
      await pool.end();
      console.log('🔌 Database connection closed');
    }
  }
}

// Execute the script
if (require.main === module) {
  createIAFAdmin()
    .then(() => {
      console.log('🎉 IAF admin user creation completed successfully!');
      console.log('\n🔐 LOGIN INFORMATION:');
      console.log('========================');
      console.log(`Email: ${IAF_ADMIN.email}`);
      console.log(`Password: ${IAF_ADMIN.password}`);
      console.log(`Role: ${IAF_ADMIN.role}`);
      console.log('========================');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 IAF admin user creation failed:', error);
      process.exit(1);
    });
}

export default createIAFAdmin;