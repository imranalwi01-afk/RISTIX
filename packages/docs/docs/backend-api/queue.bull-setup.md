[**Backend API Reference v1.0.0**](index.md)

***

# queue/bull-setup

## Interfaces

### ApprovalNotificationJob

Defined in: [src/queue/bull-setup.ts:61](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/queue/bull-setup.ts#L61)

#### Properties

##### action

> **action**: `"APPROVED"` \| `"REJECTED"` \| `"REQUESTED_CHANGES"`

Defined in: [src/queue/bull-setup.ts:66](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/queue/bull-setup.ts#L66)

##### approvalRequestId

> **approvalRequestId**: `string`

Defined in: [src/queue/bull-setup.ts:65](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/queue/bull-setup.ts#L65)

##### approverUserId

> **approverUserId**: `string`

Defined in: [src/queue/bull-setup.ts:67](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/queue/bull-setup.ts#L67)

##### email?

> `optional` **email**: `string`

Defined in: [src/queue/bull-setup.ts:69](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/queue/bull-setup.ts#L69)

##### notifyUser

> **notifyUser**: `string`

Defined in: [src/queue/bull-setup.ts:68](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/queue/bull-setup.ts#L68)

##### template

> **template**: `"approval_pending"` \| `"approval_approved"` \| `"approval_rejected"`

Defined in: [src/queue/bull-setup.ts:70](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/queue/bull-setup.ts#L70)

##### tenantId

> **tenantId**: `string`

Defined in: [src/queue/bull-setup.ts:64](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/queue/bull-setup.ts#L64)

##### workflowId

> **workflowId**: `string`

Defined in: [src/queue/bull-setup.ts:62](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/queue/bull-setup.ts#L62)

##### workflowName

> **workflowName**: `string`

Defined in: [src/queue/bull-setup.ts:63](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/queue/bull-setup.ts#L63)

***

### ComplianceCheckJob

Defined in: [src/queue/bull-setup.ts:82](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/queue/bull-setup.ts#L82)

#### Properties

##### checkType

> **checkType**: `"IFRS9"` \| `"AML"` \| `"SANCTIONS"` \| `"EXPOSURE_LIMIT"`

Defined in: [src/queue/bull-setup.ts:86](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/queue/bull-setup.ts#L86)

##### entityId

> **entityId**: `string`

Defined in: [src/queue/bull-setup.ts:85](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/queue/bull-setup.ts#L85)

##### rules?

> `optional` **rules**: `Record`\<`string`, `unknown`\>

Defined in: [src/queue/bull-setup.ts:87](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/queue/bull-setup.ts#L87)

##### tenantId

> **tenantId**: `string`

Defined in: [src/queue/bull-setup.ts:84](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/queue/bull-setup.ts#L84)

##### workflowId

> **workflowId**: `string`

Defined in: [src/queue/bull-setup.ts:83](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/queue/bull-setup.ts#L83)

***

### DeadLetterJob

Defined in: [src/queue/bull-setup.ts:90](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/queue/bull-setup.ts#L90)

#### Properties

##### data

> **data**: `Record`\<`string`, `unknown`\>

Defined in: [src/queue/bull-setup.ts:94](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/queue/bull-setup.ts#L94)

##### failedAt

> **failedAt**: `string`

Defined in: [src/queue/bull-setup.ts:96](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/queue/bull-setup.ts#L96)

##### failedReason?

> `optional` **failedReason**: `string`

Defined in: [src/queue/bull-setup.ts:95](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/queue/bull-setup.ts#L95)

##### name

> **name**: `string`

Defined in: [src/queue/bull-setup.ts:93](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/queue/bull-setup.ts#L93)

##### originalJobId

> **originalJobId**: `string` \| `number`

Defined in: [src/queue/bull-setup.ts:92](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/queue/bull-setup.ts#L92)

##### originalQueue

> **originalQueue**: `string`

Defined in: [src/queue/bull-setup.ts:91](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/queue/bull-setup.ts#L91)

***

### ECLCalculationJob

Defined in: [src/queue/bull-setup.ts:73](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/queue/bull-setup.ts#L73)

#### Properties

##### eclRunId?

> `optional` **eclRunId**: `string`

Defined in: [src/queue/bull-setup.ts:77](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/queue/bull-setup.ts#L77)

##### entityId

> **entityId**: `string`

Defined in: [src/queue/bull-setup.ts:76](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/queue/bull-setup.ts#L76)

##### parameters?

> `optional` **parameters**: `Record`\<`string`, `unknown`\>

Defined in: [src/queue/bull-setup.ts:78](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/queue/bull-setup.ts#L78)

##### storedProcedure?

> `optional` **storedProcedure**: `string`

Defined in: [src/queue/bull-setup.ts:79](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/queue/bull-setup.ts#L79)

##### tenantId

> **tenantId**: `string`

Defined in: [src/queue/bull-setup.ts:75](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/queue/bull-setup.ts#L75)

##### workflowId

> **workflowId**: `string`

Defined in: [src/queue/bull-setup.ts:74](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/queue/bull-setup.ts#L74)

## Variables

### approvalDLQ

> `const` **approvalDLQ**: `Queue`\<`any`, `any`, `string`, `any`, `any`, `string`\>

Defined in: [src/queue/bull-setup.ts:56](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/queue/bull-setup.ts#L56)

***

### approvalNotificationQueue

> `const` **approvalNotificationQueue**: `Queue`\<`any`, `any`, `string`, `any`, `any`, `string`\>

Defined in: [src/queue/bull-setup.ts:46](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/queue/bull-setup.ts#L46)

***

### complianceCheckQueue

> `const` **complianceCheckQueue**: `Queue`\<`any`, `any`, `string`, `any`, `any`, `string`\>

Defined in: [src/queue/bull-setup.ts:52](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/queue/bull-setup.ts#L52)

***

### complianceDLQ

> `const` **complianceDLQ**: `Queue`\<`any`, `any`, `string`, `any`, `any`, `string`\>

Defined in: [src/queue/bull-setup.ts:58](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/queue/bull-setup.ts#L58)

***

### eclCalculationQueue

> `const` **eclCalculationQueue**: `Queue`\<`any`, `any`, `string`, `any`, `any`, `string`\>

Defined in: [src/queue/bull-setup.ts:49](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/queue/bull-setup.ts#L49)

***

### eclDLQ

> `const` **eclDLQ**: `Queue`\<`any`, `any`, `string`, `any`, `any`, `string`\>

Defined in: [src/queue/bull-setup.ts:57](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/queue/bull-setup.ts#L57)

## Functions

### closeQueues()

> **closeQueues**(): `Promise`\<`void`\>

Defined in: [src/queue/bull-setup.ts:106](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/queue/bull-setup.ts#L106)

#### Returns

`Promise`\<`void`\>

***

### enqueueDeadLetter()

> **enqueueDeadLetter**(`queueName`, `payload`): `Promise`\<`void`\>

Defined in: [src/queue/bull-setup.ts:120](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/queue/bull-setup.ts#L120)

Move a failed job payload to the corresponding dead-letter queue

#### Parameters

##### queueName

`string`

##### payload

[`DeadLetterJob`](#deadletterjob)

#### Returns

`Promise`\<`void`\>

***

### getQueueMetrics()

> **getQueueMetrics**(): `Promise`\<\{ `approval`: \{ `dlq`: `number`; \}; `compliance`: \{ `dlq`: `number`; \}; `ecl`: \{ `dlq`: `number`; \}; \}\>

Defined in: [src/queue/bull-setup.ts:139](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/queue/bull-setup.ts#L139)

Lightweight queue health snapshot (use in /health or dashboards)

#### Returns

`Promise`\<\{ `approval`: \{ `dlq`: `number`; \}; `compliance`: \{ `dlq`: `number`; \}; `ecl`: \{ `dlq`: `number`; \}; \}\>

***

### queueApprovalNotification()

> **queueApprovalNotification**(`job`): `Promise`\<`string`\>

Defined in: [src/queue/bull-setup.ts:159](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/queue/bull-setup.ts#L159)

Add job to approval notification queue

#### Parameters

##### job

[`ApprovalNotificationJob`](#approvalnotificationjob)

#### Returns

`Promise`\<`string`\>

***

### queueComplianceCheck()

> **queueComplianceCheck**(`job`): `Promise`\<`string`\>

Defined in: [src/queue/bull-setup.ts:195](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/queue/bull-setup.ts#L195)

Add job to compliance check queue

#### Parameters

##### job

[`ComplianceCheckJob`](#compliancecheckjob)

#### Returns

`Promise`\<`string`\>

***

### queueECLCalculation()

> **queueECLCalculation**(`job`): `Promise`\<`string`\>

Defined in: [src/queue/bull-setup.ts:178](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/queue/bull-setup.ts#L178)

Add job to ECL calculation queue

#### Parameters

##### job

[`ECLCalculationJob`](#eclcalculationjob)

#### Returns

`Promise`\<`string`\>

***

### setupQueues()

> **setupQueues**(): `Promise`\<`void`\>

Defined in: [src/queue/bull-setup.ts:100](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/queue/bull-setup.ts#L100)

#### Returns

`Promise`\<`void`\>
