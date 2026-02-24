[**Backend API Reference v1.0.0**](../../../README.md)

***

# Variable: logApproval

> `const` **logApproval**: `object`

Defined in: [src/services/audit.service.ts:355](https://github.com/ifrspro/ifrs9-iaf/blob/cf4905123c7eb3e9046f36ce3f92dd13536ac238/packages/new-backend/src/services/audit.service.ts#L355)

Log approval events

## Type Declaration

### approved()

> **approved**: (`requestId`, `title`, `approvedBy`, `tenantId`, `comment?`) => `Promise`\<`void`\>

#### Parameters

##### requestId

`string`

##### title

`string`

##### approvedBy

`string`

##### tenantId

`string`

##### comment?

`string`

#### Returns

`Promise`\<`void`\>

### rejected()

> **rejected**: (`requestId`, `title`, `rejectedBy`, `tenantId`, `reason?`) => `Promise`\<`void`\>

#### Parameters

##### requestId

`string`

##### title

`string`

##### rejectedBy

`string`

##### tenantId

`string`

##### reason?

`string`

#### Returns

`Promise`\<`void`\>

### requested()

> **requested**: (`requestId`, `title`, `requestedBy`, `tenantId`) => `Promise`\<`void`\>

#### Parameters

##### requestId

`string`

##### title

`string`

##### requestedBy

`string`

##### tenantId

`string`

#### Returns

`Promise`\<`void`\>
