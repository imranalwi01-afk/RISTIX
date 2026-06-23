[**Backend API Reference v1.0.0**](index.md)

***

# services/tenants.service

## Interfaces

### CreateTenantInput

Defined in: [src/services/tenants.service.ts:11](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/new-backend/src/services/tenants.service.ts#L11)

#### Properties

##### bankingMode?

> `optional` **bankingMode?**: `string`

Defined in: [src/services/tenants.service.ts:17](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/new-backend/src/services/tenants.service.ts#L17)

##### code

> **code**: `string`

Defined in: [src/services/tenants.service.ts:12](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/new-backend/src/services/tenants.service.ts#L12)

##### description?

> `optional` **description?**: `string`

Defined in: [src/services/tenants.service.ts:15](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/new-backend/src/services/tenants.service.ts#L15)

##### name

> **name**: `string`

Defined in: [src/services/tenants.service.ts:13](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/new-backend/src/services/tenants.service.ts#L13)

##### settings?

> `optional` **settings?**: `Record`&lt;`string`, `unknown`&gt;

Defined in: [src/services/tenants.service.ts:18](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/new-backend/src/services/tenants.service.ts#L18)

##### slug?

> `optional` **slug?**: `string`

Defined in: [src/services/tenants.service.ts:14](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/new-backend/src/services/tenants.service.ts#L14)

##### type?

> `optional` **type?**: `string`

Defined in: [src/services/tenants.service.ts:16](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/new-backend/src/services/tenants.service.ts#L16)

***

### UpdateTenantInput

Defined in: [src/services/tenants.service.ts:21](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/new-backend/src/services/tenants.service.ts#L21)

#### Properties

##### bankingMode?

> `optional` **bankingMode?**: `string`

Defined in: [src/services/tenants.service.ts:24](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/new-backend/src/services/tenants.service.ts#L24)

##### description?

> `optional` **description?**: `string`

Defined in: [src/services/tenants.service.ts:23](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/new-backend/src/services/tenants.service.ts#L23)

##### isActive?

> `optional` **isActive?**: `boolean`

Defined in: [src/services/tenants.service.ts:26](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/new-backend/src/services/tenants.service.ts#L26)

##### name?

> `optional` **name?**: `string`

Defined in: [src/services/tenants.service.ts:22](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/new-backend/src/services/tenants.service.ts#L22)

##### settings?

> `optional` **settings?**: `Record`&lt;`string`, `unknown`&gt;

Defined in: [src/services/tenants.service.ts:25](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/new-backend/src/services/tenants.service.ts#L25)

## Functions

### createTenant()

> **createTenant**(`input`): `Effect`&lt;&#123; `bankingMode`: `string` &#124; `null`; `code`: `string`; `createdAt`: `Date`; `description`: `string` &#124; `null`; `id`: `string`; `isActive`: `boolean`; `name`: `string`; `settings`: `unknown`; `slug`: `string` &#124; `null`; `type`: `string` &#124; `null`; `updatedAt`: `Date`; &#125;, [`DatabaseError`](lib.errors.md#databaseerror) &#124; [`ValidationError`](lib.errors.md#validationerror)&gt;

Defined in: [src/services/tenants.service.ts:104](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/new-backend/src/services/tenants.service.ts#L104)

Create a new tenant

#### Parameters

##### input

[`CreateTenantInput`](#createtenantinput)

#### Returns

`Effect`&lt;&#123; `bankingMode`: `string` &#124; `null`; `code`: `string`; `createdAt`: `Date`; `description`: `string` &#124; `null`; `id`: `string`; `isActive`: `boolean`; `name`: `string`; `settings`: `unknown`; `slug`: `string` &#124; `null`; `type`: `string` &#124; `null`; `updatedAt`: `Date`; &#125;, [`DatabaseError`](lib.errors.md#databaseerror) &#124; [`ValidationError`](lib.errors.md#validationerror)&gt;

***

### deleteTenant()

> **deleteTenant**(`id`): `Effect`&lt;`void`, [`DatabaseError`](lib.errors.md#databaseerror) &#124; [`NotFoundError`](lib.errors.md#notfounderror)&gt;

Defined in: [src/services/tenants.service.ts:156](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/new-backend/src/services/tenants.service.ts#L156)

Delete a tenant (soft delete)

#### Parameters

##### id

`string`

#### Returns

`Effect`&lt;`void`, [`DatabaseError`](lib.errors.md#databaseerror) &#124; [`NotFoundError`](lib.errors.md#notfounderror)&gt;

***

### disableTenant()

> **disableTenant**(`id`): `Effect`&lt;`void`, [`DatabaseError`](lib.errors.md#databaseerror), `never`&gt;

Defined in: [src/services/tenants.service.ts:176](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/new-backend/src/services/tenants.service.ts#L176)

Disable a tenant

#### Parameters

##### id

`string`

#### Returns

`Effect`&lt;`void`, [`DatabaseError`](lib.errors.md#databaseerror), `never`&gt;

***

### enableTenant()

> **enableTenant**(`id`): `Effect`&lt;`void`, [`DatabaseError`](lib.errors.md#databaseerror), `never`&gt;

Defined in: [src/services/tenants.service.ts:167](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/new-backend/src/services/tenants.service.ts#L167)

Enable a tenant

#### Parameters

##### id

`string`

#### Returns

`Effect`&lt;`void`, [`DatabaseError`](lib.errors.md#databaseerror), `never`&gt;

***

### getTenantByCode()

> **getTenantByCode**(`code`): `Effect`&lt;&#123; `bankingMode`: `string` &#124; `null`; `code`: `string`; `createdAt`: `Date`; `description`: `string` &#124; `null`; `id`: `string`; `isActive`: `boolean`; `name`: `string`; `settings`: `string` &#124; `null`; `slug`: `string` &#124; `null`; `type`: `string` &#124; `null`; `updatedAt`: `Date`; &#125;, [`DatabaseError`](lib.errors.md#databaseerror), `never`&gt;

Defined in: [src/services/tenants.service.ts:76](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/new-backend/src/services/tenants.service.ts#L76)

Get tenant by code

#### Parameters

##### code

`string`

#### Returns

`Effect`&lt;&#123; `bankingMode`: `string` &#124; `null`; `code`: `string`; `createdAt`: `Date`; `description`: `string` &#124; `null`; `id`: `string`; `isActive`: `boolean`; `name`: `string`; `settings`: `string` &#124; `null`; `slug`: `string` &#124; `null`; `type`: `string` &#124; `null`; `updatedAt`: `Date`; &#125;, [`DatabaseError`](lib.errors.md#databaseerror), `never`&gt;

***

### getTenantById()

> **getTenantById**(`id`): `Effect`&lt;&#123; `bankingMode`: `string` &#124; `null`; `code`: `string`; `createdAt`: `Date`; `description`: `string` &#124; `null`; `id`: `string`; `isActive`: `boolean`; `name`: `string`; `settings`: `string` &#124; `null`; `slug`: `string` &#124; `null`; `type`: `string` &#124; `null`; `updatedAt`: `Date`; &#125; &#124; `undefined`, [`DatabaseError`](lib.errors.md#databaseerror), `never`&gt;

Defined in: [src/services/tenants.service.ts:64](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/new-backend/src/services/tenants.service.ts#L64)

Get tenant by ID

#### Parameters

##### id

`string`

#### Returns

`Effect`&lt;&#123; `bankingMode`: `string` &#124; `null`; `code`: `string`; `createdAt`: `Date`; `description`: `string` &#124; `null`; `id`: `string`; `isActive`: `boolean`; `name`: `string`; `settings`: `string` &#124; `null`; `slug`: `string` &#124; `null`; `type`: `string` &#124; `null`; `updatedAt`: `Date`; &#125; &#124; `undefined`, [`DatabaseError`](lib.errors.md#databaseerror), `never`&gt;

***

### getTenantBySlug()

> **getTenantBySlug**(`slug`): `Effect`&lt;&#123; `bankingMode`: `string` &#124; `null`; `code`: `string`; `createdAt`: `Date`; `description`: `string` &#124; `null`; `id`: `string`; `isActive`: `boolean`; `name`: `string`; `settings`: `string` &#124; `null`; `slug`: `string` &#124; `null`; `type`: `string` &#124; `null`; `updatedAt`: `Date`; &#125;, [`DatabaseError`](lib.errors.md#databaseerror), `never`&gt;

Defined in: [src/services/tenants.service.ts:88](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/new-backend/src/services/tenants.service.ts#L88)

Get tenant by slug

#### Parameters

##### slug

`string`

#### Returns

`Effect`&lt;&#123; `bankingMode`: `string` &#124; `null`; `code`: `string`; `createdAt`: `Date`; `description`: `string` &#124; `null`; `id`: `string`; `isActive`: `boolean`; `name`: `string`; `settings`: `string` &#124; `null`; `slug`: `string` &#124; `null`; `type`: `string` &#124; `null`; `updatedAt`: `Date`; &#125;, [`DatabaseError`](lib.errors.md#databaseerror), `never`&gt;

***

### getTenants()

> **getTenants**(`options?`): `Effect`&lt;&#123; `data`: `object`[]; `total`: `number`; &#125;, [`DatabaseError`](lib.errors.md#databaseerror), `never`&gt;

Defined in: [src/services/tenants.service.ts:38](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/new-backend/src/services/tenants.service.ts#L38)

Get all tenants with pagination
Note: By default, this should exclude the 'system' tenant to prevent confusing regular users.
Platform admins can request it explicitly via specific filter if needed.

#### Parameters

##### options?

`any`

#### Returns

`Effect`&lt;&#123; `data`: `object`[]; `total`: `number`; &#125;, [`DatabaseError`](lib.errors.md#databaseerror), `never`&gt;

***

### updateTenant()

> **updateTenant**(`id`, `input`): `Effect`&lt;&#123; `bankingMode`: `string` &#124; `null`; `code`: `string`; `createdAt`: `Date`; `description`: `string` &#124; `null`; `id`: `string`; `isActive`: `boolean`; `name`: `string`; `settings`: `unknown`; `slug`: `string` &#124; `null`; `type`: `string` &#124; `null`; `updatedAt`: `Date`; &#125;, [`DatabaseError`](lib.errors.md#databaseerror) &#124; [`NotFoundError`](lib.errors.md#notfounderror)&gt;

Defined in: [src/services/tenants.service.ts:144](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/new-backend/src/services/tenants.service.ts#L144)

Update a tenant

#### Parameters

##### id

`string`

##### input

[`UpdateTenantInput`](#updatetenantinput)

#### Returns

`Effect`&lt;&#123; `bankingMode`: `string` &#124; `null`; `code`: `string`; `createdAt`: `Date`; `description`: `string` &#124; `null`; `id`: `string`; `isActive`: `boolean`; `name`: `string`; `settings`: `unknown`; `slug`: `string` &#124; `null`; `type`: `string` &#124; `null`; `updatedAt`: `Date`; &#125;, [`DatabaseError`](lib.errors.md#databaseerror) &#124; [`NotFoundError`](lib.errors.md#notfounderror)&gt;
