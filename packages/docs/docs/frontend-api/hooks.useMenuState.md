[**Frontend API Reference v1.0.0**](index.md)

***

# hooks/useMenuState

## Interfaces

### MenuState

Defined in: [hooks/useMenuState.ts:14](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/frontend/src/hooks/useMenuState.ts#L14)

#### Properties

##### activeItems

> **activeItems**: `Set`\<`string`\>

Defined in: [hooks/useMenuState.ts:20](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/frontend/src/hooks/useMenuState.ts#L20)

##### activeParentIds

> **activeParentIds**: `Set`\<`string`\>

Defined in: [hooks/useMenuState.ts:22](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/frontend/src/hooks/useMenuState.ts#L22)

##### autoExpandActiveParents

> **autoExpandActiveParents**: `boolean`

Defined in: [hooks/useMenuState.ts:29](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/frontend/src/hooks/useMenuState.ts#L29)

##### collapsed

> **collapsed**: `boolean`

Defined in: [hooks/useMenuState.ts:17](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/frontend/src/hooks/useMenuState.ts#L17)

##### currentPath

> **currentPath**: `string`

Defined in: [hooks/useMenuState.ts:25](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/frontend/src/hooks/useMenuState.ts#L25)

##### expandedItems

> **expandedItems**: `Set`\<`string`\>

Defined in: [hooks/useMenuState.ts:16](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/frontend/src/hooks/useMenuState.ts#L16)

##### persistExpansionState

> **persistExpansionState**: `boolean`

Defined in: [hooks/useMenuState.ts:30](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/frontend/src/hooks/useMenuState.ts#L30)

##### previousPath

> **previousPath**: `string` \| `null`

Defined in: [hooks/useMenuState.ts:26](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/frontend/src/hooks/useMenuState.ts#L26)

##### selectedItem

> **selectedItem**: `string` \| `null`

Defined in: [hooks/useMenuState.ts:21](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/frontend/src/hooks/useMenuState.ts#L21)

***

### MenuStateActions

Defined in: [hooks/useMenuState.ts:33](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/frontend/src/hooks/useMenuState.ts#L33)

#### Properties

##### collapseAll()

> **collapseAll**: () => `void`

Defined in: [hooks/useMenuState.ts:39](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/frontend/src/hooks/useMenuState.ts#L39)

###### Returns

`void`

##### collapseItem()

> **collapseItem**: (`itemId`) => `void`

Defined in: [hooks/useMenuState.ts:37](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/frontend/src/hooks/useMenuState.ts#L37)

###### Parameters

###### itemId

`string`

###### Returns

`void`

##### expandAll()

> **expandAll**: () => `void`

Defined in: [hooks/useMenuState.ts:38](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/frontend/src/hooks/useMenuState.ts#L38)

###### Returns

`void`

##### expandItem()

> **expandItem**: (`itemId`) => `void`

Defined in: [hooks/useMenuState.ts:36](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/frontend/src/hooks/useMenuState.ts#L36)

###### Parameters

###### itemId

`string`

###### Returns

`void`

##### isActive()

> **isActive**: (`itemId`) => `boolean`

Defined in: [hooks/useMenuState.ts:54](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/frontend/src/hooks/useMenuState.ts#L54)

###### Parameters

###### itemId

`string`

###### Returns

`boolean`

##### isExpanded()

> **isExpanded**: (`itemId`) => `boolean`

Defined in: [hooks/useMenuState.ts:53](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/frontend/src/hooks/useMenuState.ts#L53)

###### Parameters

###### itemId

`string`

###### Returns

`boolean`

##### navigateToMenu()

> **navigateToMenu**: (`item`) => `void`

Defined in: [hooks/useMenuState.ts:46](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/frontend/src/hooks/useMenuState.ts#L46)

###### Parameters

###### item

[`HierarchicalMenuItem`](utils.menu-hierarchy.md#hierarchicalmenuitem)

###### Returns

`void`

##### resetState()

> **resetState**: () => `void`

Defined in: [hooks/useMenuState.ts:55](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/frontend/src/hooks/useMenuState.ts#L55)

###### Returns

`void`

##### setActiveItem()

> **setActiveItem**: (`itemId`) => `void`

Defined in: [hooks/useMenuState.ts:42](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/frontend/src/hooks/useMenuState.ts#L42)

###### Parameters

###### itemId

`string` | `null`

###### Returns

`void`

##### setActiveItems()

> **setActiveItems**: (`itemIds`) => `void`

Defined in: [hooks/useMenuState.ts:43](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/frontend/src/hooks/useMenuState.ts#L43)

###### Parameters

###### itemIds

`string`[]

###### Returns

`void`

##### setAutoExpandActiveParents()

> **setAutoExpandActiveParents**: (`enabled`) => `void`

Defined in: [hooks/useMenuState.ts:50](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/frontend/src/hooks/useMenuState.ts#L50)

###### Parameters

###### enabled

`boolean`

###### Returns

`void`

##### setCollapsed()

> **setCollapsed**: (`collapsed`) => `void`

Defined in: [hooks/useMenuState.ts:49](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/frontend/src/hooks/useMenuState.ts#L49)

###### Parameters

###### collapsed

`boolean`

###### Returns

`void`

##### toggleExpansion()

> **toggleExpansion**: (`itemId`) => `void`

Defined in: [hooks/useMenuState.ts:35](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/frontend/src/hooks/useMenuState.ts#L35)

###### Parameters

###### itemId

`string`

###### Returns

`void`

## Functions

### useMenuState()

> **useMenuState**(`hierarchicalMenu?`): [`MenuState`](#menustate) & [`MenuStateActions`](#menustateactions)

Defined in: [hooks/useMenuState.ts:65](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/frontend/src/hooks/useMenuState.ts#L65)

#### Parameters

##### hierarchicalMenu?

[`HierarchicalMenuItem`](utils.menu-hierarchy.md#hierarchicalmenuitem)[] = `[]`

#### Returns

[`MenuState`](#menustate) & [`MenuStateActions`](#menustateactions)
