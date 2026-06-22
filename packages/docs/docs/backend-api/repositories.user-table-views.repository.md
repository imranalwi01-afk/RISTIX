[**Backend API Reference v1.0.0**](index.md)

***

# repositories/user-table-views.repository

## Type Aliases

### UpsertUserTableViewInput

> **UpsertUserTableViewInput** = `object`

Defined in: [src/repositories/user-table-views.repository.ts:5](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/new-backend/src/repositories/user-table-views.repository.ts#L5)

#### Properties

##### isDefault?

> `optional` **isDefault?**: `boolean`

Defined in: [src/repositories/user-table-views.repository.ts:11](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/new-backend/src/repositories/user-table-views.repository.ts#L11)

##### name?

> `optional` **name?**: `string`

Defined in: [src/repositories/user-table-views.repository.ts:10](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/new-backend/src/repositories/user-table-views.repository.ts#L10)

##### scope

> **scope**: `string`

Defined in: [src/repositories/user-table-views.repository.ts:8](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/new-backend/src/repositories/user-table-views.repository.ts#L8)

##### state

> **state**: `Record`&lt;`string`, `unknown`&gt;

Defined in: [src/repositories/user-table-views.repository.ts:12](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/new-backend/src/repositories/user-table-views.repository.ts#L12)

##### tenantId

> **tenantId**: `string`

Defined in: [src/repositories/user-table-views.repository.ts:6](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/new-backend/src/repositories/user-table-views.repository.ts#L6)

##### userId

> **userId**: `string`

Defined in: [src/repositories/user-table-views.repository.ts:7](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/new-backend/src/repositories/user-table-views.repository.ts#L7)

##### viewKey

> **viewKey**: `string`

Defined in: [src/repositories/user-table-views.repository.ts:9](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/new-backend/src/repositories/user-table-views.repository.ts#L9)

## Variables

### UserTableViewsRepository

> `const` **UserTableViewsRepository**: `object`

Defined in: [src/repositories/user-table-views.repository.ts:45](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/new-backend/src/repositories/user-table-views.repository.ts#L45)

#### Type Declaration

##### list()

> **list**(`tenantId`, `userId`, `scope`): `Promise`&lt;`object`[]&gt;

###### Parameters

###### tenantId

`string`

###### userId

`string`

###### scope

`string`

###### Returns

`Promise`&lt;`object`[]&gt;

##### remove()

> **remove**(`tenantId`, `userId`, `scope`, `viewKey`): `Promise`&lt;&#123; `createdAt`: `Date` &#124; `null`; `id`: `string`; `isDefault`: `boolean`; `name`: `string` &#124; `null`; `scope`: `string`; `state`: `unknown`; `tenantId`: `string`; `updatedAt`: `Date` &#124; `null`; `userId`: `string`; `viewKey`: `string`; &#125;&gt;

###### Parameters

###### tenantId

`string`

###### userId

`string`

###### scope

`string`

###### viewKey

`string`

###### Returns

`Promise`&lt;&#123; `createdAt`: `Date` &#124; `null`; `id`: `string`; `isDefault`: `boolean`; `name`: `string` &#124; `null`; `scope`: `string`; `state`: `unknown`; `tenantId`: `string`; `updatedAt`: `Date` &#124; `null`; `userId`: `string`; `viewKey`: `string`; &#125;&gt;

##### upsert()

> **upsert**(`input`): `Promise`&lt;&#123; `createdAt`: `Date` &#124; `null`; `id`: `string`; `isDefault`: `boolean`; `name`: `string` &#124; `null`; `scope`: `string`; `state`: `unknown`; `tenantId`: `string`; `updatedAt`: `Date` &#124; `null`; `userId`: `string`; `viewKey`: `string`; &#125;&gt;

###### Parameters

###### input

[`UpsertUserTableViewInput`](#upsertusertableviewinput)

###### Returns

`Promise`&lt;&#123; `createdAt`: `Date` &#124; `null`; `id`: `string`; `isDefault`: `boolean`; `name`: `string` &#124; `null`; `scope`: `string`; `state`: `unknown`; `tenantId`: `string`; `updatedAt`: `Date` &#124; `null`; `userId`: `string`; `viewKey`: `string`; &#125;&gt;
