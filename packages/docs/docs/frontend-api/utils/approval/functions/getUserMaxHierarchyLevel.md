[**Frontend API Reference v1.0.0**](../../../README.md)

***

# Function: getUserMaxHierarchyLevel()

> **getUserMaxHierarchyLevel**(`roles`): `number`

Defined in: [utils/approval.ts:38](https://github.com/ifrspro/ifrs9-iaf/blob/5a4b2221d62f9d823811e12bfc71b7ff82ae62fa/packages/frontend/src/utils/approval.ts#L38)

Get the highest hierarchy level from user's roles

## Parameters

### roles

[`UserRoleInfo`](../interfaces/UserRoleInfo.md)[]

Array of user's role assignments

## Returns

`number`

Maximum hierarchy level, or 1 if no roles
