import { pgSchema, serial, bigint, varchar, doublePrecision, timestamp, boolean, integer } from 'drizzle-orm/pg-core';
import { coreSchema } from './core';

// =============================================================================
// INDIVIDUAL IMPAIRMENT SCENARIOS TABLE
// =============================================================================

export const individualImpairmentScenarios = coreSchema.table('individual_impairment_scenarios', {
    id: serial('id').primaryKey(),
    accountId: bigint('account_id', { mode: 'number' }).notNull(), // Links to frs9_master_account.account_id
    name: varchar('name', { length: 100 }).notNull(),
    discountRate: doublePrecision('discount_rate').notNull(),
    recoveryRate: doublePrecision('recovery_rate').notNull(),
    growthRate: doublePrecision('growth_rate').notNull(),
    timeHorizon: integer('time_horizon').default(60),
    paymentFrequency: varchar('payment_frequency', { length: 20 }).default('monthly'),
    isActive: boolean('is_active').default(true),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
    createdBy: varchar('created_by', { length: 100 }),
});

export type IndividualImpairmentScenario = typeof individualImpairmentScenarios.$inferSelect;
export type NewIndividualImpairmentScenario = typeof individualImpairmentScenarios.$inferInsert;
