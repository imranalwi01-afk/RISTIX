[**Backend API Reference v1.0.0**](index.md)

***

# services/parameters.service

## Variables

### ParametersService

> `const` **ParametersService**: `object`

Defined in: [src/services/parameters.service.ts:13](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/services/parameters.service.ts#L13)

Service for managing Application and Business parameters.
Handles CRUD operations for parameters and metadata.

#### Type Declaration

##### createAppSetting()

> **createAppSetting**: (`data`, `userId`) => `Effect`\<\{ `banking_type`: `any`; `created_date`: `any`; `details`: `any`; `is_active`: `any`; `param_code`: `any`; `param_name`: `any`; `param_type`: `any`; `param_usage`: `any`; `pkid`: `number`; `requires_approval`: `any`; \}, `unknown`, `unknown`\>

Create a new app setting.

###### Parameters

###### data

`any`

The setting data

###### userId

`string`

The ID of the user creating the setting

###### Returns

`Effect`\<\{ `banking_type`: `any`; `created_date`: `any`; `details`: `any`; `is_active`: `any`; `param_code`: `any`; `param_name`: `any`; `param_type`: `any`; `param_usage`: `any`; `pkid`: `number`; `requires_approval`: `any`; \}, `unknown`, `unknown`\>

An Effect resolving to the created setting header

##### createAppSettingDetail()

> **createAppSettingDetail**: (`data`, `userId`) => `Effect`\<\{ `id`: `number`; `is_active`: `boolean`; `param_code`: `string`; `param_desc`: `string` \| `null`; `param_seq`: `number`; `value1`: `string`; `value2`: `string`; `value3`: `string`; \}, `unknown`, `unknown`\>

Create a new detail for an app setting.

###### Parameters

###### data

`any`

The detail data

###### userId

`string`

The ID of the user creating the detail

###### Returns

`Effect`\<\{ `id`: `number`; `is_active`: `boolean`; `param_code`: `string`; `param_desc`: `string` \| `null`; `param_seq`: `number`; `value1`: `string`; `value2`: `string`; `value3`: `string`; \}, `unknown`, `unknown`\>

An Effect resolving to the created detail

###### Throws

NotFoundError if the parent setting is not found

##### deleteAppSetting()

> **deleteAppSetting**: (`code`) => `Effect`\<`unknown`, `unknown`, `unknown`\>

Delete an app setting header.

###### Parameters

###### code

`string`

The parameter code

###### Returns

`Effect`\<`unknown`, `unknown`, `unknown`\>

An Effect resolving to a success message

###### Throws

NotFoundError if the setting is not found

##### deleteAppSettingDetail()

> **deleteAppSettingDetail**: (`id`) => `Effect`\<`unknown`, `unknown`, `unknown`\>

Delete an app setting detail.

###### Parameters

###### id

`number`

The ID of the detail to delete

###### Returns

`Effect`\<`unknown`, `unknown`, `unknown`\>

An Effect resolving to a success message

###### Throws

NotFoundError if the detail is not found

##### getAppSetting()

> **getAppSetting**: (`code`) => `Effect`\<`unknown`, `unknown`, `unknown`\>

Get a specific app setting by code.

###### Parameters

###### code

`string`

The parameter code

###### Returns

`Effect`\<`unknown`, `unknown`, `unknown`\>

An Effect resolving to the parameter header

###### Throws

NotFoundError if the setting is not found

##### getAppSettingDetail()

> **getAppSettingDetail**: (`id`) => `Effect`\<`unknown`, `unknown`, `unknown`\>

Get a specific app/business setting detail by ID.

###### Parameters

###### id

`number`

The detail ID

###### Returns

`Effect`\<`unknown`, `unknown`, `unknown`\>

An Effect resolving to the parameter detail

###### Throws

NotFoundError if the detail is not found

##### getAppSettingDetails()

> **getAppSettingDetails**: (`code`) => `Effect`\<`object`[], [`DatabaseError`](lib.errors.md#databaseerror), `never`\>

Get details for a specific app setting.

###### Parameters

###### code

`string`

The parameter code

###### Returns

`Effect`\<`object`[], [`DatabaseError`](lib.errors.md#databaseerror), `never`\>

An Effect resolving to an array of parameter details

##### getColumns()

> **getColumns**: (`table`) => `Effect`\<`string`[], [`DatabaseError`](lib.errors.md#databaseerror), `never`\>

Get list of columns for a specific table (metadata: B0013).

###### Parameters

###### table

`string`

The table name

###### Returns

`Effect`\<`string`[], [`DatabaseError`](lib.errors.md#databaseerror), `never`\>

An Effect resolving to an array of column names

##### getColumnValues()

> **getColumnValues**: (`table`, `column`) => `Effect`\<`string`[], [`DatabaseError`](lib.errors.md#databaseerror), `never`\>

Get list of valid values for a column (metadata: B0016).

###### Parameters

###### table

`string`

The table name

###### column

`string`

The column name

###### Returns

`Effect`\<`string`[], [`DatabaseError`](lib.errors.md#databaseerror), `never`\>

An Effect resolving to an array of valid values

##### getConditions()

> **getConditions**: () => `Effect`\<`string`[], [`DatabaseError`](lib.errors.md#databaseerror), `never`\>

Get list of conditions (metadata: B0015).

###### Returns

`Effect`\<`string`[], [`DatabaseError`](lib.errors.md#databaseerror), `never`\>

An Effect resolving to an array of conditions

##### getDataType()

> **getDataType**: (`table`, `column`) => `Effect`\<`string` \| `null`, [`DatabaseError`](lib.errors.md#databaseerror), `never`\>

Get data type for a specific column (metadata: B0013).

###### Parameters

###### table

`string`

The table name

###### column

`string`

The column name

###### Returns

`Effect`\<`string` \| `null`, [`DatabaseError`](lib.errors.md#databaseerror), `never`\>

An Effect resolving to the data type or null

##### getOperators()

> **getOperators**: (`dataType`) => `Effect`\<`string`[], [`DatabaseError`](lib.errors.md#databaseerror), `never`\>

Get list of operators for a specific data type (metadata: B0014).

###### Parameters

###### dataType

`string`

The data type

###### Returns

`Effect`\<`string`[], [`DatabaseError`](lib.errors.md#databaseerror), `never`\>

An Effect resolving to an array of operators

##### getTables()

> **getTables**: () => `Effect`\<`string`[], [`DatabaseError`](lib.errors.md#databaseerror), `never`\>

Get list of distinct tables (metadata: B0012).

###### Returns

`Effect`\<`string`[], [`DatabaseError`](lib.errors.md#databaseerror), `never`\>

An Effect resolving to an array of table names

##### listAppSettings()

> **listAppSettings**: (`code?`, `paramType`) => `Effect`\<`object`[], [`DatabaseError`](lib.errors.md#databaseerror), `never`\>

List application settings (parameters).

###### Parameters

###### code?

`string`

Optional parameter code to filter by

###### paramType?

Parameter type filter (default 'S' for System)

`string` | `string`[]

###### Returns

`Effect`\<`object`[], [`DatabaseError`](lib.errors.md#databaseerror), `never`\>

An Effect resolving to an array of parameter headers

##### listBusinessSettings()

> **listBusinessSettings**: (`code?`) => `Effect`\<`object`[], [`DatabaseError`](lib.errors.md#databaseerror), `never`\> \| `Effect`\<`object`[], [`DatabaseError`](lib.errors.md#databaseerror), `never`\>

List business settings or get details for a specific setting.

###### Parameters

###### code?

`string`

Optional parameter code to filter by (if provided, returns details)

###### Returns

`Effect`\<`object`[], [`DatabaseError`](lib.errors.md#databaseerror), `never`\> \| `Effect`\<`object`[], [`DatabaseError`](lib.errors.md#databaseerror), `never`\>

An Effect resolving to an array of details or success

##### updateAppSetting()

> **updateAppSetting**: (`code`, `data`, `userId`) => `Effect`\<`unknown`, `unknown`, `unknown`\>

Update an existing app setting.

###### Parameters

###### code

`string`

The parameter code

###### data

`any`

The data to update

###### userId

`string`

The ID of the user updating the setting

###### Returns

`Effect`\<`unknown`, `unknown`, `unknown`\>

An Effect resolving to the updated setting header

###### Throws

NotFoundError if the setting is not found

##### updateAppSettingDetail()

> **updateAppSettingDetail**: (`id`, `data`, `userId`) => `Effect`\<`unknown`, `unknown`, `unknown`\>

Update an app setting detail.

###### Parameters

###### id

`number`

The ID of the detail

###### data

`any`

The data to update

###### userId

`string`

The ID of the user updating the detail

###### Returns

`Effect`\<`unknown`, `unknown`, `unknown`\>

An Effect resolving to the updated detail
