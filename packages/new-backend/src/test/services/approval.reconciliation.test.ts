import { describe, expect, test } from 'bun:test'

import {
  assessBucketHeaderRequest,
  assessFlScalarHeaderRequest,
  assessJournalHeaderRequest,
  assessParameterDetailRequest,
  assessProductHeaderRequest,
  assessRuleBaseHeaderRequest,
  assessRuleBaseDetailRequest,
  assessSegmentationDetailRequest,
  assessSegmentationHeaderRequest,
  maybeReplayAssessment,
  type Assessment,
} from '@/lib/approval-reconciliation'

describe('approval reconciliation helper coverage for risky entities', () => {
  test('assessParameterDetailRequest marks create as already applied when row exists by composite key', () => {
    const assessment = assessParameterDetailRequest(
      'create',
      { entityId: 'detail:101' },
      { scope: 'detail', paramCode: 'A1001', paramSeq: 10, value1: 'X' },
      {
        rowById: [],
        rowByKey: [
          {
            pkid: 101n,
            paramCode: 'A1001',
            paramSeq: 10,
            value1: 'X',
            value2: 'Y',
            value3: 'Z',
          },
        ],
      }
    )

    expect(assessment).toEqual({
      state: 'already_applied',
      reason: 'parameter detail exists (A1001:10)',
    })
  })

  test('assessRuleBaseDetailRequest marks delete as missing_side_effect when row still exists', () => {
    const assessment = assessRuleBaseDetailRequest(
      'delete',
      { entityId: 'detail:201' },
      { scope: 'detail', id: 201 },
      {
        rowById: [
          {
            pkid: 201,
            ruleId: 5,
            queryGroup: 2,
            seq: 1,
            tableName: 'frs9_master_account',
            columnName: 'dpd',
            operator: '>',
            value1: '90',
            detailType: 'STAGE',
          },
        ],
        rowByKey: [],
      }
    )

    expect(assessment).toEqual({
      state: 'missing_side_effect',
      reason: 'rule detail row still exists after approved delete',
    })
  })

  test('assessFlScalarHeaderRequest marks update as ambiguous when header exists but values differ', () => {
    const assessment = assessFlScalarHeaderRequest(
      'update',
      { id: 301, scalar_name: 'Scalar New' },
      {
        rowById: [{ pkid: 301, scalarName: 'Scalar Old' }],
        rowByKey: [],
      }
    )

    expect(assessment).toEqual({
      state: 'ambiguous',
      reason: 'FL scalar exists but current values do not conclusively match approved payload',
    })
  })

  test('assessSegmentationDetailRequest marks delete as missing_side_effect when detail row still exists', () => {
    const assessment = assessSegmentationDetailRequest(
      'delete',
      { scope: 'detail', id: 402 },
      {
        rowById: [
          {
            pkid: 402,
            segmentId: 300,
            queryGroup: 1,
            seq: 2,
            tableName: 'frs9_master_account',
            columnName: 'dpd',
            operator: '>=',
            value1: '30',
          },
        ],
        rowByKey: [],
      }
    )

    expect(assessment).toEqual({
      state: 'missing_side_effect',
      reason: 'segmentation detail row still exists after approved delete',
    })
  })

  test('assessBucketHeaderRequest marks update as already_applied when header matches approved payload', () => {
    const assessment = assessBucketHeaderRequest(
      'update',
      { id: 41, bucket_group: 'MAX_DPD', basis: 'Day Past Due' },
      {
        rowById: [{ pkid: 41, bucketGroup: 'MAX_DPD', basis: 'Day Past Due' }],
        rowByKey: [],
      }
    )

    expect(assessment).toEqual({
      state: 'already_applied',
      reason: 'bucket parameter matches approved payload',
    })
  })

  test('assessRuleBaseHeaderRequest marks create as missing_side_effect when header is absent', () => {
    const assessment = assessRuleBaseHeaderRequest(
      'create',
      { id: 51, rule_name: 'Stage Rule', rule_type: 'STAGE' },
      {
        rowById: [],
        rowByKey: [],
      }
    )

    expect(assessment).toEqual({
      state: 'missing_side_effect',
      reason: 'rule header row not found by id/rule_name+rule_type',
    })
  })

  test('assessSegmentationHeaderRequest marks update as already_applied when header matches approved payload', () => {
    const assessment = assessSegmentationHeaderRequest(
      'update',
      { id: 300, group_segment: 'Corporate', segment: 'SME', sub_segment: 'A' },
      {
        rowById: [{ pkid: 300, groupSegment: 'Corporate', segment: 'SME', subSegment: 'A' }],
        rowByKey: [],
      }
    )

    expect(assessment).toEqual({
      state: 'already_applied',
      reason: 'segmentation header matches approved payload',
    })
  })

  test('assessProductHeaderRequest marks delete as missing_side_effect when product row still exists', () => {
    const assessment = assessProductHeaderRequest(
      'delete',
      { id: 71, prdCode: 'PROD-71', prdDesc: 'Product 71' },
      {
        rowById: [{ pkid: 71, prdCode: 'PROD-71', prdDesc: 'Product 71' }],
        rowByKey: [],
      }
    )

    expect(assessment).toEqual({
      state: 'missing_side_effect',
      reason: 'product parameter row still exists after approved delete',
    })
  })

  test('assessJournalHeaderRequest marks update as ambiguous when journal row exists but values differ', () => {
    const assessment = assessJournalHeaderRequest(
      'update',
      { id: 81, glCode: 'GL-81', glNumber: '1000', glDesc: 'Updated Desc' },
      {
        rowById: [{ pkid: 81, glCode: 'GL-81', glNumber: '1000', glDesc: 'Old Desc' }],
        rowByKey: [],
      }
    )

    expect(assessment).toEqual({
      state: 'ambiguous',
      reason: 'journal parameter exists but current values do not conclusively match approved payload',
    })
  })

  test('maybeReplayAssessment replays missing side effect rows when apply is enabled', async () => {
    const replayCalls: Array<{ requestId: string; approvedBy?: string }> = []

    const result = await maybeReplayAssessment(
      {
        id: 'request-replay-1',
        entityType: 'rule_base_setting',
        title: 'Approval Replay',
        completedBy: 'approver-1',
        requestedBy: 'maker-1',
      },
      'delete',
      { state: 'missing_side_effect', reason: 'rule detail row still exists after approved delete' },
      { apply: true, includeAmbiguous: false },
      async (request, approvedBy) => {
        replayCalls.push({ requestId: request.id, approvedBy })
      }
    )

    expect(result).toEqual({
      requestId: 'request-replay-1',
      entityType: 'rule_base_setting',
      operation: 'delete',
      title: 'Approval Replay',
      state: 'replayed',
      reason: 'replayed successfully from state missing_side_effect',
    })
    expect(replayCalls).toEqual([{ requestId: 'request-replay-1', approvedBy: 'approver-1' }])
  })

  test('maybeReplayAssessment replays ambiguous rows only when includeAmbiguous is enabled', async () => {
    const replayCalls: Array<{ requestId: string; approvedBy?: string }> = []
    const ambiguous: Assessment = {
      state: 'ambiguous',
      reason: 'FL scalar exists but current values do not conclusively match approved payload',
    }

    const request = {
      id: 'request-replay-2',
      entityType: 'fl_scalar',
      title: 'Approval Replay',
      completedBy: 'approver-1',
      requestedBy: 'maker-1',
    }

    const skipped = await maybeReplayAssessment(
      request,
      'update',
      ambiguous,
      { apply: true, includeAmbiguous: false },
      async (row, approvedBy) => {
        replayCalls.push({ requestId: row.id, approvedBy })
      }
    )
    expect(skipped.state).toBe('ambiguous')
    expect(replayCalls).toHaveLength(0)

    const replayed = await maybeReplayAssessment(
      request,
      'update',
      ambiguous,
      { apply: true, includeAmbiguous: true },
      async (row, approvedBy) => {
        replayCalls.push({ requestId: row.id, approvedBy })
      }
    )
    expect(replayed.state).toBe('replayed')
    expect(replayCalls).toEqual([{ requestId: 'request-replay-2', approvedBy: 'approver-1' }])
  })
})
