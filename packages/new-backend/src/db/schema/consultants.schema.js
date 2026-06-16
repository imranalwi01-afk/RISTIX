"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.consultants = exports.consultantSchema = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
exports.consultantSchema = (0, pg_core_1.pgSchema)('consultant');
exports.consultants = exports.consultantSchema.table('consultants', {
    id: (0, pg_core_1.uuid)('id').primaryKey().defaultRandom(),
    fullName: (0, pg_core_1.varchar)('full_name', { length: 255 }).notNull(),
    email: (0, pg_core_1.varchar)('email', { length: 255 }).notNull().unique(),
    firmName: (0, pg_core_1.varchar)('firm_name', { length: 255 }),
    specialization: (0, pg_core_1.varchar)('specialization', { length: 255 }),
    startDate: (0, pg_core_1.date)('start_date'),
    endDate: (0, pg_core_1.date)('end_date'),
    status: (0, pg_core_1.varchar)('status', { length: 50 }).default('active'), // active, inactive, on_hold
    isActive: (0, pg_core_1.boolean)('is_active').default(true),
    notes: (0, pg_core_1.text)('notes'),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at').defaultNow().notNull(),
});
