[**Frontend API Reference v1.0.0**](index.md)

***

# utils/permission-evaluator

## Interfaces

### PermissionContext

Defined in: [utils/permission-evaluator.ts:1](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/frontend/src/utils/permission-evaluator.ts#L1)

#### Properties

##### isSuperAdmin

> **isSuperAdmin**: `boolean`

Defined in: [utils/permission-evaluator.ts:4](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/frontend/src/utils/permission-evaluator.ts#L4)

##### normalizedPermissionSet

> **normalizedPermissionSet**: `Set`&lt;`string`&gt;

Defined in: [utils/permission-evaluator.ts:3](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/frontend/src/utils/permission-evaluator.ts#L3)

##### rawPermissions

> **rawPermissions**: `string`[]

Defined in: [utils/permission-evaluator.ts:2](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/frontend/src/utils/permission-evaluator.ts#L2)

***

### PermissionEvaluation

Defined in: [utils/permission-evaluator.ts:7](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/frontend/src/utils/permission-evaluator.ts#L7)

#### Properties

##### allowed

> **allowed**: `boolean`

Defined in: [utils/permission-evaluator.ts:8](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/frontend/src/utils/permission-evaluator.ts#L8)

##### canonicalRequested

> **canonicalRequested**: `string`

Defined in: [utils/permission-evaluator.ts:10](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/frontend/src/utils/permission-evaluator.ts#L10)

##### matchedPermission?

> `optional` **matchedPermission**: `string`

Defined in: [utils/permission-evaluator.ts:12](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/frontend/src/utils/permission-evaluator.ts#L12)

##### reason

> **reason**: `string`

Defined in: [utils/permission-evaluator.ts:11](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/frontend/src/utils/permission-evaluator.ts#L11)

##### requested

> **requested**: `string`

Defined in: [utils/permission-evaluator.ts:9](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/frontend/src/utils/permission-evaluator.ts#L9)

## Functions

### buildPermissionContext()

> **buildPermissionContext**(`permissions`): [`PermissionContext`](#permissioncontext)

Defined in: [utils/permission-evaluator.ts:35](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/frontend/src/utils/permission-evaluator.ts#L35)

#### Parameters

##### permissions

`string`[]

#### Returns

[`PermissionContext`](#permissioncontext)

***

### checkAllPermissions()

> **checkAllPermissions**(`requestedPermissions`, `contextOrPermissions`): `boolean`

Defined in: [utils/permission-evaluator.ts:184](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/frontend/src/utils/permission-evaluator.ts#L184)

#### Parameters

##### requestedPermissions

`string`[]

##### contextOrPermissions

`string`[] | [`PermissionContext`](#permissioncontext)

#### Returns

`boolean`

***

### checkAnyPermission()

> **checkAnyPermission**(`requestedPermissions`, `contextOrPermissions`): `boolean`

Defined in: [utils/permission-evaluator.ts:179](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/frontend/src/utils/permission-evaluator.ts#L179)

#### Parameters

##### requestedPermissions

`string`[]

##### contextOrPermissions

`string`[] | [`PermissionContext`](#permissioncontext)

#### Returns

`boolean`

***

### checkPermission()

> **checkPermission**(`requestedPermission`, `contextOrPermissions`): `boolean`

Defined in: [utils/permission-evaluator.ts:174](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/frontend/src/utils/permission-evaluator.ts#L174)

#### Parameters

##### requestedPermission

`string`

##### contextOrPermissions

`string`[] | [`PermissionContext`](#permissioncontext)

#### Returns

`boolean`

***

### evaluatePermission()

> **evaluatePermission**(`requestedPermission`, `contextOrPermissions`): [`PermissionEvaluation`](#permissionevaluation)

Defined in: [utils/permission-evaluator.ts:56](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/frontend/src/utils/permission-evaluator.ts#L56)

#### Parameters

##### requestedPermission

`string`

##### contextOrPermissions

`string`[] | [`PermissionContext`](#permissioncontext)

#### Returns

[`PermissionEvaluation`](#permissionevaluation)

***

### normalizePermissionInput()

> **normalizePermissionInput**(`value`): `string`

Defined in: [utils/permission-evaluator.ts:32](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/frontend/src/utils/permission-evaluator.ts#L32)

#### Parameters

##### value

`string`

#### Returns

`string`
