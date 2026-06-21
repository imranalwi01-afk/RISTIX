[**Backend API Reference v1.0.0**](index.md)

***

# services/job-executor.service

## Classes

### JobExecutorService

Defined in: [src/services/job-executor.service.ts:33](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/services/job-executor.service.ts#L33)

#### Type Parameters

##### TSchema

`TSchema` *extends* `Record`&lt;`string`, `unknown`&gt; = *typeof* [`db/schema`](db.schema.md)

#### Constructors

##### Constructor

> **new JobExecutorService**&lt;`TSchema`&gt;(`db`, `options`): [`JobExecutorService`](#jobexecutorservice)&lt;`TSchema`&gt;

Defined in: [src/services/job-executor.service.ts:34](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/services/job-executor.service.ts#L34)

###### Parameters

###### db

`PostgresJsDatabase`&lt;`TSchema`&gt;

###### options

[`ExecutorOptions`](#executoroptions) = `{}`

###### Returns

[`JobExecutorService`](#jobexecutorservice)&lt;`TSchema`&gt;

#### Methods

##### execute()

> **execute**(`jobType`, `parameters`): `Promise`&lt;[`JobResult`](#jobresult)&gt;

Defined in: [src/services/job-executor.service.ts:99](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/services/job-executor.service.ts#L99)

Main entry point to execute a job based on its type

###### Parameters

###### jobType

`string`

###### parameters

`any`

###### Returns

`Promise`&lt;[`JobResult`](#jobresult)&gt;

## Type Aliases

### ExecutorOptions

> **ExecutorOptions** = `object`

Defined in: [src/services/job-executor.service.ts:29](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/services/job-executor.service.ts#L29)

#### Properties

##### onSqlRuntime()?

> `optional` **onSqlRuntime**: (`metadata`) => `Promise`&lt;`void`&gt; &#124; `void`

Defined in: [src/services/job-executor.service.ts:30](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/services/job-executor.service.ts#L30)

###### Parameters

###### metadata

[`SqlRuntimeMetadata`](#sqlruntimemetadata)

###### Returns

`Promise`&lt;`void`&gt; &#124; `void`

***

### JobResult

> **JobResult** = `object`

Defined in: [src/services/job-executor.service.ts:16](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/services/job-executor.service.ts#L16)

#### Properties

##### error?

> `optional` **error**: `string`

Defined in: [src/services/job-executor.service.ts:19](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/services/job-executor.service.ts#L19)

##### executionTimeMs

> **executionTimeMs**: `number`

Defined in: [src/services/job-executor.service.ts:20](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/services/job-executor.service.ts#L20)

##### result?

> `optional` **result**: `any`

Defined in: [src/services/job-executor.service.ts:18](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/services/job-executor.service.ts#L18)

##### success

> **success**: `boolean`

Defined in: [src/services/job-executor.service.ts:17](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/services/job-executor.service.ts#L17)

***

### SqlRuntimeMetadata

> **SqlRuntimeMetadata** = `object`

Defined in: [src/services/job-executor.service.ts:23](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/services/job-executor.service.ts#L23)

#### Properties

##### dbBackendPid

> **dbBackendPid**: `number`

Defined in: [src/services/job-executor.service.ts:24](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/services/job-executor.service.ts#L24)

##### dbName

> **dbName**: `string`

Defined in: [src/services/job-executor.service.ts:25](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/services/job-executor.service.ts#L25)

##### dbSessionStart?

> `optional` **dbSessionStart**: `string`

Defined in: [src/services/job-executor.service.ts:26](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/services/job-executor.service.ts#L26)
