CREATE TABLE "ifrs9"."ead_configurations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"model_name" varchar(255) NOT NULL,
	"population_segment_id" uuid NOT NULL,
	"ead_method" varchar(50) NOT NULL,
	"calc_method" varchar(50) NOT NULL,
	"is_active" boolean DEFAULT true,
	"created_by" uuid,
	"updated_by" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now(),
	"created_host" varchar(255),
	"updated_host" varchar(255),
	CONSTRAINT "unique_ead_model_name_per_tenant" UNIQUE("tenant_id","model_name")
);
--> statement-breakpoint
CREATE TABLE "ifrs9"."lgd_configurations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"model_name" varchar(255) NOT NULL,
	"population_segment_id" uuid NOT NULL,
	"lgd_method" integer NOT NULL,
	"population_type" integer,
	"observation_period" integer,
	"historical_month" integer,
	"first_npl_date" date,
	"workout_period" integer,
	"unsecured_lgd" numeric(10, 6),
	"secured_lgd" numeric(10, 6),
	"lgd_rate" numeric(10, 6),
	"is_active" boolean DEFAULT true,
	"created_by" uuid,
	"updated_by" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now(),
	"created_host" varchar(255),
	"updated_host" varchar(255),
	CONSTRAINT "unique_lgd_model_name_per_tenant" UNIQUE("tenant_id","model_name")
);
--> statement-breakpoint
CREATE TABLE "ifrs9"."population_segments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"segment_name" varchar(255) NOT NULL,
	"description" varchar(500),
	"active_flag" boolean DEFAULT true,
	"created_by" uuid,
	"updated_by" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now(),
	"created_host" varchar(255),
	"updated_host" varchar(255)
);
--> statement-breakpoint
DROP INDEX "ifrs9"."unique_bucket_group_per_tenant";--> statement-breakpoint
DROP INDEX "ifrs9"."unique_model_name_per_tenant";--> statement-breakpoint
DROP INDEX "ifrs9"."unique_segment_per_tenant";--> statement-breakpoint
DROP INDEX "ifrs9"."unique_rule_name_per_tenant";--> statement-breakpoint
ALTER TABLE "ifrs9"."bucket_parameter_details" ALTER COLUMN "range_end" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "ifrs9"."bucket_parameter_details" ALTER COLUMN "active_flag" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "ifrs9"."bucket_parameter_details" ALTER COLUMN "updated_at" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "ifrs9"."bucket_parameters" ALTER COLUMN "basis" SET DATA TYPE varchar(50);--> statement-breakpoint
ALTER TABLE "ifrs9"."bucket_parameters" ALTER COLUMN "include_close" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "ifrs9"."bucket_parameters" ALTER COLUMN "include_wo" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "ifrs9"."bucket_parameters" ALTER COLUMN "active_flag" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "ifrs9"."bucket_parameters" ALTER COLUMN "updated_at" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "ifrs9"."bucket_parameter_details" ADD COLUMN "created_host" varchar(255);--> statement-breakpoint
ALTER TABLE "ifrs9"."bucket_parameter_details" ADD COLUMN "updated_host" varchar(255);--> statement-breakpoint
ALTER TABLE "ifrs9"."bucket_parameters" ADD COLUMN "created_host" varchar(255);--> statement-breakpoint
ALTER TABLE "ifrs9"."bucket_parameters" ADD COLUMN "updated_host" varchar(255);--> statement-breakpoint
ALTER TABLE "ifrs9"."ead_configurations" ADD CONSTRAINT "ead_configurations_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "core"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ifrs9"."ead_configurations" ADD CONSTRAINT "ead_configurations_population_segment_id_population_segments_id_fk" FOREIGN KEY ("population_segment_id") REFERENCES "ifrs9"."population_segments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ifrs9"."ead_configurations" ADD CONSTRAINT "ead_configurations_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "core"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ifrs9"."ead_configurations" ADD CONSTRAINT "ead_configurations_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "core"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ifrs9"."lgd_configurations" ADD CONSTRAINT "lgd_configurations_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "core"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ifrs9"."lgd_configurations" ADD CONSTRAINT "lgd_configurations_population_segment_id_population_segments_id_fk" FOREIGN KEY ("population_segment_id") REFERENCES "ifrs9"."population_segments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ifrs9"."lgd_configurations" ADD CONSTRAINT "lgd_configurations_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "core"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ifrs9"."lgd_configurations" ADD CONSTRAINT "lgd_configurations_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "core"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ifrs9"."population_segments" ADD CONSTRAINT "population_segments_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "core"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ifrs9"."population_segments" ADD CONSTRAINT "population_segments_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "core"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ifrs9"."population_segments" ADD CONSTRAINT "population_segments_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "core"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ifrs9"."bucket_parameters" ADD CONSTRAINT "unique_bucket_group_per_tenant" UNIQUE("tenant_id","bucket_group");--> statement-breakpoint
ALTER TABLE "ifrs9"."pd_configurations" ADD CONSTRAINT "unique_model_name_per_tenant" UNIQUE("tenant_id","model_name");--> statement-breakpoint
ALTER TABLE "ifrs9"."product_segments" ADD CONSTRAINT "unique_segment_per_tenant" UNIQUE("tenant_id","group_segment","segment","sub_segment");--> statement-breakpoint
ALTER TABLE "ifrs9"."rule_base_setting_headers" ADD CONSTRAINT "unique_rule_name_per_tenant" UNIQUE("tenant_id","rule_name");