import { and, desc, eq } from 'drizzle-orm'
import fs from 'node:fs'
import path from 'node:path'
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
import {
    buildReconciliationCsv,
    buildReconciliationJsonReport,
    type ReconciliationReportFormat,
} from '../src/lib/approval-reconciliation-report'
import {
    assessBucketHeaderRequest,
    assessFlScalarHeaderRequest,
    assessLegacyHeaderOperation,
    assessParameterDetailRequest,
    assessProductHeaderRequest,
    assessJournalHeaderRequest,
    assessRuleBaseHeaderRequest,
    assessRuleBaseDetailRequest,
    assessSegmentationDetailRequest,
    assessSegmentationHeaderRequest,
    maybeReplayAssessment,
    same,
    toBigIntId,
    toNumericId,
    type Assessment,
    type ReconciliationResult,
    type Operation,
} from '../src/lib/approval-reconciliation'

type ApprovedRequestRow = typeof approvalRequests.$inferSelect

export interface ScriptOptions {
    envFile?: string
    tenantId?: string
    requestId?: string
    entityType?: string
    reportFormat: ReconciliationReportFormat
    outputFile?: string
    apply: boolean
    includeAmbiguous: boolean
    limit: number
}

let tenantDb: any
let legacyDb: any
let closeDatabase: (() => Promise<void>) | (() => void)
let replayApprovedRequestSideEffect: (request: any, approvedBy?: string) => Promise<void>

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
        reportFormat: 'console',
        apply: false,
        includeAmbiguous: false,
        limit: 200,
    }

    for (let i = 0; i < argv.length; i += 1) {
        const arg = argv[i]
        switch (arg) {
            case '--env-file':
                options.envFile = argv[++i]
                break
            case '--tenant-id':
                options.tenantId = argv[++i]
                break
            case '--request-id':
                options.requestId = argv[++i]
                break
            case '--entity-type':
                options.entityType = argv[++i]
                break
            case '--report-format':
            case '--format':
                {
                    const value = String(argv[++i] ?? '').trim().toLowerCase()
                    if (value !== 'console' && value !== 'json' && value !== 'csv') {
                        throw new Error(`Unsupported report format: ${value}`)
                    }
                    options.reportFormat = value as ReconciliationReportFormat
                }
                break
            case '--output-file':
                options.outputFile = argv[++i]
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
  --env-file <path>       Explicit env file to load and override current process env
  --tenant-id <id>         Filter by tenant id
  --request-id <id>        Reconcile a single approval request
  --entity-type <type>     Filter by entity type
  --report-format <type>   Output report as console, json, or csv (default: console)
  --output-file <path>     Write JSON/CSV report to a file (format inferred from extension if omitted)
  --limit <n>              Maximum requests to scan (default: 200)
  --apply                  Replay side effects for rows marked missing_side_effect
  --include-ambiguous      Also replay rows marked ambiguous
  -h, --help               Show this help
`)
}

function loadEnvFile(envFile: string) {
    const resolvedCandidates = path.isAbsolute(envFile)
        ? [envFile]
        : [
            path.resolve(process.cwd(), envFile),
            path.resolve(process.cwd(), '..', envFile),
            path.resolve(process.cwd(), '..', '..', envFile),
        ]

    const resolved = resolvedCandidates.find((candidate) => fs.existsSync(candidate))
    if (!resolved) {
        throw new Error(`Env file not found: ${resolvedCandidates[0]}`)
    }

    const content = fs.readFileSync(resolved, 'utf-8')
    for (const line of content.split('\n')) {
        const match = line.match(/^\s*([\w_]+)\s*=\s*(.*)?\s*$/)
        if (!match) continue
        const key = match[1]
        let value = match[2] ? match[2].trim() : ''
        value = value.replace(/^["'](.*)["']$/, '$1')
        process.env[key] = value
    }
}

function inferReportFormat(options: ScriptOptions): ReconciliationReportFormat {
    if (options.outputFile) {
        const extension = path.extname(options.outputFile).toLowerCase()
        if (extension === '.json') return 'json'
        if (extension === '.csv') return 'csv'
    }
    return options.reportFormat
}

function ensureParentDirectory(filePath: string) {
    const directory = path.dirname(filePath)
    if (!fs.existsSync(directory)) {
        fs.mkdirSync(directory, { recursive: true })
    }
}

export function setReconciliationRuntimeForTests(runtime: {
    tenantDb: any
    legacyDb: any
    closeDatabase?: (() => Promise<void>) | (() => void)
    replayApprovedRequestSideEffect?: (request: any, approvedBy?: string) => Promise<void>
}) {
    tenantDb = runtime.tenantDb
    legacyDb = runtime.legacyDb
    closeDatabase = runtime.closeDatabase || (async () => undefined)
    replayApprovedRequestSideEffect = runtime.replayApprovedRequestSideEffect || (async () => undefined)
}

export async function initializeRuntime(options: ScriptOptions) {
    if (options.envFile) {
        const resolvedEnvFile = path.isAbsolute(options.envFile)
            ? options.envFile
            : [
                path.resolve(process.cwd(), options.envFile),
                path.resolve(process.cwd(), '..', options.envFile),
                path.resolve(process.cwd(), '..', '..', options.envFile),
            ].find((candidate) => fs.existsSync(candidate)) ?? path.resolve(process.cwd(), options.envFile)
        process.env.ENV_FILE = resolvedEnvFile
        loadEnvFile(resolvedEnvFile)
    }

    const databaseModule = await import('../src/config/database')
    const approvalServiceModule = await import('../src/services/approval.service')

    tenantDb = databaseModule.tenantDb
    legacyDb = databaseModule.legacyDb
    closeDatabase = databaseModule.closeDatabase
    replayApprovedRequestSideEffect = approvalServiceModule.replayApprovedRequestSideEffect
}

function normalizeOperation(value: unknown): Operation | null {
    const op = String(value ?? '').trim().toLowerCase()
    if (op === 'create' || op === 'update' || op === 'delete') {
        return op
    }
    return null
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

export async function assessRequest(request: ApprovedRequestRow): Promise<Assessment> {
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
        return assessParameterDetailRequest(operation, request, data, { rowById, rowByKey })
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
    return assessBucketHeaderRequest(operation, data, { rowById, rowByKey })
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
        return assessRuleBaseDetailRequest(operation, request, data, { rowById, rowByKey })
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
    return assessRuleBaseHeaderRequest(operation, data, { rowById, rowByKey })
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
        return assessSegmentationDetailRequest(operation, data, { rowById, rowByKey })
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
    return assessSegmentationHeaderRequest(operation, data, { rowById, rowByKey })
}

async function assessFlScalarRequest(operation: Operation, request: ApprovedRequestRow, data: any): Promise<Assessment> {
    const id = toNumericId(request.entityId ?? data?.id)
    const rowById = id !== null
        ? await legacyDb.select().from(frs9ImpCaFlScalarh).where(eq(frs9ImpCaFlScalarh.pkid, id)).limit(1)
        : []
    const rowByKey = data?.scalar_name
        ? await legacyDb.select().from(frs9ImpCaFlScalarh).where(eq(frs9ImpCaFlScalarh.scalarName, String(data.scalar_name))).limit(1)
        : []
    return assessFlScalarHeaderRequest(operation, data, { rowById, rowByKey })
}

async function assessProductRequest(operation: Operation, request: ApprovedRequestRow, data: any): Promise<Assessment> {
    const id = toNumericId(request.entityId ?? data?.id)
    const rowById = id !== null
        ? await legacyDb.select().from(frs9ParamProduct).where(eq(frs9ParamProduct.pkid, id)).limit(1)
        : []
    const rowByKey = data?.prdCode
        ? await legacyDb.select().from(frs9ParamProduct).where(eq(frs9ParamProduct.prdCode, String(data.prdCode))).limit(1)
        : []
    return assessProductHeaderRequest(operation, data, { rowById, rowByKey })
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
    return assessJournalHeaderRequest(operation, data, { rowById, rowByKey })
}

export async function maybeReplayRequest(request: ApprovedRequestRow, assessment: Assessment, options: ScriptOptions): Promise<ReconciliationResult> {
    const { operation } = parseRequestData(request)
    return maybeReplayAssessment(
        request,
        operation,
        assessment,
        options,
        replayApprovedRequestSideEffect
    )
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

function printEntitySummary(results: ReconciliationResult[]) {
    const byEntity = results.reduce<Record<string, Record<string, number>>>((acc, item) => {
        acc[item.entityType] = acc[item.entityType] || {}
        acc[item.entityType][item.state] = (acc[item.entityType][item.state] || 0) + 1
        return acc
    }, {})

    console.log('\nEntity summary:')
    for (const entityType of Object.keys(byEntity).sort()) {
        const summary = Object.entries(byEntity[entityType])
            .map(([state, count]) => `${state}=${count}`)
            .join(', ')
        console.log(`- ${entityType}: ${summary}`)
    }
}

function emitReport(results: ReconciliationResult[], options: ScriptOptions) {
    const effectiveFormat = inferReportFormat(options)

    if (effectiveFormat === 'console' && !options.outputFile) {
        printSummary(results)
        printEntitySummary(results)
        return
    }

    const filters = {
        tenantId: options.tenantId,
        requestId: options.requestId,
        entityType: options.entityType,
        apply: options.apply,
        includeAmbiguous: options.includeAmbiguous,
        limit: options.limit,
    }

    const content = effectiveFormat === 'json'
        ? JSON.stringify(buildReconciliationJsonReport(results, { filters }), null, 2)
        : buildReconciliationCsv(results)

    if (options.outputFile) {
        const resolved = path.isAbsolute(options.outputFile)
            ? options.outputFile
            : path.resolve(process.cwd(), options.outputFile)
        ensureParentDirectory(resolved)
        fs.writeFileSync(resolved, content, 'utf-8')
        console.log(`\nReconciliation report written to ${resolved}`)
    } else {
        console.log(content)
    }

    printSummary(results)
    printEntitySummary(results)
}

export async function main() {
    const options = parseArgs(process.argv.slice(2))
    await initializeRuntime(options)
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

    emitReport(results, options)
}

if (import.meta.main) {
    main()
        .catch((error) => {
            console.error('Failed to reconcile approved requests:', error)
            process.exitCode = 1
        })
        .finally(async () => {
            if (closeDatabase) {
                await closeDatabase()
            }
        })
}
