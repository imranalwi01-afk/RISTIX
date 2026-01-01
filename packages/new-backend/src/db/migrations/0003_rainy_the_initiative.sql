CREATE TABLE "ifrs9"."rule_base_setting_details" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"rule_id" uuid NOT NULL,
	"query_group" integer DEFAULT 1 NOT NULL,
	"seq" integer DEFAULT 1 NOT NULL,
	"table_name" varchar(100) NOT NULL,
	"column_name" varchar(100) NOT NULL,
	"data_type" varchar(50) NOT NULL,
	"operator" varchar(20) NOT NULL,
	"value1" varchar(255),
	"value2" varchar(255),
	"condition" varchar(10) DEFAULT 'AND' NOT NULL,
	"detail_type" integer,
	"stage_from" integer,
	"stage_to" integer,
	"created_by" uuid,
	"updated_by" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ifrs9"."rule_base_setting_headers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"rule_name" varchar(100) NOT NULL,
	"rule_type" varchar(50) NOT NULL,
	"updated_table" varchar(100) NOT NULL,
	"updated_column" varchar(100) NOT NULL,
	"value" varchar(255) NOT NULL,
	"seq" integer DEFAULT 1,
	"active_flag" boolean DEFAULT true NOT NULL,
	"description" text,
	"detail_count" integer DEFAULT 0,
	"created_by" uuid,
	"updated_by" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "ifrs9"."rule_base_setting_details" ADD CONSTRAINT "rule_base_setting_details_rule_id_rule_base_setting_headers_id_fk" FOREIGN KEY ("rule_id") REFERENCES "ifrs9"."rule_base_setting_headers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ifrs9"."rule_base_setting_details" ADD CONSTRAINT "rule_base_setting_details_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "core"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ifrs9"."rule_base_setting_details" ADD CONSTRAINT "rule_base_setting_details_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "core"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ifrs9"."rule_base_setting_headers" ADD CONSTRAINT "rule_base_setting_headers_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "core"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ifrs9"."rule_base_setting_headers" ADD CONSTRAINT "rule_base_setting_headers_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "core"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ifrs9"."rule_base_setting_headers" ADD CONSTRAINT "rule_base_setting_headers_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "core"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_rule_details_rule" ON "ifrs9"."rule_base_setting_details" USING btree ("rule_id");--> statement-breakpoint
CREATE INDEX "idx_rule_details_group" ON "ifrs9"."rule_base_setting_details" USING btree ("query_group");--> statement-breakpoint
CREATE INDEX "idx_rule_details_table" ON "ifrs9"."rule_base_setting_details" USING btree ("table_name");--> statement-breakpoint
CREATE INDEX "idx_rule_details_seq" ON "ifrs9"."rule_base_setting_details" USING btree ("rule_id","seq");--> statement-breakpoint
CREATE INDEX "idx_rule_headers_tenant" ON "ifrs9"."rule_base_setting_headers" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "idx_rule_headers_type" ON "ifrs9"."rule_base_setting_headers" USING btree ("rule_type");--> statement-breakpoint
CREATE INDEX "idx_rule_headers_active" ON "ifrs9"."rule_base_setting_headers" USING btree ("active_flag");--> statement-breakpoint
CREATE INDEX "idx_rule_headers_table" ON "ifrs9"."rule_base_setting_headers" USING btree ("updated_table");--> statement-breakpoint
CREATE INDEX "idx_rule_headers_seq" ON "ifrs9"."rule_base_setting_headers" USING btree ("seq");--> statement-breakpoint
CREATE UNIQUE INDEX "unique_rule_name_per_tenant" ON "ifrs9"."rule_base_setting_headers" USING btree ("tenant_id","rule_name");