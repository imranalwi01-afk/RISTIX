[**Backend API Reference v1.0.0**](../../../README.md)

***

# Variable: logDataChange

> `const` **logDataChange**: `object`

Defined in: [src/services/audit.service.ts:143](https://github.com/ifrspro/ifrs9-iaf/blob/5a4b2221d62f9d823811e12bfc71b7ff82ae62fa/packages/new-backend/src/services/audit.service.ts#L143)

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
