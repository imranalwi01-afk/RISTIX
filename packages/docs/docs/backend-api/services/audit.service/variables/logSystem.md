[**Backend API Reference v1.0.0**](../../../README.md)

***

# Variable: logSystem

> `const` **logSystem**: `object`

Defined in: [packages/new-backend/src/services/audit.service.ts:421](https://github.com/ifrspro/ifrs9-iaf/blob/2c233b31171a451bb86daacd4389a961f1213deb/packages/new-backend/src/services/audit.service.ts#L421)

Log system events

## Type Declaration

### backupCreated()

> **backupCreated**: (`backupId`, `userId`, `tenantId`) => `Promise`\<`void`\>

#### Parameters

##### backupId

`string`

##### userId

`string`

##### tenantId

`string`

#### Returns

`Promise`\<`void`\>

### configChanged()

> **configChanged**: (`configKey`, `oldValue`, `newValue`, `userId`, `tenantId`) => `Promise`\<`void`\>

#### Parameters

##### configKey

`string`

##### oldValue

`any`

##### newValue

`any`

##### userId

`string`

##### tenantId

`string`

#### Returns

`Promise`\<`void`\>
