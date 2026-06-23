[**Backend API Reference v1.0.0**](index.md)

***

# services/rule-base-settings.service

## Variables

### RuleBaseSettingsService

> `const` **RuleBaseSettingsService**: `object`

Defined in: [src/services/rule-base-settings.service.ts:7](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/new-backend/src/services/rule-base-settings.service.ts#L7)

#### Type Declaration

##### createDetail

> **createDetail**: (`ruleId`, `data`, `userId`) => `Effect`&lt;&#123; `column_name`: `string`; `condition`: `string` &#124; `null`; `created_by`: `string`; `created_date`: `string`; `data_type`: `string`; `detail_type`: `string` &#124; `null`; `id`: `number`; `operator`: `string` &#124; `null`; `query_group`: `number` &#124; `null`; `rule_id`: `number` &#124; `null`; `seq`: `number` &#124; `null`; `stage_from`: `string` &#124; `null`; `stage_to`: `string` &#124; `null`; `table_name`: `string`; `updated_by`: `string` &#124; `null`; `updated_date`: `string` &#124; `null`; `value1`: `string`; `value2`: `string` &#124; `null`; &#125;, [`DatabaseError`](lib.errors.md#databaseerror), `never`&gt;

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

`Effect`&lt;&#123; `column_name`: `string`; `condition`: `string` &#124; `null`; `created_by`: `string`; `created_date`: `string`; `data_type`: `string`; `detail_type`: `string` &#124; `null`; `id`: `number`; `operator`: `string` &#124; `null`; `query_group`: `number` &#124; `null`; `rule_id`: `number` &#124; `null`; `seq`: `number` &#124; `null`; `stage_from`: `string` &#124; `null`; `stage_to`: `string` &#124; `null`; `table_name`: `string`; `updated_by`: `string` &#124; `null`; `updated_date`: `string` &#124; `null`; `value1`: `string`; `value2`: `string` &#124; `null`; &#125;, [`DatabaseError`](lib.errors.md#databaseerror), `never`&gt;

An Effect resolving to the created detail

##### createHeader

> **createHeader**: (`data`, `userId`) => `Effect`&lt;&#123; `active_flag`: `boolean` &#124; `null`; `created_by`: `string`; `created_date`: `string`; `id`: `number`; `rule_name`: `string`; `rule_type`: `string`; `seq`: `number` &#124; `null`; `updated_by`: `string` &#124; `null`; `updated_column`: `string` &#124; `null`; `updated_date`: `string` &#124; `null`; `updated_table`: `string` &#124; `null`; `value`: `string` &#124; `null`; &#125;, [`DatabaseError`](lib.errors.md#databaseerror), `never`&gt;

Create a new rule header.

###### Parameters

###### data

`any`

The header data

###### userId

`string`

The ID of the user creating the header

###### Returns

`Effect`&lt;&#123; `active_flag`: `boolean` &#124; `null`; `created_by`: `string`; `created_date`: `string`; `id`: `number`; `rule_name`: `string`; `rule_type`: `string`; `seq`: `number` &#124; `null`; `updated_by`: `string` &#124; `null`; `updated_column`: `string` &#124; `null`; `updated_date`: `string` &#124; `null`; `updated_table`: `string` &#124; `null`; `value`: `string` &#124; `null`; &#125;, [`DatabaseError`](lib.errors.md#databaseerror), `never`&gt;

An Effect resolving to the created header

##### deleteDetail

> **deleteDetail**: (`id`) => `Effect`&lt;&#123; `message`: `string`; &#125;, [`DatabaseError`](lib.errors.md#databaseerror) &#124; [`NotFoundError`](lib.errors.md#notfounderror), `never`&gt;

Delete a rule detail.

###### Parameters

###### id

`number`

The detail ID

###### Returns

`Effect`&lt;&#123; `message`: `string`; &#125;, [`DatabaseError`](lib.errors.md#databaseerror) &#124; [`NotFoundError`](lib.errors.md#notfounderror), `never`&gt;

An Effect resolving to a success message or NotFoundError

##### deleteHeader

> **deleteHeader**: (`id`) => `Effect`&lt;&#123; `message`: `string`; &#125;, [`DatabaseError`](lib.errors.md#databaseerror), `never`&gt;

Delete a rule header.

###### Parameters

###### id

`number`

The header ID

###### Returns

`Effect`&lt;&#123; `message`: `string`; &#125;, [`DatabaseError`](lib.errors.md#databaseerror), `never`&gt;

An Effect resolving to a success message

##### getConditions

> **getConditions**: () => `Effect`&lt;`object`[], `never`, `never`&gt;

Get available conditions (AND/OR).

###### Returns

`Effect`&lt;`object`[], `never`, `never`&gt;

##### getDetail

> **getDetail**: (`id`) => `Effect`&lt;&#123; `column_name`: `string`; `condition`: `string` &#124; `null`; `created_by`: `string`; `created_date`: `string`; `data_type`: `string`; `detail_type`: `string` &#124; `null`; `id`: `number`; `operator`: `string` &#124; `null`; `query_group`: `number` &#124; `null`; `rule_id`: `number` &#124; `null`; `seq`: `number` &#124; `null`; `stage_from`: `string` &#124; `null`; `stage_to`: `string` &#124; `null`; `table_name`: `string`; `updated_by`: `string` &#124; `null`; `updated_date`: `string` &#124; `null`; `value1`: `string`; `value2`: `string` &#124; `null`; &#125;, [`DatabaseError`](lib.errors.md#databaseerror) &#124; [`NotFoundError`](lib.errors.md#notfounderror), `never`&gt;

Get a rule detail by ID.

###### Parameters

###### id

`number`

The detail ID

###### Returns

`Effect`&lt;&#123; `column_name`: `string`; `condition`: `string` &#124; `null`; `created_by`: `string`; `created_date`: `string`; `data_type`: `string`; `detail_type`: `string` &#124; `null`; `id`: `number`; `operator`: `string` &#124; `null`; `query_group`: `number` &#124; `null`; `rule_id`: `number` &#124; `null`; `seq`: `number` &#124; `null`; `stage_from`: `string` &#124; `null`; `stage_to`: `string` &#124; `null`; `table_name`: `string`; `updated_by`: `string` &#124; `null`; `updated_date`: `string` &#124; `null`; `value1`: `string`; `value2`: `string` &#124; `null`; &#125;, [`DatabaseError`](lib.errors.md#databaseerror) &#124; [`NotFoundError`](lib.errors.md#notfounderror), `never`&gt;

An Effect resolving to the detail or NotFoundError

##### getHeader

> **getHeader**: (`id`) => `Effect`&lt;&#123; `active_flag`: `boolean` &#124; `null`; `created_by`: `string`; `created_date`: `string`; `id`: `number`; `rule_name`: `string`; `rule_type`: `string`; `seq`: `number` &#124; `null`; `updated_by`: `string` &#124; `null`; `updated_column`: `string` &#124; `null`; `updated_date`: `string` &#124; `null`; `updated_table`: `string` &#124; `null`; `value`: `string` &#124; `null`; &#125;, [`DatabaseError`](lib.errors.md#databaseerror) &#124; [`NotFoundError`](lib.errors.md#notfounderror), `never`&gt;

Get a rule header by ID.

###### Parameters

###### id

`number`

The header ID

###### Returns

`Effect`&lt;&#123; `active_flag`: `boolean` &#124; `null`; `created_by`: `string`; `created_date`: `string`; `id`: `number`; `rule_name`: `string`; `rule_type`: `string`; `seq`: `number` &#124; `null`; `updated_by`: `string` &#124; `null`; `updated_column`: `string` &#124; `null`; `updated_date`: `string` &#124; `null`; `updated_table`: `string` &#124; `null`; `value`: `string` &#124; `null`; &#125;, [`DatabaseError`](lib.errors.md#databaseerror) &#124; [`NotFoundError`](lib.errors.md#notfounderror), `never`&gt;

An Effect resolving to the header or NotFoundError

##### getOperators

> **getOperators**: (`dataType`) => `Effect`&lt;(&#123; `label`: `string`; `requiresNoValues?`: `undefined`; `supportsMultiple?`: `undefined`; `value`: `string`; &#125; &#124; &#123; `label`: `string`; `requiresNoValues?`: `undefined`; `supportsMultiple`: `boolean`; `value`: `string`; &#125; &#124; &#123; `label`: `string`; `requiresNoValues`: `boolean`; `supportsMultiple?`: `undefined`; `value`: `string`; &#125;)[] &#124; (&#123; `label`: `string`; `requiresValue2?`: `undefined`; `supportsMultiple?`: `undefined`; `value`: `string`; &#125; &#124; &#123; `label`: `string`; `requiresValue2`: `boolean`; `supportsMultiple?`: `undefined`; `value`: `string`; &#125; &#124; &#123; `label`: `string`; `requiresValue2?`: `undefined`; `supportsMultiple`: `boolean`; `value`: `string`; &#125;)[] &#124; (&#123; `label`: `string`; `requiresValue2?`: `undefined`; `value`: `string`; &#125; &#124; &#123; `label`: `string`; `requiresValue2`: `boolean`; `value`: `string`; &#125;)[], `never`, `never`&gt;

Get available operators based on data type.

###### Parameters

###### dataType

`string`

The column data type (varchar, int, date)

###### Returns

`Effect`&lt;(&#123; `label`: `string`; `requiresNoValues?`: `undefined`; `supportsMultiple?`: `undefined`; `value`: `string`; &#125; &#124; &#123; `label`: `string`; `requiresNoValues?`: `undefined`; `supportsMultiple`: `boolean`; `value`: `string`; &#125; &#124; &#123; `label`: `string`; `requiresNoValues`: `boolean`; `supportsMultiple?`: `undefined`; `value`: `string`; &#125;)[] &#124; (&#123; `label`: `string`; `requiresValue2?`: `undefined`; `supportsMultiple?`: `undefined`; `value`: `string`; &#125; &#124; &#123; `label`: `string`; `requiresValue2`: `boolean`; `supportsMultiple?`: `undefined`; `value`: `string`; &#125; &#124; &#123; `label`: `string`; `requiresValue2?`: `undefined`; `supportsMultiple`: `boolean`; `value`: `string`; &#125;)[] &#124; (&#123; `label`: `string`; `requiresValue2?`: `undefined`; `value`: `string`; &#125; &#124; &#123; `label`: `string`; `requiresValue2`: `boolean`; `value`: `string`; &#125;)[], `never`, `never`&gt;

An Effect resolving to an array of operators

##### getOptionsByType

> **getOptionsByType**: (`ruleType`) => `Effect`&lt;`object`[], [`DatabaseError`](lib.errors.md#databaseerror), `never`&gt;

Get dropdown options for Journal Parameters by rule type.
Fetches active rule header entries matching the given ruleType,
maps them to &#123; id: value, name: ruleName &#125; format.

###### Parameters

###### ruleType

`string`

The rule type to filter (e.g. 'GL', 'CURRENCY', 'JTYPE', 'JCODE', 'DBCR')

###### Returns

`Effect`&lt;`object`[], [`DatabaseError`](lib.errors.md#databaseerror), `never`&gt;

An Effect resolving to an array of &#123; id, name &#125; options

##### getRuleTypes

> **getRuleTypes**: () => `Effect`&lt;`object`[], [`DatabaseError`](lib.errors.md#databaseerror), `never`&gt;

Get available rule types options.
Dynamically sourced from Business Setting B0008 in FRS9_PARAM_COMMOND.
Per tech spec: RULE_TYPE = Combo Box (Business Setting B0008)

###### Returns

`Effect`&lt;`object`[], [`DatabaseError`](lib.errors.md#databaseerror), `never`&gt;

##### getStages

> **getStages**: () => `Effect`&lt;`object`[], `never`, `never`&gt;

Get available stage options.

###### Returns

`Effect`&lt;`object`[], `never`, `never`&gt;

##### listDetails

> **listDetails**: (`ruleId`) => `Effect`&lt;`object`[], [`DatabaseError`](lib.errors.md#databaseerror), `never`&gt;

List details for a rule.

###### Parameters

###### ruleId

`number`

The rule header ID

###### Returns

`Effect`&lt;`object`[], [`DatabaseError`](lib.errors.md#databaseerror), `never`&gt;

An Effect resolving to an array of transformed details

##### listHeaders

> **listHeaders**: (`query`) => `Effect`&lt;`object`[], [`DatabaseError`](lib.errors.md#databaseerror), `never`&gt;

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

`Effect`&lt;`object`[], [`DatabaseError`](lib.errors.md#databaseerror), `never`&gt;

An Effect resolving to an array of transformed headers

##### updateDetail

> **updateDetail**: (`id`, `data`, `userId`) => `Effect`&lt;&#123; `column_name`: `string`; `condition`: `string` &#124; `null`; `created_by`: `string`; `created_date`: `string`; `data_type`: `string`; `detail_type`: `string` &#124; `null`; `id`: `number`; `operator`: `string` &#124; `null`; `query_group`: `number` &#124; `null`; `rule_id`: `number` &#124; `null`; `seq`: `number` &#124; `null`; `stage_from`: `string` &#124; `null`; `stage_to`: `string` &#124; `null`; `table_name`: `string`; `updated_by`: `string` &#124; `null`; `updated_date`: `string` &#124; `null`; `value1`: `string`; `value2`: `string` &#124; `null`; &#125;, [`DatabaseError`](lib.errors.md#databaseerror) &#124; [`NotFoundError`](lib.errors.md#notfounderror), `never`&gt;

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

`Effect`&lt;&#123; `column_name`: `string`; `condition`: `string` &#124; `null`; `created_by`: `string`; `created_date`: `string`; `data_type`: `string`; `detail_type`: `string` &#124; `null`; `id`: `number`; `operator`: `string` &#124; `null`; `query_group`: `number` &#124; `null`; `rule_id`: `number` &#124; `null`; `seq`: `number` &#124; `null`; `stage_from`: `string` &#124; `null`; `stage_to`: `string` &#124; `null`; `table_name`: `string`; `updated_by`: `string` &#124; `null`; `updated_date`: `string` &#124; `null`; `value1`: `string`; `value2`: `string` &#124; `null`; &#125;, [`DatabaseError`](lib.errors.md#databaseerror) &#124; [`NotFoundError`](lib.errors.md#notfounderror), `never`&gt;

An Effect resolving to the updated detail or NotFoundError

##### updateHeader

> **updateHeader**: (`id`, `data`, `userId`) => `Effect`&lt;&#123; `active_flag`: `boolean` &#124; `null`; `created_by`: `string`; `created_date`: `string`; `id`: `number`; `rule_name`: `string`; `rule_type`: `string`; `seq`: `number` &#124; `null`; `updated_by`: `string` &#124; `null`; `updated_column`: `string` &#124; `null`; `updated_date`: `string` &#124; `null`; `updated_table`: `string` &#124; `null`; `value`: `string` &#124; `null`; &#125;, [`DatabaseError`](lib.errors.md#databaseerror) &#124; [`NotFoundError`](lib.errors.md#notfounderror), `never`&gt;

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

`Effect`&lt;&#123; `active_flag`: `boolean` &#124; `null`; `created_by`: `string`; `created_date`: `string`; `id`: `number`; `rule_name`: `string`; `rule_type`: `string`; `seq`: `number` &#124; `null`; `updated_by`: `string` &#124; `null`; `updated_column`: `string` &#124; `null`; `updated_date`: `string` &#124; `null`; `updated_table`: `string` &#124; `null`; `value`: `string` &#124; `null`; &#125;, [`DatabaseError`](lib.errors.md#databaseerror) &#124; [`NotFoundError`](lib.errors.md#notfounderror), `never`&gt;

An Effect resolving to the updated header or NotFoundError
