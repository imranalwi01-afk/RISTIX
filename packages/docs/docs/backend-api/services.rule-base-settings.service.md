[**Backend API Reference v1.0.0**](index.md)

***

# services/rule-base-settings.service

## Variables

### RuleBaseSettingsService

> `const` **RuleBaseSettingsService**: `object`

Defined in: [src/services/rule-base-settings.service.ts:7](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/services/rule-base-settings.service.ts#L7)

#### Type Declaration

##### createDetail()

> **createDetail**: (`ruleId`, `data`, `userId`) => `Effect`{`<`}{`{`} `column_name`: `string`; `condition`: `string` {`|`} `null`; `created_by`: `string`; `created_date`: `string`; `data_type`: `string`; `detail_type`: `string` {`|`} `null`; `id`: `number`; `operator`: `string` {`|`} `null`; `query_group`: `number` {`|`} `null`; `rule_id`: `number` {`|`} `null`; `seq`: `number` {`|`} `null`; `stage_from`: `string` {`|`} `null`; `stage_to`: `string` {`|`} `null`; `table_name`: `string`; `updated_by`: `string` {`|`} `null`; `updated_date`: `string` {`|`} `null`; `value1`: `string`; `value2`: `string` {`|`} `null`; {`}`}, [`DatabaseError`](lib.errors.md#databaseerror), `never`{`>`}

Create a new rule detail.

###### Parameters

###### ruleId

`number`

The rule header ID

###### data

`any`

The detail data

###### userId

`string`

The ID of the user creating the detail

###### Returns

`Effect`{`<`}{`{`} `column_name`: `string`; `condition`: `string` {`|`} `null`; `created_by`: `string`; `created_date`: `string`; `data_type`: `string`; `detail_type`: `string` {`|`} `null`; `id`: `number`; `operator`: `string` {`|`} `null`; `query_group`: `number` {`|`} `null`; `rule_id`: `number` {`|`} `null`; `seq`: `number` {`|`} `null`; `stage_from`: `string` {`|`} `null`; `stage_to`: `string` {`|`} `null`; `table_name`: `string`; `updated_by`: `string` {`|`} `null`; `updated_date`: `string` {`|`} `null`; `value1`: `string`; `value2`: `string` {`|`} `null`; {`}`}, [`DatabaseError`](lib.errors.md#databaseerror), `never`{`>`}

An Effect resolving to the created detail

##### createHeader()

> **createHeader**: (`data`, `userId`) => `Effect`{`<`}{`{`} `active_flag`: `boolean` {`|`} `null`; `created_by`: `string`; `created_date`: `string`; `id`: `number`; `rule_name`: `string`; `rule_type`: `string`; `seq`: `number` {`|`} `null`; `updated_by`: `string` {`|`} `null`; `updated_column`: `string` {`|`} `null`; `updated_date`: `string` {`|`} `null`; `updated_table`: `string` {`|`} `null`; `value`: `string` {`|`} `null`; {`}`}, [`DatabaseError`](lib.errors.md#databaseerror), `never`{`>`}

Create a new rule header.

###### Parameters

###### data

`any`

The header data

###### userId

`string`

The ID of the user creating the header

###### Returns

`Effect`{`<`}{`{`} `active_flag`: `boolean` {`|`} `null`; `created_by`: `string`; `created_date`: `string`; `id`: `number`; `rule_name`: `string`; `rule_type`: `string`; `seq`: `number` {`|`} `null`; `updated_by`: `string` {`|`} `null`; `updated_column`: `string` {`|`} `null`; `updated_date`: `string` {`|`} `null`; `updated_table`: `string` {`|`} `null`; `value`: `string` {`|`} `null`; {`}`}, [`DatabaseError`](lib.errors.md#databaseerror), `never`{`>`}

An Effect resolving to the created header

##### deleteDetail()

> **deleteDetail**: (`id`) => `Effect`{`<`}{`{`} `message`: `string`; {`}`}, [`DatabaseError`](lib.errors.md#databaseerror) {`|`} [`NotFoundError`](lib.errors.md#notfounderror), `never`{`>`}

Delete a rule detail.

###### Parameters

###### id

`number`

The detail ID

###### Returns

`Effect`{`<`}{`{`} `message`: `string`; {`}`}, [`DatabaseError`](lib.errors.md#databaseerror) {`|`} [`NotFoundError`](lib.errors.md#notfounderror), `never`{`>`}

An Effect resolving to a success message or NotFoundError

##### deleteHeader()

> **deleteHeader**: (`id`) => `Effect`{`<`}{`{`} `message`: `string`; {`}`}, [`DatabaseError`](lib.errors.md#databaseerror), `never`{`>`}

Delete a rule header.

###### Parameters

###### id

`number`

The header ID

###### Returns

`Effect`{`<`}{`{`} `message`: `string`; {`}`}, [`DatabaseError`](lib.errors.md#databaseerror), `never`{`>`}

An Effect resolving to a success message

##### getConditions()

> **getConditions**: () => `Effect`{`<`}`object`[], `never`, `never`{`>`}

Get available conditions (AND/OR).

###### Returns

`Effect`{`<`}`object`[], `never`, `never`{`>`}

##### getDetail()

> **getDetail**: (`id`) => `Effect`{`<`}{`{`} `column_name`: `string`; `condition`: `string` {`|`} `null`; `created_by`: `string`; `created_date`: `string`; `data_type`: `string`; `detail_type`: `string` {`|`} `null`; `id`: `number`; `operator`: `string` {`|`} `null`; `query_group`: `number` {`|`} `null`; `rule_id`: `number` {`|`} `null`; `seq`: `number` {`|`} `null`; `stage_from`: `string` {`|`} `null`; `stage_to`: `string` {`|`} `null`; `table_name`: `string`; `updated_by`: `string` {`|`} `null`; `updated_date`: `string` {`|`} `null`; `value1`: `string`; `value2`: `string` {`|`} `null`; {`}`}, [`DatabaseError`](lib.errors.md#databaseerror) {`|`} [`NotFoundError`](lib.errors.md#notfounderror), `never`{`>`}

Get a rule detail by ID.

###### Parameters

###### id

`number`

The detail ID

###### Returns

`Effect`{`<`}{`{`} `column_name`: `string`; `condition`: `string` {`|`} `null`; `created_by`: `string`; `created_date`: `string`; `data_type`: `string`; `detail_type`: `string` {`|`} `null`; `id`: `number`; `operator`: `string` {`|`} `null`; `query_group`: `number` {`|`} `null`; `rule_id`: `number` {`|`} `null`; `seq`: `number` {`|`} `null`; `stage_from`: `string` {`|`} `null`; `stage_to`: `string` {`|`} `null`; `table_name`: `string`; `updated_by`: `string` {`|`} `null`; `updated_date`: `string` {`|`} `null`; `value1`: `string`; `value2`: `string` {`|`} `null`; {`}`}, [`DatabaseError`](lib.errors.md#databaseerror) {`|`} [`NotFoundError`](lib.errors.md#notfounderror), `never`{`>`}

An Effect resolving to the detail or NotFoundError

##### getHeader()

> **getHeader**: (`id`) => `Effect`{`<`}{`{`} `active_flag`: `boolean` {`|`} `null`; `created_by`: `string`; `created_date`: `string`; `id`: `number`; `rule_name`: `string`; `rule_type`: `string`; `seq`: `number` {`|`} `null`; `updated_by`: `string` {`|`} `null`; `updated_column`: `string` {`|`} `null`; `updated_date`: `string` {`|`} `null`; `updated_table`: `string` {`|`} `null`; `value`: `string` {`|`} `null`; {`}`}, [`DatabaseError`](lib.errors.md#databaseerror) {`|`} [`NotFoundError`](lib.errors.md#notfounderror), `never`{`>`}

Get a rule header by ID.

###### Parameters

###### id

`number`

The header ID

###### Returns

`Effect`{`<`}{`{`} `active_flag`: `boolean` {`|`} `null`; `created_by`: `string`; `created_date`: `string`; `id`: `number`; `rule_name`: `string`; `rule_type`: `string`; `seq`: `number` {`|`} `null`; `updated_by`: `string` {`|`} `null`; `updated_column`: `string` {`|`} `null`; `updated_date`: `string` {`|`} `null`; `updated_table`: `string` {`|`} `null`; `value`: `string` {`|`} `null`; {`}`}, [`DatabaseError`](lib.errors.md#databaseerror) {`|`} [`NotFoundError`](lib.errors.md#notfounderror), `never`{`>`}

An Effect resolving to the header or NotFoundError

##### getOperators()

> **getOperators**: (`dataType`) => `Effect`{`<`}({`{`} `label`: `string`; `requiresNoValues?`: `undefined`; `supportsMultiple?`: `undefined`; `value`: `string`; {`}`} {`|`} {`{`} `label`: `string`; `requiresNoValues?`: `undefined`; `supportsMultiple`: `boolean`; `value`: `string`; {`}`} {`|`} {`{`} `label`: `string`; `requiresNoValues`: `boolean`; `supportsMultiple?`: `undefined`; `value`: `string`; {`}`})[] {`|`} ({`{`} `label`: `string`; `requiresValue2?`: `undefined`; `supportsMultiple?`: `undefined`; `value`: `string`; {`}`} {`|`} {`{`} `label`: `string`; `requiresValue2`: `boolean`; `supportsMultiple?`: `undefined`; `value`: `string`; {`}`} {`|`} {`{`} `label`: `string`; `requiresValue2?`: `undefined`; `supportsMultiple`: `boolean`; `value`: `string`; {`}`})[] {`|`} ({`{`} `label`: `string`; `requiresValue2?`: `undefined`; `value`: `string`; {`}`} {`|`} {`{`} `label`: `string`; `requiresValue2`: `boolean`; `value`: `string`; {`}`})[], `never`, `never`{`>`}

Get available operators based on data type.

###### Parameters

###### dataType

`string`

The column data type (varchar, int, date)

###### Returns

`Effect`{`<`}({`{`} `label`: `string`; `requiresNoValues?`: `undefined`; `supportsMultiple?`: `undefined`; `value`: `string`; {`}`} {`|`} {`{`} `label`: `string`; `requiresNoValues?`: `undefined`; `supportsMultiple`: `boolean`; `value`: `string`; {`}`} {`|`} {`{`} `label`: `string`; `requiresNoValues`: `boolean`; `supportsMultiple?`: `undefined`; `value`: `string`; {`}`})[] {`|`} ({`{`} `label`: `string`; `requiresValue2?`: `undefined`; `supportsMultiple?`: `undefined`; `value`: `string`; {`}`} {`|`} {`{`} `label`: `string`; `requiresValue2`: `boolean`; `supportsMultiple?`: `undefined`; `value`: `string`; {`}`} {`|`} {`{`} `label`: `string`; `requiresValue2?`: `undefined`; `supportsMultiple`: `boolean`; `value`: `string`; {`}`})[] {`|`} ({`{`} `label`: `string`; `requiresValue2?`: `undefined`; `value`: `string`; {`}`} {`|`} {`{`} `label`: `string`; `requiresValue2`: `boolean`; `value`: `string`; {`}`})[], `never`, `never`{`>`}

An Effect resolving to an array of operators

##### getRuleTypes()

> **getRuleTypes**: () => `Effect`{`<`}`object`[], [`DatabaseError`](lib.errors.md#databaseerror), `never`{`>`}

Get available rule types options.
Dynamically sourced from Business Setting B0008 in FRS9_PARAM_COMMOND.
Per tech spec: `RULE_TYPE` = Combo Box (Business Setting `B0008`)

###### Returns

`Effect`{`<`}`object`[], [`DatabaseError`](lib.errors.md#databaseerror), `never`{`>`}

##### getStages()

> **getStages**: () => `Effect`{`<`}`object`[], `never`, `never`{`>`}

Get available stage options.

###### Returns

`Effect`{`<`}`object`[], `never`, `never`{`>`}

##### listDetails()

> **listDetails**: (`ruleId`) => `Effect`{`<`}`object`[], [`DatabaseError`](lib.errors.md#databaseerror), `never`{`>`}

List details for a rule.

###### Parameters

###### ruleId

`number`

The rule header ID

###### Returns

`Effect`{`<`}`object`[], [`DatabaseError`](lib.errors.md#databaseerror), `never`{`>`}

An Effect resolving to an array of transformed details

##### listHeaders()

> **listHeaders**: (`query`) => `Effect`{`<`}`object`[], [`DatabaseError`](lib.errors.md#databaseerror), `never`{`>`}

List rule headers with filtering.

###### Parameters

###### query

Filter options

###### activeFlag?

`boolean`

Filter by active status

###### ruleType?

`string`

Filter by rule type

###### search?

`string`

Search term for rule name or type

###### Returns

`Effect`{`<`}`object`[], [`DatabaseError`](lib.errors.md#databaseerror), `never`{`>`}

An Effect resolving to an array of transformed headers

##### updateDetail()

> **updateDetail**: (`id`, `data`, `userId`) => `Effect`{`<`}{`{`} `column_name`: `string`; `condition`: `string` {`|`} `null`; `created_by`: `string`; `created_date`: `string`; `data_type`: `string`; `detail_type`: `string` {`|`} `null`; `id`: `number`; `operator`: `string` {`|`} `null`; `query_group`: `number` {`|`} `null`; `rule_id`: `number` {`|`} `null`; `seq`: `number` {`|`} `null`; `stage_from`: `string` {`|`} `null`; `stage_to`: `string` {`|`} `null`; `table_name`: `string`; `updated_by`: `string` {`|`} `null`; `updated_date`: `string` {`|`} `null`; `value1`: `string`; `value2`: `string` {`|`} `null`; {`}`}, [`DatabaseError`](lib.errors.md#databaseerror) {`|`} [`NotFoundError`](lib.errors.md#notfounderror), `never`{`>`}

Update an existing rule detail.

###### Parameters

###### id

`number`

The detail ID

###### data

`any`

The data to update

###### userId

`string`

The ID of the user updating the detail

###### Returns

`Effect`{`<`}{`{`} `column_name`: `string`; `condition`: `string` {`|`} `null`; `created_by`: `string`; `created_date`: `string`; `data_type`: `string`; `detail_type`: `string` {`|`} `null`; `id`: `number`; `operator`: `string` {`|`} `null`; `query_group`: `number` {`|`} `null`; `rule_id`: `number` {`|`} `null`; `seq`: `number` {`|`} `null`; `stage_from`: `string` {`|`} `null`; `stage_to`: `string` {`|`} `null`; `table_name`: `string`; `updated_by`: `string` {`|`} `null`; `updated_date`: `string` {`|`} `null`; `value1`: `string`; `value2`: `string` {`|`} `null`; {`}`}, [`DatabaseError`](lib.errors.md#databaseerror) {`|`} [`NotFoundError`](lib.errors.md#notfounderror), `never`{`>`}

An Effect resolving to the updated detail or NotFoundError

##### updateHeader()

> **updateHeader**: (`id`, `data`, `userId`) => `Effect`{`<`}{`{`} `active_flag`: `boolean` {`|`} `null`; `created_by`: `string`; `created_date`: `string`; `id`: `number`; `rule_name`: `string`; `rule_type`: `string`; `seq`: `number` {`|`} `null`; `updated_by`: `string` {`|`} `null`; `updated_column`: `string` {`|`} `null`; `updated_date`: `string` {`|`} `null`; `updated_table`: `string` {`|`} `null`; `value`: `string` {`|`} `null`; {`}`}, [`DatabaseError`](lib.errors.md#databaseerror) {`|`} [`NotFoundError`](lib.errors.md#notfounderror), `never`{`>`}

Update an existing rule header.

###### Parameters

###### id

`number`

The header ID

###### data

`any`

The data to update

###### userId

`string`

The ID of the user updating the header

###### Returns

`Effect`{`<`}{`{`} `active_flag`: `boolean` {`|`} `null`; `created_by`: `string`; `created_date`: `string`; `id`: `number`; `rule_name`: `string`; `rule_type`: `string`; `seq`: `number` {`|`} `null`; `updated_by`: `string` {`|`} `null`; `updated_column`: `string` {`|`} `null`; `updated_date`: `string` {`|`} `null`; `updated_table`: `string` {`|`} `null`; `value`: `string` {`|`} `null`; {`}`}, [`DatabaseError`](lib.errors.md#databaseerror) {`|`} [`NotFoundError`](lib.errors.md#notfounderror), `never`{`>`}

An Effect resolving to the updated header or NotFoundError
