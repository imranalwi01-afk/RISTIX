
import { login } from './src/services/auth.service';
import { Effect } from 'effect';

async function testLogin() {
    console.log('🧪 Testing login...');
    const email = 'testadmin@example.com';
    const password = 'password123';

    try {
        const program = login({ email, password });
        const result = await Effect.runPromise(program);
        console.log('✅ Login successful!');
        console.log('User:', result.user.email);
        console.log('Token:', result.tokens.accessToken.substring(0, 20) + '...');
    } catch (error) {
        console.error('❌ Login failed:', error);
    }
}

testLogin();
