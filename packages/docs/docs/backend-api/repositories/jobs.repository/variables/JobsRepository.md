[**Backend API Reference v1.0.0**](../../../README.md)

***

# Variable: JobsRepository

> `const` **JobsRepository**: `object`

Defined in: [packages/new-backend/src/repositories/jobs.repository.ts:13](https://github.com/ifrspro/ifrs9-iaf/blob/2c233b31171a451bb86daacd4389a961f1213deb/packages/new-backend/src/repositories/jobs.repository.ts#L13)

## Type Declaration

### createDefinition()

> **createDefinition**(`data`): `Promise`\<\{ `approvalMatrixId`: `string` \| `null`; `autoApproveConditions`: `unknown`; `createdAt`: `Date` \| `null`; `createdBy`: `string` \| `null`; `cronExpression`: `string` \| `null`; `defaultParameters`: `unknown`; `description`: `string` \| `null`; `id`: `string`; `isEnabled`: `boolean` \| `null`; `jobType`: `string`; `lastRunStatus`: `string` \| `null`; `lastRunTime`: `Date` \| `null`; `maxRetries`: `number` \| `null`; `name`: `string`; `nextRunTime`: `Date` \| `null`; `priority`: `string` \| `null`; `requiresApproval`: `boolean` \| `null`; `tenantId`: `string`; `timeout`: `number` \| `null`; `updatedAt`: `Date` \| `null`; `updatedBy`: `string` \| `null`; \}\>

#### Parameters

##### data

`NewJobDefinition`

#### Returns

`Promise`\<\{ `approvalMatrixId`: `string` \| `null`; `autoApproveConditions`: `unknown`; `createdAt`: `Date` \| `null`; `createdBy`: `string` \| `null`; `cronExpression`: `string` \| `null`; `defaultParameters`: `unknown`; `description`: `string` \| `null`; `id`: `string`; `isEnabled`: `boolean` \| `null`; `jobType`: `string`; `lastRunStatus`: `string` \| `null`; `lastRunTime`: `Date` \| `null`; `maxRetries`: `number` \| `null`; `name`: `string`; `nextRunTime`: `Date` \| `null`; `priority`: `string` \| `null`; `requiresApproval`: `boolean` \| `null`; `tenantId`: `string`; `timeout`: `number` \| `null`; `updatedAt`: `Date` \| `null`; `updatedBy`: `string` \| `null`; \}\>

### createExecution()

> **createExecution**(`data`): `Promise`\<\{ `approvalRequestId`: `string` \| `null`; `approvalStatus`: `string` \| `null`; `approvedAt`: `Date` \| `null`; `approvedBy`: `string` \| `null`; `duration`: `number` \| `null`; `endTime`: `Date` \| `null`; `error`: `string` \| `null`; `id`: `string`; `jobDefinitionId`: `string` \| `null`; `jobName`: `string`; `jobType`: `string`; `parameters`: `unknown`; `progress`: `number` \| `null`; `result`: `unknown`; `startTime`: `Date` \| `null`; `status`: `string`; `tags`: `unknown`; `tenantId`: `string`; `triggeredBy`: `string` \| `null`; `workerId`: `string` \| `null`; \}\>

#### Parameters

##### data

`NewJobExecution`

#### Returns

`Promise`\<\{ `approvalRequestId`: `string` \| `null`; `approvalStatus`: `string` \| `null`; `approvedAt`: `Date` \| `null`; `approvedBy`: `string` \| `null`; `duration`: `number` \| `null`; `endTime`: `Date` \| `null`; `error`: `string` \| `null`; `id`: `string`; `jobDefinitionId`: `string` \| `null`; `jobName`: `string`; `jobType`: `string`; `parameters`: `unknown`; `progress`: `number` \| `null`; `result`: `unknown`; `startTime`: `Date` \| `null`; `status`: `string`; `tags`: `unknown`; `tenantId`: `string`; `triggeredBy`: `string` \| `null`; `workerId`: `string` \| `null`; \}\>

### findAllDefinitions()

> **findAllDefinitions**(`tenantId`): `Promise`\<`object`[]\>

#### Parameters

##### tenantId

`string`

#### Returns

`Promise`\<`object`[]\>

### findDefinitionById()

> **findDefinitionById**(`id`): `Promise`\<\{ `approvalMatrixId`: `string` \| `null`; `autoApproveConditions`: `unknown`; `createdAt`: `Date` \| `null`; `createdBy`: `string` \| `null`; `cronExpression`: `string` \| `null`; `defaultParameters`: `unknown`; `description`: `string` \| `null`; `id`: `string`; `isEnabled`: `boolean` \| `null`; `jobType`: `string`; `lastRunStatus`: `string` \| `null`; `lastRunTime`: `Date` \| `null`; `maxRetries`: `number` \| `null`; `name`: `string`; `nextRunTime`: `Date` \| `null`; `priority`: `string` \| `null`; `requiresApproval`: `boolean` \| `null`; `tenantId`: `string`; `timeout`: `number` \| `null`; `updatedAt`: `Date` \| `null`; `updatedBy`: `string` \| `null`; \} \| `undefined`\>

#### Parameters

##### id

`string`

#### Returns

`Promise`\<\{ `approvalMatrixId`: `string` \| `null`; `autoApproveConditions`: `unknown`; `createdAt`: `Date` \| `null`; `createdBy`: `string` \| `null`; `cronExpression`: `string` \| `null`; `defaultParameters`: `unknown`; `description`: `string` \| `null`; `id`: `string`; `isEnabled`: `boolean` \| `null`; `jobType`: `string`; `lastRunStatus`: `string` \| `null`; `lastRunTime`: `Date` \| `null`; `maxRetries`: `number` \| `null`; `name`: `string`; `nextRunTime`: `Date` \| `null`; `priority`: `string` \| `null`; `requiresApproval`: `boolean` \| `null`; `tenantId`: `string`; `timeout`: `number` \| `null`; `updatedAt`: `Date` \| `null`; `updatedBy`: `string` \| `null`; \} \| `undefined`\>

### findExecutionById()

> **findExecutionById**(`id`): `Promise`\<\{ `approvalRequestId`: `string` \| `null`; `approvalStatus`: `string` \| `null`; `approvedAt`: `Date` \| `null`; `approvedBy`: `string` \| `null`; `definition`: `never`; `duration`: `number` \| `null`; `endTime`: `Date` \| `null`; `error`: `string` \| `null`; `id`: `string`; `jobDefinitionId`: `string` \| `null`; `jobName`: `string`; `jobType`: `string`; `parameters`: `unknown`; `progress`: `number` \| `null`; `result`: `unknown`; `startTime`: `Date` \| `null`; `status`: `string`; `tags`: `unknown`; `tenantId`: `string`; `triggeredBy`: `string` \| `null`; `workerId`: `string` \| `null`; \} \| `undefined`\>

#### Parameters

##### id

`string`

#### Returns

`Promise`\<\{ `approvalRequestId`: `string` \| `null`; `approvalStatus`: `string` \| `null`; `approvedAt`: `Date` \| `null`; `approvedBy`: `string` \| `null`; `definition`: `never`; `duration`: `number` \| `null`; `endTime`: `Date` \| `null`; `error`: `string` \| `null`; `id`: `string`; `jobDefinitionId`: `string` \| `null`; `jobName`: `string`; `jobType`: `string`; `parameters`: `unknown`; `progress`: `number` \| `null`; `result`: `unknown`; `startTime`: `Date` \| `null`; `status`: `string`; `tags`: `unknown`; `tenantId`: `string`; `triggeredBy`: `string` \| `null`; `workerId`: `string` \| `null`; \} \| `undefined`\>

### findExecutions()

> **findExecutions**(`tenantId`, `limit`): `Promise`\<`object`[]\>

#### Parameters

##### tenantId

`string`

##### limit

`number` = `50`

#### Returns

`Promise`\<`object`[]\>

### getStats()

> **getStats**(`tenantId`): `Promise`\<\{ `activeJobs`: `number`; `failedToday`: `number`; \}\>

#### Parameters

##### tenantId

`string`

#### Returns

`Promise`\<\{ `activeJobs`: `number`; `failedToday`: `number`; \}\>

### updateDefinition()

> **updateDefinition**(`id`, `data`): `Promise`\<\{ `approvalMatrixId`: `string` \| `null`; `autoApproveConditions`: `unknown`; `createdAt`: `Date` \| `null`; `createdBy`: `string` \| `null`; `cronExpression`: `string` \| `null`; `defaultParameters`: `unknown`; `description`: `string` \| `null`; `id`: `string`; `isEnabled`: `boolean` \| `null`; `jobType`: `string`; `lastRunStatus`: `string` \| `null`; `lastRunTime`: `Date` \| `null`; `maxRetries`: `number` \| `null`; `name`: `string`; `nextRunTime`: `Date` \| `null`; `priority`: `string` \| `null`; `requiresApproval`: `boolean` \| `null`; `tenantId`: `string`; `timeout`: `number` \| `null`; `updatedAt`: `Date` \| `null`; `updatedBy`: `string` \| `null`; \}\>

#### Parameters

##### id

`string`

##### data

`NewJobDefinition`

#### Returns

`Promise`\<\{ `approvalMatrixId`: `string` \| `null`; `autoApproveConditions`: `unknown`; `createdAt`: `Date` \| `null`; `createdBy`: `string` \| `null`; `cronExpression`: `string` \| `null`; `defaultParameters`: `unknown`; `description`: `string` \| `null`; `id`: `string`; `isEnabled`: `boolean` \| `null`; `jobType`: `string`; `lastRunStatus`: `string` \| `null`; `lastRunTime`: `Date` \| `null`; `maxRetries`: `number` \| `null`; `name`: `string`; `nextRunTime`: `Date` \| `null`; `priority`: `string` \| `null`; `requiresApproval`: `boolean` \| `null`; `tenantId`: `string`; `timeout`: `number` \| `null`; `updatedAt`: `Date` \| `null`; `updatedBy`: `string` \| `null`; \}\>

### updateExecution()

> **updateExecution**(`id`, `data`): `Promise`\<\{ `approvalRequestId`: `string` \| `null`; `approvalStatus`: `string` \| `null`; `approvedAt`: `Date` \| `null`; `approvedBy`: `string` \| `null`; `duration`: `number` \| `null`; `endTime`: `Date` \| `null`; `error`: `string` \| `null`; `id`: `string`; `jobDefinitionId`: `string` \| `null`; `jobName`: `string`; `jobType`: `string`; `parameters`: `unknown`; `progress`: `number` \| `null`; `result`: `unknown`; `startTime`: `Date` \| `null`; `status`: `string`; `tags`: `unknown`; `tenantId`: `string`; `triggeredBy`: `string` \| `null`; `workerId`: `string` \| `null`; \}\>

#### Parameters

##### id

`string`

##### data

`NewJobExecution`

#### Returns

`Promise`\<\{ `approvalRequestId`: `string` \| `null`; `approvalStatus`: `string` \| `null`; `approvedAt`: `Date` \| `null`; `approvedBy`: `string` \| `null`; `duration`: `number` \| `null`; `endTime`: `Date` \| `null`; `error`: `string` \| `null`; `id`: `string`; `jobDefinitionId`: `string` \| `null`; `jobName`: `string`; `jobType`: `string`; `parameters`: `unknown`; `progress`: `number` \| `null`; `result`: `unknown`; `startTime`: `Date` \| `null`; `status`: `string`; `tags`: `unknown`; `tenantId`: `string`; `triggeredBy`: `string` \| `null`; `workerId`: `string` \| `null`; \}\>
