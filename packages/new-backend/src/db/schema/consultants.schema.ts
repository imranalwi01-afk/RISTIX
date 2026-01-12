import { pgSchema, text, timestamp, date, uuid, varchar, boolean } from 'drizzle-orm/pg-core';

export const consultantSchema = pgSchema('consultant');

export const consultants = consultantSchema.table('consultants', {
    id: uuid('id').primaryKey().defaultRandom(),
    fullName: varchar('full_name', { length: 255 }).notNull(),
    email: varchar('email', { length: 255 }).notNull().unique(),
    firmName: varchar('firm_name', { length: 255 }),
    specialization: varchar('specialization', { length: 255 }),
    startDate: date('start_date'),
    endDate: date('end_date'),
    status: varchar('status', { length: 50 }).default('active'), // active, inactive, on_hold
    isActive: boolean('is_active').default(true),
    notes: text('notes'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export type Consultant = typeof consultants.$inferSelect;
export type NewConsultant = typeof consultants.$inferInsert;
