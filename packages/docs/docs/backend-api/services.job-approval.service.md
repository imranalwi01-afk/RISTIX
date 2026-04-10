[**Backend API Reference v1.0.0**](index.md)

***

# services/job-approval.service

## Type Aliases

### JobApprovalPolicy

> **JobApprovalPolicy** = `object`

Defined in: [src/services/job-approval.service.ts:9](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/services/job-approval.service.ts#L9)

#### Properties

##### approvalsRequired

> **approvalsRequired**: `number`

Defined in: [src/services/job-approval.service.ts:11](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/services/job-approval.service.ts#L11)

##### escalationAfterHours

> **escalationAfterHours**: `number`

Defined in: [src/services/job-approval.service.ts:13](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/services/job-approval.service.ts#L13)

##### impactLevel

> **impactLevel**: `"low"` \| `"medium"` \| `"high"` \| `"critical"`

Defined in: [src/services/job-approval.service.ts:10](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/services/job-approval.service.ts#L10)

##### requireDecisionComment

> **requireDecisionComment**: `boolean`

Defined in: [src/services/job-approval.service.ts:14](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/services/job-approval.service.ts#L14)

##### slaHours

> **slaHours**: `number`

Defined in: [src/services/job-approval.service.ts:12](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/services/job-approval.service.ts#L12)

## Functions

### checkAutoApprovalConditions()

> **checkAutoApprovalConditions**(`jobDefinitionId`, `tenantId`, `triggeredBy`, `parameters?`): `Promise`\<`boolean`\>

Defined in: [src/services/job-approval.service.ts:325](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/services/job-approval.service.ts#L325)

Check auto-approval conditions.
Returns true if the job can be auto-approved based on conditions.

#### Parameters

##### jobDefinitionId

`string`

The job definition ID

##### tenantId

`string`

##### triggeredBy

`string`

The user who triggered the job

##### parameters?

`any`

Job parameters

#### Returns

`Promise`\<`boolean`\>

A Promise resolving to true if auto-approval conditions are met

***

### createJobApprovalRequest()

> **createJobApprovalRequest**(`params`): `Promise`\<\{ `approvalsReceived`: `number`; `approvalsRequired`: `number`; `completedAt`: `Date` \| `null`; `completedBy`: `string` \| `null`; `createdAt`: `Date`; `currentLevel`: `number`; `description`: `string` \| `null`; `entityId`: `string` \| `null`; `entityType`: `string`; `expiresAt`: `Date` \| `null`; `id`: `string`; `impactLevel`: `string` \| `null`; `matrixId`: `string` \| `null`; `requestData`: `Record`\<`string`, `unknown`\> \| `null`; `requestedBy`: `string`; `status`: `string`; `tenantId`: `string`; `title`: `string`; \} \| `null`\>

Defined in: [src/services/job-approval.service.ts:45](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/services/job-approval.service.ts#L45)

Create an approval request for a job execution.

#### Parameters

##### params

Parameters for creating the approval request

###### approvalPolicy?

[`JobApprovalPolicy`](#jobapprovalpolicy)

###### executionId

`string`

The job execution ID

###### jobDefinitionId

`string`

The job definition ID

###### parameters?

`any`

Optional job parameters

###### tenantId

`string`

The tenant ID

###### triggeredBy

`string`

The user who triggered the job

#### Returns

`Promise`\<\{ `approvalsReceived`: `number`; `approvalsRequired`: `number`; `completedAt`: `Date` \| `null`; `completedBy`: `string` \| `null`; `createdAt`: `Date`; `currentLevel`: `number`; `description`: `string` \| `null`; `entityId`: `string` \| `null`; `entityType`: `string`; `expiresAt`: `Date` \| `null`; `id`: `string`; `impactLevel`: `string` \| `null`; `matrixId`: `string` \| `null`; `requestData`: `Record`\<`string`, `unknown`\> \| `null`; `requestedBy`: `string`; `status`: `string`; `tenantId`: `string`; `title`: `string`; \} \| `null`\>

A Promise resolving to the created approval request or null if no approval needed

#### Throws

Error if definition not found or matrix not configured

***

### getPendingJobApprovals()

> **getPendingJobApprovals**(`tenantId`): `Promise`\<`object`[]\>

Defined in: [src/services/job-approval.service.ts:308](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/services/job-approval.service.ts#L308)

Get pending job executions awaiting approval.

#### Parameters

##### tenantId

`string`

The tenant ID

#### Returns

`Promise`\<`object`[]\>

A Promise resolving to an array of pending job executions

***

### handleJobApprovalComplete()

> **handleJobApprovalComplete**(`approvalRequestId`, `status`, `approvedBy?`, `input?`): `Promise`\<\{ `approvalsReceived`: `number`; `approvalsRequired`: `number`; `completed`: `boolean`; `queued`: `boolean`; `remainingApprovals`: `number`; `status`: `string`; \}\>

Defined in: [src/services/job-approval.service.ts:146](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/services/job-approval.service.ts#L146)

Handle approval completion - queue the job if approved.

#### Parameters

##### approvalRequestId

`string`

The approval request ID

##### status

The approval status ('approved' or 'rejected')

`"approved"` | `"rejected"`

##### approvedBy?

`string`

The user who approved/rejected

##### input?

###### comment?

`string`

#### Returns

`Promise`\<\{ `approvalsReceived`: `number`; `approvalsRequired`: `number`; `completed`: `boolean`; `queued`: `boolean`; `remainingApprovals`: `number`; `status`: `string`; \}\>

A Promise resolving when handling is complete

***

### requiresApproval()

> **requiresApproval**(`jobDefinitionId`, `tenantId`): `Promise`\<`boolean`\>

Defined in: [src/services/job-approval.service.ts:23](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/services/job-approval.service.ts#L23)

Check if a job requires approval before execution.

#### Parameters

##### jobDefinitionId

`string`

The ID of the job definition

##### tenantId

`string`

#### Returns

`Promise`\<`boolean`\>

A Promise resolving to true if approval is required
