[**Backend API Reference v1.0.0**](../../../README.md)

***

# Function: addJob()

> **addJob**(`name`, `data`, `opts?`): `Promise`\<`Job`\<`any`, `any`, `string`\>\>

Defined in: [src/services/queue.service.ts:246](https://github.com/ifrspro/ifrs9-iaf/blob/cf4905123c7eb3e9046f36ce3f92dd13536ac238/packages/new-backend/src/services/queue.service.ts#L246)

Add a job to the queue.

## Parameters

### name

`string`

The job name

### data

`any`

The job data

### opts?

`any`

BullMQ job options

## Returns

`Promise`\<`Job`\<`any`, `any`, `string`\>\>

A Promise resolving to the added job
