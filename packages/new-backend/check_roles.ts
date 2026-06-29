import pg from 'pg';
const { Client } = pg;

const client = new Client({
    connectionString: 'postgresql://postgres:postgres@10.8.0.2:5433/ifrspro_tenant_iaf'
});

async function run() {
    await client.connect();
    try {
        const res = await client.query(`
            INSERT INTO core.roles (role_code, role_name, description, hierarchy_level, max_impact_level, tenant_id)
            VALUES ('TEST_NEW_ROLE_123', 'TEST_NEW_ROLE_123', 'Test', 1, 'low', 'f7b3a087-8a42-40c4-baca-9dc92cc0a2be')
            RETURNING *;
        `);
        console.log("Inserted:", res.rows[0]);
    } catch(err) {
        console.error("error:", err);
    }
    await client.end();
}

run().catch(console.error);
