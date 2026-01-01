// packages/new-backend/src/db/schema/legacy.ts
import { pgTable, varchar, timestamp, boolean, integer, bigserial, date, smallserial, smallint, doublePrecision, text, check, pgSchema } from "drizzle-orm/pg-core";
import { sql, relations } from "drizzle-orm";

export const ifrs9Schema = pgSchema("ifrs9");

// ============================================================================
// APPLICATION SETTINGS (frs9_param_common*)
// ============================================================================

export const frs9ParamCommonh = ifrs9Schema.table("frs9_param_commonh", {
    pkid: bigserial({ mode: "number" }).primaryKey().notNull(), // Using number for ease of use if ID < 2^53
    paramCode: varchar("param_code", { length: 10 }).unique(), // Unique for lookup
    paramName: varchar("param_name", { length: 255 }),
    paramUsage: varchar("param_usage", { length: 255 }),
    paramType: varchar("param_type", { length: 10 }),
    createdby: varchar({ length: 50 }).notNull().default('SYSTEM'),
    createddate: timestamp({ mode: 'string' }).notNull().defaultNow(),
    createdhost: varchar({ length: 50 }).notNull().default('localhost'),
    updatedby: varchar({ length: 50 }),
    updateddate: timestamp({ mode: 'string' }),
    updatedhost: varchar({ length: 50 }),
    bankingType: varchar("banking_type", { length: 20 }).default('conventional'),
    isActive: boolean("is_active").default(true),
    requiresApproval: boolean("requires_approval").default(false),
}, (table) => [
    check("chk_banking_type", sql`(banking_type)::text = ANY (ARRAY[('conventional'::character varying)::text, ('syariah'::character varying)::text, ('dual'::character varying)::text])`),
]);

export const frs9ParamCommond = ifrs9Schema.table("frs9_param_commond", {
    pkid: bigserial({ mode: "number" }).primaryKey().notNull(),
    // Introspected schema shows paramCode/paramSeq, but typically detail links to header via FK?
    // However, legacy schema uses paramCode as the link key based on introspection.
    // "paramCode: varchar" match.
    paramCode: varchar("param_code", { length: 50 }).notNull(),
    paramSeq: integer("param_seq").notNull(),
    value1: varchar({ length: 100 }).notNull(),
    value2: varchar({ length: 100 }).notNull(),
    value3: varchar({ length: 50 }).notNull(),
    paramdesc: varchar({ length: 1000 }).notNull(),
    createdby: varchar({ length: 50 }).notNull().default('SYSTEM'),
    createddate: timestamp({ mode: 'string' }).notNull().defaultNow(),
    createdhost: varchar({ length: 50 }).notNull().default('localhost'),
    updatedby: varchar({ length: 50 }),
    updateddate: timestamp({ mode: 'string' }),
    updatedhost: varchar({ length: 50 }),
});

export const frs9ParamCommonhRelations = relations(frs9ParamCommonh, ({ many }) => ({
    details: many(frs9ParamCommond),
}));

export const frs9ParamCommondRelations = relations(frs9ParamCommond, ({ one }) => ({
    header: one(frs9ParamCommonh, {
        fields: [frs9ParamCommond.paramCode],
        references: [frs9ParamCommonh.paramCode],
    }),
}));


// ============================================================================
// LGD CONFIGURATION (frs9_imp_ca_lgd_config)
// ============================================================================

export const frs9ImpCaLgdConfig = ifrs9Schema.table("frs9_imp_ca_lgd_config", {
    pkid: smallserial().primaryKey().notNull(),
    lgdModelName: varchar("lgd_model_name", { length: 250 }),
    // Segment ID needs to map to Product/Pop Segment. 
    // Introspection says `bigint`.
    segmentId: integer("segment_id"),
    lgdMethod: integer("lgd_method"),
    populationType: varchar("population_type", { length: 20 }), // Adjusted length
    observationPeriod: varchar("observation_period", { length: 50 }),
    observationStartDate: date("observation_start_date"),
    workoutPeriod: integer("workout_period"),
    flFlag: boolean("fl_flag").notNull().default(false),
    flScalarId: integer("fl_scalar_id"),
    lgdRate: doublePrecision("lgd_rate"),
    activeFlag: boolean("active_flag").default(true),
    createdby: varchar({ length: 50 }).notNull().default('SYSTEM'),
    createddate: timestamp({ mode: 'string' }).notNull().defaultNow(),
    createdhost: varchar({ length: 50 }).notNull().default('localhost'),
    updatedby: varchar({ length: 50 }),
    updateddate: timestamp({ mode: 'string' }),
    updatedhost: varchar({ length: 50 }),
});
