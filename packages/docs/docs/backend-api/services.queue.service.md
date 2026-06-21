[**Backend API Reference v1.0.0**](index.md)

***

# services/queue.service

## Variables

### jobsQueue

> `const` **jobsQueue**: `Queue`{`<`}`any`, `any`, `string`, `any`, `any`, `string`{`>`}

Defined in: [src/services/queue.service.ts:19](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/services/queue.service.ts#L19)

***

### jobsQueueRef

> `const` **jobsQueueRef**: `Queue`{`<`}`any`, `any`, `string`, `any`, `any`, `string`{`>`} = `jobsQueue`

Defined in: [src/services/queue.service.ts:23](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/services/queue.service.ts#L23)

***

### jobsWorker

> `const` **jobsWorker**: `Worker`{`<`}`any`, [`JobResult`](services.job-executor.service.md#jobresult), `string`{`>`}

Defined in: [src/services/queue.service.ts:171](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/services/queue.service.ts#L171)

## Functions

### addJob()

> **addJob**(`name`, `data`, `opts?`): `Promise`{`<`}`Job`{`<`}`any`, `any`, `string`{`>`}{`>`}

Defined in: [src/services/queue.service.ts:242](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/services/queue.service.ts#L242)

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

`Promise`{`<`}`Job`{`<`}`any`, `any`, `string`{`>`}{`>`}

A Promise resolving to the added job

***

### getJob()

> **getJob**(`jobId`): `Promise`{`<`}`Job`{`<`}`any`, `any`, `string`{`>`} {`|`} `undefined`{`>`}

Defined in: [src/services/queue.service.ts:253](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/services/queue.service.ts#L253)

Get a job by ID.

#### Parameters

##### jobId

`string`

The job ID

#### Returns

`Promise`{`<`}`Job`{`<`}`any`, `any`, `string`{`>`} {`|`} `undefined`{`>`}

A Promise resolving to the job or undefined
