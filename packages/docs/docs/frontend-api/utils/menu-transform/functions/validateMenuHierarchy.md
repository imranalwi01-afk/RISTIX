[**Frontend API Reference v1.0.0**](../../../README.md)

***

# Function: validateMenuHierarchy()

> **validateMenuHierarchy**(`menuTree`): `object`

Defined in: [utils/menu-transform.ts:484](https://github.com/ifrspro/ifrs9-iaf/blob/2301badfc5ea65510b50f0438f532e45a5ab486b/packages/frontend/src/utils/menu-transform.ts#L484)

Validate menu hierarchy structure

## Parameters

### menuTree

[`ExtendedMenuItem`](../interfaces/ExtendedMenuItem.md)[]

## Returns

`object`

### issues

> **issues**: `string`[]

### isValid

> **isValid**: `boolean`

### statistics

> **statistics**: `object`

#### statistics.emptyParents

> **emptyParents**: `number`

#### statistics.maxDepth

> **maxDepth**: `number`

#### statistics.orphanedItems

> **orphanedItems**: `number`

#### statistics.totalItems

> **totalItems**: `number`
