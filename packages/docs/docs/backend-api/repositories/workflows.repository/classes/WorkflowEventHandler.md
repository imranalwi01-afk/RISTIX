[**Backend API Reference v1.0.0**](../../../README.md)

***

# Class: WorkflowEventHandler

Defined in: [src/repositories/workflows.repository.ts:148](https://github.com/ifrspro/ifrs9-iaf/blob/cf4905123c7eb3e9046f36ce3f92dd13536ac238/packages/new-backend/src/repositories/workflows.repository.ts#L148)

Workflow Event Handler: trigger jobs and notifications on state changes

## Constructors

### Constructor

> **new WorkflowEventHandler**(`workflowRepo`, `db`): `WorkflowEventHandler`

Defined in: [src/repositories/workflows.repository.ts:149](https://github.com/ifrspro/ifrs9-iaf/blob/cf4905123c7eb3e9046f36ce3f92dd13536ac238/packages/new-backend/src/repositories/workflows.repository.ts#L149)

#### Parameters

##### workflowRepo

[`WorkflowRepository`](WorkflowRepository.md)

##### db

`PostgresJsDatabase`\<`any`\>

#### Returns

`WorkflowEventHandler`

## Methods

### handleApprovalCompleted()

> **handleApprovalCompleted**(`workflowId`, `tenantId`, `action`, `approverUserId`, `approverName`, `requesterUserId`, `requesterEmail`, `workflowName`, `eclParams?`): `Promise`\<`void`\>

Defined in: [src/repositories/workflows.repository.ts:158](https://github.com/ifrspro/ifrs9-iaf/blob/cf4905123c7eb3e9046f36ce3f92dd13536ac238/packages/new-backend/src/repositories/workflows.repository.ts#L158)

Handle approval workflow completed
Triggers: ECL calculation, notifications, audit log

#### Parameters

##### workflowId

`string`

##### tenantId

`string`

##### action

`"APPROVED"` | `"REJECTED"`

##### approverUserId

`string`

##### approverName

`string`

##### requesterUserId

`string`

##### requesterEmail

`string`

##### workflowName

`string`

##### eclParams?

`Record`\<`string`, `unknown`\>

#### Returns

`Promise`\<`void`\>

***

### handleECLCalculationCompleted()

> **handleECLCalculationCompleted**(`workflowId`, `tenantId`, `jobId`, `result`, `userId`): `Promise`\<`void`\>

Defined in: [src/repositories/workflows.repository.ts:260](https://github.com/ifrspro/ifrs9-iaf/blob/cf4905123c7eb3e9046f36ce3f92dd13536ac238/packages/new-backend/src/repositories/workflows.repository.ts#L260)

Handle ECL calculation job completion
Updates workflow, logs result, triggers compliance checks

#### Parameters

##### workflowId

`string`

##### tenantId

`string`

##### jobId

`string`

##### result

`Record`\<`string`, `unknown`\>

##### userId

`string`

#### Returns

`Promise`\<`void`\>
