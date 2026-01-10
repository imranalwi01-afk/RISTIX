import { Effect, pipe } from 'effect'
import { RuleBaseSettingsRepository } from '../repositories/rule-base-settings.repository'
import { NotFoundError } from '../lib/errors'
import { frs9ParamScenarioRulesh, frs9ParamScenarioRulesd } from '../db/schema'

export const RuleBaseSettingsService = {
    // Header Operations
    listHeaders: (query: { search?: string, ruleType?: string, activeFlag?: boolean }) => {
        return pipe(
            RuleBaseSettingsRepository.findHeaders(query.search, query.ruleType, query.activeFlag),
            Effect.map(headers => headers.map(transformHeader))
        )
    },

    getHeader: (id: number) => {
        return pipe(
            RuleBaseSettingsRepository.findHeaderById(BigInt(id)),
            Effect.flatMap(header =>
                header
                    ? Effect.succeed(transformHeader(header))
                    : Effect.fail(new NotFoundError({ resource: 'Rule Header', id: String(id) }))
            )
        )
    },

    createHeader: (data: any, userId: string) => {
        const now = new Date().toISOString()
        const payload = {
            ...data,
            createdby: userId,
            createdhost: 'localhost',
            createddate: now,
            updatedby: userId,
            updatedhost: 'localhost',
            updateddate: now
        }
        return pipe(
            RuleBaseSettingsRepository.createHeader(payload as any),
            Effect.map(transformHeader)
        )
    },

    updateHeader: (id: number, data: any, userId: string) => {
        const now = new Date().toISOString()
        const payload = {
            ...data,
            updatedby: userId,
            updatedhost: 'localhost',
            updateddate: now
        }
        return pipe(
            RuleBaseSettingsRepository.updateHeader(BigInt(id), payload as any),
            Effect.flatMap(updated =>
                updated
                    ? Effect.succeed(transformHeader(updated))
                    : Effect.fail(new NotFoundError({ resource: 'Rule Header', id: String(id) }))
            )
        )
    },

    deleteHeader: (id: number) => {
        return pipe(
            RuleBaseSettingsRepository.deleteHeader(BigInt(id)),
            Effect.map(() => ({ message: 'Rule header deleted successfully' }))
        )
    },

    // Detail Operations
    listDetails: (ruleId: number) => {
        return pipe(
            RuleBaseSettingsRepository.findDetailsByRuleId(BigInt(ruleId)),
            Effect.map(details => details.map(transformDetail))
        )
    },

    createDetail: (ruleId: number, data: any, userId: string) => {
        const now = new Date().toISOString()
        const payload = {
            ...data,
            ruleId,
            value1: data.value1 || '',
            createdby: userId,
            createdhost: 'localhost',
            createddate: now,
            updatedby: userId,
            updatedhost: 'localhost',
            updateddate: now
        }
        return pipe(
            RuleBaseSettingsRepository.createDetail(payload as any),
            Effect.map(transformDetail)
        )
    },

    updateDetail: (id: number, data: any, userId: string) => {
        const now = new Date().toISOString()
        const payload = {
            ...data,
            updatedby: userId,
            updatedhost: 'localhost',
            updateddate: now
        }
        return pipe(
            RuleBaseSettingsRepository.updateDetail(BigInt(id), payload as any),
            Effect.flatMap(updated =>
                updated
                    ? Effect.succeed(transformDetail(updated))
                    : Effect.fail(new NotFoundError({ resource: 'Rule Detail', id: String(id) }))
            )
        )
    },

    deleteDetail: (id: number) => {
        return pipe(
            RuleBaseSettingsRepository.deleteDetail(BigInt(id)),
            Effect.flatMap(deleted =>
                deleted
                    ? Effect.succeed({ message: 'Rule detail deleted successfully' })
                    : Effect.fail(new NotFoundError({ resource: 'Rule Detail', id: String(id) }))
            )
        )
    },

    // Metadata Handlers
    getRuleTypes: () => {
        return Effect.succeed([
            { value: 'DEFAULT', label: 'Default' },
            { value: 'GL', label: 'GL Grouping' },
            { value: 'STAGE', label: 'IFRS 9 Stage' },
            { value: 'CUSTOM', label: 'Custom Rule' },
        ])
    },

    getOperators: (dataType: string) => {
        const operators = {
            varchar: [
                { value: '=', label: 'Equals' },
                { value: '!=', label: 'Not Equals' },
                { value: 'LIKE', label: 'Like' },
                { value: 'IN', label: 'In', supportsMultiple: true },
                { value: 'IS NULL', label: 'Is Null', requiresNoValues: true },
                { value: 'IS NOT NULL', label: 'Is Not Null', requiresNoValues: true },
            ],
            int: [
                { value: '=', label: 'Equals' },
                { value: '!=', label: 'Not Equals' },
                { value: '>', label: 'Greater Than' },
                { value: '<', label: 'Less Than' },
                { value: '>=', label: 'Greater or Equal' },
                { value: '<=', label: 'Less or Equal' },
                { value: 'BETWEEN', label: 'Between', requiresValue2: true },
                { value: 'IN', label: 'In', supportsMultiple: true },
            ],
            date: [
                { value: '=', label: 'Equals' },
                { value: '>', label: 'After' },
                { value: '<', label: 'Before' },
                { value: 'BETWEEN', label: 'Between', requiresValue2: true },
            ],
        }
        return Effect.succeed(operators[dataType as keyof typeof operators] || operators.varchar)
    },

    getConditions: () => {
        return Effect.succeed([
            { value: 'AND', label: 'AND' },
            { value: 'OR', label: 'OR' },
        ])
    },

    getStages: () => {
        return Effect.succeed([
            { value: '1', label: 'Stage 1 - Performing' },
            { value: '2', label: 'Stage 2 - Underperforming' },
            { value: '3', label: 'Stage 3 - Non-performing' },
        ])
    }
}

// Helpers
const transformHeader = (header: typeof frs9ParamScenarioRulesh.$inferSelect) => ({
    id: header.pkid,
    rule_name: header.ruleName,
    rule_type: header.ruleType,
    updated_table: header.updatedTable,
    updated_column: header.updatedColumn,
    value: header.value,
    seq: header.seq,
    active_flag: header.activeFlag,
    created_by: header.createdby,
    updated_by: header.updatedby,
    created_date: header.createddate,
    updated_date: header.updateddate,
})

const transformDetail = (detail: typeof frs9ParamScenarioRulesd.$inferSelect) => ({
    id: detail.pkid,
    rule_id: detail.ruleId,
    query_group: detail.queryGroup,
    seq: detail.seq,
    table_name: detail.tableName,
    column_name: detail.columnName,
    data_type: detail.dataType,
    operator: detail.operator,
    value1: detail.value1,
    value2: detail.value2,
    condition: detail.condition,
    detail_type: detail.detailType,
    stage_from: detail.stageFrom,
    stage_to: detail.stageTo,
    created_by: detail.createdby,
    updated_by: detail.updatedby,
    created_date: detail.createddate,
    updated_date: detail.updateddate,
})
