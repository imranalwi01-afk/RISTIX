[**Backend API Reference v1.0.0**](../../../README.md)

***

# Variable: logSystem

> `const` **logSystem**: `object`

Defined in: [src/services/audit.service.ts:421](https://github.com/ifrspro/ifrs9-iaf/blob/5a4b2221d62f9d823811e12bfc71b7ff82ae62fa/packages/new-backend/src/services/audit.service.ts#L421)

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
