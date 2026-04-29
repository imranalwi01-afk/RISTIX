# Individual Impairment V2 QA Notes

## Scope

This note documents the PR #133 split between the legacy individual impairment flow and the isolated V2 flow.

## Route And API Mapping

| Surface | Route | API |
| --- | --- | --- |
| Legacy/current UI | `/banking/individual/assessment` | `/api/v1/banking/individual/impairment` |
| V2 UI | `/banking/individual/assessment-new` | `/api/v2/individual-impairment` |

The legacy API remains mounted and must not redirect into V2. The V2 UI is isolated so PR #132 can keep its legacy API assumptions while this branch keeps the newer approval-driven flow.

## Approval Behavior

- V1 override submit writes through the legacy direct override path.
- V2 override submit creates an approval request with `entityType = individual_impairment_v2`.
- Approval detail should show `Individual Impairment V2`, `sourceApi = /api/v2/individual-impairment`, and `apiVersion = v2`.
- Approved V2 override execution writes the live override row through the existing individual impairment service.

## Manual Smoke Checklist

1. Login as an admin/authorized maker.
2. Open `/banking/individual/assessment?mode=conventional&tab=watchlist` and verify watchlist loads through the legacy route.
3. Open `/banking/individual/assessment-new?mode=conventional&tab=watchlist` and verify the same UI surface loads as V2.
4. Open an account from `assessment-new`, submit an override, and verify the response indicates approval is required.
5. Open `/banking/maintenance/approval?mode=conventional` and verify the new request is labeled `Individual Impairment V2`.
6. Approve the request and verify the override appears in the individual impairment detail/history.
7. Refresh both V1 and V2 pages and verify the session remains active.

## Automated Coverage

- Backend route contract: `packages/new-backend/src/test/routes/individual-impairment.response-contract.test.ts`
- Frontend route/API split: `packages/frontend/src/features/individual-impairment/routing.test.ts`
- Frontend V2 API client: `packages/frontend/src/services/api/individual-impairment-v2-client.test.ts`
- Approval labeling: `packages/frontend/src/features/approval/domain/approval.models.test.ts`
