
async function testHash() {
    console.log('🧪 Testing password hash...');
    const password = 'password123';
    // This is the hash from check-user-db.ts output
    const hash = '$2a$12$fscA39C1S6nEhxm5hGL1aOJbQgNEz6Oyp51VDY9gFaeoVX5pOBdQO'; 

    try {
        const valid = await Bun.password.verify(password, hash);
        console.log('✅ Password valid:', valid);
    } catch (error) {
        console.error('❌ Verification failed:', error);
    }
}

testHash();
