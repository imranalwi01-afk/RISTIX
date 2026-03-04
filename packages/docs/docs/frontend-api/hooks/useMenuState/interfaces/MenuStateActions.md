[**Frontend API Reference v1.0.0**](../../../README.md)

***

# Interface: MenuStateActions

Defined in: [hooks/useMenuState.ts:33](https://github.com/ifrspro/ifrs9-iaf/blob/2301badfc5ea65510b50f0438f532e45a5ab486b/packages/frontend/src/hooks/useMenuState.ts#L33)

## Properties

### collapseAll()

> **collapseAll**: () => `void`

Defined in: [hooks/useMenuState.ts:39](https://github.com/ifrspro/ifrs9-iaf/blob/2301badfc5ea65510b50f0438f532e45a5ab486b/packages/frontend/src/hooks/useMenuState.ts#L39)

#### Returns

`void`

***

### collapseItem()

> **collapseItem**: (`itemId`) => `void`

Defined in: [hooks/useMenuState.ts:37](https://github.com/ifrspro/ifrs9-iaf/blob/2301badfc5ea65510b50f0438f532e45a5ab486b/packages/frontend/src/hooks/useMenuState.ts#L37)

#### Parameters

##### itemId

`string`

#### Returns

`void`

***

### expandAll()

> **expandAll**: () => `void`

Defined in: [hooks/useMenuState.ts:38](https://github.com/ifrspro/ifrs9-iaf/blob/2301badfc5ea65510b50f0438f532e45a5ab486b/packages/frontend/src/hooks/useMenuState.ts#L38)

#### Returns

`void`

***

### expandItem()

> **expandItem**: (`itemId`) => `void`

Defined in: [hooks/useMenuState.ts:36](https://github.com/ifrspro/ifrs9-iaf/blob/2301badfc5ea65510b50f0438f532e45a5ab486b/packages/frontend/src/hooks/useMenuState.ts#L36)

#### Parameters

##### itemId

`string`

#### Returns

`void`

***

### isActive()

> **isActive**: (`itemId`) => `boolean`

Defined in: [hooks/useMenuState.ts:54](https://github.com/ifrspro/ifrs9-iaf/blob/2301badfc5ea65510b50f0438f532e45a5ab486b/packages/frontend/src/hooks/useMenuState.ts#L54)

#### Parameters

##### itemId

`string`

#### Returns

`boolean`

***

### isExpanded()

> **isExpanded**: (`itemId`) => `boolean`

Defined in: [hooks/useMenuState.ts:53](https://github.com/ifrspro/ifrs9-iaf/blob/2301badfc5ea65510b50f0438f532e45a5ab486b/packages/frontend/src/hooks/useMenuState.ts#L53)

#### Parameters

##### itemId

`string`

#### Returns

`boolean`

***

### navigateToMenu()

> **navigateToMenu**: (`item`) => `void`

Defined in: [hooks/useMenuState.ts:46](https://github.com/ifrspro/ifrs9-iaf/blob/2301badfc5ea65510b50f0438f532e45a5ab486b/packages/frontend/src/hooks/useMenuState.ts#L46)

#### Parameters

##### item

[`HierarchicalMenuItem`](../../../utils/menu-hierarchy/interfaces/HierarchicalMenuItem.md)

#### Returns

`void`

***

### resetState()

> **resetState**: () => `void`

Defined in: [hooks/useMenuState.ts:55](https://github.com/ifrspro/ifrs9-iaf/blob/2301badfc5ea65510b50f0438f532e45a5ab486b/packages/frontend/src/hooks/useMenuState.ts#L55)

#### Returns

`void`

***

### setActiveItem()

> **setActiveItem**: (`itemId`) => `void`

Defined in: [hooks/useMenuState.ts:42](https://github.com/ifrspro/ifrs9-iaf/blob/2301badfc5ea65510b50f0438f532e45a5ab486b/packages/frontend/src/hooks/useMenuState.ts#L42)

#### Parameters

##### itemId

`string` | `null`

#### Returns

`void`

***

### setActiveItems()

> **setActiveItems**: (`itemIds`) => `void`

Defined in: [hooks/useMenuState.ts:43](https://github.com/ifrspro/ifrs9-iaf/blob/2301badfc5ea65510b50f0438f532e45a5ab486b/packages/frontend/src/hooks/useMenuState.ts#L43)

#### Parameters

##### itemIds

`string`[]

#### Returns

`void`

***

### setAutoExpandActiveParents()

> **setAutoExpandActiveParents**: (`enabled`) => `void`

Defined in: [hooks/useMenuState.ts:50](https://github.com/ifrspro/ifrs9-iaf/blob/2301badfc5ea65510b50f0438f532e45a5ab486b/packages/frontend/src/hooks/useMenuState.ts#L50)

#### Parameters

##### enabled

`boolean`

#### Returns

`void`

***

### setCollapsed()

> **setCollapsed**: (`collapsed`) => `void`

Defined in: [hooks/useMenuState.ts:49](https://github.com/ifrspro/ifrs9-iaf/blob/2301badfc5ea65510b50f0438f532e45a5ab486b/packages/frontend/src/hooks/useMenuState.ts#L49)

#### Parameters

##### collapsed

`boolean`

#### Returns

`void`

***

### toggleExpansion()

> **toggleExpansion**: (`itemId`) => `void`

Defined in: [hooks/useMenuState.ts:35](https://github.com/ifrspro/ifrs9-iaf/blob/2301badfc5ea65510b50f0438f532e45a5ab486b/packages/frontend/src/hooks/useMenuState.ts#L35)

#### Parameters

##### itemId

`string`

#### Returns

`void`
