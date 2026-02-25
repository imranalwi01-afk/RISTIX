[**Backend API Reference v1.0.0**](../../../README.md)

***

# Function: getJob()

> **getJob**(`jobId`): `Promise`\<`Job`\<`any`, `any`, `string`\> \| `undefined`\>

Defined in: [src/services/queue.service.ts:257](https://github.com/ifrspro/ifrs9-iaf/blob/5a4b2221d62f9d823811e12bfc71b7ff82ae62fa/packages/new-backend/src/services/queue.service.ts#L257)

Get a job by ID.

## Parameters

### jobId

`string`

The job ID

## Returns

`Promise`\<`Job`\<`any`, `any`, `string`\> \| `undefined`\>

A Promise resolving to the job or undefined
