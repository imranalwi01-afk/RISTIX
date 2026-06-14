const crypto = require('crypto');
const p = require('pg');
const tenantDbUrl = 'postgresql://postgres:postgres@10.8.0.2:5433/ifrspro_tenant_iaf';

async function main() {
    const rawToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');

    const tClient = new p.Client({ connectionString: tenantDbUrl });
    await tClient.connect();
    
    try {
        await tClient.query(`
            INSERT INTO auth.password_reset_tokens (user_id, token, expires_at)
            VALUES ($1, $2, NOW() + INTERVAL '30 minutes')
        `, ['e4032026-0917-45ad-b065-7ad338733fa1', hashedToken]);
        console.log(`Reset Link: http://localhost:4231/reset-password?token=${rawToken}&email=imranalwi8@gmail.com`);
    } catch (err) {
        console.error('Error tenantDb:', err);
    }
    await tClient.end();
}

main().catch(console.error);
