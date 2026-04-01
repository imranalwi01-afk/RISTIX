export type Operation = 'create' | 'update' | 'delete'

export type ReconciliationState =
    | 'already_applied'
    | 'missing_side_effect'
    | 'ambiguous'
    | 'unsupported'
    | 'error'
    | 'replayed'
    | 'replay_failed'

export interface Assessment {
    state: Exclude<ReconciliationState, 'replayed' | 'replay_failed' | 'error'>
    reason: string
}

export interface ReconciliationResult {
    requestId: string
    entityType: string
    operation: string
    title: string
    state: ReconciliationState
    reason: string
}

export interface ReplayOptions {
    apply: boolean
    includeAmbiguous: boolean
}

export function same(a: unknown, b: unknown): boolean {
    const normalize = (value: unknown) =>
        value === null || value === undefined
            ? ''
            : String(value).trim().toLowerCase()
    return normalize(a) === normalize(b)
}

export function toNumericId(value: unknown): number | null {
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : null
}

export function toBigIntId(value: unknown): bigint | null {
    try {
        if (value === null || value === undefined || value === '') return null
        return BigInt(String(value))
    } catch {
        return null
    }
}

export function assessLegacyHeaderOperation(
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

export function assessParameterDetailRequest(
    operation: Operation,
    request: { entityId?: string | null },
    data: any,
    rows: { rowById?: any[]; rowByKey?: any[] }
): Assessment {
    const detailId = toBigIntId(String(request.entityId || '').replace(/^detail:/, '')) ?? toBigIntId(data?.detailId ?? data?.id)
    const paramCode = data?.paramCode ?? data?.parentCode
    const paramSeq = Number(data?.paramSeq ?? data?.param_seq)
    const row = rows.rowById?.[0] ?? rows.rowByKey?.[0]

    if (operation === 'create') {
        return row
            ? { state: 'already_applied', reason: `parameter detail exists (${paramCode}:${paramSeq})` }
            : { state: 'missing_side_effect', reason: detailId ? 'parameter detail row not found by id/code+seq' : 'parameter detail row not found by code+seq' }
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

export function assessRuleBaseDetailRequest(
    operation: Operation,
    _request: { entityId?: string | null },
    data: any,
    rows: { rowById?: any[]; rowByKey?: any[] }
): Assessment {
    const row = rows.rowById?.[0] ?? rows.rowByKey?.[0]
    return assessLegacyHeaderOperation(operation, row, {
        createMissing: 'rule detail row not found by id/composite business key',
        deleteExisting: 'rule detail row still exists after approved delete',
        updateMatch: row
            ? same(row.operator, data?.operator) && same(row.value1, data?.value1) && same(row.detailType, data?.detail_type)
            : false,
        label: 'rule detail',
    })
}

export function assessSegmentationDetailRequest(
    operation: Operation,
    data: any,
    rows: { rowById?: any[]; rowByKey?: any[] }
): Assessment {
    const row = rows.rowById?.[0] ?? rows.rowByKey?.[0]
    return assessLegacyHeaderOperation(operation, row, {
        createMissing: 'segmentation detail row not found by id/composite business key',
        deleteExisting: 'segmentation detail row still exists after approved delete',
        updateMatch: row
            ? same(row.operator, data?.operator) && same(row.value1, data?.value1)
            : false,
        label: 'segmentation detail',
    })
}

export function assessSegmentationHeaderRequest(
    operation: Operation,
    data: any,
    rows: { rowById?: any[]; rowByKey?: any[] }
): Assessment {
    const row = rows.rowById?.[0] ?? rows.rowByKey?.[0]
    return assessLegacyHeaderOperation(operation, row, {
        createMissing: 'segmentation header row not found by id/group+segment+sub-segment',
        deleteExisting: 'segmentation header row still exists after approved delete',
        updateMatch: row
            ? same(row.groupSegment, data?.group_segment) && same(row.segment, data?.segment) && same(row.subSegment, data?.sub_segment)
            : false,
        label: 'segmentation header',
    })
}

export function assessFlScalarHeaderRequest(
    operation: Operation,
    data: any,
    rows: { rowById?: any[]; rowByKey?: any[] }
): Assessment {
    const row = rows.rowById?.[0] ?? rows.rowByKey?.[0]
    return assessLegacyHeaderOperation(operation, row, {
        createMissing: 'FL scalar header row not found by id/scalar_name',
        deleteExisting: 'FL scalar header row still exists after approved delete',
        updateMatch: row
            ? same(row.scalarName, data?.scalar_name)
            : false,
        label: 'FL scalar',
    })
}

export function assessBucketHeaderRequest(
    operation: Operation,
    data: any,
    rows: { rowById?: any[]; rowByKey?: any[] }
): Assessment {
    const row = rows.rowById?.[0] ?? rows.rowByKey?.[0]
    return assessLegacyHeaderOperation(operation, row, {
        createMissing: 'bucket header row not found by id/bucket_group',
        deleteExisting: 'bucket header row still exists after approved delete',
        updateMatch: row
            ? same(row.bucketGroup, data?.bucket_group) && same(row.basis, data?.basis)
            : false,
        label: 'bucket parameter',
    })
}

export function assessRuleBaseHeaderRequest(
    operation: Operation,
    data: any,
    rows: { rowById?: any[]; rowByKey?: any[] }
): Assessment {
    const row = rows.rowById?.[0] ?? rows.rowByKey?.[0]
    return assessLegacyHeaderOperation(operation, row, {
        createMissing: 'rule header row not found by id/rule_name+rule_type',
        deleteExisting: 'rule header row still exists after approved delete',
        updateMatch: row
            ? same(row.ruleName, data?.rule_name) && same(row.ruleType, data?.rule_type)
            : false,
        label: 'rule header',
    })
}

export function assessProductHeaderRequest(
    operation: Operation,
    data: any,
    rows: { rowById?: any[]; rowByKey?: any[] }
): Assessment {
    const row = rows.rowById?.[0] ?? rows.rowByKey?.[0]
    return assessLegacyHeaderOperation(operation, row, {
        createMissing: 'product parameter row not found by id/prdCode',
        deleteExisting: 'product parameter row still exists after approved delete',
        updateMatch: row
            ? same(row.prdCode, data?.prdCode) && same(row.prdDesc, data?.prdDesc)
            : false,
        label: 'product parameter',
    })
}

export function assessJournalHeaderRequest(
    operation: Operation,
    data: any,
    rows: { rowById?: any[]; rowByKey?: any[] }
): Assessment {
    const row = rows.rowById?.[0] ?? rows.rowByKey?.[0]
    return assessLegacyHeaderOperation(operation, row, {
        createMissing: 'journal parameter row not found by id/composite business key',
        deleteExisting: 'journal parameter row still exists after approved delete',
        updateMatch: row
            ? same(row.glCode, data?.glCode) && same(row.glNumber, data?.glNumber) && same(row.glDesc, data?.glDesc)
            : false,
        label: 'journal parameter',
    })
}

export async function maybeReplayAssessment(
    request: {
        id: string
        entityType: string
        title: string
        completedBy?: string | null
        requestedBy?: string | null
    },
    operation: string | null,
    assessment: Assessment,
    options: ReplayOptions,
    replay: (request: any, approvedBy?: string) => Promise<void>
): Promise<ReconciliationResult> {
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
        await replay(request, request.completedBy ?? request.requestedBy ?? undefined)
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
