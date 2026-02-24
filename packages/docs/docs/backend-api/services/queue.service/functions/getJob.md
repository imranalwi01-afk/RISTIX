[**Backend API Reference v1.0.0**](../../../README.md)

***

# Function: getJob()

> **getJob**(`jobId`): `Promise`\<`Job`\<`any`, `any`, `string`\> \| `undefined`\>

Defined in: [src/services/queue.service.ts:257](https://github.com/ifrspro/ifrs9-iaf/blob/cf4905123c7eb3e9046f36ce3f92dd13536ac238/packages/new-backend/src/services/queue.service.ts#L257)

Get a job by ID.

## Parameters

### jobId

`string`

The job ID

## Returns

`Promise`\<`Job`\<`any`, `any`, `string`\> \| `undefined`\>

A Promise resolving to the job or undefined
