const { Client } = require('pg');
const client = new Client({ connectionString: 'postgresql://postgres:postgres@10.8.0.2:5433/ifrspro_tenant_iaf' });
client.connect().then(() => {
    return client.query("SELECT relname, relkind FROM pg_class WHERE relname LIKE '%pd_structure%';");
}).then(res => {
    console.log('Relations found:', res.rows);
}).catch(err => {
    console.log('ERROR:', err.message);
}).finally(() => {
    client.end();
});
