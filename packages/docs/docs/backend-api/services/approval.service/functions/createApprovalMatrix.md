[**Backend API Reference v1.0.0**](../../../README.md)

***

# Function: createApprovalMatrix()

> **createApprovalMatrix**(`data`, `levels`): `Effect`\<`any`, [`DatabaseError`](../../../lib/errors/classes/DatabaseError.md)\>

Defined in: [packages/new-backend/src/services/approval.service.ts:87](https://github.com/ifrspro/ifrs9-iaf/blob/2c233b31171a451bb86daacd4389a961f1213deb/packages/new-backend/src/services/approval.service.ts#L87)

Create an approval matrix.

## Parameters

### data

The matrix data

#### amountThresholds?

\{ `critical?`: `number`; `high?`: `number`; `low?`: `number`; `medium?`: `number`; \} \| `null`

#### autoApprovalRules?

`unknown`

#### bankingMode?

`string` \| `null`

#### createdAt?

`Date`

#### description?

`string` \| `null`

#### entityType

`string`

#### escalationRules?

`unknown`

#### id?

`string`

#### isActive?

`boolean`

#### name

`string`

#### operationType?

`string` \| `null`

#### riskThresholds?

\{ `high?`: `number`; `low?`: `number`; `medium?`: `number`; \} \| `null`

#### syariahBoardRequired?

`boolean` \| `null`

#### tenantId?

`string` \| `null`

#### updatedAt?

`Date`

### levels

`Omit`\<\{ `canDelegate?`: `boolean` \| `null`; `conditions?`: `Record`\<`string`, `unknown`\> \| `null`; `createdAt?`: `Date`; `description?`: `string` \| `null`; `id?`: `string`; `level`: `number`; `matrixId`: `string`; `maxAmount?`: `number` \| `null`; `name`: `string`; `requiredCount?`: `number`; `requiredRoles`: `string`[]; `timeoutHours?`: `number` \| `null`; \}, `"matrixId"`\>[]

The levels data

## Returns

`Effect`\<`any`, [`DatabaseError`](../../../lib/errors/classes/DatabaseError.md)\>

An Effect resolving to the created matrix
