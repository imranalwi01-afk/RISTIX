[**Backend API Reference v1.0.0**](../../../README.md)

***

# Variable: logApproval

> `const` **logApproval**: `object`

Defined in: [src/services/audit.service.ts:355](https://github.com/ifrspro/ifrs9-iaf/blob/5a4b2221d62f9d823811e12bfc71b7ff82ae62fa/packages/new-backend/src/services/audit.service.ts#L355)

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
