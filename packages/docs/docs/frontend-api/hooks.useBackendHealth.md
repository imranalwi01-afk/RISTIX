[**Frontend API Reference v1.0.0**](index.md)

***

# hooks/useBackendHealth

## Interfaces

### BackendHealth

Defined in: [hooks/useBackendHealth.ts:7](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/frontend/src/hooks/useBackendHealth.ts#L7)

#### Properties

##### checkNow()

> **checkNow**: () => `Promise`\<`void`\>

Defined in: [hooks/useBackendHealth.ts:12](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/frontend/src/hooks/useBackendHealth.ts#L12)

###### Returns

`Promise`\<`void`\>

##### error?

> `optional` **error**: `string`

Defined in: [hooks/useBackendHealth.ts:13](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/frontend/src/hooks/useBackendHealth.ts#L13)

##### isChecking

> **isChecking**: `boolean`

Defined in: [hooks/useBackendHealth.ts:11](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/frontend/src/hooks/useBackendHealth.ts#L11)

##### isOnline

> **isOnline**: `boolean`

Defined in: [hooks/useBackendHealth.ts:8](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/frontend/src/hooks/useBackendHealth.ts#L8)

##### lastChecked

> **lastChecked**: `Date` \| `null`

Defined in: [hooks/useBackendHealth.ts:10](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/frontend/src/hooks/useBackendHealth.ts#L10)

##### latency

> **latency**: `number` \| `null`

Defined in: [hooks/useBackendHealth.ts:9](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/frontend/src/hooks/useBackendHealth.ts#L9)

## Functions

### useBackendHealth()

> **useBackendHealth**(`pollingIntervalMs?`): [`BackendHealth`](#backendhealth)

Defined in: [hooks/useBackendHealth.ts:16](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/frontend/src/hooks/useBackendHealth.ts#L16)

#### Parameters

##### pollingIntervalMs?

`number` = `300000`

#### Returns

[`BackendHealth`](#backendhealth)
