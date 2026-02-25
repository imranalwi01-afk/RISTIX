[**Backend API Reference v1.0.0**](../../../README.md)

***

# Class: JobExecutorService\<TSchema\>

Defined in: [src/services/job-executor.service.ts:29](https://github.com/ifrspro/ifrs9-iaf/blob/5a4b2221d62f9d823811e12bfc71b7ff82ae62fa/packages/new-backend/src/services/job-executor.service.ts#L29)

## Type Parameters

### TSchema

`TSchema` *extends* `Record`\<`string`, `unknown`\> = *typeof* [`db/schema`](../../../db/schema/README.md)

## Constructors

### Constructor

> **new JobExecutorService**\<`TSchema`\>(`db`, `options`): `JobExecutorService`\<`TSchema`\>

Defined in: [src/services/job-executor.service.ts:30](https://github.com/ifrspro/ifrs9-iaf/blob/5a4b2221d62f9d823811e12bfc71b7ff82ae62fa/packages/new-backend/src/services/job-executor.service.ts#L30)

#### Parameters

##### db

`PostgresJsDatabase`\<`TSchema`\>

##### options

`ExecutorOptions` = `{}`

#### Returns

`JobExecutorService`\<`TSchema`\>

## Methods

### execute()

> **execute**(`jobType`, `parameters`): `Promise`\<[`JobResult`](../type-aliases/JobResult.md)\>

Defined in: [src/services/job-executor.service.ts:77](https://github.com/ifrspro/ifrs9-iaf/blob/5a4b2221d62f9d823811e12bfc71b7ff82ae62fa/packages/new-backend/src/services/job-executor.service.ts#L77)

Main entry point to execute a job based on its type

#### Parameters

##### jobType

`string`

##### parameters

`any`

#### Returns

`Promise`\<[`JobResult`](../type-aliases/JobResult.md)\>
