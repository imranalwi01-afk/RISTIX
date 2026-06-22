[**Backend API Reference v1.0.0**](index.md)

***

# repositories/workflows.repository

## Classes

### WorkflowEventHandler

Defined in: [src/repositories/workflows.repository.ts:148](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/repositories/workflows.repository.ts#L148)

Workflow Event Handler: trigger jobs and notifications on state changes

#### Constructors

##### Constructor

> **new WorkflowEventHandler**(`workflowRepo`, `db`): [`WorkflowEventHandler`](#workfloweventhandler)

Defined in: [src/repositories/workflows.repository.ts:149](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/repositories/workflows.repository.ts#L149)

###### Parameters

###### workflowRepo

[`WorkflowRepository`](#workflowrepository)

###### db

`PostgresJsDatabase`&lt;`any`&gt;

###### Returns

[`WorkflowEventHandler`](#workfloweventhandler)

#### Methods

##### handleApprovalCompleted()

> **handleApprovalCompleted**(`workflowId`, `tenantId`, `action`, `approverUserId`, `approverName`, `requesterUserId`, `requesterEmail`, `workflowName`, `eclParams?`): `Promise`&lt;`void`&gt;

Defined in: [src/repositories/workflows.repository.ts:158](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/repositories/workflows.repository.ts#L158)

Handle approval workflow completed
Triggers: ECL calculation, notifications, audit log

###### Parameters

###### workflowId

`string`

###### tenantId

`string`

###### action

`"APPROVED"` | `"REJECTED"`

###### approverUserId

`string`

###### approverName

`string`

###### requesterUserId

`string`

###### requesterEmail

`string`

###### workflowName

`string`

###### eclParams?

`Record`&lt;`string`, `unknown`&gt;

###### Returns

`Promise`&lt;`void`&gt;

##### handleECLCalculationCompleted()

> **handleECLCalculationCompleted**(`workflowId`, `tenantId`, `jobId`, `result`, `userId`): `Promise`&lt;`void`&gt;

Defined in: [src/repositories/workflows.repository.ts:260](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/repositories/workflows.repository.ts#L260)

Handle ECL calculation job completion
Updates workflow, logs result, triggers compliance checks

###### Parameters

###### workflowId

`string`

###### tenantId

`string`

###### jobId

`string`

###### result

`Record`&lt;`string`, `unknown`&gt;

###### userId

`string`

###### Returns

`Promise`&lt;`void`&gt;

***

### WorkflowRepository

Defined in: [src/repositories/workflows.repository.ts:23](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/repositories/workflows.repository.ts#L23)

Workflow Repository: CRUD and business logic for workflows

#### Constructors

##### Constructor

> **new WorkflowRepository**(`db`): [`WorkflowRepository`](#workflowrepository)

Defined in: [src/repositories/workflows.repository.ts:24](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/repositories/workflows.repository.ts#L24)

###### Parameters

###### db

`PostgresJsDatabase`&lt;`any`&gt;

###### Returns

[`WorkflowRepository`](#workflowrepository)

#### Methods

##### createWorkflow()

> **createWorkflow**(`data`): `Promise`&lt;&#123; `completedAt`: `Date` &#124; `null`; `createdAt`: `Date`; `currentState`: `string`; `description`: `string` &#124; `null`; `entityId`: `string`; `entityType`: `string`; `expectedCompletionAt`: `Date` &#124; `null`; `id`: `string`; `isActive`: `boolean`; `metadata`: `unknown`; `previousState`: `string` &#124; `null`; `requestedBy`: `string` &#124; `null`; `requestReason`: `string` &#124; `null`; `tenantId`: `string`; `updatedAt`: `Date`; `workflowName`: `string`; `workflowType`: `string`; &#125;&gt;

Defined in: [src/repositories/workflows.repository.ts:29](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/repositories/workflows.repository.ts#L29)

Create new workflow

###### Parameters

###### data

###### completedAt?

`Date` &#124; `null`

###### createdAt?

`Date`

###### currentState?

`string`

###### description?

`string` &#124; `null`

###### entityId

`string`

###### entityType

`string`

###### expectedCompletionAt?

`Date` &#124; `null`

###### id?

`string`

###### isActive?

`boolean`

###### metadata?

`unknown`

###### previousState?

`string` &#124; `null`

###### requestedBy?

`string` &#124; `null`

###### requestReason?

`string` &#124; `null`

###### tenantId

`string`

###### updatedAt?

`Date`

###### workflowName

`string`

###### workflowType

`string`

###### Returns

`Promise`&lt;&#123; `completedAt`: `Date` &#124; `null`; `createdAt`: `Date`; `currentState`: `string`; `description`: `string` &#124; `null`; `entityId`: `string`; `entityType`: `string`; `expectedCompletionAt`: `Date` &#124; `null`; `id`: `string`; `isActive`: `boolean`; `metadata`: `unknown`; `previousState`: `string` &#124; `null`; `requestedBy`: `string` &#124; `null`; `requestReason`: `string` &#124; `null`; `tenantId`: `string`; `updatedAt`: `Date`; `workflowName`: `string`; `workflowType`: `string`; &#125;&gt;

##### createWorkflowJob()

> **createWorkflowJob**(`data`): `Promise`&lt;&#123; `attempts`: `number` &#124; `null`; `completedAt`: `Date` &#124; `null`; `createdAt`: `Date`; `errorMessage`: `string` &#124; `null`; `id`: `string`; `jobId`: `string` &#124; `null`; `jobName`: `string` &#124; `null`; `jobType`: `string`; `maxAttempts`: `number` &#124; `null`; `result`: `unknown`; `startedAt`: `Date` &#124; `null`; `status`: `string`; `tenantId`: `string`; `updatedAt`: `Date`; `workflowId`: `string`; &#125;&gt;

Defined in: [src/repositories/workflows.repository.ts:115](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/repositories/workflows.repository.ts#L115)

Create workflow job (for Bull queue tracking)

###### Parameters

###### data

###### attempts?

`number` &#124; `null`

###### completedAt?

`Date` &#124; `null`

###### createdAt?

`Date`

###### errorMessage?

`string` &#124; `null`

###### id?

`string`

###### jobId?

`string` &#124; `null`

###### jobName?

`string` &#124; `null`

###### jobType

`string`

###### maxAttempts?

`number` &#124; `null`

###### result?

`unknown`

###### startedAt?

`Date` &#124; `null`

###### status?

`string`

###### tenantId

`string`

###### updatedAt?

`Date`

###### workflowId

`string`

###### Returns

`Promise`&lt;&#123; `attempts`: `number` &#124; `null`; `completedAt`: `Date` &#124; `null`; `createdAt`: `Date`; `errorMessage`: `string` &#124; `null`; `id`: `string`; `jobId`: `string` &#124; `null`; `jobName`: `string` &#124; `null`; `jobType`: `string`; `maxAttempts`: `number` &#124; `null`; `result`: `unknown`; `startedAt`: `Date` &#124; `null`; `status`: `string`; `tenantId`: `string`; `updatedAt`: `Date`; `workflowId`: `string`; &#125;&gt;

##### getWorkflow()

> **getWorkflow**(`workflowId`): `Promise`&lt;&#123; `completedAt`: `Date` &#124; `null`; `createdAt`: `Date`; `currentState`: `string`; `description`: `string` &#124; `null`; `entityId`: `string`; `entityType`: `string`; `expectedCompletionAt`: `Date` &#124; `null`; `id`: `string`; `isActive`: `boolean`; `metadata`: `unknown`; `previousState`: `string` &#124; `null`; `requestedBy`: `string` &#124; `null`; `requestReason`: `string` &#124; `null`; `tenantId`: `string`; `updatedAt`: `Date`; `workflowName`: `string`; `workflowType`: `string`; &#125; &#124; `undefined`&gt;

Defined in: [src/repositories/workflows.repository.ts:37](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/repositories/workflows.repository.ts#L37)

Get workflow by ID

###### Parameters

###### workflowId

`string`

###### Returns

`Promise`&lt;&#123; `completedAt`: `Date` &#124; `null`; `createdAt`: `Date`; `currentState`: `string`; `description`: `string` &#124; `null`; `entityId`: `string`; `entityType`: `string`; `expectedCompletionAt`: `Date` &#124; `null`; `id`: `string`; `isActive`: `boolean`; `metadata`: `unknown`; `previousState`: `string` &#124; `null`; `requestedBy`: `string` &#124; `null`; `requestReason`: `string` &#124; `null`; `tenantId`: `string`; `updatedAt`: `Date`; `workflowName`: `string`; `workflowType`: `string`; &#125; &#124; `undefined`&gt;

##### getWorkflowsByTenant()

> **getWorkflowsByTenant**(`tenantId`): `Promise`&lt;`object`[]&gt;

Defined in: [src/repositories/workflows.repository.ts:51](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/repositories/workflows.repository.ts#L51)

Get workflows for tenant

###### Parameters

###### tenantId

`string`

###### Returns

`Promise`&lt;`object`[]&gt;

##### transitionWorkflow()

> **transitionWorkflow**(`workflowId`, `toState`, `triggeredBy`, `transitionReason?`, `transitionNotes?`, `approvalAction?`, `approvalComment?`): `Promise`&lt;&#123; `transition`: &#123; `approvalAction`: `string` &#124; `null`; `approvalComment`: `string` &#124; `null`; `fromState`: `string`; `id`: `string`; `metadata`: `unknown`; `tenantId`: `string`; `toState`: `string`; `transitionNotes`: `string` &#124; `null`; `transitionReason`: `string` &#124; `null`; `triggeredAt`: `Date`; `triggeredBy`: `string` &#124; `null`; `workflowId`: `string`; &#125;; `workflow`: &#123; `completedAt`: `Date` &#124; `null`; `createdAt`: `Date`; `currentState`: `string`; `description`: `string` &#124; `null`; `entityId`: `string`; `entityType`: `string`; `expectedCompletionAt`: `Date` &#124; `null`; `id`: `string`; `isActive`: `boolean`; `metadata`: `unknown`; `previousState`: `string` &#124; `null`; `requestedBy`: `string` &#124; `null`; `requestReason`: `string` &#124; `null`; `tenantId`: `string`; `updatedAt`: `Date`; `workflowName`: `string`; `workflowType`: `string`; &#125;; &#125;&gt;

Defined in: [src/repositories/workflows.repository.ts:61](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/repositories/workflows.repository.ts#L61)

Transition workflow state + audit trail

###### Parameters

###### workflowId

`string`

###### toState

`string`

###### triggeredBy

`string`

###### transitionReason?

`string`

###### transitionNotes?

`string`

###### approvalAction?

`string`

###### approvalComment?

`string`

###### Returns

`Promise`&lt;&#123; `transition`: &#123; `approvalAction`: `string` &#124; `null`; `approvalComment`: `string` &#124; `null`; `fromState`: `string`; `id`: `string`; `metadata`: `unknown`; `tenantId`: `string`; `toState`: `string`; `transitionNotes`: `string` &#124; `null`; `transitionReason`: `string` &#124; `null`; `triggeredAt`: `Date`; `triggeredBy`: `string` &#124; `null`; `workflowId`: `string`; &#125;; `workflow`: &#123; `completedAt`: `Date` &#124; `null`; `createdAt`: `Date`; `currentState`: `string`; `description`: `string` &#124; `null`; `entityId`: `string`; `entityType`: `string`; `expectedCompletionAt`: `Date` &#124; `null`; `id`: `string`; `isActive`: `boolean`; `metadata`: `unknown`; `previousState`: `string` &#124; `null`; `requestedBy`: `string` &#124; `null`; `requestReason`: `string` &#124; `null`; `tenantId`: `string`; `updatedAt`: `Date`; `workflowName`: `string`; `workflowType`: `string`; &#125;; &#125;&gt;

##### updateJobStatus()

> **updateJobStatus**(`jobId`, `status`, `result?`, `errorMessage?`): `Promise`&lt;&#123; `attempts`: `number` &#124; `null`; `completedAt`: `Date` &#124; `null`; `createdAt`: `Date`; `errorMessage`: `string` &#124; `null`; `id`: `string`; `jobId`: `string` &#124; `null`; `jobName`: `string` &#124; `null`; `jobType`: `string`; `maxAttempts`: `number` &#124; `null`; `result`: `unknown`; `startedAt`: `Date` &#124; `null`; `status`: `string`; `tenantId`: `string`; `updatedAt`: `Date`; `workflowId`: `string`; &#125;&gt;

Defined in: [src/repositories/workflows.repository.ts:123](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/repositories/workflows.repository.ts#L123)

Update workflow job status

###### Parameters

###### jobId

`string`

###### status

`string`

###### result?

`Record`&lt;`string`, `unknown`&gt;

###### errorMessage?

`string`

###### Returns

`Promise`&lt;&#123; `attempts`: `number` &#124; `null`; `completedAt`: `Date` &#124; `null`; `createdAt`: `Date`; `errorMessage`: `string` &#124; `null`; `id`: `string`; `jobId`: `string` &#124; `null`; `jobName`: `string` &#124; `null`; `jobType`: `string`; `maxAttempts`: `number` &#124; `null`; `result`: `unknown`; `startedAt`: `Date` &#124; `null`; `status`: `string`; `tenantId`: `string`; `updatedAt`: `Date`; `workflowId`: `string`; &#125;&gt;

## Functions

### createWorkflowEventHandler()

> **createWorkflowEventHandler**(`workflowRepo`, `db`): [`WorkflowEventHandler`](#workfloweventhandler)

Defined in: [src/repositories/workflows.repository.ts:313](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/repositories/workflows.repository.ts#L313)

#### Parameters

##### workflowRepo

[`WorkflowRepository`](#workflowrepository)

##### db

`PostgresJsDatabase`&lt;`any`&gt;

#### Returns

[`WorkflowEventHandler`](#workfloweventhandler)

***

### createWorkflowRepository()

> **createWorkflowRepository**(`db`): [`WorkflowRepository`](#workflowrepository)

Defined in: [src/repositories/workflows.repository.ts:309](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/repositories/workflows.repository.ts#L309)

Export repository factory

#### Parameters

##### db

`PostgresJsDatabase`&lt;`any`&gt;

#### Returns

[`WorkflowRepository`](#workflowrepository)
