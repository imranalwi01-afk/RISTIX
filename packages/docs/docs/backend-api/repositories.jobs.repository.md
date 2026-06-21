[**Backend API Reference v1.0.0**](index.md)

***

# repositories/jobs.repository

## Variables

### JobsRepository

> `const` **JobsRepository**: `object`

Defined in: [src/repositories/jobs.repository.ts:14](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/repositories/jobs.repository.ts#L14)

#### Type Declaration

##### createDefinition()

> **createDefinition**(`data`): `Promise`&lt;&#123; `approvalMatrixId`: `string` &#124; `null`; `autoApproveConditions`: `unknown`; `createdAt`: `Date` &#124; `null`; `createdBy`: `string` &#124; `null`; `cronExpression`: `string` &#124; `null`; `defaultParameters`: `unknown`; `description`: `string` &#124; `null`; `id`: `string`; `isEnabled`: `boolean` &#124; `null`; `jobType`: `string`; `lastRunStatus`: `string` &#124; `null`; `lastRunTime`: `Date` &#124; `null`; `maxRetries`: `number` &#124; `null`; `name`: `string`; `nextRunTime`: `Date` &#124; `null`; `priority`: `string` &#124; `null`; `requiresApproval`: `boolean` &#124; `null`; `tenantId`: `string`; `timeout`: `number` &#124; `null`; `updatedAt`: `Date` &#124; `null`; `updatedBy`: `string` &#124; `null`; &#125;&gt;

###### Parameters

###### data

`NewJobDefinition`

###### Returns

`Promise`&lt;&#123; `approvalMatrixId`: `string` &#124; `null`; `autoApproveConditions`: `unknown`; `createdAt`: `Date` &#124; `null`; `createdBy`: `string` &#124; `null`; `cronExpression`: `string` &#124; `null`; `defaultParameters`: `unknown`; `description`: `string` &#124; `null`; `id`: `string`; `isEnabled`: `boolean` &#124; `null`; `jobType`: `string`; `lastRunStatus`: `string` &#124; `null`; `lastRunTime`: `Date` &#124; `null`; `maxRetries`: `number` &#124; `null`; `name`: `string`; `nextRunTime`: `Date` &#124; `null`; `priority`: `string` &#124; `null`; `requiresApproval`: `boolean` &#124; `null`; `tenantId`: `string`; `timeout`: `number` &#124; `null`; `updatedAt`: `Date` &#124; `null`; `updatedBy`: `string` &#124; `null`; &#125;&gt;

##### createExecution()

> **createExecution**(`data`): `Promise`&lt;&#123; `approvalRequestId`: `string` &#124; `null`; `approvalStatus`: `string` &#124; `null`; `approvedAt`: `Date` &#124; `null`; `approvedBy`: `string` &#124; `null`; `duration`: `number` &#124; `null`; `endTime`: `Date` &#124; `null`; `error`: `string` &#124; `null`; `id`: `string`; `jobDefinitionId`: `string` &#124; `null`; `jobName`: `string`; `jobType`: `string`; `parameters`: `unknown`; `progress`: `number` &#124; `null`; `result`: `unknown`; `startTime`: `Date` &#124; `null`; `status`: `string`; `tags`: `unknown`; `tenantId`: `string`; `triggeredBy`: `string` &#124; `null`; `workerId`: `string` &#124; `null`; &#125;&gt;

###### Parameters

###### data

`NewJobExecution`

###### Returns

`Promise`&lt;&#123; `approvalRequestId`: `string` &#124; `null`; `approvalStatus`: `string` &#124; `null`; `approvedAt`: `Date` &#124; `null`; `approvedBy`: `string` &#124; `null`; `duration`: `number` &#124; `null`; `endTime`: `Date` &#124; `null`; `error`: `string` &#124; `null`; `id`: `string`; `jobDefinitionId`: `string` &#124; `null`; `jobName`: `string`; `jobType`: `string`; `parameters`: `unknown`; `progress`: `number` &#124; `null`; `result`: `unknown`; `startTime`: `Date` &#124; `null`; `status`: `string`; `tags`: `unknown`; `tenantId`: `string`; `triggeredBy`: `string` &#124; `null`; `workerId`: `string` &#124; `null`; &#125;&gt;

##### findAllDefinitions()

> **findAllDefinitions**(`tenantId`): `Promise`&lt;`object`[]&gt;

###### Parameters

###### tenantId

`string`

###### Returns

`Promise`&lt;`object`[]&gt;

##### findDefinitionById()

> **findDefinitionById**(`id`, `tenantId?`): `Promise`&lt;&#123; `approvalMatrixId`: `string` &#124; `null`; `autoApproveConditions`: `unknown`; `createdAt`: `Date` &#124; `null`; `createdBy`: `string` &#124; `null`; `cronExpression`: `string` &#124; `null`; `defaultParameters`: `unknown`; `description`: `string` &#124; `null`; `id`: `string`; `isEnabled`: `boolean` &#124; `null`; `jobType`: `string`; `lastRunStatus`: `string` &#124; `null`; `lastRunTime`: `Date` &#124; `null`; `maxRetries`: `number` &#124; `null`; `name`: `string`; `nextRunTime`: `Date` &#124; `null`; `priority`: `string` &#124; `null`; `requiresApproval`: `boolean` &#124; `null`; `tenantId`: `string`; `timeout`: `number` &#124; `null`; `updatedAt`: `Date` &#124; `null`; `updatedBy`: `string` &#124; `null`; &#125;&gt;

###### Parameters

###### id

`string`

###### tenantId?

`string`

###### Returns

`Promise`&lt;&#123; `approvalMatrixId`: `string` &#124; `null`; `autoApproveConditions`: `unknown`; `createdAt`: `Date` &#124; `null`; `createdBy`: `string` &#124; `null`; `cronExpression`: `string` &#124; `null`; `defaultParameters`: `unknown`; `description`: `string` &#124; `null`; `id`: `string`; `isEnabled`: `boolean` &#124; `null`; `jobType`: `string`; `lastRunStatus`: `string` &#124; `null`; `lastRunTime`: `Date` &#124; `null`; `maxRetries`: `number` &#124; `null`; `name`: `string`; `nextRunTime`: `Date` &#124; `null`; `priority`: `string` &#124; `null`; `requiresApproval`: `boolean` &#124; `null`; `tenantId`: `string`; `timeout`: `number` &#124; `null`; `updatedAt`: `Date` &#124; `null`; `updatedBy`: `string` &#124; `null`; &#125;&gt;

##### findExecutionById()

> **findExecutionById**(`id`, `tenantId?`): `Promise`&lt;&#123; `approvalRequestId`: `string` &#124; `null`; `approvalStatus`: `string` &#124; `null`; `approvedAt`: `Date` &#124; `null`; `approvedBy`: `string` &#124; `null`; `definition`: `never`; `duration`: `number` &#124; `null`; `endTime`: `Date` &#124; `null`; `error`: `string` &#124; `null`; `id`: `string`; `jobDefinitionId`: `string` &#124; `null`; `jobName`: `string`; `jobType`: `string`; `parameters`: `unknown`; `progress`: `number` &#124; `null`; `result`: `unknown`; `startTime`: `Date` &#124; `null`; `status`: `string`; `tags`: `unknown`; `tenantId`: `string`; `triggeredBy`: `string` &#124; `null`; `workerId`: `string` &#124; `null`; &#125; &#124; `undefined`&gt;

###### Parameters

###### id

`string`

###### tenantId?

`string`

###### Returns

`Promise`&lt;&#123; `approvalRequestId`: `string` &#124; `null`; `approvalStatus`: `string` &#124; `null`; `approvedAt`: `Date` &#124; `null`; `approvedBy`: `string` &#124; `null`; `definition`: `never`; `duration`: `number` &#124; `null`; `endTime`: `Date` &#124; `null`; `error`: `string` &#124; `null`; `id`: `string`; `jobDefinitionId`: `string` &#124; `null`; `jobName`: `string`; `jobType`: `string`; `parameters`: `unknown`; `progress`: `number` &#124; `null`; `result`: `unknown`; `startTime`: `Date` &#124; `null`; `status`: `string`; `tags`: `unknown`; `tenantId`: `string`; `triggeredBy`: `string` &#124; `null`; `workerId`: `string` &#124; `null`; &#125; &#124; `undefined`&gt;

##### findExecutions()

> **findExecutions**(`tenantId`, `limit`): `Promise`&lt;`RowList`&lt;`Row`[]&gt;&gt;

###### Parameters

###### tenantId

`string`

###### limit

`number` = `10`

###### Returns

`Promise`&lt;`RowList`&lt;`Row`[]&gt;&gt;

##### getStats()

> **getStats**(`tenantId`): `Promise`&lt;&#123; `activeJobs`: `number`; `failedToday`: `number`; &#125;&gt;

###### Parameters

###### tenantId

`string`

###### Returns

`Promise`&lt;&#123; `activeJobs`: `number`; `failedToday`: `number`; &#125;&gt;

##### updateDefinition()

> **updateDefinition**(`id`, `data`, `tenantId?`): `Promise`&lt;&#123; `approvalMatrixId`: `string` &#124; `null`; `autoApproveConditions`: `unknown`; `createdAt`: `Date` &#124; `null`; `createdBy`: `string` &#124; `null`; `cronExpression`: `string` &#124; `null`; `defaultParameters`: `unknown`; `description`: `string` &#124; `null`; `id`: `string`; `isEnabled`: `boolean` &#124; `null`; `jobType`: `string`; `lastRunStatus`: `string` &#124; `null`; `lastRunTime`: `Date` &#124; `null`; `maxRetries`: `number` &#124; `null`; `name`: `string`; `nextRunTime`: `Date` &#124; `null`; `priority`: `string` &#124; `null`; `requiresApproval`: `boolean` &#124; `null`; `tenantId`: `string`; `timeout`: `number` &#124; `null`; `updatedAt`: `Date` &#124; `null`; `updatedBy`: `string` &#124; `null`; &#125;&gt;

###### Parameters

###### id

`string`

###### data

`NewJobDefinition`

###### tenantId?

`string`

###### Returns

`Promise`&lt;&#123; `approvalMatrixId`: `string` &#124; `null`; `autoApproveConditions`: `unknown`; `createdAt`: `Date` &#124; `null`; `createdBy`: `string` &#124; `null`; `cronExpression`: `string` &#124; `null`; `defaultParameters`: `unknown`; `description`: `string` &#124; `null`; `id`: `string`; `isEnabled`: `boolean` &#124; `null`; `jobType`: `string`; `lastRunStatus`: `string` &#124; `null`; `lastRunTime`: `Date` &#124; `null`; `maxRetries`: `number` &#124; `null`; `name`: `string`; `nextRunTime`: `Date` &#124; `null`; `priority`: `string` &#124; `null`; `requiresApproval`: `boolean` &#124; `null`; `tenantId`: `string`; `timeout`: `number` &#124; `null`; `updatedAt`: `Date` &#124; `null`; `updatedBy`: `string` &#124; `null`; &#125;&gt;

##### updateExecution()

> **updateExecution**(`id`, `data`, `tenantId?`): `Promise`&lt;&#123; `approvalRequestId`: `string` &#124; `null`; `approvalStatus`: `string` &#124; `null`; `approvedAt`: `Date` &#124; `null`; `approvedBy`: `string` &#124; `null`; `duration`: `number` &#124; `null`; `endTime`: `Date` &#124; `null`; `error`: `string` &#124; `null`; `id`: `string`; `jobDefinitionId`: `string` &#124; `null`; `jobName`: `string`; `jobType`: `string`; `parameters`: `unknown`; `progress`: `number` &#124; `null`; `result`: `unknown`; `startTime`: `Date` &#124; `null`; `status`: `string`; `tags`: `unknown`; `tenantId`: `string`; `triggeredBy`: `string` &#124; `null`; `workerId`: `string` &#124; `null`; &#125;&gt;

###### Parameters

###### id

`string`

###### data

`NewJobExecution`

###### tenantId?

`string`

###### Returns

`Promise`&lt;&#123; `approvalRequestId`: `string` &#124; `null`; `approvalStatus`: `string` &#124; `null`; `approvedAt`: `Date` &#124; `null`; `approvedBy`: `string` &#124; `null`; `duration`: `number` &#124; `null`; `endTime`: `Date` &#124; `null`; `error`: `string` &#124; `null`; `id`: `string`; `jobDefinitionId`: `string` &#124; `null`; `jobName`: `string`; `jobType`: `string`; `parameters`: `unknown`; `progress`: `number` &#124; `null`; `result`: `unknown`; `startTime`: `Date` &#124; `null`; `status`: `string`; `tags`: `unknown`; `tenantId`: `string`; `triggeredBy`: `string` &#124; `null`; `workerId`: `string` &#124; `null`; &#125;&gt;
