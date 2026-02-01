[**Backend API Reference v1.0.0**](../../../README.md)

***

# Function: handleJobApprovalComplete()

> **handleJobApprovalComplete**(`approvalRequestId`, `status`, `approvedBy?`): `Promise`\<`void`\>

Defined in: [packages/new-backend/src/services/job-approval.service.ts:94](https://github.com/ifrspro/ifrs9-iaf/blob/2c233b31171a451bb86daacd4389a961f1213deb/packages/new-backend/src/services/job-approval.service.ts#L94)

Handle approval completion - queue the job if approved.

## Parameters

### approvalRequestId

`string`

The approval request ID

### status

The approval status ('approved' or 'rejected')

`"approved"` | `"rejected"`

### approvedBy?

`string`

The user who approved/rejected

## Returns

`Promise`\<`void`\>

A Promise resolving when handling is complete
