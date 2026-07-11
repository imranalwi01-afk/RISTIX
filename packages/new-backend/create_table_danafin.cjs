const { Client } = require('pg');

const client = new Client({
  user: 'admin_iaf',
  host: 'pgm-d9j5id443p7876n9.pgsql.ap-southeast-5.rds.aliyuncs.com',
  database: 'FRS9PRO',
  password: 'P@ssw0rd2025!',
  port: 5432,
});

async function createTable() {
  try {
    await client.connect();
    console.log('Connected to Ristix PostgreSQL database.');

    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS public.frs9_r_pd_afl (
          id SERIAL PRIMARY KEY,
          model_id INTEGER,
          model_name VARCHAR(255),
          r_squared NUMERIC(10,4),
          mape NUMERIC(10,4),
          model_status VARCHAR(50),
          data_file BYTEA,
          created_by VARCHAR(100),
          created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_date TIMESTAMP,
          is_deleted BOOLEAN DEFAULT FALSE
      );
    `;

    await client.query(createTableQuery);
    console.log('Successfully created frs9_r_pd_afl table in Ristix database!');
  } catch (err) {
    console.error('Error creating table:', err);
  } finally {
    await client.end();
  }
}

createTable();
