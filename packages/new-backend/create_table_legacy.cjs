const { Client } = require('pg');

const client = new Client({
  connectionString: process.env.LEGACY_DATABASE_URL // FIXED TO USE LEGACY DB
});

async function run() {
  try {
    await client.connect();
    
    // Create sequence if it doesn't exist
    await client.query(`
      CREATE SEQUENCE IF NOT EXISTS frs9_r_pd_afl_id_seq;
    `);

    // Create table
    await client.query(`
      CREATE TABLE IF NOT EXISTS public.frs9_r_pd_afl (
        id integer NOT NULL DEFAULT nextval('frs9_r_pd_afl_id_seq'::regclass),
        request_id character varying(50),
        prc_date date,
        model_id integer NOT NULL,
        model_name character varying(255),
        model_status character varying(50) DEFAULT 'DRAFT'::character varying,
        dependent_variable character varying(100),
        r_squared double precision,
        mape double precision,
        data_file bytea,
        status character varying(50) DEFAULT 'ACTIVE'::character varying,
        is_deleted boolean DEFAULT false,
        created_date timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
        updated_date timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
        created_by character varying(100),
        updated_by character varying(100),
        CONSTRAINT frs9_r_pd_afl_pkey PRIMARY KEY (id)
      );
    `);

    console.log("Table frs9_r_pd_afl successfully created in LEGACY DB!");
  } catch (err) {
    console.error("Error creating table in LEGACY DB:", err);
  } finally {
    await client.end();
  }
}

run();
