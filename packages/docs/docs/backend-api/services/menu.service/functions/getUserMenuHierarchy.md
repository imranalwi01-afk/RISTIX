[**Backend API Reference v1.0.0**](../../../README.md)

***

# Function: getUserMenuHierarchy()

> **getUserMenuHierarchy**(`userId`, `tenantId`, `userRoles`): `Effect`\<[`MenuHierarchyItem`](../interfaces/MenuHierarchyItem.md)[], [`DatabaseError`](../../../lib/errors/classes/DatabaseError.md)\>

Defined in: [packages/new-backend/src/services/menu.service.ts:44](https://github.com/ifrspro/ifrs9-iaf/blob/2c233b31171a451bb86daacd4389a961f1213deb/packages/new-backend/src/services/menu.service.ts#L44)

Generate a hierarchical menu structure for a user.

The hierarchy is constructed by:
1. Identifying roles assigned to the user within the tenant.
2. Fetching menu items that these roles have permission to view.
3. Building a tree structure based on parent-child relationships.

## Parameters

### userId

`string`

The unique identifier of the user

### tenantId

`string`

The unique identifier of the tenant

### userRoles

`string`[]

Array of role names assigned to the user

## Returns

`Effect`\<[`MenuHierarchyItem`](../interfaces/MenuHierarchyItem.md)[], [`DatabaseError`](../../../lib/errors/classes/DatabaseError.md)\>

An Effect that succeeds with the hierarchical menu tree
