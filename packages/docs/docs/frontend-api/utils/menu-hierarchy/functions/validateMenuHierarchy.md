[**Frontend API Reference v1.0.0**](../../../README.md)

***

# Function: validateMenuHierarchy()

> **validateMenuHierarchy**(`hierarchicalItems`): `object`

Defined in: [utils/menu-hierarchy.ts:366](https://github.com/ifrspro/ifrs9-iaf/blob/5a4b2221d62f9d823811e12bfc71b7ff82ae62fa/packages/frontend/src/utils/menu-hierarchy.ts#L366)

## Parameters

### hierarchicalItems

[`HierarchicalMenuItem`](../interfaces/HierarchicalMenuItem.md)[]

## Returns

`object`

### issues

> **issues**: `string`[]

### isValid

> **isValid**: `boolean`

### stats

> **stats**: `object`

#### stats.groups

> **groups**: `number`

#### stats.items

> **items**: `number`

#### stats.maxDepth

> **maxDepth**: `number`

#### stats.totalItems

> **totalItems**: `number`
