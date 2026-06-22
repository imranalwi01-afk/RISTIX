[**Frontend API Reference v1.0.0**](index.md)

***

# hooks/useLoginPrefetch

## Functions

### useLoginPrefetch()

> **useLoginPrefetch**(): `object`

Defined in: [hooks/useLoginPrefetch.ts:79](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/frontend/src/hooks/useLoginPrefetch.ts#L79)

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

> **warmupAPIs**: () => `Promise`&lt;`void`&gt;

###### Returns

`Promise`&lt;`void`&gt;

## References

### default

Renames and re-exports [useLoginPrefetch](#useloginprefetch)
