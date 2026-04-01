[**Frontend API Reference v1.0.0**](index.md)

***

# hooks/useApprovalStatus

## Interfaces

### ApprovalRequest

Defined in: [hooks/useApprovalStatus.ts:5](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/frontend/src/hooks/useApprovalStatus.ts#L5)

#### Properties

##### createdAt

> **createdAt**: `string`

Defined in: [hooks/useApprovalStatus.ts:11](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/frontend/src/hooks/useApprovalStatus.ts#L11)

##### entityId?

> `optional` **entityId**: `string`

Defined in: [hooks/useApprovalStatus.ts:8](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/frontend/src/hooks/useApprovalStatus.ts#L8)

##### entityType

> **entityType**: `string`

Defined in: [hooks/useApprovalStatus.ts:7](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/frontend/src/hooks/useApprovalStatus.ts#L7)

##### id

> **id**: `string`

Defined in: [hooks/useApprovalStatus.ts:6](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/frontend/src/hooks/useApprovalStatus.ts#L6)

##### requestData

> **requestData**: `any`

Defined in: [hooks/useApprovalStatus.ts:10](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/frontend/src/hooks/useApprovalStatus.ts#L10)

##### status

> **status**: `"pending"` \| `"rejected"` \| `"approved"`

Defined in: [hooks/useApprovalStatus.ts:9](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/frontend/src/hooks/useApprovalStatus.ts#L9)

##### updatedAt

> **updatedAt**: `string`

Defined in: [hooks/useApprovalStatus.ts:12](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/frontend/src/hooks/useApprovalStatus.ts#L12)

## Functions

### useApprovalStatus()

> **useApprovalStatus**(`entityType`, `entityId?`): `object`

Defined in: [hooks/useApprovalStatus.ts:15](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/frontend/src/hooks/useApprovalStatus.ts#L15)

#### Parameters

##### entityType

`string`

##### entityId?

`string`

#### Returns

`object`

##### hasPending

> **hasPending**: `boolean`

##### loading

> **loading**: `boolean`

##### pendingRequest

> **pendingRequest**: [`ApprovalRequest`](#approvalrequest) \| `null`

##### refresh()

> **refresh**: () => `Promise`\<`void`\> = `checkApprovalStatus`

###### Returns

`Promise`\<`void`\>
