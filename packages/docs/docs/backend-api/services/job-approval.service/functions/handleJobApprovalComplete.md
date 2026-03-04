[**Backend API Reference v1.0.0**](../../../README.md)

***

# Function: handleJobApprovalComplete()

> **handleJobApprovalComplete**(`approvalRequestId`, `status`, `approvedBy?`, `input?`): `Promise`\<\{ `approvalsReceived`: `number`; `approvalsRequired`: `number`; `completed`: `boolean`; `queued`: `boolean`; `remainingApprovals`: `number`; `status`: `string`; \}\>

Defined in: [src/services/job-approval.service.ts:146](https://github.com/ifrspro/ifrs9-iaf/blob/5a4b2221d62f9d823811e12bfc71b7ff82ae62fa/packages/new-backend/src/services/job-approval.service.ts#L146)

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

### input?

#### comment?

`string`

## Returns

`Promise`\<\{ `approvalsReceived`: `number`; `approvalsRequired`: `number`; `completed`: `boolean`; `queued`: `boolean`; `remainingApprovals`: `number`; `status`: `string`; \}\>

A Promise resolving when handling is complete
