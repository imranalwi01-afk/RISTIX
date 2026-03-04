[**Frontend API Reference v1.0.0**](../../../README.md)

***

# Function: useLoginPrefetch()

> **useLoginPrefetch**(): `object`

Defined in: [hooks/useLoginPrefetch.ts:79](https://github.com/ifrspro/ifrs9-iaf/blob/2301badfc5ea65510b50f0438f532e45a5ab486b/packages/frontend/src/hooks/useLoginPrefetch.ts#L79)

Hook to prefetch resources during login page load
This reduces the time to navigate after successful login

## Returns

`object`

### prefetchRoute()

> **prefetchRoute**: (`route`) => `void`

#### Parameters

##### route

`string`

#### Returns

`void`

### prefetchRoutes()

> **prefetchRoutes**: () => `void`

#### Returns

`void`

### warmupAPIs()

> **warmupAPIs**: () => `Promise`\<`void`\>

#### Returns

`Promise`\<`void`\>
