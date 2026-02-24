[**Backend API Reference v1.0.0**](../../../README.md)

***

# Class: WorkflowRepository

Defined in: [src/repositories/workflows.repository.ts:23](https://github.com/ifrspro/ifrs9-iaf/blob/cf4905123c7eb3e9046f36ce3f92dd13536ac238/packages/new-backend/src/repositories/workflows.repository.ts#L23)

Workflow Repository: CRUD and business logic for workflows

## Constructors

### Constructor

> **new WorkflowRepository**(`db`): `WorkflowRepository`

Defined in: [src/repositories/workflows.repository.ts:24](https://github.com/ifrspro/ifrs9-iaf/blob/cf4905123c7eb3e9046f36ce3f92dd13536ac238/packages/new-backend/src/repositories/workflows.repository.ts#L24)

#### Parameters

##### db

`PostgresJsDatabase`\<`any`\>

#### Returns

`WorkflowRepository`

## Methods

### createWorkflow()

> **createWorkflow**(`data`): `Promise`\<\{ `completedAt`: `Date` \| `null`; `createdAt`: `Date`; `currentState`: `string`; `description`: `string` \| `null`; `entityId`: `string`; `entityType`: `string`; `expectedCompletionAt`: `Date` \| `null`; `id`: `string`; `isActive`: `boolean`; `metadata`: `unknown`; `previousState`: `string` \| `null`; `requestedBy`: `string` \| `null`; `requestReason`: `string` \| `null`; `tenantId`: `string`; `updatedAt`: `Date`; `workflowName`: `string`; `workflowType`: `string`; \}\>

Defined in: [src/repositories/workflows.repository.ts:29](https://github.com/ifrspro/ifrs9-iaf/blob/cf4905123c7eb3e9046f36ce3f92dd13536ac238/packages/new-backend/src/repositories/workflows.repository.ts#L29)

Create new workflow

#### Parameters

##### data

###### completedAt?

`Date` \| `null`

###### createdAt?

`Date`

###### currentState?

`string`

###### description?

`string` \| `null`

###### entityId

`string`

###### entityType

`string`

###### expectedCompletionAt?

`Date` \| `null`

###### id?

`string`

###### isActive?

`boolean`

###### metadata?

`unknown`

###### previousState?

`string` \| `null`

###### requestedBy?

`string` \| `null`

###### requestReason?

`string` \| `null`

###### tenantId

`string`

###### updatedAt?

`Date`

###### workflowName

`string`

###### workflowType

`string`

#### Returns

`Promise`\<\{ `completedAt`: `Date` \| `null`; `createdAt`: `Date`; `currentState`: `string`; `description`: `string` \| `null`; `entityId`: `string`; `entityType`: `string`; `expectedCompletionAt`: `Date` \| `null`; `id`: `string`; `isActive`: `boolean`; `metadata`: `unknown`; `previousState`: `string` \| `null`; `requestedBy`: `string` \| `null`; `requestReason`: `string` \| `null`; `tenantId`: `string`; `updatedAt`: `Date`; `workflowName`: `string`; `workflowType`: `string`; \}\>

***

### createWorkflowJob()

> **createWorkflowJob**(`data`): `Promise`\<\{ `attempts`: `number` \| `null`; `completedAt`: `Date` \| `null`; `createdAt`: `Date`; `errorMessage`: `string` \| `null`; `id`: `string`; `jobId`: `string` \| `null`; `jobName`: `string` \| `null`; `jobType`: `string`; `maxAttempts`: `number` \| `null`; `result`: `unknown`; `startedAt`: `Date` \| `null`; `status`: `string`; `tenantId`: `string`; `updatedAt`: `Date`; `workflowId`: `string`; \}\>

Defined in: [src/repositories/workflows.repository.ts:115](https://github.com/ifrspro/ifrs9-iaf/blob/cf4905123c7eb3e9046f36ce3f92dd13536ac238/packages/new-backend/src/repositories/workflows.repository.ts#L115)

Create workflow job (for Bull queue tracking)

#### Parameters

##### data

###### attempts?

`number` \| `null`

###### completedAt?

`Date` \| `null`

###### createdAt?

`Date`

###### errorMessage?

`string` \| `null`

###### id?

`string`

###### jobId?

`string` \| `null`

###### jobName?

`string` \| `null`

###### jobType

`string`

###### maxAttempts?

`number` \| `null`

###### result?

`unknown`

###### startedAt?

`Date` \| `null`

###### status?

`string`

###### tenantId

`string`

###### updatedAt?

`Date`

###### workflowId

`string`

#### Returns

`Promise`\<\{ `attempts`: `number` \| `null`; `completedAt`: `Date` \| `null`; `createdAt`: `Date`; `errorMessage`: `string` \| `null`; `id`: `string`; `jobId`: `string` \| `null`; `jobName`: `string` \| `null`; `jobType`: `string`; `maxAttempts`: `number` \| `null`; `result`: `unknown`; `startedAt`: `Date` \| `null`; `status`: `string`; `tenantId`: `string`; `updatedAt`: `Date`; `workflowId`: `string`; \}\>

***

### getWorkflow()

> **getWorkflow**(`workflowId`): `Promise`\<\{ `completedAt`: `Date` \| `null`; `createdAt`: `Date`; `currentState`: `string`; `description`: `string` \| `null`; `entityId`: `string`; `entityType`: `string`; `expectedCompletionAt`: `Date` \| `null`; `id`: `string`; `isActive`: `boolean`; `metadata`: `unknown`; `previousState`: `string` \| `null`; `requestedBy`: `string` \| `null`; `requestReason`: `string` \| `null`; `tenantId`: `string`; `updatedAt`: `Date`; `workflowName`: `string`; `workflowType`: `string`; \} \| `undefined`\>

Defined in: [src/repositories/workflows.repository.ts:37](https://github.com/ifrspro/ifrs9-iaf/blob/cf4905123c7eb3e9046f36ce3f92dd13536ac238/packages/new-backend/src/repositories/workflows.repository.ts#L37)

Get workflow by ID

#### Parameters

##### workflowId

`string`

#### Returns

`Promise`\<\{ `completedAt`: `Date` \| `null`; `createdAt`: `Date`; `currentState`: `string`; `description`: `string` \| `null`; `entityId`: `string`; `entityType`: `string`; `expectedCompletionAt`: `Date` \| `null`; `id`: `string`; `isActive`: `boolean`; `metadata`: `unknown`; `previousState`: `string` \| `null`; `requestedBy`: `string` \| `null`; `requestReason`: `string` \| `null`; `tenantId`: `string`; `updatedAt`: `Date`; `workflowName`: `string`; `workflowType`: `string`; \} \| `undefined`\>

***

### getWorkflowsByTenant()

> **getWorkflowsByTenant**(`tenantId`): `Promise`\<`object`[]\>

Defined in: [src/repositories/workflows.repository.ts:51](https://github.com/ifrspro/ifrs9-iaf/blob/cf4905123c7eb3e9046f36ce3f92dd13536ac238/packages/new-backend/src/repositories/workflows.repository.ts#L51)

Get workflows for tenant

#### Parameters

##### tenantId

`string`

#### Returns

`Promise`\<`object`[]\>

***

### transitionWorkflow()

> **transitionWorkflow**(`workflowId`, `toState`, `triggeredBy`, `transitionReason?`, `transitionNotes?`, `approvalAction?`, `approvalComment?`): `Promise`\<\{ `transition`: \{ `approvalAction`: `string` \| `null`; `approvalComment`: `string` \| `null`; `fromState`: `string`; `id`: `string`; `metadata`: `unknown`; `tenantId`: `string`; `toState`: `string`; `transitionNotes`: `string` \| `null`; `transitionReason`: `string` \| `null`; `triggeredAt`: `Date`; `triggeredBy`: `string` \| `null`; `workflowId`: `string`; \}; `workflow`: \{ `completedAt`: `Date` \| `null`; `createdAt`: `Date`; `currentState`: `string`; `description`: `string` \| `null`; `entityId`: `string`; `entityType`: `string`; `expectedCompletionAt`: `Date` \| `null`; `id`: `string`; `isActive`: `boolean`; `metadata`: `unknown`; `previousState`: `string` \| `null`; `requestedBy`: `string` \| `null`; `requestReason`: `string` \| `null`; `tenantId`: `string`; `updatedAt`: `Date`; `workflowName`: `string`; `workflowType`: `string`; \}; \}\>

Defined in: [src/repositories/workflows.repository.ts:61](https://github.com/ifrspro/ifrs9-iaf/blob/cf4905123c7eb3e9046f36ce3f92dd13536ac238/packages/new-backend/src/repositories/workflows.repository.ts#L61)

Transition workflow state + audit trail

#### Parameters

##### workflowId

`string`

##### toState

`string`

##### triggeredBy

`string`

##### transitionReason?

`string`

##### transitionNotes?

`string`

##### approvalAction?

`string`

##### approvalComment?

`string`

#### Returns

`Promise`\<\{ `transition`: \{ `approvalAction`: `string` \| `null`; `approvalComment`: `string` \| `null`; `fromState`: `string`; `id`: `string`; `metadata`: `unknown`; `tenantId`: `string`; `toState`: `string`; `transitionNotes`: `string` \| `null`; `transitionReason`: `string` \| `null`; `triggeredAt`: `Date`; `triggeredBy`: `string` \| `null`; `workflowId`: `string`; \}; `workflow`: \{ `completedAt`: `Date` \| `null`; `createdAt`: `Date`; `currentState`: `string`; `description`: `string` \| `null`; `entityId`: `string`; `entityType`: `string`; `expectedCompletionAt`: `Date` \| `null`; `id`: `string`; `isActive`: `boolean`; `metadata`: `unknown`; `previousState`: `string` \| `null`; `requestedBy`: `string` \| `null`; `requestReason`: `string` \| `null`; `tenantId`: `string`; `updatedAt`: `Date`; `workflowName`: `string`; `workflowType`: `string`; \}; \}\>

***

### updateJobStatus()

> **updateJobStatus**(`jobId`, `status`, `result?`, `errorMessage?`): `Promise`\<\{ `attempts`: `number` \| `null`; `completedAt`: `Date` \| `null`; `createdAt`: `Date`; `errorMessage`: `string` \| `null`; `id`: `string`; `jobId`: `string` \| `null`; `jobName`: `string` \| `null`; `jobType`: `string`; `maxAttempts`: `number` \| `null`; `result`: `unknown`; `startedAt`: `Date` \| `null`; `status`: `string`; `tenantId`: `string`; `updatedAt`: `Date`; `workflowId`: `string`; \}\>

Defined in: [src/repositories/workflows.repository.ts:123](https://github.com/ifrspro/ifrs9-iaf/blob/cf4905123c7eb3e9046f36ce3f92dd13536ac238/packages/new-backend/src/repositories/workflows.repository.ts#L123)

Update workflow job status

#### Parameters

##### jobId

`string`

##### status

`string`

##### result?

`Record`\<`string`, `unknown`\>

##### errorMessage?

`string`

#### Returns

`Promise`\<\{ `attempts`: `number` \| `null`; `completedAt`: `Date` \| `null`; `createdAt`: `Date`; `errorMessage`: `string` \| `null`; `id`: `string`; `jobId`: `string` \| `null`; `jobName`: `string` \| `null`; `jobType`: `string`; `maxAttempts`: `number` \| `null`; `result`: `unknown`; `startedAt`: `Date` \| `null`; `status`: `string`; `tenantId`: `string`; `updatedAt`: `Date`; `workflowId`: `string`; \}\>
