import { and, desc, eq } from 'drizzle-orm'
import {
    approvalRequests,
    rolePermissions,
    roles,
    userRoles,
    users,
    frs9ImpCaEadConfig,
    frs9ImpCaEclConfigh,
    frs9ImpCaFlScalarh,
    frs9ImpCaLgdConfig,
    frs9ImpCaPdConfig,
    frs9ParamBucketh,
    frs9ParamCommond,
    frs9ParamCommonh,
    frs9ParamJournal,
    frs9ParamProduct,
    frs9ParamScenarioRulesd,
    frs9ParamScenarioRulesh,
    frs9ParamSegmentd,
    frs9ParamSegmenth,
} from '../src/db/schema'
import { closeDatabase, legacyDb, tenantDb } from '../src/config/database'
import { replayApprovedRequestSideEffect } from '../src/services/approval.service'

type Operation = 'create' | 'update' | 'delete'
type ReconciliationState =
    | 'already_applied'
    | 'missing_side_effect'
    | 'ambiguous'
    | 'unsupported'
    | 'error'
    | 'replayed'
    | 'replay_failed'

type ApprovedRequestRow = typeof approvalRequests.$inferSelect

interface ScriptOptions {
    tenantId?: string
    requestId?: string
    entityType?: string
    apply: boolean
    includeAmbiguous: boolean
    limit: number
}

interface ReconciliationResult {
    requestId: string
    entityType: string
    operation: string
    title: string
    state: ReconciliationState
    reason: string
}

interface Assessment {
    state: Exclude<ReconciliationState, 'replayed' | 'replay_failed' | 'error'>
    reason: string
}

const SUPPORTED_ENTITY_TYPES = new Set([
    'user',
    'user_status',
    'role',
    'role_assignment',
    'role_permission',
    'role_permissions',
    'parameter',
    'app_setting',
    'business_setting',
    'pd_configuration',
    'lgd_configuration',
    'ead_configuration',
    'ecl_configuration',
    'bucket_parameter',
    'rule_base_setting',
    'segmentation',
    'fl_scalar',
    'product_parameter',
    'journal_parameter',
])

function parseArgs(argv: string[]): ScriptOptions {
    const options: ScriptOptions = {
        apply: false,
        includeAmbiguous: false,
        limit: 200,
    }

    for (let i = 0; i < argv.length; i += 1) {
        const arg = argv[i]
        switch (arg) {
            case '--tenant-id':
                options.tenantId = argv[++i]
                break
            case '--request-id':
                options.requestId = argv[++i]
                break
            case '--entity-type':
                options.entityType = argv[++i]
                break
            case '--limit':
                options.limit = Number(argv[++i] ?? '200') || 200
                break
            case '--apply':
                options.apply = true
                break
            case '--include-ambiguous':
                options.includeAmbiguous = true
                break
            default:
                if (arg === '--help' || arg === '-h') {
                    printHelp()
                    process.exit(0)
                }
                throw new Error(`Unknown argument: ${arg}`)
        }
    }

    return options
}

function printHelp() {
    console.log(`
Reconcile approved approval requests whose live side effects may be missing.

Usage:
  bun run scripts/reconcile-approved-requests.ts [options]

Options:
  --tenant-id <id>         Filter by tenant id
  --request-id <id>        Reconcile a single approval request
  --entity-type <type>     Filter by entity type
  --limit <n>              Maximum requests to scan (default: 200)
  --apply                  Replay side effects for rows marked missing_side_effect
  --include-ambiguous      Also replay rows marked ambiguous
  -h, --help               Show this help
`)
}

function normalizeOperation(value: unknown): Operation | null {
    const op = String(value ?? '').trim().toLowerCase()
    if (op === 'create' || op === 'update' || op === 'delete') {
        return op
    }
    return null
}

function same(a: unknown, b: unknown): boolean {
    const normalize = (value: unknown) =>
        value === null || value === undefined
            ? ''
            : String(value).trim().toLowerCase()
    return normalize(a) === normalize(b)
}

function toNumericId(value: unknown): number | null {
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : null
}

function toBigIntId(value: unknown): bigint | null {
    try {
        if (value === null || value === undefined || value === '') return null
        return BigInt(String(value))
    } catch {
        return null
    }
}

function parseRequestData(request: ApprovedRequestRow): {
    operation: Operation | null
    entityType: string
    data: any
} {
    const requestData = (request.requestData ?? {}) as any
    return {
        operation: normalizeOperation(requestData.operation),
        entityType: String(requestData.entityType || request.entityType || '').trim(),
        data: requestData.data ?? {},
    }
}

async function fetchApprovedRequests(options: ScriptOptions): Promise<ApprovedRequestRow[]> {
    const conditions = [eq(approvalRequests.status, 'approved')]

    if (options.tenantId) {
        conditions.push(eq(approvalRequests.tenantId, options.tenantId))
    }

    if (options.requestId) {
        conditions.push(eq(approvalRequests.id, options.requestId))
    }

    if (options.entityType) {
        conditions.push(eq(approvalRequests.entityType, options.entityType))
    }

    return tenantDb
        .select()
        .from(approvalRequests)
        .where(and(...conditions))
        .orderBy(desc(approvalRequests.completedAt), desc(approvalRequests.createdAt))
        .limit(options.limit)
}

async function assessRequest(request: ApprovedRequestRow): Promise<Assessment> {
    const { operation, entityType, data } = parseRequestData(request)

    if (!operation) {
        return { state: 'ambiguous', reason: 'request_data.operation missing or unsupported' }
    }

    if (!SUPPORTED_ENTITY_TYPES.has(entityType)) {
        return { state: 'unsupported', reason: `entity type ${entityType} is not covered by reconciliation yet` }
    }

    switch (entityType) {
        case 'user':
            return assessUserRequest(operation, request, data)
        case 'user_status':
            return assessUserStatusRequest(request, data)
        case 'role':
            return assessRoleRequest(operation, request, data)
        case 'role_assignment':
            return assessRoleAssignmentRequest(operation, data)
        case 'role_permission':
        case 'role_permissions':
            return assessRolePermissionRequest(operation, data)
        case 'parameter':
        case 'app_setting':
        case 'business_setting':
            return assessParameterRequest(operation, request, data)
        case 'pd_configuration':
            return assessPdConfigurationRequest(operation, request, data)
        case 'lgd_configuration':
            return assessLgdConfigurationRequest(operation, request, data)
        case 'ead_configuration':
            return assessEadConfigurationRequest(operation, request, data)
        case 'ecl_configuration':
            return assessEclConfigurationRequest(operation, request, data)
        case 'bucket_parameter':
            return assessBucketRequest(operation, request, data)
        case 'rule_base_setting':
            return assessRuleBaseRequest(operation, request, data)
        case 'segmentation':
            return assessSegmentationRequest(operation, request, data)
        case 'fl_scalar':
            return assessFlScalarRequest(operation, request, data)
        case 'product_parameter':
            return assessProductRequest(operation, request, data)
        case 'journal_parameter':
            return assessJournalRequest(operation, request, data)
        default:
            return { state: 'unsupported', reason: `entity type ${entityType} is not mapped` }
    }
}

async function assessUserRequest(operation: Operation, request: ApprovedRequestRow, data: any): Promise<Assessment> {
    const id = request.entityId || data?.id
    const email = data?.email
    const userById = id ? await tenantDb.query.users.findFirst({ where: eq(users.id, String(id)) }) : undefined
    const userByEmail = email ? await tenantDb.query.users.findFirst({ where: eq(users.email, String(email)) }) : undefined
    const row = userById ?? userByEmail

    if (operation === 'create') {
        return row
            ? { state: 'already_applied', reason: `user exists (${row.email})` }
            : { state: 'missing_side_effect', reason: 'user row not found by id/email' }
    }

    if (operation === 'delete') {
        return row
            ? { state: 'missing_side_effect', reason: 'user row still exists after approved delete' }
            : { state: 'already_applied', reason: 'user row no longer exists' }
    }

    if (!row) {
        return { state: 'ambiguous', reason: 'user update target not found; row may have been deleted later' }
    }

    if (same(row.fullName, data?.fullName ?? data?.full_name) && same(row.email, data?.email)) {
        return { state: 'already_applied', reason: 'user row matches approved payload' }
    }

    return { state: 'ambiguous', reason: 'user exists but current values do not conclusively match approved payload' }
}

async function assessUserStatusRequest(request: ApprovedRequestRow, data: any): Promise<Assessment> {
    const userId = request.entityId || data?.id
    if (!userId) return { state: 'ambiguous', reason: 'missing user id in request payload' }

    const row = await tenantDb.query.users.findFirst({ where: eq(users.id, String(userId)) })
    if (!row) {
        return { state: 'ambiguous', reason: 'user row not found; status change target may have been removed' }
    }

    return row.isActive === Boolean(data?.isActive)
        ? { state: 'already_applied', reason: `user is_active already ${row.isActive}` }
        : { state: 'missing_side_effect', reason: `user is_active is ${row.isActive}, expected ${Boolean(data?.isActive)}` }
}

async function assessRoleRequest(operation: Operation, request: ApprovedRequestRow, data: any): Promise<Assessment> {
    const roleId = request.entityId || data?.id
    const roleCode = data?.roleCode ?? data?.role_code
    const rowById = roleId ? await tenantDb.query.roles.findFirst({ where: eq(roles.id, String(roleId)) }) : undefined
    const rowByCode = roleCode ? await tenantDb.query.roles.findFirst({ where: eq(roles.roleCode, String(roleCode)) }) : undefined
    const row = rowById ?? rowByCode

    if (operation === 'create') {
        return row
            ? { state: 'already_applied', reason: `role exists (${row.roleCode})` }
            : { state: 'missing_side_effect', reason: 'role row not found by id/code' }
    }

    if (operation === 'delete') {
        return row
            ? { state: 'missing_side_effect', reason: 'role row still exists after approved delete' }
            : { state: 'already_applied', reason: 'role row no longer exists' }
    }

    if (!row) {
        return { state: 'ambiguous', reason: 'role update target not found' }
    }

    if (same(row.roleName, data?.roleName ?? data?.role_name) && same(row.roleCode, roleCode)) {
        return { state: 'already_applied', reason: 'role row matches approved payload' }
    }

    return { state: 'ambiguous', reason: 'role exists but current values do not conclusively match approved payload' }
}

async function assessRoleAssignmentRequest(operation: Operation, data: any): Promise<Assessment> {
    const userId = data?.userId
    const roleId = data?.roleId

    if (!userId || !roleId) {
        return { state: 'ambiguous', reason: 'missing userId/roleId in role assignment payload' }
    }

    const row = await tenantDb.query.userRoles.findFirst({
        where: and(eq(userRoles.userId, String(userId)), eq(userRoles.roleId, String(roleId)), eq(userRoles.isActive, true)),
    })

    if (operation === 'create') {
        return row
            ? { state: 'already_applied', reason: 'active role assignment already exists' }
            : { state: 'missing_side_effect', reason: 'active role assignment not found' }
    }

    if (operation === 'delete') {
        return row
            ? { state: 'missing_side_effect', reason: 'active role assignment still exists after approved delete' }
            : { state: 'already_applied', reason: 'role assignment no longer active' }
    }

    return { state: 'unsupported', reason: 'role assignment update is not used in current workflow' }
}

async function assessRolePermissionRequest(operation: Operation, data: any): Promise<Assessment> {
    const roleId = data?.roleId
    const permissionId = data?.permissionId

    if (!roleId || !permissionId) {
        return { state: 'ambiguous', reason: 'missing roleId/permissionId in role permission payload' }
    }

    const row = await tenantDb.query.rolePermissions.findFirst({
        where: and(eq(rolePermissions.roleId, String(roleId)), eq(rolePermissions.permissionId, String(permissionId))),
    })

    if (operation === 'create') {
        return row
            ? { state: 'already_applied', reason: 'role permission row already exists' }
            : { state: 'missing_side_effect', reason: 'role permission row not found' }
    }

    if (operation === 'delete') {
        return row
            ? { state: 'missing_side_effect', reason: 'role permission row still exists after approved delete' }
            : { state: 'already_applied', reason: 'role permission row no longer exists' }
    }

    return { state: 'unsupported', reason: 'role permission update is not part of current workflow' }
}

async function assessParameterRequest(operation: Operation, request: ApprovedRequestRow, data: any): Promise<Assessment> {
    const detailScope = data?.scope === 'detail' || String(request.entityId || '').startsWith('detail:')

    if (detailScope) {
        const detailId = toBigIntId(String(request.entityId || '').replace(/^detail:/, '')) ?? toBigIntId(data?.detailId ?? data?.id)
        const paramCode = data?.paramCode ?? data?.parentCode
        const paramSeq = Number(data?.paramSeq ?? data?.param_seq)

        const rowById = detailId
            ? await legacyDb.select().from(frs9ParamCommond).where(eq(frs9ParamCommond.pkid, detailId)).limit(1)
            : []
        const rowByKey = paramCode && Number.isFinite(paramSeq)
            ? await legacyDb.select().from(frs9ParamCommond).where(and(eq(frs9ParamCommond.paramCode, String(paramCode)), eq(frs9ParamCommond.paramSeq, paramSeq))).limit(1)
            : []
        const row = rowById[0] ?? rowByKey[0]

        if (operation === 'create') {
            return row
                ? { state: 'already_applied', reason: `parameter detail exists (${paramCode}:${paramSeq})` }
                : { state: 'missing_side_effect', reason: 'parameter detail row not found by id/code+seq' }
        }

        if (operation === 'delete') {
            return row
                ? { state: 'missing_side_effect', reason: 'parameter detail row still exists after approved delete' }
                : { state: 'already_applied', reason: 'parameter detail row no longer exists' }
        }

        if (!row) {
            return { state: 'ambiguous', reason: 'parameter detail update target not found' }
        }

        if (same(row.value1, data?.value1) && same(row.value2, data?.value2) && same(row.value3, data?.value3)) {
            return { state: 'already_applied', reason: 'parameter detail matches approved payload' }
        }

        return { state: 'ambiguous', reason: 'parameter detail exists but values do not conclusively match approved payload' }
    }

    const paramCode = String(request.entityId || data?.paramCode || '')
    const row = paramCode
        ? await legacyDb.select().from(frs9ParamCommonh).where(eq(frs9ParamCommonh.paramCode, paramCode)).limit(1)
        : []
    const header = row[0]

    if (operation === 'create') {
        return header
            ? { state: 'already_applied', reason: `parameter header exists (${paramCode})` }
            : { state: 'missing_side_effect', reason: 'parameter header row not found by param_code' }
    }

    if (operation === 'delete') {
        return header
            ? { state: 'missing_side_effect', reason: 'parameter header row still exists after approved delete' }
            : { state: 'already_applied', reason: 'parameter header row no longer exists' }
    }

    if (!header) {
        return { state: 'ambiguous', reason: 'parameter update target not found' }
    }

    if (same(header.paramName, data?.paramName ?? data?.param_name) && same(header.paramUsage, data?.paramUsage ?? data?.param_usage)) {
        return { state: 'already_applied', reason: 'parameter header matches approved payload' }
    }

    return { state: 'ambiguous', reason: 'parameter header exists but values do not conclusively match approved payload' }
}

async function assessPdConfigurationRequest(operation: Operation, request: ApprovedRequestRow, data: any): Promise<Assessment> {
    const id = toNumericId(request.entityId ?? data?.id)
    const rowById = id !== null
        ? await legacyDb.select().from(frs9ImpCaPdConfig).where(eq(frs9ImpCaPdConfig.pkid, id)).limit(1)
        : []
    const rowByName = data?.model_name
        ? await legacyDb.select().from(frs9ImpCaPdConfig).where(eq(frs9ImpCaPdConfig.pdModelName, String(data.model_name))).limit(1)
        : []
    const row = rowById[0] ?? rowByName[0]

    return assessLegacyHeaderOperation(operation, row, {
        createMissing: 'PD configuration row not found by id/model_name',
        deleteExisting: 'PD configuration row still exists after approved delete',
        updateMatch: row
            ? same(row.pdModelName, data?.model_name) && same(row.pdMethod, data?.pd_method)
            : false,
        label: 'PD configuration',
    })
}

async function assessLgdConfigurationRequest(operation: Operation, request: ApprovedRequestRow, data: any): Promise<Assessment> {
    const id = toNumericId(request.entityId ?? data?.id)
    const rowById = id !== null
        ? await legacyDb.select().from(frs9ImpCaLgdConfig).where(eq(frs9ImpCaLgdConfig.pkid, id)).limit(1)
        : []
    const rowByName = data?.model_name
        ? await legacyDb.select().from(frs9ImpCaLgdConfig).where(eq(frs9ImpCaLgdConfig.lgdModelName, String(data.model_name))).limit(1)
        : []
    const row = rowById[0] ?? rowByName[0]

    return assessLegacyHeaderOperation(operation, row, {
        createMissing: 'LGD configuration row not found by id/model_name',
        deleteExisting: 'LGD configuration row still exists after approved delete',
        updateMatch: row
            ? same(row.lgdModelName, data?.model_name) && same(row.lgdMethod, data?.lgd_method)
            : false,
        label: 'LGD configuration',
    })
}

async function assessEadConfigurationRequest(operation: Operation, request: ApprovedRequestRow, data: any): Promise<Assessment> {
    const id = toNumericId(request.entityId ?? data?.id)
    const rowById = id !== null
        ? await legacyDb.select().from(frs9ImpCaEadConfig).where(eq(frs9ImpCaEadConfig.pkid, id)).limit(1)
        : []
    const rowByName = data?.model_name
        ? await legacyDb.select().from(frs9ImpCaEadConfig).where(eq(frs9ImpCaEadConfig.eadModelName, String(data.model_name))).limit(1)
        : []
    const row = rowById[0] ?? rowByName[0]

    return assessLegacyHeaderOperation(operation, row, {
        createMissing: 'EAD configuration row not found by id/model_name',
        deleteExisting: 'EAD configuration row still exists after approved delete',
        updateMatch: row
            ? same(row.eadModelName, data?.model_name) && same(row.eadMethod, data?.ead_method)
            : false,
        label: 'EAD configuration',
    })
}

async function assessEclConfigurationRequest(operation: Operation, request: ApprovedRequestRow, data: any): Promise<Assessment> {
    const id = toNumericId(request.entityId ?? data?.id)
    const rowById = id !== null
        ? await legacyDb.select().from(frs9ImpCaEclConfigh).where(eq(frs9ImpCaEclConfigh.pkid, id)).limit(1)
        : []
    const rowByName = data?.modelName
        ? await legacyDb.select().from(frs9ImpCaEclConfigh).where(eq(frs9ImpCaEclConfigh.eclModelName, String(data.modelName))).limit(1)
        : []
    const row = rowById[0] ?? rowByName[0]

    return assessLegacyHeaderOperation(operation, row, {
        createMissing: 'ECL configuration row not found by id/modelName',
        deleteExisting: 'ECL configuration row still exists after approved delete',
        updateMatch: row
            ? same(row.eclModelName, data?.modelName) && same(row.module, data?.module)
            : false,
        label: 'ECL configuration',
    })
}

async function assessBucketRequest(operation: Operation, request: ApprovedRequestRow, data: any): Promise<Assessment> {
    const id = toNumericId(request.entityId ?? data?.id)
    const rowById = id !== null
        ? await legacyDb.select().from(frs9ParamBucketh).where(eq(frs9ParamBucketh.pkid, id)).limit(1)
        : []
    const rowByKey = data?.bucket_group
        ? await legacyDb.select().from(frs9ParamBucketh).where(eq(frs9ParamBucketh.bucketGroup, String(data.bucket_group))).limit(1)
        : []
    const row = rowById[0] ?? rowByKey[0]

    return assessLegacyHeaderOperation(operation, row, {
        createMissing: 'bucket header row not found by id/bucket_group',
        deleteExisting: 'bucket header row still exists after approved delete',
        updateMatch: row
            ? same(row.bucketGroup, data?.bucket_group) && same(row.basis, data?.basis)
            : false,
        label: 'bucket parameter',
    })
}

async function assessRuleBaseRequest(operation: Operation, request: ApprovedRequestRow, data: any): Promise<Assessment> {
    const detailScope = data?.scope === 'detail' || String(request.entityId || '').startsWith('detail:')

    if (detailScope) {
        const detailId = toNumericId(String(request.entityId || '').replace(/^detail:/, '')) ?? toNumericId(data?.detailId ?? data?.id)
        const rowById = detailId !== null
            ? await legacyDb.select().from(frs9ParamScenarioRulesd).where(eq(frs9ParamScenarioRulesd.pkid, detailId)).limit(1)
            : []
        const rowByKey = Number.isFinite(Number(data?.ruleId)) && Number.isFinite(Number(data?.query_group)) && Number.isFinite(Number(data?.seq))
            ? await legacyDb.select().from(frs9ParamScenarioRulesd).where(and(
                eq(frs9ParamScenarioRulesd.ruleId, Number(data.ruleId)),
                eq(frs9ParamScenarioRulesd.queryGroup, Number(data.query_group)),
                eq(frs9ParamScenarioRulesd.seq, Number(data.seq)),
                eq(frs9ParamScenarioRulesd.tableName, String(data.table_name)),
                eq(frs9ParamScenarioRulesd.columnName, String(data.column_name)),
            )).limit(1)
            : []
        const row = rowById[0] ?? rowByKey[0]

        return assessLegacyHeaderOperation(operation, row, {
            createMissing: 'rule detail row not found by id/composite business key',
            deleteExisting: 'rule detail row still exists after approved delete',
            updateMatch: row
                ? same(row.operator, data?.operator) && same(row.value1, data?.value1) && same(row.detailType, data?.detail_type)
                : false,
            label: 'rule detail',
        })
    }

    const id = toNumericId(request.entityId ?? data?.id)
    const rowById = id !== null
        ? await legacyDb.select().from(frs9ParamScenarioRulesh).where(eq(frs9ParamScenarioRulesh.pkid, id)).limit(1)
        : []
    const rowByKey = data?.rule_name
        ? await legacyDb.select().from(frs9ParamScenarioRulesh).where(and(
            eq(frs9ParamScenarioRulesh.ruleName, String(data.rule_name)),
            eq(frs9ParamScenarioRulesh.ruleType, String(data.rule_type)),
        )).limit(1)
        : []
    const row = rowById[0] ?? rowByKey[0]

    return assessLegacyHeaderOperation(operation, row, {
        createMissing: 'rule header row not found by id/rule_name+rule_type',
        deleteExisting: 'rule header row still exists after approved delete',
        updateMatch: row
            ? same(row.ruleName, data?.rule_name) && same(row.ruleType, data?.rule_type)
            : false,
        label: 'rule header',
    })
}

async function assessSegmentationRequest(operation: Operation, request: ApprovedRequestRow, data: any): Promise<Assessment> {
    const detailScope = data?.scope === 'detail' || String(request.entityId || '').startsWith('detail:')

    if (detailScope) {
        const detailId = toNumericId(String(request.entityId || '').replace(/^detail:/, '')) ?? toNumericId(data?.detail_id ?? data?.id)
        const rowById = detailId !== null
            ? await legacyDb.select().from(frs9ParamSegmentd).where(eq(frs9ParamSegmentd.pkid, detailId)).limit(1)
            : []
        const rowByKey = Number.isFinite(Number(data?.segment_id)) && Number.isFinite(Number(data?.query_group)) && Number.isFinite(Number(data?.seq))
            ? await legacyDb.select().from(frs9ParamSegmentd).where(and(
                eq(frs9ParamSegmentd.segmentId, Number(data.segment_id)),
                eq(frs9ParamSegmentd.queryGroup, Number(data.query_group)),
                eq(frs9ParamSegmentd.seq, Number(data.seq)),
                eq(frs9ParamSegmentd.tableName, String(data.table_name)),
                eq(frs9ParamSegmentd.columnName, String(data.column_name)),
            )).limit(1)
            : []
        const row = rowById[0] ?? rowByKey[0]

        return assessLegacyHeaderOperation(operation, row, {
            createMissing: 'segmentation detail row not found by id/composite business key',
            deleteExisting: 'segmentation detail row still exists after approved delete',
            updateMatch: row
                ? same(row.operator, data?.operator) && same(row.value1, data?.value1)
                : false,
            label: 'segmentation detail',
        })
    }

    const id = toNumericId(request.entityId ?? data?.id)
    const rowById = id !== null
        ? await legacyDb.select().from(frs9ParamSegmenth).where(eq(frs9ParamSegmenth.pkid, id)).limit(1)
        : []
    const rowByKey = data?.segment
        ? await legacyDb.select().from(frs9ParamSegmenth).where(and(
            eq(frs9ParamSegmenth.groupSegment, String(data.group_segment)),
            eq(frs9ParamSegmenth.segment, String(data.segment)),
            eq(frs9ParamSegmenth.subSegment, String(data.sub_segment)),
        )).limit(1)
        : []
    const row = rowById[0] ?? rowByKey[0]

    return assessLegacyHeaderOperation(operation, row, {
        createMissing: 'segmentation header row not found by id/group+segment+sub-segment',
        deleteExisting: 'segmentation header row still exists after approved delete',
        updateMatch: row
            ? same(row.groupSegment, data?.group_segment) && same(row.segment, data?.segment) && same(row.subSegment, data?.sub_segment)
            : false,
        label: 'segmentation header',
    })
}

async function assessFlScalarRequest(operation: Operation, request: ApprovedRequestRow, data: any): Promise<Assessment> {
    const id = toNumericId(request.entityId ?? data?.id)
    const rowById = id !== null
        ? await legacyDb.select().from(frs9ImpCaFlScalarh).where(eq(frs9ImpCaFlScalarh.pkid, id)).limit(1)
        : []
    const rowByKey = data?.scalar_name
        ? await legacyDb.select().from(frs9ImpCaFlScalarh).where(eq(frs9ImpCaFlScalarh.scalarName, String(data.scalar_name))).limit(1)
        : []
    const row = rowById[0] ?? rowByKey[0]

    return assessLegacyHeaderOperation(operation, row, {
        createMissing: 'FL scalar header row not found by id/scalar_name',
        deleteExisting: 'FL scalar header row still exists after approved delete',
        updateMatch: row
            ? same(row.scalarName, data?.scalar_name)
            : false,
        label: 'FL scalar',
    })
}

async function assessProductRequest(operation: Operation, request: ApprovedRequestRow, data: any): Promise<Assessment> {
    const id = toNumericId(request.entityId ?? data?.id)
    const rowById = id !== null
        ? await legacyDb.select().from(frs9ParamProduct).where(eq(frs9ParamProduct.pkid, id)).limit(1)
        : []
    const rowByKey = data?.prdCode
        ? await legacyDb.select().from(frs9ParamProduct).where(eq(frs9ParamProduct.prdCode, String(data.prdCode))).limit(1)
        : []
    const row = rowById[0] ?? rowByKey[0]

    return assessLegacyHeaderOperation(operation, row, {
        createMissing: 'product parameter row not found by id/prdCode',
        deleteExisting: 'product parameter row still exists after approved delete',
        updateMatch: row
            ? same(row.prdCode, data?.prdCode) && same(row.prdDesc, data?.prdDesc)
            : false,
        label: 'product parameter',
    })
}

async function assessJournalRequest(operation: Operation, request: ApprovedRequestRow, data: any): Promise<Assessment> {
    const id = toNumericId(request.entityId ?? data?.id)
    const rowById = id !== null
        ? await legacyDb.select().from(frs9ParamJournal).where(eq(frs9ParamJournal.pkid, id)).limit(1)
        : []
    const rowByKey = data?.glCode
        ? await legacyDb.select().from(frs9ParamJournal).where(and(
            eq(frs9ParamJournal.glCode, String(data.glCode)),
            eq(frs9ParamJournal.glNumber, String(data.glNumber ?? '')),
            eq(frs9ParamJournal.dbcr, String(data.dbcr ?? '')),
        )).limit(1)
        : []
    const row = rowById[0] ?? rowByKey[0]

    return assessLegacyHeaderOperation(operation, row, {
        createMissing: 'journal parameter row not found by id/composite business key',
        deleteExisting: 'journal parameter row still exists after approved delete',
        updateMatch: row
            ? same(row.glCode, data?.glCode) && same(row.glNumber, data?.glNumber) && same(row.glDesc, data?.glDesc)
            : false,
        label: 'journal parameter',
    })
}

function assessLegacyHeaderOperation(
    operation: Operation,
    row: unknown,
    config: {
        createMissing: string
        deleteExisting: string
        updateMatch: boolean
        label: string
    }
): Assessment {
    if (operation === 'create') {
        return row
            ? { state: 'already_applied', reason: `${config.label} already exists` }
            : { state: 'missing_side_effect', reason: config.createMissing }
    }

    if (operation === 'delete') {
        return row
            ? { state: 'missing_side_effect', reason: config.deleteExisting }
            : { state: 'already_applied', reason: `${config.label} no longer exists` }
    }

    if (!row) {
        return { state: 'ambiguous', reason: `${config.label} update target not found` }
    }

    return config.updateMatch
        ? { state: 'already_applied', reason: `${config.label} matches approved payload` }
        : { state: 'ambiguous', reason: `${config.label} exists but current values do not conclusively match approved payload` }
}

async function maybeReplayRequest(request: ApprovedRequestRow, assessment: Assessment, options: ScriptOptions): Promise<ReconciliationResult> {
    const { operation } = parseRequestData(request)
    const eligible =
        assessment.state === 'missing_side_effect' ||
        (options.includeAmbiguous && assessment.state === 'ambiguous')

    if (!options.apply || !eligible) {
        return {
            requestId: request.id,
            entityType: request.entityType,
            operation: operation ?? 'unknown',
            title: request.title,
            state: assessment.state,
            reason: assessment.reason,
        }
    }

    try {
        await replayApprovedRequestSideEffect(request, request.completedBy ?? request.requestedBy ?? undefined)
        return {
            requestId: request.id,
            entityType: request.entityType,
            operation: operation ?? 'unknown',
            title: request.title,
            state: 'replayed',
            reason: `replayed successfully from state ${assessment.state}`,
        }
    } catch (error) {
        return {
            requestId: request.id,
            entityType: request.entityType,
            operation: operation ?? 'unknown',
            title: request.title,
            state: 'replay_failed',
            reason: error instanceof Error ? error.message : String(error),
        }
    }
}

function printSummary(results: ReconciliationResult[]) {
    const counts = results.reduce<Record<string, number>>((acc, item) => {
        acc[item.state] = (acc[item.state] || 0) + 1
        return acc
    }, {})

    console.log('\nReconciliation summary:')
    for (const state of [
        'already_applied',
        'missing_side_effect',
        'ambiguous',
        'unsupported',
        'replayed',
        'replay_failed',
        'error',
    ]) {
        if (counts[state]) {
            console.log(`- ${state}: ${counts[state]}`)
        }
    }

    console.log('\nDetailed results:')
    for (const result of results) {
        console.log(`- [${result.state}] ${result.entityType} ${result.operation} ${result.requestId} :: ${result.reason}`)
    }
}

async function main() {
    const options = parseArgs(process.argv.slice(2))
    console.log('Scanning approved approval requests...')
    console.log(JSON.stringify(options, null, 2))

    const requests = await fetchApprovedRequests(options)
    console.log(`Found ${requests.length} approved request(s) to inspect`)

    const results: ReconciliationResult[] = []

    for (const request of requests) {
        try {
            const assessment = await assessRequest(request)
            const result = await maybeReplayRequest(request, assessment, options)
            results.push(result)
        } catch (error) {
            const { operation } = parseRequestData(request)
            results.push({
                requestId: request.id,
                entityType: request.entityType,
                operation: operation ?? 'unknown',
                title: request.title,
                state: 'error',
                reason: error instanceof Error ? error.message : String(error),
            })
        }
    }

    printSummary(results)
}

main()
    .catch((error) => {
        console.error('Failed to reconcile approved requests:', error)
        process.exitCode = 1
    })
    .finally(async () => {
        await closeDatabase()
    })
