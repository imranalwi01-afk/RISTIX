
import { login } from '../src/services/auth.service';
import { Effect } from 'effect';
import { env } from '../src/config/env';

async function verifyLogin() {
    console.log('🧪 Verifying Login Configuration...');
    console.log(`📡 Database Host: ${env.DB_HOST}`);
    console.log(`🔌 Database Port: ${env.DB_PORT}`);
    
    const email = 'testadmin@example.com';
    const password = 'password123';

    console.log(`👤 Attempting login for: ${email}`);

    try {
        const program = login({ email, password });
        const result = await Effect.runPromise(program);
        
        console.log('\n✅ Login SUCCESSFUL!');
        console.log('--------------------------------------------------');
        console.log(`User ID: ${result.user.id}`);
        console.log(`Email:   ${result.user.email}`);
        console.log(`Role:    ${(result.user as any).role || 'N/A'}`);
        console.log(`Token:   ${result.tokens.accessToken.substring(0, 20)}...`);
        console.log('--------------------------------------------------');
        
        process.exit(0);
    } catch (error: any) {
        console.error('\n❌ Login FAILED');
        console.error('--------------------------------------------------');
        console.error('Error:', error.message || error);
        
        if (error._tag === 'AuthenticationError') {
             console.error('Reason: Invalid credentials. Check if user exists in the configured database.');
        } else if (error.code === 'ECONNREFUSED' || error.message.includes('connect')) {
             console.error('Reason: Database connection failed. Check DB_HOST and DB_PORT.');
        }

        console.log('--------------------------------------------------');
        console.log('Troubleshooting:');
        console.log('1. Ensure .env file has correct DB_HOST/DB_PORT');
        console.log('2. Ensure database is running and accessible');
        console.log('3. Ensure user exists in platform_admin.users table');
        
        process.exit(1);
    }
}

verifyLogin();
