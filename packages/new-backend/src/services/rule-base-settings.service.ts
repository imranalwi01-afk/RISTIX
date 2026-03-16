import { Effect, pipe } from 'effect'
import { RuleBaseSettingsRepository } from '../repositories/rule-base-settings.repository'
import { ParametersRepository } from '../repositories/parameters.repository'
import { NotFoundError } from '../lib/errors'
import { frs9ParamScenarioRulesh, frs9ParamScenarioRulesd } from '../db/schema'

export const RuleBaseSettingsService = {
    // Header Operations

    /**
     * List rule headers with filtering.
     * 
     * @param query - Filter options
     * @param query.search - Search term for rule name or type
     * @param query.ruleType - Filter by rule type
     * @param query.activeFlag - Filter by active status
     * @returns An Effect resolving to an array of transformed headers
     */
    listHeaders: (query: { search?: string, ruleType?: string, activeFlag?: boolean }) => {
        return pipe(
            RuleBaseSettingsRepository.findHeaders(query.search, query.ruleType, query.activeFlag),
            Effect.map(headers => headers.map(transformHeader))
        )
    },

    /**
     * Get a rule header by ID.
     * 
     * @param id - The header ID
     * @returns An Effect resolving to the header or NotFoundError
     */
    getHeader: (id: number) => {
        return pipe(
            RuleBaseSettingsRepository.findHeaderById(BigInt(id)),
            Effect.flatMap(header =>
                header
                    ? Effect.succeed(transformHeader(header))
                    : Effect.fail(new NotFoundError({ message: 'Rule Header not found', resource: 'Rule Header', id: String(id) }))
            )
        )
    },

    /**
     * Create a new rule header.
     * 
     * @param data - The header data
     * @param userId - The ID of the user creating the header
     * @returns An Effect resolving to the created header
     */
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

    /**
     * Update an existing rule header.
     * 
     * @param id - The header ID
     * @param data - The data to update
     * @param userId - The ID of the user updating the header
     * @returns An Effect resolving to the updated header or NotFoundError
     */
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
                    : Effect.fail(new NotFoundError({ message: 'Rule Header not found', resource: 'Rule Header', id: String(id) }))
            )
        )
    },

    /**
     * Delete a rule header.
     * 
     * @param id - The header ID
     * @returns An Effect resolving to a success message
     */
    deleteHeader: (id: number) => {
        return pipe(
            RuleBaseSettingsRepository.deleteHeader(BigInt(id)),
            Effect.map(() => ({ message: 'Rule header deleted successfully' }))
        )
    },

    // Detail Operations

    /**
     * List details for a rule.
     * 
     * @param ruleId - The rule header ID
     * @returns An Effect resolving to an array of transformed details
     */
    listDetails: (ruleId: number) => {
        return pipe(
            RuleBaseSettingsRepository.findDetailsByRuleId(BigInt(ruleId)),
            Effect.map(details => details.map(transformDetail))
        )
    },

    /**
     * Get a rule detail by ID.
     *
     * @param id - The detail ID
     * @returns An Effect resolving to the detail or NotFoundError
     */
    getDetail: (id: number) => {
        return pipe(
            RuleBaseSettingsRepository.findDetailById(BigInt(id)),
            Effect.flatMap(detail =>
                detail
                    ? Effect.succeed(transformDetail(detail))
                    : Effect.fail(new NotFoundError({ message: 'Rule Detail not found', resource: 'Rule Detail', id: String(id) }))
            )
        )
    },

    /**
     * Create a new rule detail.
     * 
     * @param ruleId - The rule header ID
     * @param data - The detail data
     * @param userId - The ID of the user creating the detail
     * @returns An Effect resolving to the created detail
     */
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

    /**
     * Update an existing rule detail.
     * 
     * @param id - The detail ID
     * @param data - The data to update
     * @param userId - The ID of the user updating the detail
     * @returns An Effect resolving to the updated detail or NotFoundError
     */
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
                    : Effect.fail(new NotFoundError({ message: 'Rule Detail not found', resource: 'Rule Detail', id: String(id) }))
            )
        )
    },

    /**
     * Delete a rule detail.
     * 
     * @param id - The detail ID
     * @returns An Effect resolving to a success message or NotFoundError
     */
    deleteDetail: (id: number) => {
        return pipe(
            RuleBaseSettingsRepository.deleteDetail(BigInt(id)),
            Effect.flatMap(deleted =>
                deleted
                    ? Effect.succeed({ message: 'Rule detail deleted successfully' })
                    : Effect.fail(new NotFoundError({ message: 'Rule Detail not found', resource: 'Rule Detail', id: String(id) }))
            )
        )
    },

    // Metadata Handlers

    /**
     * Get available rule types options.
     * Dynamically sourced from Business Setting B0008 in FRS9_PARAM_COMMOND.
     * Per tech spec: RULE_TYPE = Combo Box (Business Setting B0008)
     */
    getRuleTypes: () => {
        return pipe(
            ParametersRepository.findDetailByCode('B0008'),
            Effect.map(details =>
                details
                    .filter(d => d.value1 !== null && d.value1 !== '')
                    .map(d => ({
                        value: d.value1!,
                        label: d.value2 ?? d.value1!,
                    }))
            )
        )
    },

    /**
     * Get available operators based on data type.
     * 
     * @param dataType - The column data type (varchar, int, date)
     * @returns An Effect resolving to an array of operators
     */
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

    /** Get available conditions (AND/OR). */
    getConditions: () => {
        return Effect.succeed([
            { value: 'AND', label: 'AND' },
            { value: 'OR', label: 'OR' },
        ])
    },

    /** Get available stage options. */
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
