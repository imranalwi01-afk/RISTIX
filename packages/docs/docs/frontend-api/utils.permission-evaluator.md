[**Frontend API Reference v1.0.0**](index.md)

***

# utils/permission-evaluator

## Interfaces

### PermissionContext

Defined in: [utils/permission-evaluator.ts:1](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/frontend/src/utils/permission-evaluator.ts#L1)

#### Properties

##### isSuperAdmin

> **isSuperAdmin**: `boolean`

Defined in: [utils/permission-evaluator.ts:4](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/frontend/src/utils/permission-evaluator.ts#L4)

##### normalizedPermissionSet

> **normalizedPermissionSet**: `Set`\<`string`\>

Defined in: [utils/permission-evaluator.ts:3](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/frontend/src/utils/permission-evaluator.ts#L3)

##### rawPermissions

> **rawPermissions**: `string`[]

Defined in: [utils/permission-evaluator.ts:2](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/frontend/src/utils/permission-evaluator.ts#L2)

***

### PermissionEvaluation

Defined in: [utils/permission-evaluator.ts:7](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/frontend/src/utils/permission-evaluator.ts#L7)

#### Properties

##### allowed

> **allowed**: `boolean`

Defined in: [utils/permission-evaluator.ts:8](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/frontend/src/utils/permission-evaluator.ts#L8)

##### canonicalRequested

> **canonicalRequested**: `string`

Defined in: [utils/permission-evaluator.ts:10](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/frontend/src/utils/permission-evaluator.ts#L10)

##### matchedPermission?

> `optional` **matchedPermission**: `string`

Defined in: [utils/permission-evaluator.ts:12](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/frontend/src/utils/permission-evaluator.ts#L12)

##### reason

> **reason**: `string`

Defined in: [utils/permission-evaluator.ts:11](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/frontend/src/utils/permission-evaluator.ts#L11)

##### requested

> **requested**: `string`

Defined in: [utils/permission-evaluator.ts:9](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/frontend/src/utils/permission-evaluator.ts#L9)

## Functions

### buildPermissionContext()

> **buildPermissionContext**(`permissions`): [`PermissionContext`](#permissioncontext)

Defined in: [utils/permission-evaluator.ts:57](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/frontend/src/utils/permission-evaluator.ts#L57)

#### Parameters

##### permissions

`string`[]

#### Returns

[`PermissionContext`](#permissioncontext)

***

### checkAllPermissions()

> **checkAllPermissions**(`requestedPermissions`, `contextOrPermissions`): `boolean`

Defined in: [utils/permission-evaluator.ts:207](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/frontend/src/utils/permission-evaluator.ts#L207)

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

Defined in: [utils/permission-evaluator.ts:202](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/frontend/src/utils/permission-evaluator.ts#L202)

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

Defined in: [utils/permission-evaluator.ts:197](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/frontend/src/utils/permission-evaluator.ts#L197)

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

Defined in: [utils/permission-evaluator.ts:79](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/frontend/src/utils/permission-evaluator.ts#L79)

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

Defined in: [utils/permission-evaluator.ts:46](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/frontend/src/utils/permission-evaluator.ts#L46)

#### Parameters

##### value

`string`

#### Returns

`string`

***

### toCanonicalPermission()

> **toCanonicalPermission**(`value`): `string`

Defined in: [utils/permission-evaluator.ts:52](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/frontend/src/utils/permission-evaluator.ts#L52)

#### Parameters

##### value

`string`

#### Returns

`string`
