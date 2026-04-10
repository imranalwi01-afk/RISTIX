[**Frontend API Reference v1.0.0**](index.md)

***

# utils/menu-transform

## Interfaces

### ExtendedMenuItem

Defined in: [utils/menu-transform.ts:18](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/frontend/src/utils/menu-transform.ts#L18)

#### Extends

- [`MenuItem`](services.menu.service.md#menuitem)

#### Properties

##### badge?

> `optional` **badge**: `object`

Defined in: [services/menu.service.ts:26](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/frontend/src/services/menu.service.ts#L26)

###### color?

> `optional` **color**: `"error"` \| `"success"` \| `"primary"` \| `"secondary"` \| `"info"` \| `"warning"`

###### content?

> `optional` **content**: `string` \| `number`

###### Inherited from

[`MenuItem`](services.menu.service.md#menuitem).[`badge`](services.menu.service.md#badge-1)

##### banking\_modes?

> `optional` **banking\_modes**: (`"conventional"` \| `"syariah"` \| `"dual"`)[]

Defined in: [services/menu.service.ts:24](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/frontend/src/services/menu.service.ts#L24)

###### Inherited from

[`MenuItem`](services.menu.service.md#menuitem).[`banking_modes`](services.menu.service.md#banking_modes-1)

##### children?

> `optional` **children**: [`ExtendedMenuItem`](#extendedmenuitem)[]

Defined in: [utils/menu-transform.ts:19](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/frontend/src/utils/menu-transform.ts#L19)

###### Overrides

[`MenuItem`](services.menu.service.md#menuitem).[`children`](services.menu.service.md#children)

##### code

> **code**: `string`

Defined in: [services/menu.service.ts:14](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/frontend/src/services/menu.service.ts#L14)

###### Inherited from

[`MenuItem`](services.menu.service.md#menuitem).[`code`](services.menu.service.md#code-1)

##### created\_at?

> `optional` **created\_at**: `string`

Defined in: [services/menu.service.ts:36](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/frontend/src/services/menu.service.ts#L36)

###### Inherited from

[`MenuItem`](services.menu.service.md#menuitem).[`created_at`](services.menu.service.md#created_at)

##### description?

> `optional` **description**: `string`

Defined in: [services/menu.service.ts:17](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/frontend/src/services/menu.service.ts#L17)

###### Inherited from

[`MenuItem`](services.menu.service.md#menuitem).[`description`](services.menu.service.md#description-1)

##### external\_url?

> `optional` **external\_url**: `string`

Defined in: [services/menu.service.ts:34](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/frontend/src/services/menu.service.ts#L34)

###### Inherited from

[`MenuItem`](services.menu.service.md#menuitem).[`external_url`](services.menu.service.md#external_url-1)

##### href?

> `optional` **href**: `string`

Defined in: [services/menu.service.ts:16](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/frontend/src/services/menu.service.ts#L16)

###### Inherited from

[`MenuItem`](services.menu.service.md#menuitem).[`href`](services.menu.service.md#href-1)

##### icon?

> `optional` **icon**: `string`

Defined in: [services/menu.service.ts:18](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/frontend/src/services/menu.service.ts#L18)

###### Inherited from

[`MenuItem`](services.menu.service.md#menuitem).[`icon`](services.menu.service.md#icon-1)

##### id

> **id**: `string`

Defined in: [services/menu.service.ts:13](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/frontend/src/services/menu.service.ts#L13)

###### Inherited from

[`MenuItem`](services.menu.service.md#menuitem).[`id`](services.menu.service.md#id)

##### is\_active

> **is\_active**: `boolean`

Defined in: [services/menu.service.ts:23](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/frontend/src/services/menu.service.ts#L23)

###### Inherited from

[`MenuItem`](services.menu.service.md#menuitem).[`is_active`](services.menu.service.md#is_active)

##### is\_new?

> `optional` **is\_new**: `boolean`

Defined in: [services/menu.service.ts:31](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/frontend/src/services/menu.service.ts#L31)

###### Inherited from

[`MenuItem`](services.menu.service.md#menuitem).[`is_new`](services.menu.service.md#is_new-1)

##### key

> **key**: `string`

Defined in: [utils/menu-transform.ts:20](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/frontend/src/utils/menu-transform.ts#L20)

##### label

> **label**: `string`

Defined in: [services/menu.service.ts:15](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/frontend/src/services/menu.service.ts#L15)

###### Inherited from

[`MenuItem`](services.menu.service.md#menuitem).[`label`](services.menu.service.md#label-1)

##### level

> **level**: `number`

Defined in: [services/menu.service.ts:21](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/frontend/src/services/menu.service.ts#L21)

###### Inherited from

[`MenuItem`](services.menu.service.md#menuitem).[`level`](services.menu.service.md#level)

##### parent\_id?

> `optional` **parent\_id**: `string`

Defined in: [services/menu.service.ts:19](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/frontend/src/services/menu.service.ts#L19)

###### Inherited from

[`MenuItem`](services.menu.service.md#menuitem).[`parent_id`](services.menu.service.md#parent_id-1)

##### path

> **path**: `string`

Defined in: [services/menu.service.ts:22](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/frontend/src/services/menu.service.ts#L22)

###### Inherited from

[`MenuItem`](services.menu.service.md#menuitem).[`path`](services.menu.service.md#path)

##### requires\_setup?

> `optional` **requires\_setup**: `boolean`

Defined in: [services/menu.service.ts:32](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/frontend/src/services/menu.service.ts#L32)

###### Inherited from

[`MenuItem`](services.menu.service.md#menuitem).[`requires_setup`](services.menu.service.md#requires_setup-1)

##### roles?

> `optional` **roles**: `string`[]

Defined in: [services/menu.service.ts:25](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/frontend/src/services/menu.service.ts#L25)

###### Inherited from

[`MenuItem`](services.menu.service.md#menuitem).[`roles`](services.menu.service.md#roles-1)

##### sort\_order

> **sort\_order**: `number`

Defined in: [services/menu.service.ts:20](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/frontend/src/services/menu.service.ts#L20)

###### Inherited from

[`MenuItem`](services.menu.service.md#menuitem).[`sort_order`](services.menu.service.md#sort_order)

##### status?

> `optional` **status**: `"error"` \| `"active"` \| `"disabled"` \| `"warning"`

Defined in: [services/menu.service.ts:30](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/frontend/src/services/menu.service.ts#L30)

###### Inherited from

[`MenuItem`](services.menu.service.md#menuitem).[`status`](services.menu.service.md#status-1)

##### target?

> `optional` **target**: `"_self"` \| `"_blank"`

Defined in: [services/menu.service.ts:33](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/frontend/src/services/menu.service.ts#L33)

###### Inherited from

[`MenuItem`](services.menu.service.md#menuitem).[`target`](services.menu.service.md#target-1)

##### updated\_at?

> `optional` **updated\_at**: `string`

Defined in: [services/menu.service.ts:37](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/frontend/src/services/menu.service.ts#L37)

###### Inherited from

[`MenuItem`](services.menu.service.md#menuitem).[`updated_at`](services.menu.service.md#updated_at)

***

### MenuCategory

Defined in: [utils/menu-transform.ts:24](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/frontend/src/utils/menu-transform.ts#L24)

#### Properties

##### children

> **children**: `string`[]

Defined in: [utils/menu-transform.ts:31](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/frontend/src/utils/menu-transform.ts#L31)

##### description

> **description**: `string`

Defined in: [utils/menu-transform.ts:28](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/frontend/src/utils/menu-transform.ts#L28)

##### icon

> **icon**: `string`

Defined in: [utils/menu-transform.ts:29](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/frontend/src/utils/menu-transform.ts#L29)

##### id

> **id**: `string`

Defined in: [utils/menu-transform.ts:25](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/frontend/src/utils/menu-transform.ts#L25)

##### key

> **key**: `string`

Defined in: [utils/menu-transform.ts:26](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/frontend/src/utils/menu-transform.ts#L26)

##### sort\_order

> **sort\_order**: `number`

Defined in: [utils/menu-transform.ts:30](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/frontend/src/utils/menu-transform.ts#L30)

##### title

> **title**: `string`

Defined in: [utils/menu-transform.ts:27](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/frontend/src/utils/menu-transform.ts#L27)

## Functions

### findMenuItemByKey()

> **findMenuItemByKey**(`menuTree`, `key`): [`ExtendedMenuItem`](#extendedmenuitem) \| `null`

Defined in: [utils/menu-transform.ts:452](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/frontend/src/utils/menu-transform.ts#L452)

Find menu item by key in hierarchical tree

#### Parameters

##### menuTree

[`ExtendedMenuItem`](#extendedmenuitem)[]

##### key

`string`

#### Returns

[`ExtendedMenuItem`](#extendedmenuitem) \| `null`

***

### findMenuItemByPath()

> **findMenuItemByPath**(`menuTree`, `path`): [`ExtendedMenuItem`](#extendedmenuitem) \| `null`

Defined in: [utils/menu-transform.ts:434](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/frontend/src/utils/menu-transform.ts#L434)

Find menu item by path in hierarchical tree

#### Parameters

##### menuTree

[`ExtendedMenuItem`](#extendedmenuitem)[]

##### path

`string`

#### Returns

[`ExtendedMenuItem`](#extendedmenuitem) \| `null`

***

### getExpandableMenuItems()

> **getExpandableMenuItems**(`menuTree`): `string`[]

Defined in: [utils/menu-transform.ts:470](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/frontend/src/utils/menu-transform.ts#L470)

Get all expandable parent menu items

#### Parameters

##### menuTree

[`ExtendedMenuItem`](#extendedmenuitem)[]

#### Returns

`string`[]

***

### getMenuBreadcrumb()

> **getMenuBreadcrumb**(`menuTree`, `currentPath`): [`ExtendedMenuItem`](#extendedmenuitem)[]

Defined in: [utils/menu-transform.ts:397](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/frontend/src/utils/menu-transform.ts#L397)

Get menu breadcrumb for navigation

#### Parameters

##### menuTree

[`ExtendedMenuItem`](#extendedmenuitem)[]

##### currentPath

`string`

#### Returns

[`ExtendedMenuItem`](#extendedmenuitem)[]

***

### transformFlatToHierarchical()

> **transformFlatToHierarchical**(`flatItems`): [`ExtendedMenuItem`](#extendedmenuitem)[]

Defined in: [utils/menu-transform.ts:242](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/frontend/src/utils/menu-transform.ts#L242)

Transform flat database menu items into hierarchical structure

#### Parameters

##### flatItems

[`MenuItem`](services.menu.service.md#menuitem)[]

Array of flat menu items from database

#### Returns

[`ExtendedMenuItem`](#extendedmenuitem)[]

Hierarchical menu structure

***

### validateMenuHierarchy()

> **validateMenuHierarchy**(`menuTree`): `object`

Defined in: [utils/menu-transform.ts:489](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/frontend/src/utils/menu-transform.ts#L489)

Validate menu hierarchy structure

#### Parameters

##### menuTree

[`ExtendedMenuItem`](#extendedmenuitem)[]

#### Returns

`object`

##### issues

> **issues**: `string`[]

##### isValid

> **isValid**: `boolean`

##### statistics

> **statistics**: `object`

###### statistics.emptyParents

> **emptyParents**: `number`

###### statistics.maxDepth

> **maxDepth**: `number`

###### statistics.orphanedItems

> **orphanedItems**: `number`

###### statistics.totalItems

> **totalItems**: `number`
