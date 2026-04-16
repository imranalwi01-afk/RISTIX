[**Frontend API Reference v1.0.0**](index.md)

***

# hooks/useLoginPrefetch

## Functions

### useLoginPrefetch()

> **useLoginPrefetch**(): `object`

Defined in: [hooks/useLoginPrefetch.ts:79](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/frontend/src/hooks/useLoginPrefetch.ts#L79)

Hook to prefetch resources during login page load
This reduces the time to navigate after successful login

#### Returns

`object`

##### prefetchRoute()

> **prefetchRoute**: (`route`) => `void`

###### Parameters

###### route

`string`

###### Returns

`void`

##### prefetchRoutes()

> **prefetchRoutes**: () => `void`

###### Returns

`void`

##### warmupAPIs()

> **warmupAPIs**: () => `Promise`\<`void`\>

###### Returns

`Promise`\<`void`\>

## References

### default

Renames and re-exports [useLoginPrefetch](#useloginprefetch)
