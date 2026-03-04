import { Client } from 'pg';
import * as fs from 'fs';

async function main() {
    const client = new Client({
        host: '10.8.0.2',
        port: 5433,
        user: 'postgres',
        password: 'postgres',
        database: 'FRS9PRO'
    });

    try {
        await client.connect();
        
        const res = await client.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'frs9_master_account'
            AND table_schema = 'public'
        `);
        
        fs.writeFileSync('schema.json', JSON.stringify(res.rows, null, 2));
        
    } catch (e) {
        console.error(e);
    } finally {
        await client.end();
    }
}

main();
