const { Client } = require('pg');
const client = new Client({
    connectionString: 'postgresql://postgres:postgres@host.docker.internal:5432/ifrspro_platform_admin'
});
async function run() {
    await client.connect();
    try {
        // Try to update first
        const res = await client.query(`UPDATE users SET password_hash = crypt('1019181716', gen_salt('bf', 12)), is_platform_admin = true, is_active = true WHERE email = 'demo@ristix.pro'`);
        if (res.rowCount === 0) {
            // Insert if not exists
            await client.query(`
                INSERT INTO users (id, email, username, full_name, password_hash, is_active, is_platform_admin)
                VALUES (gen_random_uuid(), 'demo@ristix.pro', 'demo_admin', 'Demo Platform Admin', crypt('1019181716', gen_salt('bf', 12)), true, true)
            `);
            console.log("Inserted demo@ristix.pro");
        } else {
            console.log("Updated demo@ristix.pro");
        }
    } catch (e) {
        console.error("DB Error:", e);
    }
    await client.end();
}
run();
