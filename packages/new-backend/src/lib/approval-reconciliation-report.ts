import type { ReconciliationResult } from '@/lib/approval-reconciliation'

export type ReconciliationReportFormat = 'console' | 'json' | 'csv'

export interface ReconciliationReportOptions {
    format: ReconciliationReportFormat
    generatedAt?: string
    filters?: Record<string, string | number | boolean | undefined>
}

export interface ReconciliationReportRow extends ReconciliationResult {
    requiresManualReview: boolean
    recommendedAction: string
}

export interface ReconciliationJsonReport {
    generatedAt: string
    summary: {
        total: number
        byState: Record<string, number>
        byEntityType: Record<string, number>
    }
    filters: Record<string, string | number | boolean>
    rows: ReconciliationReportRow[]
}

export function decorateReconciliationResult(result: ReconciliationResult): ReconciliationReportRow {
    const requiresManualReview =
        result.state === 'ambiguous'
        || result.state === 'unsupported'
        || result.state === 'error'
        || result.state === 'replay_failed'

    let recommendedAction = 'none'
    switch (result.state) {
        case 'missing_side_effect':
            recommendedAction = 'replay_candidate'
            break
        case 'ambiguous':
            recommendedAction = 'manual_review'
            break
        case 'unsupported':
            recommendedAction = 'extend_reconciliation_mapping'
            break
        case 'error':
        case 'replay_failed':
            recommendedAction = 'investigate_failure'
            break
        case 'replayed':
            recommendedAction = 'verify_live_data'
            break
        case 'already_applied':
            recommendedAction = 'none'
            break
    }

    return {
        ...result,
        requiresManualReview,
        recommendedAction,
    }
}

export function buildReconciliationJsonReport(
    results: ReconciliationResult[],
    options: Omit<ReconciliationReportOptions, 'format'> = {}
): ReconciliationJsonReport {
    const rows = results.map(decorateReconciliationResult)
    const generatedAt = options.generatedAt ?? new Date().toISOString()
    const filters = Object.fromEntries(
        Object.entries(options.filters ?? {}).filter(([, value]) => value !== undefined)
    ) as Record<string, string | number | boolean>

    const byState = rows.reduce<Record<string, number>>((acc, row) => {
        acc[row.state] = (acc[row.state] || 0) + 1
        return acc
    }, {})

    const byEntityType = rows.reduce<Record<string, number>>((acc, row) => {
        acc[row.entityType] = (acc[row.entityType] || 0) + 1
        return acc
    }, {})

    return {
        generatedAt,
        summary: {
            total: rows.length,
            byState,
            byEntityType,
        },
        filters,
        rows,
    }
}

function escapeCsv(value: unknown): string {
    const normalized = value === null || value === undefined ? '' : String(value)
    if (/[",\n]/.test(normalized)) {
        return `"${normalized.replace(/"/g, '""')}"`
    }
    return normalized
}

export function buildReconciliationCsv(results: ReconciliationResult[]): string {
    const rows = results.map(decorateReconciliationResult)
    const headers = [
        'requestId',
        'entityType',
        'operation',
        'title',
        'state',
        'reason',
        'requiresManualReview',
        'recommendedAction',
    ]

    const csvRows = rows.map((row) =>
        [
            row.requestId,
            row.entityType,
            row.operation,
            row.title,
            row.state,
            row.reason,
            row.requiresManualReview,
            row.recommendedAction,
        ].map(escapeCsv).join(',')
    )

    return [headers.join(','), ...csvRows].join('\n')
}
