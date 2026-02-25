[**Frontend API Reference v1.0.0**](../../../README.md)

***

# Function: checkApprovalEligibility()

> **checkApprovalEligibility**(`userRoles`, `approval`): `object`

Defined in: [utils/approval.ts:49](https://github.com/ifrspro/ifrs9-iaf/blob/5a4b2221d62f9d823811e12bfc71b7ff82ae62fa/packages/frontend/src/utils/approval.ts#L49)

Check if user has sufficient privileges for a permission

## Parameters

### userRoles

[`UserRoleInfo`](../interfaces/UserRoleInfo.md)[]

User's current roles

### approval

[`ApprovalMetadata`](../interfaces/ApprovalMetadata.md)

Permission's approval requirements

## Returns

`object`

Object with eligibility status and reason

### canApprove

> **canApprove**: `boolean`

### maxLevel

> **maxLevel**: `number`

### reason

> **reason**: `string`

### requiredLevel

> **requiredLevel**: `number` \| `null`
