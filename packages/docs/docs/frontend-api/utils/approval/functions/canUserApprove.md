[**Frontend API Reference v1.0.0**](../../../README.md)

***

# Function: canUserApprove()

> **canUserApprove**(`userMaxHierarchyLevel`, `requiredMinHierarchyLevel`): `boolean`

Defined in: [utils/approval.ts:23](https://github.com/ifrspro/ifrs9-iaf/blob/2301badfc5ea65510b50f0438f532e45a5ab486b/packages/frontend/src/utils/approval.ts#L23)

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
