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

> **impactLevel**: `"low"` &#124; `"medium"` &#124; `"high"` &#124; `"critical"`

Defined in: [src/services/job-approval.service.ts:10](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/services/job-approval.service.ts#L10)

##### requireDecisionComment

> **requireDecisionComment**: `boolean`

Defined in: [src/services/job-approval.service.ts:14](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/services/job-approval.service.ts#L14)

##### slaHours

> **slaHours**: `number`

Defined in: [src/services/job-approval.service.ts:12](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/services/job-approval.service.ts#L12)

## Functions

### checkAutoApprovalConditions()

> **checkAutoApprovalConditions**(`jobDefinitionId`, `tenantId`, `triggeredBy`, `parameters?`): `Promise`&lt;`boolean`&gt;

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

`Promise`&lt;`boolean`&gt;

A Promise resolving to true if auto-approval conditions are met

***

### createJobApprovalRequest()

> **createJobApprovalRequest**(`params`): `Promise`&lt;&#123; `approvalsReceived`: `number`; `approvalsRequired`: `number`; `completedAt`: `Date` &#124; `null`; `completedBy`: `string` &#124; `null`; `createdAt`: `Date`; `currentLevel`: `number`; `description`: `string` &#124; `null`; `entityId`: `string` &#124; `null`; `entityType`: `string`; `expiresAt`: `Date` &#124; `null`; `id`: `string`; `impactLevel`: `string` &#124; `null`; `matrixId`: `string` &#124; `null`; `requestData`: `Record`&lt;`string`, `unknown`&gt; &#124; `null`; `requestedBy`: `string`; `status`: `string`; `tenantId`: `string`; `title`: `string`; &#125; &#124; `null`&gt;

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

`Promise`&lt;&#123; `approvalsReceived`: `number`; `approvalsRequired`: `number`; `completedAt`: `Date` &#124; `null`; `completedBy`: `string` &#124; `null`; `createdAt`: `Date`; `currentLevel`: `number`; `description`: `string` &#124; `null`; `entityId`: `string` &#124; `null`; `entityType`: `string`; `expiresAt`: `Date` &#124; `null`; `id`: `string`; `impactLevel`: `string` &#124; `null`; `matrixId`: `string` &#124; `null`; `requestData`: `Record`&lt;`string`, `unknown`&gt; &#124; `null`; `requestedBy`: `string`; `status`: `string`; `tenantId`: `string`; `title`: `string`; &#125; &#124; `null`&gt;

A Promise resolving to the created approval request or null if no approval needed

#### Throws

Error if definition not found or matrix not configured

***

### getPendingJobApprovals()

> **getPendingJobApprovals**(`tenantId`): `Promise`&lt;`object`[]&gt;

Defined in: [src/services/job-approval.service.ts:308](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/services/job-approval.service.ts#L308)

Get pending job executions awaiting approval.

#### Parameters

##### tenantId

`string`

The tenant ID

#### Returns

`Promise`&lt;`object`[]&gt;

A Promise resolving to an array of pending job executions

***

### handleJobApprovalComplete()

> **handleJobApprovalComplete**(`approvalRequestId`, `status`, `approvedBy?`, `input?`): `Promise`&lt;&#123; `approvalsReceived`: `number`; `approvalsRequired`: `number`; `completed`: `boolean`; `queued`: `boolean`; `remainingApprovals`: `number`; `status`: `string`; &#125;&gt;

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

`Promise`&lt;&#123; `approvalsReceived`: `number`; `approvalsRequired`: `number`; `completed`: `boolean`; `queued`: `boolean`; `remainingApprovals`: `number`; `status`: `string`; &#125;&gt;

A Promise resolving when handling is complete

***

### requiresApproval()

> **requiresApproval**(`jobDefinitionId`, `tenantId`): `Promise`&lt;`boolean`&gt;

Defined in: [src/services/job-approval.service.ts:23](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/services/job-approval.service.ts#L23)

Check if a job requires approval before execution.

#### Parameters

##### jobDefinitionId

`string`

The ID of the job definition

##### tenantId

`string`

#### Returns

`Promise`&lt;`boolean`&gt;

A Promise resolving to true if approval is required
