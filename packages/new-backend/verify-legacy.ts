
import { db } from './src/config';
import { frs9ParamCommonh, frs9ImpCaLgdConfig } from './src/db/schema';
import { eq } from 'drizzle-orm';

async function verifyLegacySchema() {
    console.log('Verifying Legacy Schema Access...');

    try {
        console.log('1. Checking frs9ParamCommonh...');
        const params = await db.select().from(frs9ParamCommonh).limit(1);
        console.log('   Success! Found:', params.length, 'records.');
    } catch (e) {
        console.error('   Failed frs9ParamCommonh:', e);
    }

    try {
        console.log('2. Checking frs9ImpCaLgdConfig...');
        const configs = await db.select().from(frs9ImpCaLgdConfig).limit(1);
        if (configs.length > 0) {
            console.log('   Keys found:', Object.keys(configs[0]));
        }
        console.log('   Success! Found:', configs.length, 'records.');
    } catch (e) {
        console.error('   Failed frs9ImpCaLgdConfig:', e);
    }

    process.exit(0);
}

verifyLegacySchema();
