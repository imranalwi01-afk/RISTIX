
import postgres from 'postgres';

async function checkLocalDb() {
    console.log('📡 Connecting to localhost:5432...');
    // Try to connect to postgres db first to list others, or directly to ifrspro_platform_admin
    const sql = postgres('postgresql://postgres:postgres@localhost:5432/postgres');

    try {
        const dbs = await sql`SELECT datname FROM pg_database WHERE datistemplate = false`;
        console.log('📂 Databases:', dbs.map(d => d.datname));

        // Check if ifrspro_platform_admin exists
        if (dbs.find(d => d.datname === 'ifrspro_platform_admin')) {
             console.log('✅ ifrspro_platform_admin found');
             const sqlPlatform = postgres('postgresql://postgres:postgres@localhost:5432/ifrspro_platform_admin');
             const users = await sqlPlatform`SELECT email FROM platform_admin.users`;
             console.log('👥 Users in platform_admin:', users.map(u => u.email));
             await sqlPlatform.end();
        } else {
            console.log('❌ ifrspro_platform_admin NOT found');
        }

    } catch (error) {
        console.error('❌ Connection failed:', error);
    } finally {
        await sql.end();
    }
}

checkLocalDb();
