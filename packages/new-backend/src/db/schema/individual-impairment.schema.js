"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.individualImpairmentScenarios = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
const core_1 = require("./core");
// =============================================================================
// INDIVIDUAL IMPAIRMENT SCENARIOS TABLE
// =============================================================================
exports.individualImpairmentScenarios = core_1.coreSchema.table('individual_impairment_scenarios', {
    id: (0, pg_core_1.serial)('id').primaryKey(),
    accountId: (0, pg_core_1.bigint)('account_id', { mode: 'number' }).notNull(), // Links to frs9_master_account.account_id
    name: (0, pg_core_1.varchar)('name', { length: 100 }).notNull(),
    discountRate: (0, pg_core_1.doublePrecision)('discount_rate').notNull(),
    recoveryRate: (0, pg_core_1.doublePrecision)('recovery_rate').notNull(),
    growthRate: (0, pg_core_1.doublePrecision)('growth_rate').notNull(),
    timeHorizon: (0, pg_core_1.integer)('time_horizon').default(60),
    paymentFrequency: (0, pg_core_1.varchar)('payment_frequency', { length: 20 }).default('monthly'),
    isActive: (0, pg_core_1.boolean)('is_active').default(true),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at').defaultNow(),
    createdBy: (0, pg_core_1.varchar)('created_by', { length: 100 }),
});
