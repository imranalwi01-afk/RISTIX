import { describe, expect, test } from 'bun:test'

import {
    buildReconciliationCsv,
    buildReconciliationJsonReport,
    decorateReconciliationResult,
} from '@/lib/approval-reconciliation-report'

describe('approval reconciliation report helpers', () => {
    const sampleResults = [
        {
            requestId: 'req-1',
            entityType: 'fl_scalar',
            operation: 'update',
            title: 'Update FL Scalar',
            state: 'ambiguous',
            reason: 'FL scalar exists but current values do not conclusively match approved payload',
        },
        {
            requestId: 'req-2',
            entityType: 'product_parameter',
            operation: 'create',
            title: 'Create Product',
            state: 'missing_side_effect',
            reason: 'product parameter row not found by id/prdCode',
        },
    ] as const

    test('decorateReconciliationResult adds operational metadata', () => {
        expect(decorateReconciliationResult(sampleResults[0])).toEqual(
            expect.objectContaining({
                requiresManualReview: true,
                recommendedAction: 'manual_review',
            })
        )

        expect(decorateReconciliationResult(sampleResults[1])).toEqual(
            expect.objectContaining({
                requiresManualReview: false,
                recommendedAction: 'replay_candidate',
            })
        )
    })

    test('buildReconciliationJsonReport returns summary, filters, and decorated rows', () => {
        const report = buildReconciliationJsonReport([...sampleResults], {
            generatedAt: '2026-03-30T10:00:00.000Z',
            filters: { tenantId: 'tenant-1', apply: false, limit: 50 },
        })

        expect(report.generatedAt).toBe('2026-03-30T10:00:00.000Z')
        expect(report.summary.total).toBe(2)
        expect(report.summary.byState).toEqual({
            ambiguous: 1,
            missing_side_effect: 1,
        })
        expect(report.summary.byEntityType).toEqual({
            fl_scalar: 1,
            product_parameter: 1,
        })
        expect(report.filters).toEqual({
            tenantId: 'tenant-1',
            apply: false,
            limit: 50,
        })
        expect(report.rows[0]).toEqual(expect.objectContaining({
            requestId: 'req-1',
            requiresManualReview: true,
            recommendedAction: 'manual_review',
        }))
    })

    test('buildReconciliationCsv renders headers and escaped values', () => {
        const csv = buildReconciliationCsv([
            ...sampleResults,
            {
                requestId: 'req-3',
                entityType: 'journal_parameter',
                operation: 'update',
                title: 'Update "Journal"',
                state: 'replayed',
                reason: 'replayed successfully from state missing_side_effect',
            },
        ])

        expect(csv).toContain('requestId,entityType,operation,title,state,reason,requiresManualReview,recommendedAction')
        expect(csv).toContain('req-1,fl_scalar,update,Update FL Scalar,ambiguous')
        expect(csv).toContain('"Update ""Journal"""')
        expect(csv).toContain('verify_live_data')
    })
})
