
import * as dotenv from 'dotenv';
import path from 'path';
import { Pool } from 'pg';
import bcrypt from 'bcryptjs';

// Load .env file manually
const envPath = path.resolve(__dirname, '../../.env');
console.log(`Loading .env from: ${envPath}`);
dotenv.config({ path: envPath });

async function checkUser() {
  let pool;
  try {
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
    const query = 'SELECT * FROM platform_admin.users WHERE email = $1';
    const result = await pool.query(query, [email]);

    if (result.rows.length > 0) {
        console.log('User found:');
        console.log(JSON.stringify(result.rows[0], null, 2));
        
        const passwordStart = 'password123';
        const hashedPassword = result.rows[0].password_hash;
        console.log(`Comparing '${passwordStart}' with hash '${hashedPassword}'...`);
        
        const valid = await bcrypt.compare(passwordStart, hashedPassword);
        console.log('Password valid:', valid);
        
    } else {
        console.log('User NOT found.');
    }

  } catch (error) {
    console.error('Error checking user:', error);
  } finally {
    if (pool) await pool.end();
    process.exit();
  }
}

checkUser();
