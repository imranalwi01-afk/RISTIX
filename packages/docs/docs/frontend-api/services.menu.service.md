[**Frontend API Reference v1.0.0**](index.md)

***

# services/menu.service

## Classes

### MenuService

Defined in: [services/menu.service.ts:149](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/frontend/src/services/menu.service.ts#L149)

#### Constructors

##### Constructor

> **new MenuService**(): [`MenuService`](#menuservice)

###### Returns

[`MenuService`](#menuservice)

#### Methods

##### clearCache()

> **clearCache**(): `void`

Defined in: [services/menu.service.ts:601](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/frontend/src/services/menu.service.ts#L601)

Clear all cache

###### Returns

`void`

##### createMenuItem()

> **createMenuItem**(`menuData`): `Promise`\<[`MenuItemResponse`](#menuitemresponse)\>

Defined in: [services/menu.service.ts:336](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/frontend/src/services/menu.service.ts#L336)

Create new menu item (Admin only)

###### Parameters

###### menuData

[`CreateMenuItemRequest`](#createmenuitemrequest)

###### Returns

`Promise`\<[`MenuItemResponse`](#menuitemresponse)\>

##### deleteMenuItem()

> **deleteMenuItem**(`id`): `Promise`\<[`ApiResponse`](#apiresponse)\>

Defined in: [services/menu.service.ts:390](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/frontend/src/services/menu.service.ts#L390)

Delete menu item (Admin only)

###### Parameters

###### id

`string`

###### Returns

`Promise`\<[`ApiResponse`](#apiresponse)\>

##### filterMenuTree()

> **filterMenuTree**(`menuTree`, `userRole`, `bankingMode?`): [`MenuItem`](#menuitem)[]

Defined in: [services/menu.service.ts:589](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/frontend/src/services/menu.service.ts#L589)

Filter menu tree based on user context

###### Parameters

###### menuTree

[`MenuItem`](#menuitem)[]

###### userRole

`string`

###### bankingMode?

`string`

###### Returns

[`MenuItem`](#menuitem)[]

##### findMenuItemByCode()

> **findMenuItemByCode**(`menuTree`, `code`): [`MenuItem`](#menuitem) \| `null`

Defined in: [services/menu.service.ts:512](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/frontend/src/services/menu.service.ts#L512)

Find menu item by code in tree

###### Parameters

###### menuTree

[`MenuItem`](#menuitem)[]

###### code

`string`

###### Returns

[`MenuItem`](#menuitem) \| `null`

##### getBreadcrumbForPath()

> **getBreadcrumbForPath**(`menuTree`, `currentPath`): [`MenuItem`](#menuitem)[]

Defined in: [services/menu.service.ts:528](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/frontend/src/services/menu.service.ts#L528)

Get menu breadcrumb for a path

###### Parameters

###### menuTree

[`MenuItem`](#menuitem)[]

###### currentPath

`string`

###### Returns

[`MenuItem`](#menuitem)[]

##### getCachedMenuTree()

> **getCachedMenuTree**(`params?`): `Promise`\<[`MenuTreeResponse`](#menutreeresponse)\>

Defined in: [services/menu.service.ts:468](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/frontend/src/services/menu.service.ts#L468)

Get cached menu hierarchy with automatic refresh

###### Parameters

###### params?

[`MenuQueryParams`](#menuqueryparams)

###### Returns

`Promise`\<[`MenuTreeResponse`](#menutreeresponse)\>

##### getMenuItem()

> **getMenuItem**(`id`): `Promise`\<[`MenuItemResponse`](#menuitemresponse)\>

Defined in: [services/menu.service.ts:312](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/frontend/src/services/menu.service.ts#L312)

Get single menu item by ID

###### Parameters

###### id

`string`

###### Returns

`Promise`\<[`MenuItemResponse`](#menuitemresponse)\>

##### getMenuItems()

> **getMenuItems**(`params?`): `Promise`\<[`MenuItemsResponse`](#menuitemsresponse)\>

Defined in: [services/menu.service.ts:247](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/frontend/src/services/menu.service.ts#L247)

Get flat menu items list

###### Parameters

###### params?

[`MenuQueryParams`](#menuqueryparams)

###### Returns

`Promise`\<[`MenuItemsResponse`](#menuitemsresponse)\>

##### getMenuStatistics()

> **getMenuStatistics**(`menuTree`): `object`

Defined in: [services/menu.service.ts:609](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/frontend/src/services/menu.service.ts#L609)

Get menu statistics

###### Parameters

###### menuTree

[`MenuItem`](#menuitem)[]

###### Returns

`object`

###### active

> **active**: `number`

###### disabled

> **disabled**: `number`

###### hasChildren

> **hasChildren**: `number`

###### inactive

> **inactive**: `number`

###### levels

> **levels**: `number`

###### newItems

> **newItems**: `number`

###### requiresSetup

> **requiresSetup**: `number`

###### total

> **total**: `number`

##### getMenuTree()

> **getMenuTree**(`params?`): `Promise`\<[`MenuTreeResponse`](#menutreeresponse)\>

Defined in: [services/menu.service.ts:157](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/frontend/src/services/menu.service.ts#L157)

Get menu hierarchy for current user

###### Parameters

###### params?

[`MenuQueryParams`](#menuqueryparams)

###### Returns

`Promise`\<[`MenuTreeResponse`](#menutreeresponse)\>

##### initializeMenuStructure()

> **initializeMenuStructure**(): `Promise`\<[`ApiResponse`](#apiresponse)\>

Defined in: [services/menu.service.ts:442](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/frontend/src/services/menu.service.ts#L442)

Initialize default menu structure (Admin only)

###### Returns

`Promise`\<[`ApiResponse`](#apiresponse)\>

##### isMenuItemAccessible()

> **isMenuItemAccessible**(`menuItem`, `userRole`, `bankingMode?`): `boolean`

Defined in: [services/menu.service.ts:565](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/frontend/src/services/menu.service.ts#L565)

Check if menu item is accessible for current user - CENTRALIZED CONFIGURATION

###### Parameters

###### menuItem

[`MenuItem`](#menuitem)

###### userRole

`string`

###### bankingMode?

`string`

###### Returns

`boolean`

##### reorderMenuItems()

> **reorderMenuItems**(`items`): `Promise`\<[`ApiResponse`](#apiresponse)\>

Defined in: [services/menu.service.ts:416](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/frontend/src/services/menu.service.ts#L416)

Reorder menu items (Admin only)

###### Parameters

###### items

[`ReorderMenuItemsRequest`](#reordermenuitemsrequest)

###### Returns

`Promise`\<[`ApiResponse`](#apiresponse)\>

##### updateMenuItem()

> **updateMenuItem**(`id`, `updateData`): `Promise`\<[`MenuItemResponse`](#menuitemresponse)\>

Defined in: [services/menu.service.ts:363](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/frontend/src/services/menu.service.ts#L363)

Update menu item (Admin only)

###### Parameters

###### id

`string`

###### updateData

[`UpdateMenuItemRequest`](#updatemenuitemrequest)

###### Returns

`Promise`\<[`MenuItemResponse`](#menuitemresponse)\>

## Interfaces

### ApiResponse

Defined in: [services/menu.service.ts:137](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/frontend/src/services/menu.service.ts#L137)

#### Properties

##### data?

> `optional` **data**: `any`

Defined in: [services/menu.service.ts:139](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/frontend/src/services/menu.service.ts#L139)

##### error?

> `optional` **error**: `string`

Defined in: [services/menu.service.ts:141](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/frontend/src/services/menu.service.ts#L141)

##### message?

> `optional` **message**: `string`

Defined in: [services/menu.service.ts:140](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/frontend/src/services/menu.service.ts#L140)

##### meta?

> `optional` **meta**: `object`

Defined in: [services/menu.service.ts:142](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/frontend/src/services/menu.service.ts#L142)

###### requestId?

> `optional` **requestId**: `string`

###### tenantId?

> `optional` **tenantId**: `string`

###### timestamp

> **timestamp**: `string`

##### success

> **success**: `boolean`

Defined in: [services/menu.service.ts:138](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/frontend/src/services/menu.service.ts#L138)

***

### CreateMenuItemRequest

Defined in: [services/menu.service.ts:79](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/frontend/src/services/menu.service.ts#L79)

#### Properties

##### badge?

> `optional` **badge**: `object`

Defined in: [services/menu.service.ts:88](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/frontend/src/services/menu.service.ts#L88)

###### color?

> `optional` **color**: `"error"` \| `"success"` \| `"primary"` \| `"secondary"` \| `"info"` \| `"warning"`

###### content?

> `optional` **content**: `string` \| `number`

##### banking\_modes?

> `optional` **banking\_modes**: (`"conventional"` \| `"syariah"` \| `"dual"`)[]

Defined in: [services/menu.service.ts:86](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/frontend/src/services/menu.service.ts#L86)

##### code

> **code**: `string`

Defined in: [services/menu.service.ts:80](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/frontend/src/services/menu.service.ts#L80)

##### description?

> `optional` **description**: `string`

Defined in: [services/menu.service.ts:83](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/frontend/src/services/menu.service.ts#L83)

##### external\_url?

> `optional` **external\_url**: `string`

Defined in: [services/menu.service.ts:96](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/frontend/src/services/menu.service.ts#L96)

##### href?

> `optional` **href**: `string`

Defined in: [services/menu.service.ts:82](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/frontend/src/services/menu.service.ts#L82)

##### icon?

> `optional` **icon**: `string`

Defined in: [services/menu.service.ts:84](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/frontend/src/services/menu.service.ts#L84)

##### is\_new?

> `optional` **is\_new**: `boolean`

Defined in: [services/menu.service.ts:93](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/frontend/src/services/menu.service.ts#L93)

##### label

> **label**: `string`

Defined in: [services/menu.service.ts:81](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/frontend/src/services/menu.service.ts#L81)

##### parent\_id?

> `optional` **parent\_id**: `string`

Defined in: [services/menu.service.ts:85](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/frontend/src/services/menu.service.ts#L85)

##### requires\_setup?

> `optional` **requires\_setup**: `boolean`

Defined in: [services/menu.service.ts:94](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/frontend/src/services/menu.service.ts#L94)

##### roles?

> `optional` **roles**: `string`[]

Defined in: [services/menu.service.ts:87](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/frontend/src/services/menu.service.ts#L87)

##### status?

> `optional` **status**: `"error"` \| `"active"` \| `"disabled"` \| `"warning"`

Defined in: [services/menu.service.ts:92](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/frontend/src/services/menu.service.ts#L92)

##### target?

> `optional` **target**: `"_self"` \| `"_blank"`

Defined in: [services/menu.service.ts:95](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/frontend/src/services/menu.service.ts#L95)

***

### MenuItem

Defined in: [services/menu.service.ts:12](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/frontend/src/services/menu.service.ts#L12)

#### Extended by

- [`ExtendedMenuItem`](utils.menu-transform.md#extendedmenuitem)

#### Properties

##### badge?

> `optional` **badge**: `object`

Defined in: [services/menu.service.ts:26](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/frontend/src/services/menu.service.ts#L26)

###### color?

> `optional` **color**: `"error"` \| `"success"` \| `"primary"` \| `"secondary"` \| `"info"` \| `"warning"`

###### content?

> `optional` **content**: `string` \| `number`

##### banking\_modes?

> `optional` **banking\_modes**: (`"conventional"` \| `"syariah"` \| `"dual"`)[]

Defined in: [services/menu.service.ts:24](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/frontend/src/services/menu.service.ts#L24)

##### children?

> `optional` **children**: [`MenuItem`](#menuitem)[]

Defined in: [services/menu.service.ts:35](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/frontend/src/services/menu.service.ts#L35)

##### code

> **code**: `string`

Defined in: [services/menu.service.ts:14](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/frontend/src/services/menu.service.ts#L14)

##### created\_at?

> `optional` **created\_at**: `string`

Defined in: [services/menu.service.ts:36](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/frontend/src/services/menu.service.ts#L36)

##### description?

> `optional` **description**: `string`

Defined in: [services/menu.service.ts:17](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/frontend/src/services/menu.service.ts#L17)

##### external\_url?

> `optional` **external\_url**: `string`

Defined in: [services/menu.service.ts:34](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/frontend/src/services/menu.service.ts#L34)

##### href?

> `optional` **href**: `string`

Defined in: [services/menu.service.ts:16](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/frontend/src/services/menu.service.ts#L16)

##### icon?

> `optional` **icon**: `string`

Defined in: [services/menu.service.ts:18](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/frontend/src/services/menu.service.ts#L18)

##### id

> **id**: `string`

Defined in: [services/menu.service.ts:13](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/frontend/src/services/menu.service.ts#L13)

##### is\_active

> **is\_active**: `boolean`

Defined in: [services/menu.service.ts:23](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/frontend/src/services/menu.service.ts#L23)

##### is\_new?

> `optional` **is\_new**: `boolean`

Defined in: [services/menu.service.ts:31](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/frontend/src/services/menu.service.ts#L31)

##### label

> **label**: `string`

Defined in: [services/menu.service.ts:15](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/frontend/src/services/menu.service.ts#L15)

##### level

> **level**: `number`

Defined in: [services/menu.service.ts:21](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/frontend/src/services/menu.service.ts#L21)

##### parent\_id?

> `optional` **parent\_id**: `string`

Defined in: [services/menu.service.ts:19](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/frontend/src/services/menu.service.ts#L19)

##### path

> **path**: `string`

Defined in: [services/menu.service.ts:22](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/frontend/src/services/menu.service.ts#L22)

##### requires\_setup?

> `optional` **requires\_setup**: `boolean`

Defined in: [services/menu.service.ts:32](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/frontend/src/services/menu.service.ts#L32)

##### roles?

> `optional` **roles**: `string`[]

Defined in: [services/menu.service.ts:25](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/frontend/src/services/menu.service.ts#L25)

##### sort\_order

> **sort\_order**: `number`

Defined in: [services/menu.service.ts:20](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/frontend/src/services/menu.service.ts#L20)

##### status?

> `optional` **status**: `"error"` \| `"active"` \| `"disabled"` \| `"warning"`

Defined in: [services/menu.service.ts:30](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/frontend/src/services/menu.service.ts#L30)

##### target?

> `optional` **target**: `"_self"` \| `"_blank"`

Defined in: [services/menu.service.ts:33](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/frontend/src/services/menu.service.ts#L33)

##### updated\_at?

> `optional` **updated\_at**: `string`

Defined in: [services/menu.service.ts:37](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/frontend/src/services/menu.service.ts#L37)

***

### MenuItemResponse

Defined in: [services/menu.service.ts:51](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/frontend/src/services/menu.service.ts#L51)

#### Properties

##### data

> **data**: [`MenuItem`](#menuitem)

Defined in: [services/menu.service.ts:53](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/frontend/src/services/menu.service.ts#L53)

##### message?

> `optional` **message**: `string`

Defined in: [services/menu.service.ts:54](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/frontend/src/services/menu.service.ts#L54)

##### meta?

> `optional` **meta**: `object`

Defined in: [services/menu.service.ts:55](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/frontend/src/services/menu.service.ts#L55)

###### requestId?

> `optional` **requestId**: `string`

###### tenantId?

> `optional` **tenantId**: `string`

###### timestamp

> **timestamp**: `string`

##### success

> **success**: `boolean`

Defined in: [services/menu.service.ts:52](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/frontend/src/services/menu.service.ts#L52)

***

### MenuItemsResponse

Defined in: [services/menu.service.ts:62](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/frontend/src/services/menu.service.ts#L62)

#### Properties

##### data

> **data**: [`MenuItem`](#menuitem)[]

Defined in: [services/menu.service.ts:64](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/frontend/src/services/menu.service.ts#L64)

##### message?

> `optional` **message**: `string`

Defined in: [services/menu.service.ts:71](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/frontend/src/services/menu.service.ts#L71)

##### meta?

> `optional` **meta**: `object`

Defined in: [services/menu.service.ts:72](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/frontend/src/services/menu.service.ts#L72)

###### requestId?

> `optional` **requestId**: `string`

###### tenantId?

> `optional` **tenantId**: `string`

###### timestamp

> **timestamp**: `string`

##### pagination?

> `optional` **pagination**: `object`

Defined in: [services/menu.service.ts:65](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/frontend/src/services/menu.service.ts#L65)

###### limit

> **limit**: `number`

###### page

> **page**: `number`

###### total

> **total**: `number`

###### totalPages

> **totalPages**: `number`

##### success

> **success**: `boolean`

Defined in: [services/menu.service.ts:63](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/frontend/src/services/menu.service.ts#L63)

***

### MenuQueryParams

Defined in: [services/menu.service.ts:126](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/frontend/src/services/menu.service.ts#L126)

#### Properties

##### bankingMode?

> `optional` **bankingMode**: `"conventional"` \| `"syariah"` \| `"dual"`

Defined in: [services/menu.service.ts:127](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/frontend/src/services/menu.service.ts#L127)

##### includeInactive?

> `optional` **includeInactive**: `boolean`

Defined in: [services/menu.service.ts:128](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/frontend/src/services/menu.service.ts#L128)

##### level?

> `optional` **level**: `number`

Defined in: [services/menu.service.ts:130](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/frontend/src/services/menu.service.ts#L130)

##### limit?

> `optional` **limit**: `number`

Defined in: [services/menu.service.ts:132](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/frontend/src/services/menu.service.ts#L132)

##### page?

> `optional` **page**: `number`

Defined in: [services/menu.service.ts:131](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/frontend/src/services/menu.service.ts#L131)

##### parentId?

> `optional` **parentId**: `string`

Defined in: [services/menu.service.ts:129](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/frontend/src/services/menu.service.ts#L129)

##### search?

> `optional` **search**: `string`

Defined in: [services/menu.service.ts:133](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/frontend/src/services/menu.service.ts#L133)

##### useCache?

> `optional` **useCache**: `boolean`

Defined in: [services/menu.service.ts:134](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/frontend/src/services/menu.service.ts#L134)

***

### MenuTreeResponse

Defined in: [services/menu.service.ts:40](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/frontend/src/services/menu.service.ts#L40)

#### Properties

##### data

> **data**: [`MenuItem`](#menuitem)[]

Defined in: [services/menu.service.ts:42](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/frontend/src/services/menu.service.ts#L42)

##### message?

> `optional` **message**: `string`

Defined in: [services/menu.service.ts:43](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/frontend/src/services/menu.service.ts#L43)

##### meta?

> `optional` **meta**: `object`

Defined in: [services/menu.service.ts:44](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/frontend/src/services/menu.service.ts#L44)

###### requestId?

> `optional` **requestId**: `string`

###### tenantId?

> `optional` **tenantId**: `string`

###### timestamp

> **timestamp**: `string`

##### success

> **success**: `boolean`

Defined in: [services/menu.service.ts:41](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/frontend/src/services/menu.service.ts#L41)

***

### ReorderMenuItemsRequest

Defined in: [services/menu.service.ts:119](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/frontend/src/services/menu.service.ts#L119)

#### Properties

##### items

> **items**: `object`[]

Defined in: [services/menu.service.ts:120](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/frontend/src/services/menu.service.ts#L120)

###### id

> **id**: `string`

###### sort\_order

> **sort\_order**: `number`

***

### UpdateMenuItemRequest

Defined in: [services/menu.service.ts:99](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/frontend/src/services/menu.service.ts#L99)

#### Properties

##### badge?

> `optional` **badge**: `object`

Defined in: [services/menu.service.ts:107](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/frontend/src/services/menu.service.ts#L107)

###### color?

> `optional` **color**: `"error"` \| `"success"` \| `"primary"` \| `"secondary"` \| `"info"` \| `"warning"`

###### content?

> `optional` **content**: `string` \| `number`

##### banking\_modes?

> `optional` **banking\_modes**: (`"conventional"` \| `"syariah"` \| `"dual"`)[]

Defined in: [services/menu.service.ts:105](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/frontend/src/services/menu.service.ts#L105)

##### description?

> `optional` **description**: `string`

Defined in: [services/menu.service.ts:102](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/frontend/src/services/menu.service.ts#L102)

##### external\_url?

> `optional` **external\_url**: `string`

Defined in: [services/menu.service.ts:116](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/frontend/src/services/menu.service.ts#L116)

##### href?

> `optional` **href**: `string`

Defined in: [services/menu.service.ts:101](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/frontend/src/services/menu.service.ts#L101)

##### icon?

> `optional` **icon**: `string`

Defined in: [services/menu.service.ts:103](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/frontend/src/services/menu.service.ts#L103)

##### is\_active?

> `optional` **is\_active**: `boolean`

Defined in: [services/menu.service.ts:114](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/frontend/src/services/menu.service.ts#L114)

##### is\_new?

> `optional` **is\_new**: `boolean`

Defined in: [services/menu.service.ts:112](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/frontend/src/services/menu.service.ts#L112)

##### label?

> `optional` **label**: `string`

Defined in: [services/menu.service.ts:100](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/frontend/src/services/menu.service.ts#L100)

##### parent\_id?

> `optional` **parent\_id**: `string`

Defined in: [services/menu.service.ts:104](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/frontend/src/services/menu.service.ts#L104)

##### requires\_setup?

> `optional` **requires\_setup**: `boolean`

Defined in: [services/menu.service.ts:113](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/frontend/src/services/menu.service.ts#L113)

##### roles?

> `optional` **roles**: `string`[]

Defined in: [services/menu.service.ts:106](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/frontend/src/services/menu.service.ts#L106)

##### status?

> `optional` **status**: `"error"` \| `"active"` \| `"disabled"` \| `"warning"`

Defined in: [services/menu.service.ts:111](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/frontend/src/services/menu.service.ts#L111)

##### target?

> `optional` **target**: `"_self"` \| `"_blank"`

Defined in: [services/menu.service.ts:115](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/frontend/src/services/menu.service.ts#L115)

## Variables

### menuService

> `const` **menuService**: [`MenuService`](#menuservice)

Defined in: [services/menu.service.ts:625](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/frontend/src/services/menu.service.ts#L625)

## References

### default

Renames and re-exports [menuService](#menuservice-1)
