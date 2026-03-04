[**Frontend API Reference v1.0.0**](../../../README.md)

***

# Function: useSavedFilters()

> **useSavedFilters**(`options`): `object`

Defined in: [hooks/useSavedFilters.ts:19](https://github.com/ifrspro/ifrs9-iaf/blob/2301badfc5ea65510b50f0438f532e45a5ab486b/packages/frontend/src/hooks/useSavedFilters.ts#L19)

## Parameters

### options

`UseSavedFiltersOptions`

## Returns

`object`

### clearAllFilters()

> **clearAllFilters**: () => `void`

#### Returns

`void`

### deleteFilter()

> **deleteFilter**: (`id`) => `void`

#### Parameters

##### id

`string`

#### Returns

`void`

### loadFilter()

> **loadFilter**: (`id`) => [`SavedFilter`](../interfaces/SavedFilter.md) \| `undefined`

#### Parameters

##### id

`string`

#### Returns

[`SavedFilter`](../interfaces/SavedFilter.md) \| `undefined`

### loading

> **loading**: `boolean`

### savedFilters

> **savedFilters**: [`SavedFilter`](../interfaces/SavedFilter.md)[]

### saveFilter()

> **saveFilter**: (`name`, `filterData`) => [`SavedFilter`](../interfaces/SavedFilter.md)

#### Parameters

##### name

`string`

##### filterData

`Record`\<`string`, `any`\>

#### Returns

[`SavedFilter`](../interfaces/SavedFilter.md)

### updateFilter()

> **updateFilter**: (`id`, `name`, `filterData`) => `void`

#### Parameters

##### id

`string`

##### name

`string`

##### filterData

`Record`\<`string`, `any`\>

#### Returns

`void`
