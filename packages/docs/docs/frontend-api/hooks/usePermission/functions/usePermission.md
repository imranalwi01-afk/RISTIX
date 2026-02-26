[**Frontend API Reference v1.0.0**](../../../README.md)

***

# Function: usePermission()

> **usePermission**(): `object`

Defined in: [hooks/usePermission.ts:47](https://github.com/ifrspro/ifrs9-iaf/blob/5a4b2221d62f9d823811e12bfc71b7ff82ae62fa/packages/frontend/src/hooks/usePermission.ts#L47)

## Returns

`object`

### can()

> **can**: (`action`, `resource`, `match`) => `boolean`

#### Parameters

##### action

`ActionOrResource`

##### resource

`ActionOrResource`

##### match?

`MatchMode` = `'any'`

#### Returns

`boolean`

### hasAllPermissions()

> **hasAllPermissions**: (`codes`) => `boolean`

#### Parameters

##### codes

`string`[]

#### Returns

`boolean`

### hasAnyPermission()

> **hasAnyPermission**: (`codes`) => `boolean`

#### Parameters

##### codes

`string`[]

#### Returns

`boolean`

### hasPermission()

> **hasPermission**: (`code`) => `boolean`

#### Parameters

##### code

`string`

#### Returns

`boolean`

### isSuperAdmin

> **isSuperAdmin**: `boolean`

### permissions

> **permissions**: `string`[]
