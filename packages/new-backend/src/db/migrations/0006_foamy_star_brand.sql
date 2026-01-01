CREATE TABLE "ifrs9"."pd_configurations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"model_name" varchar(255) NOT NULL,
	"population_segment" integer NOT NULL,
	"population_segment_desc" varchar(255),
	"selected_method" integer NOT NULL,
	"selected_method_desc" varchar(100),
	"migration_interval" integer DEFAULT 0,
	"population_type" integer,
	"population_type_desc" varchar(100),
	"historical_month" integer DEFAULT 0,
	"first_historical_date" timestamp,
	"first_historical_date_string" varchar(50),
	"multiplication" integer,
	"multiplication_string" varchar(20),
	"fl_flag" boolean DEFAULT false NOT NULL,
	"fl_scalar_id" uuid,
	"fl_scalar" varchar(255),
	"ia_flag" boolean DEFAULT false NOT NULL,
	"bucket" varchar(50) NOT NULL,
	"bucket_desc" varchar(255),
	"is_active" boolean DEFAULT true NOT NULL,
	"seq" integer DEFAULT 1,
	"created_by" uuid,
	"updated_by" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"created_host" varchar(255),
	"updated_host" varchar(255)
);
--> statement-breakpoint
ALTER TABLE "ifrs9"."pd_configurations" ADD CONSTRAINT "pd_configurations_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "core"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ifrs9"."pd_configurations" ADD CONSTRAINT "pd_configurations_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "core"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ifrs9"."pd_configurations" ADD CONSTRAINT "pd_configurations_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "core"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_pd_config_tenant" ON "ifrs9"."pd_configurations" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "idx_pd_config_segment" ON "ifrs9"."pd_configurations" USING btree ("population_segment");--> statement-breakpoint
CREATE INDEX "idx_pd_config_method" ON "ifrs9"."pd_configurations" USING btree ("selected_method");--> statement-breakpoint
CREATE INDEX "idx_pd_config_bucket" ON "ifrs9"."pd_configurations" USING btree ("bucket");--> statement-breakpoint
CREATE INDEX "idx_pd_config_active" ON "ifrs9"."pd_configurations" USING btree ("is_active");--> statement-breakpoint
CREATE UNIQUE INDEX "unique_model_name_per_tenant" ON "ifrs9"."pd_configurations" USING btree ("tenant_id","model_name");