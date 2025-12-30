CREATE SCHEMA "approval";
--> statement-breakpoint
CREATE SCHEMA "audit";
--> statement-breakpoint
CREATE SCHEMA "auth";
--> statement-breakpoint
CREATE SCHEMA "core";
--> statement-breakpoint
CREATE TABLE "approval"."approval_actions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"request_id" uuid NOT NULL,
	"approver_id" uuid NOT NULL,
	"approver_role" varchar(100),
	"level" integer NOT NULL,
	"action" varchar(20) NOT NULL,
	"comment" text,
	"conditions" text,
	"delegated_to" uuid,
	"delegation_reason" text,
	"risk_assessment" jsonb,
	"risk_score" integer,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "approval"."approval_levels" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"matrix_id" uuid NOT NULL,
	"level" integer NOT NULL,
	"name" varchar(100) NOT NULL,
	"description" text,
	"required_roles" jsonb NOT NULL,
	"required_count" integer DEFAULT 1 NOT NULL,
	"max_amount" integer,
	"conditions" jsonb,
	"timeout_hours" integer DEFAULT 24,
	"can_delegate" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "approval"."approval_matrices" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid,
	"name" varchar(255) NOT NULL,
	"description" text,
	"entity_type" varchar(100) NOT NULL,
	"operation_type" varchar(100),
	"banking_mode" varchar(20),
	"amount_thresholds" jsonb,
	"risk_thresholds" jsonb,
	"auto_approval_rules" jsonb,
	"escalation_rules" jsonb,
	"syariah_board_required" boolean DEFAULT false,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "approval"."approval_requests" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"matrix_id" uuid,
	"tenant_id" uuid NOT NULL,
	"entity_type" varchar(100) NOT NULL,
	"entity_id" varchar(100),
	"title" varchar(500) NOT NULL,
	"description" text,
	"request_data" jsonb,
	"requested_by" uuid NOT NULL,
	"impact_level" varchar(20) DEFAULT 'medium',
	"current_level" integer DEFAULT 1 NOT NULL,
	"approvals_required" integer DEFAULT 1 NOT NULL,
	"approvals_received" integer DEFAULT 0 NOT NULL,
	"status" varchar(20) DEFAULT 'pending' NOT NULL,
	"expires_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"completed_at" timestamp,
	"completed_by" uuid
);
--> statement-breakpoint
CREATE TABLE "audit"."audit_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"legacy_id" integer,
	"user_id" uuid,
	"session_id" varchar(255),
	"correlation_id" uuid DEFAULT gen_random_uuid() NOT NULL,
	"event_type" varchar(100) NOT NULL,
	"action" varchar(100) NOT NULL,
	"description" text,
	"entity_type" varchar(100),
	"entity_id" varchar(255),
	"entity_name" varchar(200),
	"old_values" jsonb,
	"new_values" jsonb,
	"changed_fields" jsonb,
	"ip_address" varchar(45),
	"user_agent" text,
	"request_path" varchar(500),
	"request_method" varchar(10),
	"application_name" varchar(100),
	"module_name" varchar(100),
	"function_name" varchar(100),
	"business_date" timestamp,
	"calculation_date" timestamp,
	"risk_level" varchar(20) DEFAULT 'low' NOT NULL,
	"compliance_category" varchar(50),
	"execution_time_ms" integer,
	"tenant_id" uuid,
	"timestamp" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "audit"."calculation_audit_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"tenant_id" uuid,
	"calculation_type" varchar(100) NOT NULL,
	"calculation_date" timestamp NOT NULL,
	"parameters" jsonb,
	"input_summary" jsonb,
	"output_summary" jsonb,
	"status" varchar(50) NOT NULL,
	"error_message" text,
	"execution_time_ms" integer,
	"records_processed" integer,
	"timestamp" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "audit"."data_access_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"tenant_id" uuid,
	"access_type" varchar(50) NOT NULL,
	"resource_type" varchar(100) NOT NULL,
	"resource_id" varchar(255),
	"record_count" integer,
	"purpose" text,
	"ip_address" varchar(45),
	"timestamp" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "auth"."email_verification_tokens" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"token" varchar(255) NOT NULL,
	"expires_at" timestamp NOT NULL,
	"verified_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "core"."menu_categories" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"category_key" varchar(100) NOT NULL,
	"category_name" varchar(255) NOT NULL,
	"category_name_id" varchar(255) NOT NULL,
	"description" text,
	"icon_name" varchar(100),
	"display_order" integer DEFAULT 0,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "core"."menu_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"parent_id" uuid,
	"category_id" uuid,
	"menu_key" varchar(100) NOT NULL,
	"title" varchar(255) NOT NULL,
	"menu_name_id" varchar(255),
	"url" varchar(500),
	"page_path" varchar(500),
	"external_url" varchar(500),
	"menu_type" varchar(20) DEFAULT 'item' NOT NULL,
	"level" integer DEFAULT 1 NOT NULL,
	"sort_order" integer DEFAULT 0,
	"icon" varchar(100),
	"badge_text" varchar(50),
	"badge_color" varchar(20) DEFAULT 'primary',
	"module_name" varchar(100),
	"required_permissions" text[],
	"banking_types" text[] DEFAULT ARRAY['conventional', 'syariah', 'dual'],
	"banking_type" varchar(20) DEFAULT 'all',
	"is_active" boolean DEFAULT true,
	"is_visible" boolean DEFAULT true,
	"is_protected" boolean DEFAULT false,
	"opens_in_new_tab" boolean DEFAULT false,
	"description" text,
	"tags" text[],
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	"created_by" uuid,
	"tenant_id" uuid DEFAULT 'a24af6d2-3032-4d53-ae82-9cfa84f97a20',
	"version" integer DEFAULT 1,
	"last_modified_by" uuid
);
--> statement-breakpoint
CREATE TABLE "core"."menu_user_customization" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"menu_item_id" uuid NOT NULL,
	"is_favorite" boolean DEFAULT false,
	"is_pinned" boolean DEFAULT false,
	"is_hidden" boolean DEFAULT false,
	"custom_display_name" varchar(255),
	"custom_icon" varchar(100),
	"custom_color" varchar(20),
	"custom_order" integer,
	"access_count" integer DEFAULT 0,
	"last_accessed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "auth"."password_reset_tokens" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"token" varchar(255) NOT NULL,
	"expires_at" timestamp NOT NULL,
	"used_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "core"."permissions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"code" varchar(100) NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text,
	"resource" varchar(100) NOT NULL,
	"action" varchar(50) NOT NULL,
	"module" varchar(50) DEFAULT 'core' NOT NULL,
	"category" varchar(100),
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "core"."role_menu_access" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"role_id" uuid NOT NULL,
	"menu_item_id" uuid NOT NULL,
	"can_view" boolean DEFAULT true,
	"can_create" boolean DEFAULT false,
	"can_edit" boolean DEFAULT false,
	"can_delete" boolean DEFAULT false,
	"can_approve" boolean DEFAULT false,
	"is_favorite" boolean DEFAULT false,
	"custom_display_name" varchar(255),
	"custom_icon" varchar(100),
	"custom_order" integer,
	"granted_at" timestamp with time zone DEFAULT now(),
	"granted_by" uuid,
	"expires_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	"tenant_id" uuid DEFAULT 'a24af6d2-3032-4d53-ae82-9cfa84f97a20'
);
--> statement-breakpoint
CREATE TABLE "core"."role_permissions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"role_id" uuid NOT NULL,
	"permission_id" uuid NOT NULL,
	"granted_by" uuid,
	"granted_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "core"."roles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"legacy_id" integer,
	"role_code" varchar(50) NOT NULL,
	"role_name" varchar(100) NOT NULL,
	"description" text,
	"permissions" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"banking_type_specific" varchar(20),
	"compliance_level" varchar(50),
	"hierarchy_level" integer DEFAULT 1 NOT NULL,
	"is_system_role" boolean DEFAULT false NOT NULL,
	"tenant_id" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"created_by" uuid,
	"updated_by" uuid,
	CONSTRAINT "roles_role_code_unique" UNIQUE("role_code")
);
--> statement-breakpoint
CREATE TABLE "auth"."sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"tenant_id" uuid,
	"access_token_id" uuid NOT NULL,
	"refresh_token_id" uuid NOT NULL,
	"user_agent" text,
	"ip_address" varchar(45),
	"device_type" varchar(50),
	"device_name" varchar(100),
	"is_active" boolean DEFAULT true NOT NULL,
	"last_activity_at" timestamp DEFAULT now() NOT NULL,
	"expires_at" timestamp NOT NULL,
	"refresh_expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"revoked_at" timestamp,
	"revoke_reason" varchar(100)
);
--> statement-breakpoint
CREATE TABLE "core"."tenants" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"code" varchar(50) NOT NULL,
	"name" varchar(255) NOT NULL,
	"slug" varchar(100),
	"description" text,
	"type" varchar(50) DEFAULT 'banking',
	"banking_mode" varchar(20) DEFAULT 'conventional',
	"settings" jsonb DEFAULT '{}'::jsonb,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "audit"."user_activity_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"tenant_id" uuid,
	"activity_type" varchar(100) NOT NULL,
	"description" text,
	"metadata" jsonb,
	"ip_address" varchar(45),
	"user_agent" text,
	"session_id" varchar(255),
	"timestamp" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "core"."user_roles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"role_id" uuid NOT NULL,
	"assigned_by" uuid,
	"assigned_at" timestamp DEFAULT now() NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"valid_from" timestamp,
	"valid_until" timestamp,
	"banking_type_restriction" varchar(20),
	"is_temporary" boolean DEFAULT false NOT NULL,
	"temporary_reason" text,
	"tenant_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "core"."users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"email" varchar(255) NOT NULL,
	"username" varchar(100) NOT NULL,
	"password_hash" text NOT NULL,
	"full_name" text,
	"first_name" varchar(100),
	"last_name" varchar(100),
	"phone" varchar(20),
	"department" varchar(100),
	"position" varchar(100),
	"is_active" boolean DEFAULT true NOT NULL,
	"is_email_verified" boolean DEFAULT false NOT NULL,
	"last_login_at" timestamp,
	"password_changed_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "approval"."approval_actions" ADD CONSTRAINT "approval_actions_request_id_approval_requests_id_fk" FOREIGN KEY ("request_id") REFERENCES "approval"."approval_requests"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "approval"."approval_actions" ADD CONSTRAINT "approval_actions_approver_id_users_id_fk" FOREIGN KEY ("approver_id") REFERENCES "core"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "approval"."approval_actions" ADD CONSTRAINT "approval_actions_delegated_to_users_id_fk" FOREIGN KEY ("delegated_to") REFERENCES "core"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "approval"."approval_levels" ADD CONSTRAINT "approval_levels_matrix_id_approval_matrices_id_fk" FOREIGN KEY ("matrix_id") REFERENCES "approval"."approval_matrices"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "approval"."approval_matrices" ADD CONSTRAINT "approval_matrices_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "core"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "approval"."approval_requests" ADD CONSTRAINT "approval_requests_matrix_id_approval_matrices_id_fk" FOREIGN KEY ("matrix_id") REFERENCES "approval"."approval_matrices"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "approval"."approval_requests" ADD CONSTRAINT "approval_requests_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "core"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "approval"."approval_requests" ADD CONSTRAINT "approval_requests_requested_by_users_id_fk" FOREIGN KEY ("requested_by") REFERENCES "core"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "approval"."approval_requests" ADD CONSTRAINT "approval_requests_completed_by_users_id_fk" FOREIGN KEY ("completed_by") REFERENCES "core"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "auth"."email_verification_tokens" ADD CONSTRAINT "email_verification_tokens_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "core"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "core"."menu_items" ADD CONSTRAINT "menu_items_category_id_menu_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "core"."menu_categories"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "core"."menu_user_customization" ADD CONSTRAINT "menu_user_customization_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "core"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "core"."menu_user_customization" ADD CONSTRAINT "menu_user_customization_menu_item_id_menu_items_id_fk" FOREIGN KEY ("menu_item_id") REFERENCES "core"."menu_items"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "auth"."password_reset_tokens" ADD CONSTRAINT "password_reset_tokens_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "core"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "core"."role_menu_access" ADD CONSTRAINT "role_menu_access_role_id_roles_id_fk" FOREIGN KEY ("role_id") REFERENCES "core"."roles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "core"."role_menu_access" ADD CONSTRAINT "role_menu_access_menu_item_id_menu_items_id_fk" FOREIGN KEY ("menu_item_id") REFERENCES "core"."menu_items"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "core"."role_menu_access" ADD CONSTRAINT "role_menu_access_granted_by_users_id_fk" FOREIGN KEY ("granted_by") REFERENCES "core"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "core"."role_permissions" ADD CONSTRAINT "role_permissions_role_id_roles_id_fk" FOREIGN KEY ("role_id") REFERENCES "core"."roles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "core"."role_permissions" ADD CONSTRAINT "role_permissions_permission_id_permissions_id_fk" FOREIGN KEY ("permission_id") REFERENCES "core"."permissions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "core"."roles" ADD CONSTRAINT "roles_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "core"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "auth"."sessions" ADD CONSTRAINT "sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "core"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "auth"."sessions" ADD CONSTRAINT "sessions_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "core"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "core"."user_roles" ADD CONSTRAINT "user_roles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "core"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "core"."user_roles" ADD CONSTRAINT "user_roles_role_id_roles_id_fk" FOREIGN KEY ("role_id") REFERENCES "core"."roles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "core"."user_roles" ADD CONSTRAINT "user_roles_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "core"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "core"."users" ADD CONSTRAINT "users_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "core"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "approval_actions_request_idx" ON "approval"."approval_actions" USING btree ("request_id");--> statement-breakpoint
CREATE INDEX "approval_actions_approver_idx" ON "approval"."approval_actions" USING btree ("approver_id");--> statement-breakpoint
CREATE INDEX "approval_actions_action_idx" ON "approval"."approval_actions" USING btree ("action");--> statement-breakpoint
CREATE INDEX "approval_levels_matrix_idx" ON "approval"."approval_levels" USING btree ("matrix_id");--> statement-breakpoint
CREATE INDEX "approval_levels_level_idx" ON "approval"."approval_levels" USING btree ("level");--> statement-breakpoint
CREATE INDEX "approval_matrices_tenant_idx" ON "approval"."approval_matrices" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "approval_matrices_entity_idx" ON "approval"."approval_matrices" USING btree ("entity_type");--> statement-breakpoint
CREATE INDEX "approval_matrices_active_idx" ON "approval"."approval_matrices" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "approval_requests_tenant_idx" ON "approval"."approval_requests" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "approval_requests_status_idx" ON "approval"."approval_requests" USING btree ("status");--> statement-breakpoint
CREATE INDEX "approval_requests_requester_idx" ON "approval"."approval_requests" USING btree ("requested_by");--> statement-breakpoint
CREATE INDEX "approval_requests_entity_idx" ON "approval"."approval_requests" USING btree ("entity_type","entity_id");--> statement-breakpoint
CREATE INDEX "approval_requests_expires_idx" ON "approval"."approval_requests" USING btree ("expires_at");--> statement-breakpoint
CREATE INDEX "audit_user_idx" ON "audit"."audit_logs" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "audit_tenant_idx" ON "audit"."audit_logs" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "audit_event_type_idx" ON "audit"."audit_logs" USING btree ("event_type");--> statement-breakpoint
CREATE INDEX "audit_action_idx" ON "audit"."audit_logs" USING btree ("action");--> statement-breakpoint
CREATE INDEX "audit_entity_type_idx" ON "audit"."audit_logs" USING btree ("entity_type");--> statement-breakpoint
CREATE INDEX "audit_entity_id_idx" ON "audit"."audit_logs" USING btree ("entity_id");--> statement-breakpoint
CREATE INDEX "audit_timestamp_idx" ON "audit"."audit_logs" USING btree ("timestamp");--> statement-breakpoint
CREATE INDEX "audit_business_date_idx" ON "audit"."audit_logs" USING btree ("business_date");--> statement-breakpoint
CREATE INDEX "audit_risk_level_idx" ON "audit"."audit_logs" USING btree ("risk_level");--> statement-breakpoint
CREATE INDEX "audit_compliance_category_idx" ON "audit"."audit_logs" USING btree ("compliance_category");--> statement-breakpoint
CREATE INDEX "audit_session_idx" ON "audit"."audit_logs" USING btree ("session_id");--> statement-breakpoint
CREATE INDEX "audit_correlation_idx" ON "audit"."audit_logs" USING btree ("correlation_id");--> statement-breakpoint
CREATE INDEX "audit_ip_address_idx" ON "audit"."audit_logs" USING btree ("ip_address");--> statement-breakpoint
CREATE INDEX "audit_tenant_event_time_idx" ON "audit"."audit_logs" USING btree ("tenant_id","event_type","timestamp");--> statement-breakpoint
CREATE INDEX "audit_user_time_idx" ON "audit"."audit_logs" USING btree ("user_id","timestamp");--> statement-breakpoint
CREATE INDEX "audit_entity_time_idx" ON "audit"."audit_logs" USING btree ("entity_type","entity_id","timestamp");--> statement-breakpoint
CREATE INDEX "calc_audit_user_idx" ON "audit"."calculation_audit_logs" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "calc_audit_tenant_idx" ON "audit"."calculation_audit_logs" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "calc_audit_type_idx" ON "audit"."calculation_audit_logs" USING btree ("calculation_type");--> statement-breakpoint
CREATE INDEX "calc_audit_date_idx" ON "audit"."calculation_audit_logs" USING btree ("calculation_date");--> statement-breakpoint
CREATE INDEX "calc_audit_status_idx" ON "audit"."calculation_audit_logs" USING btree ("status");--> statement-breakpoint
CREATE INDEX "calc_audit_timestamp_idx" ON "audit"."calculation_audit_logs" USING btree ("timestamp");--> statement-breakpoint
CREATE INDEX "data_access_user_idx" ON "audit"."data_access_logs" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "data_access_tenant_idx" ON "audit"."data_access_logs" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "data_access_resource_idx" ON "audit"."data_access_logs" USING btree ("resource_type","resource_id");--> statement-breakpoint
CREATE INDEX "data_access_timestamp_idx" ON "audit"."data_access_logs" USING btree ("timestamp");--> statement-breakpoint
CREATE INDEX "email_verification_user_idx" ON "auth"."email_verification_tokens" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "email_verification_token_idx" ON "auth"."email_verification_tokens" USING btree ("token");--> statement-breakpoint
CREATE UNIQUE INDEX "menu_categories_key_idx" ON "core"."menu_categories" USING btree ("category_key");--> statement-breakpoint
CREATE UNIQUE INDEX "menu_items_key_idx" ON "core"."menu_items" USING btree ("menu_key");--> statement-breakpoint
CREATE INDEX "idx_menu_items_parent_id" ON "core"."menu_items" USING btree ("parent_id");--> statement-breakpoint
CREATE INDEX "idx_menu_items_category_id" ON "core"."menu_items" USING btree ("category_id");--> statement-breakpoint
CREATE INDEX "idx_menu_items_level" ON "core"."menu_items" USING btree ("level");--> statement-breakpoint
CREATE INDEX "idx_menu_items_active" ON "core"."menu_items" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "idx_menu_items_visible" ON "core"."menu_items" USING btree ("is_visible");--> statement-breakpoint
CREATE INDEX "idx_menu_items_banking_type" ON "core"."menu_items" USING btree ("banking_type");--> statement-breakpoint
CREATE INDEX "idx_menu_items_module" ON "core"."menu_items" USING btree ("module_name");--> statement-breakpoint
CREATE INDEX "idx_menu_items_display_order" ON "core"."menu_items" USING btree ("category_id","sort_order");--> statement-breakpoint
CREATE UNIQUE INDEX "menu_user_custom_unique_idx" ON "core"."menu_user_customization" USING btree ("user_id","menu_item_id");--> statement-breakpoint
CREATE INDEX "idx_menu_user_custom_user_id" ON "core"."menu_user_customization" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_menu_user_custom_menu_id" ON "core"."menu_user_customization" USING btree ("menu_item_id");--> statement-breakpoint
CREATE INDEX "idx_menu_user_custom_favorite" ON "core"."menu_user_customization" USING btree ("is_favorite");--> statement-breakpoint
CREATE INDEX "password_reset_user_idx" ON "auth"."password_reset_tokens" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "password_reset_token_idx" ON "auth"."password_reset_tokens" USING btree ("token");--> statement-breakpoint
CREATE INDEX "password_reset_expires_idx" ON "auth"."password_reset_tokens" USING btree ("expires_at");--> statement-breakpoint
CREATE UNIQUE INDEX "permissions_code_idx" ON "core"."permissions" USING btree ("code");--> statement-breakpoint
CREATE INDEX "permissions_resource_action_idx" ON "core"."permissions" USING btree ("resource","action");--> statement-breakpoint
CREATE INDEX "permissions_category_idx" ON "core"."permissions" USING btree ("category");--> statement-breakpoint
CREATE UNIQUE INDEX "role_menu_unique_idx" ON "core"."role_menu_access" USING btree ("role_id","menu_item_id");--> statement-breakpoint
CREATE INDEX "idx_role_menu_access_role_id" ON "core"."role_menu_access" USING btree ("role_id");--> statement-breakpoint
CREATE INDEX "idx_role_menu_access_menu_id" ON "core"."role_menu_access" USING btree ("menu_item_id");--> statement-breakpoint
CREATE INDEX "idx_role_menu_access_can_view" ON "core"."role_menu_access" USING btree ("can_view");--> statement-breakpoint
CREATE UNIQUE INDEX "role_perm_unique_idx" ON "core"."role_permissions" USING btree ("role_id","permission_id");--> statement-breakpoint
CREATE INDEX "role_permissions_role_idx" ON "core"."role_permissions" USING btree ("role_id");--> statement-breakpoint
CREATE INDEX "role_permissions_perm_idx" ON "core"."role_permissions" USING btree ("permission_id");--> statement-breakpoint
CREATE UNIQUE INDEX "roles_role_name_idx" ON "core"."roles" USING btree ("role_name");--> statement-breakpoint
CREATE INDEX "roles_tenant_idx" ON "core"."roles" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "roles_active_idx" ON "core"."roles" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "roles_hierarchy_idx" ON "core"."roles" USING btree ("hierarchy_level");--> statement-breakpoint
CREATE INDEX "roles_system_role_idx" ON "core"."roles" USING btree ("is_system_role");--> statement-breakpoint
CREATE INDEX "sessions_user_idx" ON "auth"."sessions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "sessions_tenant_idx" ON "auth"."sessions" USING btree ("tenant_id");--> statement-breakpoint
CREATE UNIQUE INDEX "sessions_access_token_idx" ON "auth"."sessions" USING btree ("access_token_id");--> statement-breakpoint
CREATE UNIQUE INDEX "sessions_refresh_token_idx" ON "auth"."sessions" USING btree ("refresh_token_id");--> statement-breakpoint
CREATE INDEX "sessions_active_idx" ON "auth"."sessions" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "sessions_expires_idx" ON "auth"."sessions" USING btree ("expires_at");--> statement-breakpoint
CREATE UNIQUE INDEX "tenants_code_idx" ON "core"."tenants" USING btree ("code");--> statement-breakpoint
CREATE INDEX "tenants_slug_idx" ON "core"."tenants" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "tenants_active_idx" ON "core"."tenants" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "user_activity_user_idx" ON "audit"."user_activity_logs" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "user_activity_tenant_idx" ON "audit"."user_activity_logs" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "user_activity_type_idx" ON "audit"."user_activity_logs" USING btree ("activity_type");--> statement-breakpoint
CREATE INDEX "user_activity_timestamp_idx" ON "audit"."user_activity_logs" USING btree ("timestamp");--> statement-breakpoint
CREATE UNIQUE INDEX "user_role_unique_idx" ON "core"."user_roles" USING btree ("user_id","role_id");--> statement-breakpoint
CREATE INDEX "user_roles_user_idx" ON "core"."user_roles" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "user_roles_role_idx" ON "core"."user_roles" USING btree ("role_id");--> statement-breakpoint
CREATE INDEX "user_roles_tenant_idx" ON "core"."user_roles" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "user_roles_active_idx" ON "core"."user_roles" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "user_roles_valid_from_idx" ON "core"."user_roles" USING btree ("valid_from");--> statement-breakpoint
CREATE INDEX "user_roles_valid_until_idx" ON "core"."user_roles" USING btree ("valid_until");--> statement-breakpoint
CREATE UNIQUE INDEX "users_email_tenant_idx" ON "core"."users" USING btree ("email","tenant_id");--> statement-breakpoint
CREATE INDEX "users_username_idx" ON "core"."users" USING btree ("username");--> statement-breakpoint
CREATE INDEX "users_tenant_idx" ON "core"."users" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "users_active_idx" ON "core"."users" USING btree ("is_active");