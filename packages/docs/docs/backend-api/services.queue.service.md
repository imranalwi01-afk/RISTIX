[**Backend API Reference v1.0.0**](index.md)

***

# services/queue.service

## Variables

### jobsQueue

> `const` **jobsQueue**: `Queue`&lt;`any`, `any`, `string`, `any`, `any`, `string`&gt;

Defined in: [src/services/queue.service.ts:19](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/new-backend/src/services/queue.service.ts#L19)

***

### jobsQueueRef

> `const` **jobsQueueRef**: `Queue`&lt;`any`, `any`, `string`, `any`, `any`, `string`&gt; = `jobsQueue`

Defined in: [src/services/queue.service.ts:23](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/new-backend/src/services/queue.service.ts#L23)

***

### jobsWorker

> `const` **jobsWorker**: `Worker`&lt;`any`, [`JobResult`](services.job-executor.service.md#jobresult), `string`&gt;

Defined in: [src/services/queue.service.ts:171](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/new-backend/src/services/queue.service.ts#L171)

## Functions

### addJob()

> **addJob**(`name`, `data`, `opts?`): `Promise`&lt;`Job`&lt;`any`, `any`, `string`&gt;&gt;

Defined in: [src/services/queue.service.ts:242](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/new-backend/src/services/queue.service.ts#L242)

Add a job to the queue.

#### Parameters

##### name

`string`

The job name

##### data

`any`

The job data

##### opts?

`any`

BullMQ job options

#### Returns

`Promise`&lt;`Job`&lt;`any`, `any`, `string`&gt;&gt;

A Promise resolving to the added job

***

### getJob()

> **getJob**(`jobId`): `Promise`&lt;`Job`&lt;`any`, `any`, `string`&gt; &#124; `undefined`&gt;

Defined in: [src/services/queue.service.ts:253](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/new-backend/src/services/queue.service.ts#L253)

Get a job by ID.

#### Parameters

##### jobId

`string`

The job ID

#### Returns

`Promise`&lt;`Job`&lt;`any`, `any`, `string`&gt; &#124; `undefined`&gt;

A Promise resolving to the job or undefined
