
import * as dotenv from 'dotenv';
import path from 'path';
import { Pool } from 'pg';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

// Load .env file manually
const envPath = path.resolve(__dirname, '../../.env');
console.log(`Loading .env from: ${envPath}`);
dotenv.config({ path: envPath });

async function createPlatformAdmin() {
  let pool;
  try {
    const { default: databaseManager } = await import('../config/database');
    // We can't easily use databaseManager for raw SQL on platform_admin if models aren't set up.
    // So we'll use pg Pool directly with config.

    const { backendEnvironmentLoader } = await import('../config/environment-loader-backend');
    const config = backendEnvironmentLoader.getConfiguration();
    const iafDbConfig = config.database;

    console.log('Connecting to Platform DB...');
    pool = new Pool({
        host: iafDbConfig.platform.host,
        port: iafDbConfig.platform.port,
        database: iafDbConfig.platform.database,
        user: iafDbConfig.platform.user,
        password: iafDbConfig.platform.password,
        ssl: iafDbConfig.platform.ssl ? {
          rejectUnauthorized: false
        } : false
    });

    const email = 'testadmin@example.com';
    const password = 'password123';
    const hashedPassword = await bcrypt.hash(password, 12);
    const userId = uuidv4();

    // Check if user exists
    const checkQuery = 'SELECT id FROM platform_admin.users WHERE email = $1';
    const checkResult = await pool.query(checkQuery, [email]);

    if (checkResult.rows.length > 0) {
        console.log('User already exists, updating password...');
        const updateQuery = 'UPDATE platform_admin.users SET password_hash = $1 WHERE email = $2';
        await pool.query(updateQuery, [hashedPassword, email]);
        console.log('Password updated.');
    } else {
        console.log('Creating new platform admin user...');
        const insertQuery = `
            INSERT INTO platform_admin.users 
            (id, username, email, password_hash, full_name, role, is_active, created_at, updated_at)
            VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
        `;
        await pool.query(insertQuery, [
            userId,
            'testadmin',
            email,
            hashedPassword,
            'Test Admin',
            'PLATFORM_SUPER_ADMIN',
            true
        ]);
        console.log(`User ${email} created.`);
    }

  } catch (error) {
    console.error('Error creating platform admin:', error);
  } finally {
    if (pool) await pool.end();
    process.exit();
  }
}

createPlatformAdmin();
