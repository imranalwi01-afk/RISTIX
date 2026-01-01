CREATE TABLE IF NOT EXISTS "frs9_imp_ca_lgd_config" (
	"pkid" "smallserial" PRIMARY KEY NOT NULL,
	"lgd_model_name" varchar(250),
	"segment_id" integer,
	"lgd_method" integer,
	"population_type" varchar(20),
	"observation_period" varchar(50),
	"observation_start_date" date,
	"workout_period" integer,
	"fl_flag" boolean DEFAULT false NOT NULL,
	"fl_scalar_id" integer,
	"lgd_rate" double precision,
	"active_flag" boolean DEFAULT true,
	"createdby" varchar(50) DEFAULT 'SYSTEM' NOT NULL,
	"createddate" timestamp DEFAULT now() NOT NULL,
	"createdhost" varchar(50) DEFAULT 'localhost' NOT NULL,
	"updatedby" varchar(50),
	"updateddate" timestamp,
	"updatedhost" varchar(50)
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "frs9_param_commond" (
	"pkid" bigserial PRIMARY KEY NOT NULL,
	"param_code" varchar(50) NOT NULL,
	"param_seq" integer NOT NULL,
	"value1" varchar(100) NOT NULL,
	"value2" varchar(100) NOT NULL,
	"value3" varchar(50) NOT NULL,
	"paramdesc" varchar(1000) NOT NULL,
	"createdby" varchar(50) DEFAULT 'SYSTEM' NOT NULL,
	"createddate" timestamp DEFAULT now() NOT NULL,
	"createdhost" varchar(50) DEFAULT 'localhost' NOT NULL,
	"updatedby" varchar(50),
	"updateddate" timestamp,
	"updatedhost" varchar(50)
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "frs9_param_commonh" (
	"pkid" bigserial PRIMARY KEY NOT NULL,
	"param_code" varchar(10),
	"param_name" varchar(255),
	"param_usage" varchar(255),
	"param_type" varchar(10),
	"createdby" varchar(50) DEFAULT 'SYSTEM' NOT NULL,
	"createddate" timestamp DEFAULT now() NOT NULL,
	"createdhost" varchar(50) DEFAULT 'localhost' NOT NULL,
	"updatedby" varchar(50),
	"updateddate" timestamp,
	"updatedhost" varchar(50),
	"banking_type" varchar(20) DEFAULT 'conventional',
	"is_active" boolean DEFAULT true,
	"requires_approval" boolean DEFAULT false,
	CONSTRAINT "frs9_param_commonh_param_code_unique" UNIQUE("param_code"),
	CONSTRAINT "chk_banking_type" CHECK ((banking_type)::text = ANY (ARRAY[('conventional'::character varying)::text, ('syariah'::character varying)::text, ('dual'::character varying)::text]))
);