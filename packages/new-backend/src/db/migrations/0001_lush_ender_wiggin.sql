CREATE TABLE "core"."menu_access_log" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"menu_item_id" uuid,
	"access_action" varchar(50) NOT NULL,
	"ip_address" varchar(50),
	"user_agent" text,
	"session_id" varchar(255),
	"response_time_ms" integer,
	"accessed_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "core"."menu_access_log" ADD CONSTRAINT "menu_access_log_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "core"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "core"."menu_access_log" ADD CONSTRAINT "menu_access_log_menu_item_id_menu_items_id_fk" FOREIGN KEY ("menu_item_id") REFERENCES "core"."menu_items"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_menu_access_log_user_id" ON "core"."menu_access_log" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_menu_access_log_menu_id" ON "core"."menu_access_log" USING btree ("menu_item_id");--> statement-breakpoint
CREATE INDEX "idx_menu_access_log_accessed_at" ON "core"."menu_access_log" USING btree ("accessed_at");