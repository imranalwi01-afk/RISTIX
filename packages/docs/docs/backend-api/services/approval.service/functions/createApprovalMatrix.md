[**Backend API Reference v1.0.0**](../../../README.md)

***

# Function: createApprovalMatrix()

> **createApprovalMatrix**(`data`, `levels`): `Effect`\<`any`, [`DatabaseError`](../../../lib/errors/classes/DatabaseError.md)\>

Defined in: [src/services/approval.service.ts:129](https://github.com/ifrspro/ifrs9-iaf/blob/5a4b2221d62f9d823811e12bfc71b7ff82ae62fa/packages/new-backend/src/services/approval.service.ts#L129)

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

`Omit`\<\{ `canDelegate?`: `boolean` \| `null`; `conditions?`: `Record`\<`string`, `unknown`\> \| `null`; `createdAt?`: `Date`; `description?`: `string` \| `null`; `id?`: `string`; `level`: `number`; `matrixId`: `string`; `maxAmount?`: `number` \| `null`; `name`: `string`; `permissionMatchMode?`: `string`; `requiredCount?`: `number`; `requiredPermissionCodes?`: `string`[]; `requiredRoleCodes?`: `string`[]; `roleMatchMode?`: `string`; `timeoutHours?`: `number` \| `null`; \}, `"matrixId"`\>[]

The levels data

## Returns

`Effect`\<`any`, [`DatabaseError`](../../../lib/errors/classes/DatabaseError.md)\>

An Effect resolving to the created matrix
