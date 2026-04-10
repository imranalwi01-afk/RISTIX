[**Frontend API Reference v1.0.0**](index.md)

***

# hooks/usePermission

## Type Aliases

### ActionOrResource

> **ActionOrResource** = `string` \| `string`[]

Defined in: [hooks/usePermission.ts:17](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/frontend/src/hooks/usePermission.ts#L17)

***

### MatchMode

> **MatchMode** = `"any"` \| `"all"`

Defined in: [hooks/usePermission.ts:18](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/frontend/src/hooks/usePermission.ts#L18)

## Functions

### usePermission()

> **usePermission**(): `object`

Defined in: [hooks/usePermission.ts:52](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/frontend/src/hooks/usePermission.ts#L52)

#### Returns

`object`

##### can()

> **can**: (`action`, `resource`, `match`) => `boolean`

###### Parameters

###### action

[`ActionOrResource`](#actionorresource)

###### resource

[`ActionOrResource`](#actionorresource)

###### match?

[`MatchMode`](#matchmode) = `'any'`

###### Returns

`boolean`

##### hasAllPermissions()

> **hasAllPermissions**: (`codes`) => `boolean`

###### Parameters

###### codes

`string`[]

###### Returns

`boolean`

##### hasAnyPermission()

> **hasAnyPermission**: (`codes`) => `boolean`

###### Parameters

###### codes

`string`[]

###### Returns

`boolean`

##### hasPermission()

> **hasPermission**: (`code`) => `boolean`

###### Parameters

###### code

`string`

###### Returns

`boolean`

##### isSuperAdmin

> **isSuperAdmin**: `boolean`

##### permissions

> **permissions**: `string`[]
