[**Backend API Reference v1.0.0**](../../../README.md)

***

# Variable: logAuth

> `const` **logAuth**: `object`

Defined in: [packages/new-backend/src/services/audit.service.ts:89](https://github.com/ifrspro/ifrs9-iaf/blob/2c233b31171a451bb86daacd4389a961f1213deb/packages/new-backend/src/services/audit.service.ts#L89)

Log authentication events

## Type Declaration

### login()

> **login**: (`userId`, `tenantId`, `ipAddress?`, `userAgent?`) => `Promise`\<`void`\>

#### Parameters

##### userId

`string`

##### tenantId

`string`

##### ipAddress?

`string`

##### userAgent?

`string`

#### Returns

`Promise`\<`void`\>

### loginFailed()

> **loginFailed**: (`email`, `tenantId?`, `ipAddress?`, `reason?`) => `Promise`\<`void`\>

#### Parameters

##### email

`string`

##### tenantId?

`string`

##### ipAddress?

`string`

##### reason?

`string`

#### Returns

`Promise`\<`void`\>

### logout()

> **logout**: (`userId`, `tenantId`, `ipAddress?`) => `Promise`\<`void`\>

#### Parameters

##### userId

`string`

##### tenantId

`string`

##### ipAddress?

`string`

#### Returns

`Promise`\<`void`\>

### sessionExpired()

> **sessionExpired**: (`userId`, `tenantId`) => `Promise`\<`void`\>

#### Parameters

##### userId

`string`

##### tenantId

`string`

#### Returns

`Promise`\<`void`\>
