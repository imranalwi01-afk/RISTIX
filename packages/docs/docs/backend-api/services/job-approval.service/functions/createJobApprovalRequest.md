[**Backend API Reference v1.0.0**](../../../README.md)

***

# Function: createJobApprovalRequest()

> **createJobApprovalRequest**(`params`): `Promise`\<\{ `approvalsReceived`: `number`; `approvalsRequired`: `number`; `completedAt`: `Date` \| `null`; `completedBy`: `string` \| `null`; `createdAt`: `Date`; `currentLevel`: `number`; `description`: `string` \| `null`; `entityId`: `string` \| `null`; `entityType`: `string`; `expiresAt`: `Date` \| `null`; `id`: `string`; `impactLevel`: `string` \| `null`; `matrixId`: `string` \| `null`; `requestData`: `Record`\<`string`, `unknown`\> \| `null`; `requestedBy`: `string`; `status`: `string`; `tenantId`: `string`; `title`: `string`; \} \| `null`\>

Defined in: [packages/new-backend/src/services/job-approval.service.ts:36](https://github.com/ifrspro/ifrs9-iaf/blob/2c233b31171a451bb86daacd4389a961f1213deb/packages/new-backend/src/services/job-approval.service.ts#L36)

Create an approval request for a job execution.

## Parameters

### params

Parameters for creating the approval request

#### executionId

`string`

The job execution ID

#### jobDefinitionId

`string`

The job definition ID

#### parameters?

`any`

Optional job parameters

#### tenantId

`string`

The tenant ID

#### triggeredBy

`string`

The user who triggered the job

## Returns

`Promise`\<\{ `approvalsReceived`: `number`; `approvalsRequired`: `number`; `completedAt`: `Date` \| `null`; `completedBy`: `string` \| `null`; `createdAt`: `Date`; `currentLevel`: `number`; `description`: `string` \| `null`; `entityId`: `string` \| `null`; `entityType`: `string`; `expiresAt`: `Date` \| `null`; `id`: `string`; `impactLevel`: `string` \| `null`; `matrixId`: `string` \| `null`; `requestData`: `Record`\<`string`, `unknown`\> \| `null`; `requestedBy`: `string`; `status`: `string`; `tenantId`: `string`; `title`: `string`; \} \| `null`\>

A Promise resolving to the created approval request or null if no approval needed

## Throws

Error if definition not found or matrix not configured
