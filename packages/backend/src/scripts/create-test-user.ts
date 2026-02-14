
import * as dotenv from 'dotenv';
import path from 'path';

// Load .env file manually
const envPath = path.resolve(__dirname, '../../.env');
console.log(`Loading .env from: ${envPath}`);
dotenv.config({ path: envPath });

async function createTestUser() {
  try {
    // Dynamic import to ensure env is loaded before models
    const { modelManager, User } = await import('../models');
    const { default: databaseManager } = await import('../config/database');
    const bcrypt = (await import('bcryptjs')).default;

    console.log('Initializing database...');
    await databaseManager.initializeConnections();
    await modelManager.initializeModels();

    const email = 'testadmin@example.com';
    const password = 'password123';
    const hashedPassword = await bcrypt.hash(password, 12);

    // Check if user exists
    const existing = await User.findOne({ where: { email } });
    if (existing) {
        console.log('Test user already exists. Updating password...');
        await existing.update({ password: hashedPassword });
    } else {
        console.log('Creating test user...');
        await User.create({
            email,
            password: hashedPassword,
            fullName: 'Test Admin',
            stakeholderType: 'platform_admin',
            role: 'PLATFORM_SUPER_ADMIN',
            isActive: true,
            preferences: {}
        });
    }
    
    console.log(`Test user ${email} prepare with password ${password}`);

  } catch (error) {
    console.error('Error creating test user:', error);
  } finally {
    process.exit();
  }
}

createTestUser();
