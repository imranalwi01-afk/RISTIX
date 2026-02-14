
import { env } from '../src/config/env';

async function checkApi() {
    const ports = [4232, 3001, 3000];
    const path = '/api/v1/banking/business-settings/tables';

    console.log('🧪 Checking API for Table Dropdown Data...');

    for (const port of ports) {
        const url = `http://localhost:${port}${path}`;
        console.log(`\n🔗 Trying ${url}...`);
        try {
            const response = await fetch(url);
            if (response.ok) {
                const json: any = await response.json();
                console.log(`✅ Success on port ${port}!`);
                console.log('📦 Status:', response.status);
                console.log('📄 Data length:', json.data?.length);
                if (json.data && json.data.length > 0) {
                    console.log('🔍 First item:', json.data[0]);
                } else {
                    console.log('⚠️ Data is empty!');
                }
                return;
            } else {
                console.log(`❌ Failed on port ${port}: ${response.status} ${response.statusText}`);
            }
        } catch (error: any) {
            console.log(`❌ Error on port ${port}: ${error.message}`);
            if (error.cause) console.log('   Cause:', error.cause);
        }
    }

    console.log('\n❌ Could not connect to any port.');
}

checkApi();
