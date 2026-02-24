[**Backend API Reference v1.0.0**](../../../README.md)

***

# Variable: logDataChange

> `const` **logDataChange**: `object`

Defined in: [src/services/audit.service.ts:143](https://github.com/ifrspro/ifrs9-iaf/blob/cf4905123c7eb3e9046f36ce3f92dd13536ac238/packages/new-backend/src/services/audit.service.ts#L143)

Log data modification events

## Type Declaration

### create()

> **create**: (`resource`, `resourceId`, `newValues`, `userId`, `tenantId`) => `Promise`\<`void`\>

#### Parameters

##### resource

`string`

##### resourceId

`string`

##### newValues

`any`

##### userId

`string`

##### tenantId

`string`

#### Returns

`Promise`\<`void`\>

### delete()

> **delete**: (`resource`, `resourceId`, `oldValues`, `userId`, `tenantId`) => `Promise`\<`void`\>

#### Parameters

##### resource

`string`

##### resourceId

`string`

##### oldValues

`any`

##### userId

`string`

##### tenantId

`string`

#### Returns

`Promise`\<`void`\>

### update()

> **update**: (`resource`, `resourceId`, `oldValues`, `newValues`, `userId`, `tenantId`) => `Promise`\<`void`\>

#### Parameters

##### resource

`string`

##### resourceId

`string`

##### oldValues

`any`

##### newValues

`any`

##### userId

`string`

##### tenantId

`string`

#### Returns

`Promise`\<`void`\>
