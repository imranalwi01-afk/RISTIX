[**Frontend API Reference v1.0.0**](index.md)

***

# hooks/useSavedFilters

## Interfaces

### SavedFilter

Defined in: [hooks/useSavedFilters.ts:10](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/frontend/src/hooks/useSavedFilters.ts#L10)

#### Properties

##### createdAt

> **createdAt**: `string`

Defined in: [hooks/useSavedFilters.ts:14](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/frontend/src/hooks/useSavedFilters.ts#L14)

##### filters

> **filters**: `Record`\<`string`, `any`\>

Defined in: [hooks/useSavedFilters.ts:13](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/frontend/src/hooks/useSavedFilters.ts#L13)

##### id

> **id**: `string`

Defined in: [hooks/useSavedFilters.ts:11](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/frontend/src/hooks/useSavedFilters.ts#L11)

##### name

> **name**: `string`

Defined in: [hooks/useSavedFilters.ts:12](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/frontend/src/hooks/useSavedFilters.ts#L12)

##### updatedAt

> **updatedAt**: `string`

Defined in: [hooks/useSavedFilters.ts:15](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/frontend/src/hooks/useSavedFilters.ts#L15)

***

### UseSavedFiltersOptions

Defined in: [hooks/useSavedFilters.ts:18](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/frontend/src/hooks/useSavedFilters.ts#L18)

#### Properties

##### maxSavedFilters?

> `optional` **maxSavedFilters**: `number`

Defined in: [hooks/useSavedFilters.ts:20](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/frontend/src/hooks/useSavedFilters.ts#L20)

##### storageKey

> **storageKey**: `string`

Defined in: [hooks/useSavedFilters.ts:19](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/frontend/src/hooks/useSavedFilters.ts#L19)

## Functions

### useSavedFilters()

> **useSavedFilters**(`options`): `object`

Defined in: [hooks/useSavedFilters.ts:23](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/frontend/src/hooks/useSavedFilters.ts#L23)

#### Parameters

##### options

[`UseSavedFiltersOptions`](#usesavedfiltersoptions)

#### Returns

`object`

##### clearAllFilters()

> **clearAllFilters**: () => `void`

###### Returns

`void`

##### deleteFilter()

> **deleteFilter**: (`id`) => `void`

###### Parameters

###### id

`string`

###### Returns

`void`

##### loadFilter()

> **loadFilter**: (`id`) => [`SavedFilter`](#savedfilter) \| `undefined`

###### Parameters

###### id

`string`

###### Returns

[`SavedFilter`](#savedfilter) \| `undefined`

##### loading

> **loading**: `boolean`

##### savedFilters

> **savedFilters**: [`SavedFilter`](#savedfilter)[]

##### saveFilter()

> **saveFilter**: (`name`, `filterData`) => [`SavedFilter`](#savedfilter)

###### Parameters

###### name

`string`

###### filterData

`Record`\<`string`, `any`\>

###### Returns

[`SavedFilter`](#savedfilter)

##### updateFilter()

> **updateFilter**: (`id`, `name`, `filterData`) => `void`

###### Parameters

###### id

`string`

###### name

`string`

###### filterData

`Record`\<`string`, `any`\>

###### Returns

`void`
