import postgres from 'postgres';

export async function run(args: string[] = []) {
    const sql = postgres(process.env.DB_URL || 'postgresql://postgres:postgres@10.8.0.2:5433/ifrspro_platform_admin');

    try {
        console.log('--- Checking core.users for bank_id ---');
        const bankIdCol = await sql`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_schema = 'core' AND table_name = 'users' AND column_name = 'bank_id'
        `;

        if (bankIdCol.length === 0) {
            console.log('Adding bank_id column...');
            await sql`ALTER TABLE core.users ADD COLUMN bank_id character varying(50)`;
        } else {
            console.log('bank_id already exists.');
        }

        console.log('--- Checking core.users for other banking columns ---');
        const columns = [
            { name: 'banking_access', type: 'character varying(20)', default: "'CONVENTIONAL'" },
            { name: 'syariah_certified', type: 'boolean', default: 'false' },
            { name: 'syariah_certification', type: 'boolean', default: 'false' },
            { name: 'syariah_certification_date', type: 'date' }
        ];

        for (const col of columns) {
            const check = await sql`
                SELECT column_name 
                FROM information_schema.columns 
                WHERE table_schema = 'core' AND table_name = 'users' AND column_name = ${col.name}
            `;
            if (check.length === 0) {
                console.log(`Adding ${col.name} column...`);
                let query = `ALTER TABLE core.users ADD COLUMN ${col.name} ${col.type}`;
                if (col.default) {
                    query += ` DEFAULT ${col.default}`;
                }
                await sql.unsafe(query);
            } else {
                console.log(`${col.name} already exists.`);
            }
        }

        console.log('Success: All missing columns added.');

    } catch (err) {
        console.error('Error:', err);
    } finally {
        await sql.end();
    }
}
