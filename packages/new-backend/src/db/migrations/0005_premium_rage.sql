CREATE TABLE "ifrs9"."bucket_parameter_details" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"bucket_id" uuid NOT NULL,
	"bucket_name" varchar(100) NOT NULL,
	"range_start" integer NOT NULL,
	"range_end" integer NOT NULL,
	"seq" integer DEFAULT 1,
	"active_flag" boolean DEFAULT true NOT NULL,
	"created_by" uuid,
	"updated_by" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "ifrs9"."bucket_parameter_details" ADD CONSTRAINT "bucket_parameter_details_bucket_id_bucket_parameters_id_fk" FOREIGN KEY ("bucket_id") REFERENCES "ifrs9"."bucket_parameters"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ifrs9"."bucket_parameter_details" ADD CONSTRAINT "bucket_parameter_details_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "core"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ifrs9"."bucket_parameter_details" ADD CONSTRAINT "bucket_parameter_details_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "core"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_bucket_details_bucket" ON "ifrs9"."bucket_parameter_details" USING btree ("bucket_id");--> statement-breakpoint
CREATE INDEX "idx_bucket_details_range" ON "ifrs9"."bucket_parameter_details" USING btree ("range_start","range_end");