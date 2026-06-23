[**Frontend API Reference v1.0.0**](index.md)

***

# services/menu.service

## Classes

### MenuService

Defined in: [services/menu.service.ts:206](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/frontend/src/services/menu.service.ts#L206)

#### Constructors

##### Constructor

> **new MenuService**(): [`MenuService`](#menuservice)

###### Returns

[`MenuService`](#menuservice)

#### Methods

##### clearCache()

> **clearCache**(): `void`

Defined in: [services/menu.service.ts:565](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/frontend/src/services/menu.service.ts#L565)

Clear all cache

###### Returns

`void`

##### createMenuItem()

> **createMenuItem**(`menuData`): `Promise`&lt;[`MenuItemResponse`](#menuitemresponse)&gt;

Defined in: [services/menu.service.ts:333](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/frontend/src/services/menu.service.ts#L333)

Create new menu item (Admin only)

###### Parameters

###### menuData

[`CreateMenuItemRequest`](#createmenuitemrequest)

###### Returns

`Promise`&lt;[`MenuItemResponse`](#menuitemresponse)&gt;

##### deleteMenuItem()

> **deleteMenuItem**(`id`): `Promise`&lt;[`ApiResponse`](#apiresponse)&gt;

Defined in: [services/menu.service.ts:373](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/frontend/src/services/menu.service.ts#L373)

Delete menu item (Admin only)

###### Parameters

###### id

`string`

###### Returns

`Promise`&lt;[`ApiResponse`](#apiresponse)&gt;

##### filterMenuTree()

> **filterMenuTree**(`menuTree`, `userRole`, `bankingMode?`): [`MenuItem`](#menuitem)[]

Defined in: [services/menu.service.ts:553](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/frontend/src/services/menu.service.ts#L553)

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

> **findMenuItemByCode**(`menuTree`, `code`): [`MenuItem`](#menuitem) &#124; `null`

Defined in: [services/menu.service.ts:476](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/frontend/src/services/menu.service.ts#L476)

Find menu item by code in tree

###### Parameters

###### menuTree

[`MenuItem`](#menuitem)[]

###### code

`string`

###### Returns

[`MenuItem`](#menuitem) &#124; `null`

##### getBreadcrumbForPath()

> **getBreadcrumbForPath**(`menuTree`, `currentPath`): [`MenuItem`](#menuitem)[]

Defined in: [services/menu.service.ts:492](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/frontend/src/services/menu.service.ts#L492)

Get menu breadcrumb for a path

###### Parameters

###### menuTree

[`MenuItem`](#menuitem)[]

###### currentPath

`string`

###### Returns

[`MenuItem`](#menuitem)[]

##### getCachedMenuTree()

> **getCachedMenuTree**(`params?`): `Promise`&lt;[`MenuTreeResponse`](#menutreeresponse)&gt;

Defined in: [services/menu.service.ts:433](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/frontend/src/services/menu.service.ts#L433)

Get cached menu hierarchy with automatic refresh

###### Parameters

###### params?

[`MenuQueryParams`](#menuqueryparams)

###### Returns

`Promise`&lt;[`MenuTreeResponse`](#menutreeresponse)&gt;

##### getMenuItem()

> **getMenuItem**(`id`): `Promise`&lt;[`MenuItemResponse`](#menuitemresponse)&gt;

Defined in: [services/menu.service.ts:316](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/frontend/src/services/menu.service.ts#L316)

Get single menu item by ID

###### Parameters

###### id

`string`

###### Returns

`Promise`&lt;[`MenuItemResponse`](#menuitemresponse)&gt;

##### getMenuItems()

> **getMenuItems**(`params?`): `Promise`&lt;[`MenuItemsResponse`](#menuitemsresponse)&gt;

Defined in: [services/menu.service.ts:259](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/frontend/src/services/menu.service.ts#L259)

Get flat menu items list

###### Parameters

###### params?

[`MenuQueryParams`](#menuqueryparams)

###### Returns

`Promise`&lt;[`MenuItemsResponse`](#menuitemsresponse)&gt;

##### getMenuStatistics()

> **getMenuStatistics**(`menuTree`): `object`

Defined in: [services/menu.service.ts:572](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/frontend/src/services/menu.service.ts#L572)

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

> **getMenuTree**(`params?`): `Promise`&lt;[`MenuTreeResponse`](#menutreeresponse)&gt;

Defined in: [services/menu.service.ts:214](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/frontend/src/services/menu.service.ts#L214)

Get menu hierarchy for current user

###### Parameters

###### params?

[`MenuQueryParams`](#menuqueryparams)

###### Returns

`Promise`&lt;[`MenuTreeResponse`](#menutreeresponse)&gt;

##### initializeMenuStructure()

> **initializeMenuStructure**(): `Promise`&lt;[`ApiResponse`](#apiresponse)&gt;

Defined in: [services/menu.service.ts:413](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/frontend/src/services/menu.service.ts#L413)

Initialize default menu structure (Admin only)

###### Returns

`Promise`&lt;[`ApiResponse`](#apiresponse)&gt;

##### isMenuItemAccessible()

> **isMenuItemAccessible**(`menuItem`, `userRole`, `bankingMode?`): `boolean`

Defined in: [services/menu.service.ts:529](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/frontend/src/services/menu.service.ts#L529)

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

> **reorderMenuItems**(`items`): `Promise`&lt;[`ApiResponse`](#apiresponse)&gt;

Defined in: [services/menu.service.ts:393](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/frontend/src/services/menu.service.ts#L393)

Reorder menu items (Admin only)

###### Parameters

###### items

[`ReorderMenuItemsRequest`](#reordermenuitemsrequest)

###### Returns

`Promise`&lt;[`ApiResponse`](#apiresponse)&gt;

##### updateMenuItem()

> **updateMenuItem**(`id`, `updateData`): `Promise`&lt;[`MenuItemResponse`](#menuitemresponse)&gt;

Defined in: [services/menu.service.ts:353](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/frontend/src/services/menu.service.ts#L353)

Update menu item (Admin only)

###### Parameters

###### id

`string`

###### updateData

[`UpdateMenuItemRequest`](#updatemenuitemrequest)

###### Returns

`Promise`&lt;[`MenuItemResponse`](#menuitemresponse)&gt;

## Interfaces

### ApiResponse

Defined in: [services/menu.service.ts:194](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/frontend/src/services/menu.service.ts#L194)

#### Properties

##### data?

> `optional` **data**: `any`

Defined in: [services/menu.service.ts:196](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/frontend/src/services/menu.service.ts#L196)

##### error?

> `optional` **error**: `string`

Defined in: [services/menu.service.ts:198](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/frontend/src/services/menu.service.ts#L198)

##### message?

> `optional` **message**: `string`

Defined in: [services/menu.service.ts:197](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/frontend/src/services/menu.service.ts#L197)

##### meta?

> `optional` **meta**: `object`

Defined in: [services/menu.service.ts:199](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/frontend/src/services/menu.service.ts#L199)

###### requestId?

> `optional` **requestId**: `string`

###### tenantId?

> `optional` **tenantId**: `string`

###### timestamp

> **timestamp**: `string`

##### success

> **success**: `boolean`

Defined in: [services/menu.service.ts:195](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/frontend/src/services/menu.service.ts#L195)

***

### CreateMenuItemRequest

Defined in: [services/menu.service.ts:84](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/frontend/src/services/menu.service.ts#L84)

#### Properties

##### badge?

> `optional` **badge**: `object`

Defined in: [services/menu.service.ts:93](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/frontend/src/services/menu.service.ts#L93)

###### color?

> `optional` **color**: `"error"` &#124; `"success"` &#124; `"primary"` &#124; `"secondary"` &#124; `"info"` &#124; `"warning"`

###### content?

> `optional` **content**: `string` &#124; `number`

##### banking\_modes?

> `optional` **banking\_modes**: (`"conventional"` &#124; `"dual"`)[]

Defined in: [services/menu.service.ts:91](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/frontend/src/services/menu.service.ts#L91)

##### code

> **code**: `string`

Defined in: [services/menu.service.ts:85](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/frontend/src/services/menu.service.ts#L85)

##### description?

> `optional` **description**: `string`

Defined in: [services/menu.service.ts:88](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/frontend/src/services/menu.service.ts#L88)

##### external\_url?

> `optional` **external\_url**: `string`

Defined in: [services/menu.service.ts:101](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/frontend/src/services/menu.service.ts#L101)

##### href?

> `optional` **href**: `string`

Defined in: [services/menu.service.ts:87](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/frontend/src/services/menu.service.ts#L87)

##### icon?

> `optional` **icon**: `string`

Defined in: [services/menu.service.ts:89](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/frontend/src/services/menu.service.ts#L89)

##### is\_new?

> `optional` **is\_new**: `boolean`

Defined in: [services/menu.service.ts:98](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/frontend/src/services/menu.service.ts#L98)

##### label

> **label**: `string`

Defined in: [services/menu.service.ts:86](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/frontend/src/services/menu.service.ts#L86)

##### parent\_id?

> `optional` **parent\_id**: `string`

Defined in: [services/menu.service.ts:90](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/frontend/src/services/menu.service.ts#L90)

##### requires\_setup?

> `optional` **requires\_setup**: `boolean`

Defined in: [services/menu.service.ts:99](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/frontend/src/services/menu.service.ts#L99)

##### roles?

> `optional` **roles**: `string`[]

Defined in: [services/menu.service.ts:92](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/frontend/src/services/menu.service.ts#L92)

##### status?

> `optional` **status**: `"active"` &#124; `"disabled"` &#124; `"error"` &#124; `"warning"`

Defined in: [services/menu.service.ts:97](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/frontend/src/services/menu.service.ts#L97)

##### target?

> `optional` **target**: `"_self"` &#124; `"_blank"`

Defined in: [services/menu.service.ts:100](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/frontend/src/services/menu.service.ts#L100)

***

### MenuItem

Defined in: [services/menu.service.ts:14](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/frontend/src/services/menu.service.ts#L14)

#### Properties

##### badge?

> `optional` **badge**: `object`

Defined in: [services/menu.service.ts:28](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/frontend/src/services/menu.service.ts#L28)

###### color?

> `optional` **color**: `"error"` &#124; `"success"` &#124; `"primary"` &#124; `"secondary"` &#124; `"info"` &#124; `"warning"`

###### content?

> `optional` **content**: `string` &#124; `number`

##### banking\_modes?

> `optional` **banking\_modes**: (`"conventional"` &#124; `"dual"`)[]

Defined in: [services/menu.service.ts:26](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/frontend/src/services/menu.service.ts#L26)

##### children?

> `optional` **children**: [`MenuItem`](#menuitem)[]

Defined in: [services/menu.service.ts:37](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/frontend/src/services/menu.service.ts#L37)

##### code

> **code**: `string`

Defined in: [services/menu.service.ts:16](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/frontend/src/services/menu.service.ts#L16)

##### created\_at?

> `optional` **created\_at**: `string`

Defined in: [services/menu.service.ts:38](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/frontend/src/services/menu.service.ts#L38)

##### description?

> `optional` **description**: `string`

Defined in: [services/menu.service.ts:19](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/frontend/src/services/menu.service.ts#L19)

##### external\_url?

> `optional` **external\_url**: `string`

Defined in: [services/menu.service.ts:36](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/frontend/src/services/menu.service.ts#L36)

##### href?

> `optional` **href**: `string`

Defined in: [services/menu.service.ts:18](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/frontend/src/services/menu.service.ts#L18)

##### icon?

> `optional` **icon**: `string`

Defined in: [services/menu.service.ts:20](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/frontend/src/services/menu.service.ts#L20)

##### id

> **id**: `string`

Defined in: [services/menu.service.ts:15](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/frontend/src/services/menu.service.ts#L15)

##### is\_active

> **is\_active**: `boolean`

Defined in: [services/menu.service.ts:25](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/frontend/src/services/menu.service.ts#L25)

##### is\_new?

> `optional` **is\_new**: `boolean`

Defined in: [services/menu.service.ts:33](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/frontend/src/services/menu.service.ts#L33)

##### label

> **label**: `string`

Defined in: [services/menu.service.ts:17](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/frontend/src/services/menu.service.ts#L17)

##### level

> **level**: `number`

Defined in: [services/menu.service.ts:23](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/frontend/src/services/menu.service.ts#L23)

##### parent\_id?

> `optional` **parent\_id**: `string`

Defined in: [services/menu.service.ts:21](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/frontend/src/services/menu.service.ts#L21)

##### path

> **path**: `string`

Defined in: [services/menu.service.ts:24](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/frontend/src/services/menu.service.ts#L24)

##### requires\_setup?

> `optional` **requires\_setup**: `boolean`

Defined in: [services/menu.service.ts:34](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/frontend/src/services/menu.service.ts#L34)

##### roles?

> `optional` **roles**: `string`[]

Defined in: [services/menu.service.ts:27](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/frontend/src/services/menu.service.ts#L27)

##### sort\_order

> **sort\_order**: `number`

Defined in: [services/menu.service.ts:22](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/frontend/src/services/menu.service.ts#L22)

##### status?

> `optional` **status**: `"active"` &#124; `"disabled"` &#124; `"error"` &#124; `"warning"`

Defined in: [services/menu.service.ts:32](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/frontend/src/services/menu.service.ts#L32)

##### target?

> `optional` **target**: `"_self"` &#124; `"_blank"`

Defined in: [services/menu.service.ts:35](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/frontend/src/services/menu.service.ts#L35)

##### updated\_at?

> `optional` **updated\_at**: `string`

Defined in: [services/menu.service.ts:39](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/frontend/src/services/menu.service.ts#L39)

***

### MenuItemResponse

Defined in: [services/menu.service.ts:54](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/frontend/src/services/menu.service.ts#L54)

#### Properties

##### data

> **data**: [`MenuItem`](#menuitem)

Defined in: [services/menu.service.ts:56](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/frontend/src/services/menu.service.ts#L56)

##### message?

> `optional` **message**: `string`

Defined in: [services/menu.service.ts:57](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/frontend/src/services/menu.service.ts#L57)

##### meta?

> `optional` **meta**: `object`

Defined in: [services/menu.service.ts:58](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/frontend/src/services/menu.service.ts#L58)

###### requestId?

> `optional` **requestId**: `string`

###### source?

> `optional` **source**: `string`

###### tenantId?

> `optional` **tenantId**: `string`

###### timestamp

> **timestamp**: `string`

##### success

> **success**: `boolean`

Defined in: [services/menu.service.ts:55](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/frontend/src/services/menu.service.ts#L55)

***

### MenuItemsResponse

Defined in: [services/menu.service.ts:66](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/frontend/src/services/menu.service.ts#L66)

#### Properties

##### data

> **data**: [`MenuItem`](#menuitem)[]

Defined in: [services/menu.service.ts:68](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/frontend/src/services/menu.service.ts#L68)

##### message?

> `optional` **message**: `string`

Defined in: [services/menu.service.ts:75](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/frontend/src/services/menu.service.ts#L75)

##### meta?

> `optional` **meta**: `object`

Defined in: [services/menu.service.ts:76](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/frontend/src/services/menu.service.ts#L76)

###### requestId?

> `optional` **requestId**: `string`

###### source?

> `optional` **source**: `string`

###### tenantId?

> `optional` **tenantId**: `string`

###### timestamp

> **timestamp**: `string`

##### pagination?

> `optional` **pagination**: `object`

Defined in: [services/menu.service.ts:69](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/frontend/src/services/menu.service.ts#L69)

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

Defined in: [services/menu.service.ts:67](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/frontend/src/services/menu.service.ts#L67)

***

### MenuQueryParams

Defined in: [services/menu.service.ts:131](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/frontend/src/services/menu.service.ts#L131)

#### Properties

##### bankingMode?

> `optional` **bankingMode**: `"conventional"` &#124; `"dual"`

Defined in: [services/menu.service.ts:132](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/frontend/src/services/menu.service.ts#L132)

##### includeInactive?

> `optional` **includeInactive**: `boolean`

Defined in: [services/menu.service.ts:133](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/frontend/src/services/menu.service.ts#L133)

##### level?

> `optional` **level**: `number`

Defined in: [services/menu.service.ts:135](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/frontend/src/services/menu.service.ts#L135)

##### limit?

> `optional` **limit**: `number`

Defined in: [services/menu.service.ts:137](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/frontend/src/services/menu.service.ts#L137)

##### page?

> `optional` **page**: `number`

Defined in: [services/menu.service.ts:136](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/frontend/src/services/menu.service.ts#L136)

##### parentId?

> `optional` **parentId**: `string`

Defined in: [services/menu.service.ts:134](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/frontend/src/services/menu.service.ts#L134)

##### search?

> `optional` **search**: `string`

Defined in: [services/menu.service.ts:138](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/frontend/src/services/menu.service.ts#L138)

##### useCache?

> `optional` **useCache**: `boolean`

Defined in: [services/menu.service.ts:139](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/frontend/src/services/menu.service.ts#L139)

***

### MenuTreeResponse

Defined in: [services/menu.service.ts:42](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/frontend/src/services/menu.service.ts#L42)

#### Properties

##### data

> **data**: [`MenuItem`](#menuitem)[]

Defined in: [services/menu.service.ts:44](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/frontend/src/services/menu.service.ts#L44)

##### message?

> `optional` **message**: `string`

Defined in: [services/menu.service.ts:45](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/frontend/src/services/menu.service.ts#L45)

##### meta?

> `optional` **meta**: `object`

Defined in: [services/menu.service.ts:46](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/frontend/src/services/menu.service.ts#L46)

###### requestId?

> `optional` **requestId**: `string`

###### source?

> `optional` **source**: `string`

###### tenantId?

> `optional` **tenantId**: `string`

###### timestamp

> **timestamp**: `string`

##### success

> **success**: `boolean`

Defined in: [services/menu.service.ts:43](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/frontend/src/services/menu.service.ts#L43)

***

### ReorderMenuItemsRequest

Defined in: [services/menu.service.ts:124](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/frontend/src/services/menu.service.ts#L124)

#### Properties

##### items

> **items**: `object`[]

Defined in: [services/menu.service.ts:125](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/frontend/src/services/menu.service.ts#L125)

###### id

> **id**: `string`

###### sort\_order

> **sort\_order**: `number`

***

### UpdateMenuItemRequest

Defined in: [services/menu.service.ts:104](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/frontend/src/services/menu.service.ts#L104)

#### Properties

##### badge?

> `optional` **badge**: `object`

Defined in: [services/menu.service.ts:112](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/frontend/src/services/menu.service.ts#L112)

###### color?

> `optional` **color**: `"error"` &#124; `"success"` &#124; `"primary"` &#124; `"secondary"` &#124; `"info"` &#124; `"warning"`

###### content?

> `optional` **content**: `string` &#124; `number`

##### banking\_modes?

> `optional` **banking\_modes**: (`"conventional"` &#124; `"dual"`)[]

Defined in: [services/menu.service.ts:110](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/frontend/src/services/menu.service.ts#L110)

##### description?

> `optional` **description**: `string`

Defined in: [services/menu.service.ts:107](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/frontend/src/services/menu.service.ts#L107)

##### external\_url?

> `optional` **external\_url**: `string`

Defined in: [services/menu.service.ts:121](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/frontend/src/services/menu.service.ts#L121)

##### href?

> `optional` **href**: `string`

Defined in: [services/menu.service.ts:106](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/frontend/src/services/menu.service.ts#L106)

##### icon?

> `optional` **icon**: `string`

Defined in: [services/menu.service.ts:108](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/frontend/src/services/menu.service.ts#L108)

##### is\_active?

> `optional` **is\_active**: `boolean`

Defined in: [services/menu.service.ts:119](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/frontend/src/services/menu.service.ts#L119)

##### is\_new?

> `optional` **is\_new**: `boolean`

Defined in: [services/menu.service.ts:117](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/frontend/src/services/menu.service.ts#L117)

##### label?

> `optional` **label**: `string`

Defined in: [services/menu.service.ts:105](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/frontend/src/services/menu.service.ts#L105)

##### parent\_id?

> `optional` **parent\_id**: `string`

Defined in: [services/menu.service.ts:109](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/frontend/src/services/menu.service.ts#L109)

##### requires\_setup?

> `optional` **requires\_setup**: `boolean`

Defined in: [services/menu.service.ts:118](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/frontend/src/services/menu.service.ts#L118)

##### roles?

> `optional` **roles**: `string`[]

Defined in: [services/menu.service.ts:111](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/frontend/src/services/menu.service.ts#L111)

##### status?

> `optional` **status**: `"active"` &#124; `"disabled"` &#124; `"error"` &#124; `"warning"`

Defined in: [services/menu.service.ts:116](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/frontend/src/services/menu.service.ts#L116)

##### target?

> `optional` **target**: `"_self"` &#124; `"_blank"`

Defined in: [services/menu.service.ts:120](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/frontend/src/services/menu.service.ts#L120)

## Variables

### menuService

> `const` **menuService**: [`MenuService`](#menuservice)

Defined in: [services/menu.service.ts:588](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/frontend/src/services/menu.service.ts#L588)

## References

### default

Renames and re-exports [menuService](#menuservice-1)
