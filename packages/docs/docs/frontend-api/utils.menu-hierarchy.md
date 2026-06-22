[**Frontend API Reference v1.0.0**](index.md)

***

# utils/menu-hierarchy

## Interfaces

### HierarchicalMenuItem

Defined in: [utils/menu-hierarchy.ts:38](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/frontend/src/utils/menu-hierarchy.ts#L38)

#### Properties

##### active

> **active**: `boolean`

Defined in: [utils/menu-hierarchy.ts:51](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/frontend/src/utils/menu-hierarchy.ts#L51)

##### banking\_modes

> **banking\_modes**: `string`[]

Defined in: [utils/menu-hierarchy.ts:55](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/frontend/src/utils/menu-hierarchy.ts#L55)

##### banking\_types?

> `optional` **banking\_types**: `string`[]

Defined in: [utils/menu-hierarchy.ts:56](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/frontend/src/utils/menu-hierarchy.ts#L56)

##### children?

> `optional` **children**: [`HierarchicalMenuItem`](#hierarchicalmenuitem)[]

Defined in: [utils/menu-hierarchy.ts:48](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/frontend/src/utils/menu-hierarchy.ts#L48)

##### description?

> `optional` **description**: `string`

Defined in: [utils/menu-hierarchy.ts:42](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/frontend/src/utils/menu-hierarchy.ts#L42)

##### expanded

> **expanded**: `boolean`

Defined in: [utils/menu-hierarchy.ts:50](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/frontend/src/utils/menu-hierarchy.ts#L50)

##### icon

> **icon**: `string`

Defined in: [utils/menu-hierarchy.ts:43](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/frontend/src/utils/menu-hierarchy.ts#L43)

##### id

> **id**: `string`

Defined in: [utils/menu-hierarchy.ts:39](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/frontend/src/utils/menu-hierarchy.ts#L39)

##### key

> **key**: `string`

Defined in: [utils/menu-hierarchy.ts:40](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/frontend/src/utils/menu-hierarchy.ts#L40)

##### level

> **level**: `number`

Defined in: [utils/menu-hierarchy.ts:49](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/frontend/src/utils/menu-hierarchy.ts#L49)

##### metadata?

> `optional` **metadata**: `Record`&lt;`string`, `any`&gt;

Defined in: [utils/menu-hierarchy.ts:59](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/frontend/src/utils/menu-hierarchy.ts#L59)

##### parent\_id

> **parent\_id**: `string` &#124; `null`

Defined in: [utils/menu-hierarchy.ts:47](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/frontend/src/utils/menu-hierarchy.ts#L47)

##### permissions

> **permissions**: `string`[]

Defined in: [utils/menu-hierarchy.ts:53](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/frontend/src/utils/menu-hierarchy.ts#L53)

##### requiredPermissions?

> `optional` **requiredPermissions**: `string`[]

Defined in: [utils/menu-hierarchy.ts:54](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/frontend/src/utils/menu-hierarchy.ts#L54)

##### sort\_order

> **sort\_order**: `number`

Defined in: [utils/menu-hierarchy.ts:46](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/frontend/src/utils/menu-hierarchy.ts#L46)

##### tenant\_types

> **tenant\_types**: `string`[]

Defined in: [utils/menu-hierarchy.ts:58](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/frontend/src/utils/menu-hierarchy.ts#L58)

##### title

> **title**: `string`

Defined in: [utils/menu-hierarchy.ts:41](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/frontend/src/utils/menu-hierarchy.ts#L41)

##### type

> **type**: `"group"` &#124; `"item"`

Defined in: [utils/menu-hierarchy.ts:45](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/frontend/src/utils/menu-hierarchy.ts#L45)

##### url

> **url**: `string` &#124; `null`

Defined in: [utils/menu-hierarchy.ts:44](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/frontend/src/utils/menu-hierarchy.ts#L44)

##### user\_types

> **user\_types**: `string`[]

Defined in: [utils/menu-hierarchy.ts:57](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/frontend/src/utils/menu-hierarchy.ts#L57)

##### visible

> **visible**: `boolean`

Defined in: [utils/menu-hierarchy.ts:52](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/frontend/src/utils/menu-hierarchy.ts#L52)

## Functions

### filterHierarchicalMenu()

> **filterHierarchicalMenu**(`hierarchicalItems`, `bankingMode`, `userPermissions?`): [`HierarchicalMenuItem`](#hierarchicalmenuitem)[]

Defined in: [utils/menu-hierarchy.ts:251](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/frontend/src/utils/menu-hierarchy.ts#L251)

#### Parameters

##### hierarchicalItems

[`HierarchicalMenuItem`](#hierarchicalmenuitem)[]

##### bankingMode

`"conventional"` | `"dual"`

##### userPermissions?

`string`[]

#### Returns

[`HierarchicalMenuItem`](#hierarchicalmenuitem)[]

***

### findMenuItemByPath()

> **findMenuItemByPath**(`hierarchicalItems`, `pathname`): [`HierarchicalMenuItem`](#hierarchicalmenuitem) &#124; `null`

Defined in: [utils/menu-hierarchy.ts:200](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/frontend/src/utils/menu-hierarchy.ts#L200)

#### Parameters

##### hierarchicalItems

[`HierarchicalMenuItem`](#hierarchicalmenuitem)[]

##### pathname

`string`

#### Returns

[`HierarchicalMenuItem`](#hierarchicalmenuitem) &#124; `null`

***

### generateBreadcrumb()

> **generateBreadcrumb**(`hierarchicalItems`, `currentPath`): `object`[]

Defined in: [utils/menu-hierarchy.ts:419](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/frontend/src/utils/menu-hierarchy.ts#L419)

#### Parameters

##### hierarchicalItems

[`HierarchicalMenuItem`](#hierarchicalmenuitem)[]

##### currentPath

`string`

#### Returns

`object`[]

***

### getExpandableMenuItems()

> **getExpandableMenuItems**(`hierarchicalItems`): `string`[]

Defined in: [utils/menu-hierarchy.ts:335](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/frontend/src/utils/menu-hierarchy.ts#L335)

#### Parameters

##### hierarchicalItems

[`HierarchicalMenuItem`](#hierarchicalmenuitem)[]

#### Returns

`string`[]

***

### getParentIds()

> **getParentIds**(`hierarchicalItems`, `itemId`): `string`[]

Defined in: [utils/menu-hierarchy.ts:224](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/frontend/src/utils/menu-hierarchy.ts#L224)

#### Parameters

##### hierarchicalItems

[`HierarchicalMenuItem`](#hierarchicalmenuitem)[]

##### itemId

`string`

#### Returns

`string`[]

***

### transformFlatToHierarchical()

> **transformFlatToHierarchical**(`items`): [`HierarchicalMenuItem`](#hierarchicalmenuitem)[]

Defined in: [utils/menu-hierarchy.ts:63](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/frontend/src/utils/menu-hierarchy.ts#L63)

#### Parameters

##### items

`any`[]

#### Returns

[`HierarchicalMenuItem`](#hierarchicalmenuitem)[]

***

### validateMenuHierarchy()

> **validateMenuHierarchy**(`hierarchicalItems`): `object`

Defined in: [utils/menu-hierarchy.ts:354](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/frontend/src/utils/menu-hierarchy.ts#L354)

#### Parameters

##### hierarchicalItems

[`HierarchicalMenuItem`](#hierarchicalmenuitem)[]

#### Returns

`object`

##### issues

> **issues**: `string`[]

##### isValid

> **isValid**: `boolean`

##### stats

> **stats**: `object`

###### stats.groups

> **groups**: `number`

###### stats.items

> **items**: `number`

###### stats.maxDepth

> **maxDepth**: `number`

###### stats.totalItems

> **totalItems**: `number`
