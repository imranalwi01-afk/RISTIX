[**Backend API Reference v1.0.0**](../../../README.md)

***

# Function: canProcessApproval()

> **canProcessApproval**(`request`): `object`

Defined in: [src/lib/approval-helpers.ts:255](https://github.com/ifrspro/ifrs9-iaf/blob/cf4905123c7eb3e9046f36ce3f92dd13536ac238/packages/new-backend/src/lib/approval-helpers.ts#L255)

Check if approval can be processed

## Parameters

### request

#### approvalsReceived

`number`

#### approvalsRequired

`number`

#### completedAt

`Date` \| `null`

#### completedBy

`string` \| `null`

#### createdAt

`Date`

#### currentLevel

`number`

#### description

`string` \| `null`

#### entityId

`string` \| `null`

#### entityType

`string`

#### expiresAt

`Date` \| `null`

#### id

`string`

#### impactLevel

`string` \| `null`

#### matrixId

`string` \| `null`

#### requestData

`Record`\<`string`, `unknown`\> \| `null`

#### requestedBy

`string`

#### status

`string`

#### tenantId

`string`

#### title

`string`

## Returns

`object`

### canProcess

> **canProcess**: `boolean`

### reason?

> `optional` **reason**: `string`
