[**Backend API Reference v1.0.0**](../../../README.md)

***

# Function: addJob()

> **addJob**(`name`, `data`, `opts?`): `Promise`\<`any`\>

Defined in: [packages/new-backend/src/services/queue.service.ts:103](https://github.com/ifrspro/ifrs9-iaf/blob/2c233b31171a451bb86daacd4389a961f1213deb/packages/new-backend/src/services/queue.service.ts#L103)

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

`Promise`\<`any`\>

A Promise resolving to the added job
