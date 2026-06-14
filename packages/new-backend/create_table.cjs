const { Client } = require('pg');

const client = new Client({
  connectionString: process.env.DATABASE_URL
});

const sql = `
CREATE TABLE IF NOT EXISTS "frs9_r_pd_afl" (
	"id" serial PRIMARY KEY NOT NULL,
	"request_id" varchar(100),
	"model_id" integer,
	"model_name" varchar(255),
	"model_status" varchar(50),
	"dependent_variable" varchar(100),
	"r_squared" double precision,
	"mape" double precision,
	"data_file" bytea,
	"is_deleted" boolean DEFAULT false,
	"created_date" timestamp DEFAULT now(),
	"updated_date" timestamp,
	"created_by" varchar(100),
	"updated_by" varchar(100)
);
`;

async function run() {
  try {
    await client.connect();
    console.log('Connected to DB...');
    await client.query(sql);
    console.log('Table frs9_r_pd_afl successfully created!');
  } catch (error) {
    console.error('Error creating table:', error);
  } finally {
    await client.end();
  }
}

run();
