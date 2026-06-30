const { Client } = require('pg');
const client = new Client({ connectionString: 'postgresql://postgres:postgres@10.8.0.2:5433/FRS9PRO' });
client.connect().then(() => {
    return client.query("SELECT table_name FROM information_schema.tables WHERE table_name LIKE '%pd_structure%';");
}).then(res => {
    console.log(res.rows);
}).catch(err => {
    console.log('ERROR:', err.message);
}).finally(() => {
    client.end();
});
