[**Backend API Reference v1.0.0**](../../../README.md)

***

# Function: shouldAutoApprove()

> **shouldAutoApprove**(`matrix`, `userPermissions`, `entityType`, `operation`, `impactLevel?`): `boolean`

Defined in: [src/lib/approval-helpers.ts:283](https://github.com/ifrspro/ifrs9-iaf/blob/5a4b2221d62f9d823811e12bfc71b7ff82ae62fa/packages/new-backend/src/lib/approval-helpers.ts#L283)

Determine if auto-approval should apply based on matrix rules

## Parameters

### matrix

\{ `amountThresholds`: \{ `critical?`: `number`; `high?`: `number`; `low?`: `number`; `medium?`: `number`; \} \| `null`; `autoApprovalRules`: `unknown`; `bankingMode`: `string` \| `null`; `createdAt`: `Date`; `description`: `string` \| `null`; `entityType`: `string`; `escalationRules`: `unknown`; `id`: `string`; `isActive`: `boolean`; `name`: `string`; `operationType`: `string` \| `null`; `riskThresholds`: \{ `high?`: `number`; `low?`: `number`; `medium?`: `number`; \} \| `null`; `syariahBoardRequired`: `boolean` \| `null`; `tenantId`: `string` \| `null`; `updatedAt`: `Date`; \} | `null` | `undefined`

### userPermissions

`string`[]

### entityType

`string`

### operation

`"update"` | `"delete"` | `"create"`

### impactLevel?

`string`

## Returns

`boolean`
