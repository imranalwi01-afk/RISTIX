[**Frontend API Reference v1.0.0**](../../../README.md)

***

# Function: canUserApprove()

> **canUserApprove**(`userMaxHierarchyLevel`, `requiredMinHierarchyLevel`): `boolean`

Defined in: [utils/approval.ts:23](https://github.com/ifrspro/ifrs9-iaf/blob/5a4b2221d62f9d823811e12bfc71b7ff82ae62fa/packages/frontend/src/utils/approval.ts#L23)

Check if user can approve based on their highest hierarchy level

## Parameters

### userMaxHierarchyLevel

`number`

Highest hierarchy level among user's roles

### requiredMinHierarchyLevel

Minimum level required to approve

`number` | `null`

## Returns

`boolean`

true if user meets or exceeds the required level
