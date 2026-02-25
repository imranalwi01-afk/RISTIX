[**Frontend API Reference v1.0.0**](../../../README.md)

***

# Function: validateMenuHierarchy()

> **validateMenuHierarchy**(`menuTree`): `object`

Defined in: [utils/menu-transform.ts:484](https://github.com/ifrspro/ifrs9-iaf/blob/5a4b2221d62f9d823811e12bfc71b7ff82ae62fa/packages/frontend/src/utils/menu-transform.ts#L484)

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
