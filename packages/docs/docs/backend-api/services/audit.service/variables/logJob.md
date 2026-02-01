[**Backend API Reference v1.0.0**](../../../README.md)

***

# Variable: logJob

> `const` **logJob**: `object`

Defined in: [packages/new-backend/src/services/audit.service.ts:285](https://github.com/ifrspro/ifrs9-iaf/blob/2c233b31171a451bb86daacd4389a961f1213deb/packages/new-backend/src/services/audit.service.ts#L285)

Log job events

## Type Declaration

### completed()

> **completed**: (`executionId`, `jobName`, `duration`, `tenantId`) => `Promise`\<`void`\>

#### Parameters

##### executionId

`string`

##### jobName

`string`

##### duration

`number`

##### tenantId

`string`

#### Returns

`Promise`\<`void`\>

### created()

> **created**: (`jobId`, `jobName`, `jobType`, `userId`, `tenantId`) => `Promise`\<`void`\>

#### Parameters

##### jobId

`string`

##### jobName

`string`

##### jobType

`string`

##### userId

`string`

##### tenantId

`string`

#### Returns

`Promise`\<`void`\>

### failed()

> **failed**: (`executionId`, `jobName`, `error`, `tenantId`) => `Promise`\<`void`\>

#### Parameters

##### executionId

`string`

##### jobName

`string`

##### error

`string`

##### tenantId

`string`

#### Returns

`Promise`\<`void`\>

### triggered()

> **triggered**: (`executionId`, `jobName`, `jobType`, `userId`, `tenantId`, `parameters?`) => `Promise`\<`void`\>

#### Parameters

##### executionId

`string`

##### jobName

`string`

##### jobType

`string`

##### userId

`string`

##### tenantId

`string`

##### parameters?

`any`

#### Returns

`Promise`\<`void`\>
