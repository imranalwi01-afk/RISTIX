[**Backend API Reference v1.0.0**](../../../README.md)

***

# Class: JobExecutorService

Defined in: packages/new-backend/src/services/job-executor.service.ts:18

## Constructors

### Constructor

> **new JobExecutorService**(`db`): `JobExecutorService`

Defined in: packages/new-backend/src/services/job-executor.service.ts:19

#### Parameters

##### db

`PostgresJsDatabase`\<[`db/schema`](../../../db/schema/README.md)\>

#### Returns

`JobExecutorService`

## Methods

### execute()

> **execute**(`jobType`, `parameters`): `Promise`\<[`JobResult`](../type-aliases/JobResult.md)\>

Defined in: packages/new-backend/src/services/job-executor.service.ts:24

Main entry point to execute a job based on its type

#### Parameters

##### jobType

`string`

##### parameters

`any`

#### Returns

`Promise`\<[`JobResult`](../type-aliases/JobResult.md)\>
