[**Backend API Reference v1.0.0**](../../../README.md)

***

# Function: getRequiredApprovalLevel()

> **getRequiredApprovalLevel**(`matrix`, `impactLevel?`): `number`

Defined in: [src/lib/approval-helpers.ts:371](https://github.com/ifrspro/ifrs9-iaf/blob/cf4905123c7eb3e9046f36ce3f92dd13536ac238/packages/new-backend/src/lib/approval-helpers.ts#L371)

Get required approval level for operation

## Parameters

### matrix

\{ `amountThresholds`: \{ `critical?`: `number`; `high?`: `number`; `low?`: `number`; `medium?`: `number`; \} \| `null`; `autoApprovalRules`: `unknown`; `bankingMode`: `string` \| `null`; `createdAt`: `Date`; `description`: `string` \| `null`; `entityType`: `string`; `escalationRules`: `unknown`; `id`: `string`; `isActive`: `boolean`; `name`: `string`; `operationType`: `string` \| `null`; `riskThresholds`: \{ `high?`: `number`; `low?`: `number`; `medium?`: `number`; \} \| `null`; `syariahBoardRequired`: `boolean` \| `null`; `tenantId`: `string` \| `null`; `updatedAt`: `Date`; \} | `null` | `undefined`

### impactLevel?

`string`

## Returns

`number`
