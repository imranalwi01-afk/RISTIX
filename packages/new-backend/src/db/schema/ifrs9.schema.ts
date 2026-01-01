import { boolean, char, date, decimal, integer, pgSchema, text, timestamp, uuid, varchar, unique, index } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { tenants, users } from './core';

export const ifrs9Schema = pgSchema('ifrs9');

// Restored from 0002_majestic_bug.sql
export const productSegments = ifrs9Schema.table('product_segments', {
    id: uuid('id').primaryKey().defaultRandom(),
    tenantId: uuid('tenant_id').notNull().references(() => tenants.id, { onDelete: 'cascade' }),
    groupSegment: varchar('group_segment', { length: 100 }).notNull(),
    segment: varchar('segment', { length: 100 }).notNull(),
    subSegment: varchar('sub_segment', { length: 100 }).notNull(),
    segmentType: varchar('segment_type', { length: 50 }).notNull(),
    isActive: boolean('is_active').default(true).notNull(),
    description: text('description'),
    displayOrder: integer('display_order').default(0),
    createdBy: uuid('created_by').references(() => users.id),
    updatedBy: uuid('updated_by').references(() => users.id),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => {
    return {
        uniqueSegmentPerTenant: unique('unique_segment_per_tenant').on(table.tenantId, table.groupSegment, table.segment, table.subSegment),
        idxTenant: index('idx_product_segments_tenant').on(table.tenantId),
        idxType: index('idx_product_segments_type').on(table.segmentType),
        idxActive: index('idx_product_segments_active').on(table.isActive),
        idxGroup: index('idx_product_segments_group').on(table.groupSegment),
    };
});

export const productSegmentsRelations = relations(productSegments, ({ one }) => ({
    tenant: one(tenants, {
        fields: [productSegments.tenantId],
        references: [tenants.id],
    }),
    creator: one(users, {
        fields: [productSegments.createdBy],
        references: [users.id],
    }),
    updater: one(users, {
        fields: [productSegments.updatedBy],
        references: [users.id],
    }),
}));

// Restored from 0003_rainy_the_initiative.sql
export const ruleBaseSettingHeaders = ifrs9Schema.table('rule_base_setting_headers', {
    id: uuid('id').primaryKey().defaultRandom(),
    tenantId: uuid('tenant_id').notNull().references(() => tenants.id, { onDelete: 'cascade' }),
    ruleName: varchar('rule_name', { length: 100 }).notNull(),
    ruleType: varchar('rule_type', { length: 50 }).notNull(),
    updatedTable: varchar('updated_table', { length: 100 }).notNull(),
    updatedColumn: varchar('updated_column', { length: 100 }).notNull(),
    value: varchar('value', { length: 255 }).notNull(),
    seq: integer('seq').default(1),
    activeFlag: boolean('active_flag').default(true).notNull(),
    description: text('description'),
    detailCount: integer('detail_count').default(0),
    createdBy: uuid('created_by').references(() => users.id),
    updatedBy: uuid('updated_by').references(() => users.id),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => {
    return {
        uniqueRuleNamePerTenant: unique('unique_rule_name_per_tenant').on(table.tenantId, table.ruleName),
        idxTenant: index('idx_rule_headers_tenant').on(table.tenantId),
        idxType: index('idx_rule_headers_type').on(table.ruleType),
        idxActive: index('idx_rule_headers_active').on(table.activeFlag),
        idxTable: index('idx_rule_headers_table').on(table.updatedTable),
        idxSeq: index('idx_rule_headers_seq').on(table.seq),
    };
});

export const ruleBaseSettingDetails = ifrs9Schema.table('rule_base_setting_details', {
    id: uuid('id').primaryKey().defaultRandom(),
    ruleId: uuid('rule_id').references(() => ruleBaseSettingHeaders.id, { onDelete: 'cascade' }).notNull(),
    queryGroup: integer('query_group').default(1).notNull(),
    seq: integer('seq').default(1).notNull(),
    tableName: varchar('table_name', { length: 100 }).notNull(),
    columnName: varchar('column_name', { length: 100 }).notNull(),
    dataType: varchar('data_type', { length: 50 }).notNull(),
    operator: varchar('operator', { length: 20 }).notNull(),
    value1: varchar('value1', { length: 255 }),
    value2: varchar('value2', { length: 255 }),
    condition: varchar('condition', { length: 10 }).default('AND').notNull(),
    detailType: integer('detail_type'),
    stageFrom: integer('stage_from'),
    stageTo: integer('stage_to'),
    createdBy: uuid('created_by').references(() => users.id),
    updatedBy: uuid('updated_by').references(() => users.id),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => {
    return {
        idxRule: index('idx_rule_details_rule').on(table.ruleId),
        idxGroup: index('idx_rule_details_group').on(table.queryGroup),
        idxTable: index('idx_rule_details_table').on(table.tableName),
        idxSeq: index('idx_rule_details_seq').on(table.ruleId, table.seq),
    };
});

export const ruleBaseSettingHeadersRelations = relations(ruleBaseSettingHeaders, ({ many, one }) => ({
    details: many(ruleBaseSettingDetails),
    tenant: one(tenants, {
        fields: [ruleBaseSettingHeaders.tenantId],
        references: [tenants.id],
    }),
}));

export const ruleBaseSettingDetailsRelations = relations(ruleBaseSettingDetails, ({ one }) => ({
    header: one(ruleBaseSettingHeaders, {
        fields: [ruleBaseSettingDetails.ruleId],
        references: [ruleBaseSettingHeaders.id],
    }),
}));

// Bucket Parameters
export const bucketParameters = ifrs9Schema.table('bucket_parameters', {
    id: uuid('id').primaryKey().defaultRandom(),
    tenantId: uuid('tenant_id').notNull().references(() => tenants.id, { onDelete: 'cascade' }),
    bucketGroup: varchar('bucket_group', { length: 100 }).notNull(),
    bucketGroupDesc: varchar('bucket_group_desc', { length: 255 }),
    basis: varchar('basis', { length: 50 }).notNull(),
    includeClose: boolean('include_close').default(false),
    includeWo: boolean('include_wo').default(false),
    activeFlag: boolean('active_flag').default(true),
    seq: integer('seq').default(1),
    createdBy: uuid('created_by').references(() => users.id),
    updatedBy: uuid('updated_by').references(() => users.id),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow(),
    createdHost: varchar('created_host', { length: 255 }),
    updatedHost: varchar('updated_host', { length: 255 }),
}, (table) => {
    return {
        uniqueBucketGroupPerTenant: unique('unique_bucket_group_per_tenant').on(table.tenantId, table.bucketGroup),
        idxTenant: index('idx_bucket_parameters_tenant').on(table.tenantId),
        idxBasis: index('idx_bucket_parameters_basis').on(table.basis),
        idxActive: index('idx_bucket_parameters_active').on(table.activeFlag),
    };
});

export const bucketParameterDetails = ifrs9Schema.table('bucket_parameter_details', {
    id: uuid('id').primaryKey().defaultRandom(),
    bucketId: uuid('bucket_id').references(() => bucketParameters.id, { onDelete: 'cascade' }).notNull(),
    bucketName: varchar('bucket_name', { length: 100 }).notNull(),
    rangeStart: integer('range_start').notNull(),
    rangeEnd: integer('range_end'),
    seq: integer('seq').default(1),
    activeFlag: boolean('active_flag').default(true),
    createdBy: uuid('created_by').references(() => users.id),
    updatedBy: uuid('updated_by').references(() => users.id),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow(),
    createdHost: varchar('created_host', { length: 255 }),
    updatedHost: varchar('updated_host', { length: 255 }),
}, (table) => {
    return {
        idxBucket: index('idx_bucket_details_bucket').on(table.bucketId),
        idxRange: index('idx_bucket_details_range').on(table.rangeStart, table.rangeEnd),
    };
});

export const bucketParametersRelations = relations(bucketParameters, ({ many, one }) => ({
    details: many(bucketParameterDetails),
    tenant: one(tenants, {
        fields: [bucketParameters.tenantId],
        references: [tenants.id],
    }),
}));

export const bucketParameterDetailsRelations = relations(bucketParameterDetails, ({ one }) => ({
    header: one(bucketParameters, {
        fields: [bucketParameterDetails.bucketId],
        references: [bucketParameters.id],
    }),
}));

// Restored PD Configurations (Match 0006)
export const pdConfigurations = ifrs9Schema.table('pd_configurations', {
    id: uuid('id').primaryKey().defaultRandom(),
    tenantId: uuid('tenant_id').notNull().references(() => tenants.id, { onDelete: 'cascade' }),
    modelName: varchar('model_name', { length: 255 }).notNull(),
    populationSegment: integer('population_segment'),
    populationSegmentId: uuid('population_segment_id').references(() => populationSegments.id),
    populationSegmentDesc: varchar('population_segment_desc', { length: 255 }),
    selectedMethod: integer('selected_method').notNull(),
    selectedMethodDesc: varchar('selected_method_desc', { length: 100 }),
    migrationInterval: integer('migration_interval').default(0),
    populationType: integer('population_type'),
    populationTypeDesc: varchar('population_type_desc', { length: 100 }),
    historicalMonth: integer('historical_month').default(0),
    firstHistoricalDate: timestamp('first_historical_date'),
    firstHistoricalDateString: varchar('first_historical_date_string', { length: 50 }),
    multiplication: integer('multiplication'),
    multiplicationString: varchar('multiplication_string', { length: 20 }),
    flFlag: boolean('fl_flag').default(false).notNull(),
    flScalarId: uuid('fl_scalar_id'),
    flScalar: varchar('fl_scalar', { length: 255 }),
    iaFlag: boolean('ia_flag').default(false).notNull(),
    bucket: varchar('bucket', { length: 50 }).notNull(),
    bucketDesc: varchar('bucket_desc', { length: 255 }),
    isActive: boolean('is_active').default(true).notNull(),
    seq: integer('seq').default(1),
    createdBy: uuid('created_by').references(() => users.id),
    updatedBy: uuid('updated_by').references(() => users.id),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
    createdHost: varchar('created_host', { length: 255 }),
    updatedHost: varchar('updated_host', { length: 255 }),
}, (table) => {
    return {
        uniqueModelNamePerTenant: unique('unique_model_name_per_tenant').on(table.tenantId, table.modelName),
        idxTenant: index('idx_pd_config_tenant').on(table.tenantId),
        idxSegment: index('idx_pd_config_segment').on(table.populationSegment),
        idxMethod: index('idx_pd_config_method').on(table.selectedMethod),
        idxBucket: index('idx_pd_config_bucket').on(table.bucket),
        idxActive: index('idx_pd_config_active').on(table.isActive),
    };
});

export const pdConfigurationsRelations = relations(pdConfigurations, ({ one }) => ({
    tenant: one(tenants, {
        fields: [pdConfigurations.tenantId],
        references: [tenants.id],
    }),
}));

// New Tables

export const populationSegments = ifrs9Schema.table('population_segments', {
    id: uuid('id').primaryKey().defaultRandom(),
    tenantId: uuid('tenant_id').notNull().references(() => tenants.id, { onDelete: 'cascade' }),
    segmentName: varchar('segment_name', { length: 255 }).notNull(),
    description: varchar('description', { length: 500 }),
    activeFlag: boolean('active_flag').default(true),
    createdBy: uuid('created_by').references(() => users.id),
    updatedBy: uuid('updated_by').references(() => users.id),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow(),
    createdHost: varchar('created_host', { length: 255 }),
    updatedHost: varchar('updated_host', { length: 255 }),
});

export const lgdConfigurations = ifrs9Schema.table('lgd_configurations', {
    id: uuid('id').primaryKey().defaultRandom(),
    tenantId: uuid('tenant_id').notNull().references(() => tenants.id, { onDelete: 'cascade' }),
    modelName: varchar('model_name', { length: 255 }).notNull(),
    populationSegmentId: uuid('population_segment_id').references(() => populationSegments.id).notNull(),
    lgdMethod: integer('lgd_method').notNull(),
    populationType: integer('population_type'),
    observationPeriod: integer('observation_period'),
    historicalMonth: integer('historical_month'),
    firstNplDate: date('first_npl_date'),
    workoutPeriod: integer('workout_period'),
    unsecuredLgd: decimal('unsecured_lgd', { precision: 10, scale: 6 }),
    securedLgd: decimal('secured_lgd', { precision: 10, scale: 6 }),
    lgdRate: decimal('lgd_rate', { precision: 10, scale: 6 }),
    isActive: boolean('is_active').default(true),
    createdBy: uuid('created_by').references(() => users.id),
    updatedBy: uuid('updated_by').references(() => users.id),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow(),
    createdHost: varchar('created_host', { length: 255 }),
    updatedHost: varchar('updated_host', { length: 255 }),
}, (table) => {
    return {
        uniqueLgdModelNamePerTenant: unique('unique_lgd_model_name_per_tenant').on(table.tenantId, table.modelName),
    };
});

export const eadConfigurations = ifrs9Schema.table('ead_configurations', {
    id: uuid('id').primaryKey().defaultRandom(),
    tenantId: uuid('tenant_id').notNull().references(() => tenants.id, { onDelete: 'cascade' }),
    modelName: varchar('model_name', { length: 255 }).notNull(),
    populationSegmentId: uuid('population_segment_id').references(() => populationSegments.id).notNull(),
    eadMethod: varchar('ead_method', { length: 50 }).notNull(),
    calcMethod: varchar('calc_method', { length: 50 }).notNull(),
    isActive: boolean('is_active').default(true),
    createdBy: uuid('created_by').references(() => users.id),
    updatedBy: uuid('updated_by').references(() => users.id),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow(),
    createdHost: varchar('created_host', { length: 255 }),
    updatedHost: varchar('updated_host', { length: 255 }),
}, (table) => {
    return {
        uniqueEadModelNamePerTenant: unique('unique_ead_model_name_per_tenant').on(table.tenantId, table.modelName),
    };
});
