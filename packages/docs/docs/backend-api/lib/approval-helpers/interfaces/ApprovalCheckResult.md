[**Backend API Reference v1.0.0**](../../../README.md)

***

# Interface: ApprovalCheckResult

Defined in: [src/lib/approval-helpers.ts:13](https://github.com/ifrspro/ifrs9-iaf/blob/5a4b2221d62f9d823811e12bfc71b7ff82ae62fa/packages/new-backend/src/lib/approval-helpers.ts#L13)

Approval Helper Utilities
Provides common functions for working with the approval workflow system

## Properties

### canSelfApprove

> **canSelfApprove**: `boolean`

Defined in: [src/lib/approval-helpers.ts:15](https://github.com/ifrspro/ifrs9-iaf/blob/5a4b2221d62f9d823811e12bfc71b7ff82ae62fa/packages/new-backend/src/lib/approval-helpers.ts#L15)

***

### matrix?

> `optional` **matrix**: `object`

Defined in: [src/lib/approval-helpers.ts:16](https://github.com/ifrspro/ifrs9-iaf/blob/5a4b2221d62f9d823811e12bfc71b7ff82ae62fa/packages/new-backend/src/lib/approval-helpers.ts#L16)

#### amountThresholds

> **amountThresholds**: \{ `critical?`: `number`; `high?`: `number`; `low?`: `number`; `medium?`: `number`; \} \| `null`

#### autoApprovalRules

> **autoApprovalRules**: `unknown`

#### bankingMode

> **bankingMode**: `string` \| `null`

#### createdAt

> **createdAt**: `Date`

#### description

> **description**: `string` \| `null`

#### entityType

> **entityType**: `string`

#### escalationRules

> **escalationRules**: `unknown`

#### id

> **id**: `string`

#### isActive

> **isActive**: `boolean`

#### name

> **name**: `string`

#### operationType

> **operationType**: `string` \| `null`

#### riskThresholds

> **riskThresholds**: \{ `high?`: `number`; `low?`: `number`; `medium?`: `number`; \} \| `null`

#### syariahBoardRequired

> **syariahBoardRequired**: `boolean` \| `null`

#### tenantId

> **tenantId**: `string` \| `null`

#### updatedAt

> **updatedAt**: `Date`

***

### reason?

> `optional` **reason**: `string`

Defined in: [src/lib/approval-helpers.ts:17](https://github.com/ifrspro/ifrs9-iaf/blob/5a4b2221d62f9d823811e12bfc71b7ff82ae62fa/packages/new-backend/src/lib/approval-helpers.ts#L17)

***

### requiresApproval

> **requiresApproval**: `boolean`

Defined in: [src/lib/approval-helpers.ts:14](https://github.com/ifrspro/ifrs9-iaf/blob/5a4b2221d62f9d823811e12bfc71b7ff82ae62fa/packages/new-backend/src/lib/approval-helpers.ts#L14)
