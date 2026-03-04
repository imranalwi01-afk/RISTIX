[**Frontend API Reference v1.0.0**](../../../README.md)

***

# Function: useApprovalStatus()

> **useApprovalStatus**(`entityType`, `entityId?`): `object`

Defined in: [hooks/useApprovalStatus.ts:15](https://github.com/ifrspro/ifrs9-iaf/blob/2301badfc5ea65510b50f0438f532e45a5ab486b/packages/frontend/src/hooks/useApprovalStatus.ts#L15)

## Parameters

### entityType

`string`

### entityId?

`string`

## Returns

`object`

### hasPending

> **hasPending**: `boolean`

### loading

> **loading**: `boolean`

### pendingRequest

> **pendingRequest**: [`ApprovalRequest`](../interfaces/ApprovalRequest.md) \| `null`

### refresh()

> **refresh**: () => `Promise`\<`void`\> = `checkApprovalStatus`

#### Returns

`Promise`\<`void`\>
