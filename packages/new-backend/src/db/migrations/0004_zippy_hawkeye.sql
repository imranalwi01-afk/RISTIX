CREATE TABLE "ifrs9"."bucket_parameters" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"bucket_group" varchar(100) NOT NULL,
	"bucket_group_desc" varchar(255),
	"basis" varchar(100) NOT NULL,
	"include_close" boolean DEFAULT false NOT NULL,
	"include_wo" boolean DEFAULT false NOT NULL,
	"active_flag" boolean DEFAULT true NOT NULL,
	"seq" integer DEFAULT 1,
	"created_by" uuid,
	"updated_by" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "ifrs9"."bucket_parameters" ADD CONSTRAINT "bucket_parameters_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "core"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ifrs9"."bucket_parameters" ADD CONSTRAINT "bucket_parameters_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "core"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ifrs9"."bucket_parameters" ADD CONSTRAINT "bucket_parameters_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "core"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_bucket_parameters_tenant" ON "ifrs9"."bucket_parameters" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "idx_bucket_parameters_basis" ON "ifrs9"."bucket_parameters" USING btree ("basis");--> statement-breakpoint
CREATE INDEX "idx_bucket_parameters_active" ON "ifrs9"."bucket_parameters" USING btree ("active_flag");--> statement-breakpoint
CREATE UNIQUE INDEX "unique_bucket_group_per_tenant" ON "ifrs9"."bucket_parameters" USING btree ("tenant_id","bucket_group");