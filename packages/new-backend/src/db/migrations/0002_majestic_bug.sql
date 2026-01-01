CREATE SCHEMA "ifrs9";
--> statement-breakpoint
CREATE TABLE "ifrs9"."product_segments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"group_segment" varchar(100) NOT NULL,
	"segment" varchar(100) NOT NULL,
	"sub_segment" varchar(100) NOT NULL,
	"segment_type" varchar(50) NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"description" text,
	"display_order" integer DEFAULT 0,
	"created_by" uuid,
	"updated_by" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "ifrs9"."product_segments" ADD CONSTRAINT "product_segments_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "core"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ifrs9"."product_segments" ADD CONSTRAINT "product_segments_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "core"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ifrs9"."product_segments" ADD CONSTRAINT "product_segments_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "core"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_product_segments_tenant" ON "ifrs9"."product_segments" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "idx_product_segments_type" ON "ifrs9"."product_segments" USING btree ("segment_type");--> statement-breakpoint
CREATE INDEX "idx_product_segments_active" ON "ifrs9"."product_segments" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "idx_product_segments_group" ON "ifrs9"."product_segments" USING btree ("group_segment");--> statement-breakpoint
CREATE UNIQUE INDEX "unique_segment_per_tenant" ON "ifrs9"."product_segments" USING btree ("tenant_id","group_segment","segment","sub_segment");