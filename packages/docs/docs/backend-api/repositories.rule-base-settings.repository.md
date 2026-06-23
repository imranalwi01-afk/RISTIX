[**Backend API Reference v1.0.0**](index.md)

***

# repositories/rule-base-settings.repository

## Variables

### RuleBaseSettingsRepository

> `const` **RuleBaseSettingsRepository**: `object`

Defined in: [src/repositories/rule-base-settings.repository.ts:7](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/new-backend/src/repositories/rule-base-settings.repository.ts#L7)

#### Type Declaration

##### createDetail

> **createDetail**: (`data`) => `Effect`&lt;&#123; `columnName`: `string`; `condition`: `string` &#124; `null`; `createdby`: `string`; `createddate`: `string`; `createdhost`: `string`; `dataType`: `string`; `detailType`: `string` &#124; `null`; `operator`: `string` &#124; `null`; `pkid`: `number`; `queryGroup`: `number` &#124; `null`; `ruleId`: `number` &#124; `null`; `seq`: `number` &#124; `null`; `stageFrom`: `string` &#124; `null`; `stageTo`: `string` &#124; `null`; `tableName`: `string`; `updatedby`: `string` &#124; `null`; `updateddate`: `string` &#124; `null`; `updatedhost`: `string` &#124; `null`; `value1`: `string`; `value2`: `string` &#124; `null`; &#125;, [`DatabaseError`](lib.errors.md#databaseerror), `never`&gt;

Create a new rule detail.

###### Parameters

###### data

The detail data

###### columnName

`string`

###### condition?

`string` &#124; `null`

###### createdby

`string`

###### createddate

`string`

###### createdhost

`string`

###### dataType

`string`

###### detailType?

`string` &#124; `null`

###### operator?

`string` &#124; `null`

###### pkid?

`number`

###### queryGroup?

`number` &#124; `null`

###### ruleId?

`number` &#124; `null`

###### seq?

`number` &#124; `null`

###### stageFrom?

`string` &#124; `null`

###### stageTo?

`string` &#124; `null`

###### tableName

`string`

###### updatedby?

`string` &#124; `null`

###### updateddate?

`string` &#124; `null`

###### updatedhost?

`string` &#124; `null`

###### value1

`string`

###### value2?

`string` &#124; `null`

###### Returns

`Effect`&lt;&#123; `columnName`: `string`; `condition`: `string` &#124; `null`; `createdby`: `string`; `createddate`: `string`; `createdhost`: `string`; `dataType`: `string`; `detailType`: `string` &#124; `null`; `operator`: `string` &#124; `null`; `pkid`: `number`; `queryGroup`: `number` &#124; `null`; `ruleId`: `number` &#124; `null`; `seq`: `number` &#124; `null`; `stageFrom`: `string` &#124; `null`; `stageTo`: `string` &#124; `null`; `tableName`: `string`; `updatedby`: `string` &#124; `null`; `updateddate`: `string` &#124; `null`; `updatedhost`: `string` &#124; `null`; `value1`: `string`; `value2`: `string` &#124; `null`; &#125;, [`DatabaseError`](lib.errors.md#databaseerror), `never`&gt;

An Effect resolving to the created detail

##### createHeader

> **createHeader**: (`data`) => `Effect`&lt;&#123; `activeFlag`: `boolean` &#124; `null`; `createdby`: `string`; `createddate`: `string`; `createdhost`: `string`; `pkid`: `number`; `ruleName`: `string`; `ruleType`: `string`; `seq`: `number` &#124; `null`; `updatedby`: `string` &#124; `null`; `updatedColumn`: `string` &#124; `null`; `updateddate`: `string` &#124; `null`; `updatedhost`: `string` &#124; `null`; `updatedTable`: `string` &#124; `null`; `value`: `string` &#124; `null`; &#125;, [`DatabaseError`](lib.errors.md#databaseerror), `never`&gt;

Create a new rule header.

###### Parameters

###### data

The header data

###### activeFlag?

`boolean` &#124; `null`

###### createdby

`string`

###### createddate

`string`

###### createdhost

`string`

###### pkid?

`number`

###### ruleName

`string`

###### ruleType

`string`

###### seq?

`number` &#124; `null`

###### updatedby?

`string` &#124; `null`

###### updatedColumn?

`string` &#124; `null`

###### updateddate?

`string` &#124; `null`

###### updatedhost?

`string` &#124; `null`

###### updatedTable?

`string` &#124; `null`

###### value?

`string` &#124; `null`

###### Returns

`Effect`&lt;&#123; `activeFlag`: `boolean` &#124; `null`; `createdby`: `string`; `createddate`: `string`; `createdhost`: `string`; `pkid`: `number`; `ruleName`: `string`; `ruleType`: `string`; `seq`: `number` &#124; `null`; `updatedby`: `string` &#124; `null`; `updatedColumn`: `string` &#124; `null`; `updateddate`: `string` &#124; `null`; `updatedhost`: `string` &#124; `null`; `updatedTable`: `string` &#124; `null`; `value`: `string` &#124; `null`; &#125;, [`DatabaseError`](lib.errors.md#databaseerror), `never`&gt;

An Effect resolving to the created header

##### deleteDetail

> **deleteDetail**: (`id`) => `Effect`&lt;`boolean`, [`DatabaseError`](lib.errors.md#databaseerror), `never`&gt;

Delete a rule detail.

###### Parameters

###### id

`bigint`

The detail ID

###### Returns

`Effect`&lt;`boolean`, [`DatabaseError`](lib.errors.md#databaseerror), `never`&gt;

An Effect resolving to true if deleted, false otherwise

##### deleteHeader

> **deleteHeader**: (`id`) => `Effect`&lt;`boolean`, [`DatabaseError`](lib.errors.md#databaseerror), `never`&gt;

Delete a rule header and its associated details.

###### Parameters

###### id

`bigint`

The header ID

###### Returns

`Effect`&lt;`boolean`, [`DatabaseError`](lib.errors.md#databaseerror), `never`&gt;

An Effect resolving to true on success

##### findDetailById

> **findDetailById**: (`id`) => `Effect`&lt;&#123; `columnName`: `string`; `condition`: `string` &#124; `null`; `createdby`: `string`; `createddate`: `string`; `createdhost`: `string`; `dataType`: `string`; `detailType`: `string` &#124; `null`; `operator`: `string` &#124; `null`; `pkid`: `number`; `queryGroup`: `number` &#124; `null`; `ruleId`: `number` &#124; `null`; `seq`: `number` &#124; `null`; `stageFrom`: `string` &#124; `null`; `stageTo`: `string` &#124; `null`; `tableName`: `string`; `updatedby`: `string` &#124; `null`; `updateddate`: `string` &#124; `null`; `updatedhost`: `string` &#124; `null`; `value1`: `string`; `value2`: `string` &#124; `null`; &#125;, [`DatabaseError`](lib.errors.md#databaseerror), `never`&gt;

Find a rule detail by ID.

###### Parameters

###### id

`bigint`

The detail ID

###### Returns

`Effect`&lt;&#123; `columnName`: `string`; `condition`: `string` &#124; `null`; `createdby`: `string`; `createddate`: `string`; `createdhost`: `string`; `dataType`: `string`; `detailType`: `string` &#124; `null`; `operator`: `string` &#124; `null`; `pkid`: `number`; `queryGroup`: `number` &#124; `null`; `ruleId`: `number` &#124; `null`; `seq`: `number` &#124; `null`; `stageFrom`: `string` &#124; `null`; `stageTo`: `string` &#124; `null`; `tableName`: `string`; `updatedby`: `string` &#124; `null`; `updateddate`: `string` &#124; `null`; `updatedhost`: `string` &#124; `null`; `value1`: `string`; `value2`: `string` &#124; `null`; &#125;, [`DatabaseError`](lib.errors.md#databaseerror), `never`&gt;

An Effect resolving to the detail or null

##### findDetailsByRuleId

> **findDetailsByRuleId**: (`ruleId`) => `Effect`&lt;`object`[], [`DatabaseError`](lib.errors.md#databaseerror), `never`&gt;

Find details for a specific rule sorted by group and sequence.

###### Parameters

###### ruleId

`bigint`

The rule header ID

###### Returns

`Effect`&lt;`object`[], [`DatabaseError`](lib.errors.md#databaseerror), `never`&gt;

An Effect resolving to an array of details

##### findHeaderById

> **findHeaderById**: (`id`) => `Effect`&lt;&#123; `activeFlag`: `boolean` &#124; `null`; `createdby`: `string`; `createddate`: `string`; `createdhost`: `string`; `pkid`: `number`; `ruleName`: `string`; `ruleType`: `string`; `seq`: `number` &#124; `null`; `updatedby`: `string` &#124; `null`; `updatedColumn`: `string` &#124; `null`; `updateddate`: `string` &#124; `null`; `updatedhost`: `string` &#124; `null`; `updatedTable`: `string` &#124; `null`; `value`: `string` &#124; `null`; &#125;, [`DatabaseError`](lib.errors.md#databaseerror), `never`&gt;

Find a rule header by ID.

###### Parameters

###### id

`bigint`

The header ID

###### Returns

`Effect`&lt;&#123; `activeFlag`: `boolean` &#124; `null`; `createdby`: `string`; `createddate`: `string`; `createdhost`: `string`; `pkid`: `number`; `ruleName`: `string`; `ruleType`: `string`; `seq`: `number` &#124; `null`; `updatedby`: `string` &#124; `null`; `updatedColumn`: `string` &#124; `null`; `updateddate`: `string` &#124; `null`; `updatedhost`: `string` &#124; `null`; `updatedTable`: `string` &#124; `null`; `value`: `string` &#124; `null`; &#125;, [`DatabaseError`](lib.errors.md#databaseerror), `never`&gt;

An Effect resolving to the header or null

##### findHeaders

> **findHeaders**: (`search?`, `ruleType?`, `activeFlag?`) => `Effect`&lt;`object`[], [`DatabaseError`](lib.errors.md#databaseerror), `never`&gt;

Find rule headers with filtering.

###### Parameters

###### search?

`string`

Search term for rule name or type

###### ruleType?

`string`

Filter by rule type

###### activeFlag?

`boolean`

Filter by active status

###### Returns

`Effect`&lt;`object`[], [`DatabaseError`](lib.errors.md#databaseerror), `never`&gt;

An Effect resolving to an array of headers

##### findHeadersByType

> **findHeadersByType**: (`ruleType`, `activeOnly`) => `Effect`&lt;`object`[], [`DatabaseError`](lib.errors.md#databaseerror), `never`&gt;

Find rule headers by rule type.
Used by Journal Parameters to fetch dropdown options from Rule Base Setting.

###### Parameters

###### ruleType

`string`

The rule type to filter by

###### activeOnly?

`boolean` = `true`

If true, only return active headers

###### Returns

`Effect`&lt;`object`[], [`DatabaseError`](lib.errors.md#databaseerror), `never`&gt;

An Effect resolving to an array of headers, sorted by seq

##### updateDetail

> **updateDetail**: (`id`, `data`) => `Effect`&lt;&#123; `columnName`: `string`; `condition`: `string` &#124; `null`; `createdby`: `string`; `createddate`: `string`; `createdhost`: `string`; `dataType`: `string`; `detailType`: `string` &#124; `null`; `operator`: `string` &#124; `null`; `pkid`: `number`; `queryGroup`: `number` &#124; `null`; `ruleId`: `number` &#124; `null`; `seq`: `number` &#124; `null`; `stageFrom`: `string` &#124; `null`; `stageTo`: `string` &#124; `null`; `tableName`: `string`; `updatedby`: `string` &#124; `null`; `updateddate`: `string` &#124; `null`; `updatedhost`: `string` &#124; `null`; `value1`: `string`; `value2`: `string` &#124; `null`; &#125;, [`DatabaseError`](lib.errors.md#databaseerror), `never`&gt;

Update an existing rule detail.

###### Parameters

###### id

`bigint`

The detail ID

###### data

`Partial`&lt;*typeof* `frs9ParamScenarioRulesd.$inferInsert`&gt;

The data to update

###### Returns

`Effect`&lt;&#123; `columnName`: `string`; `condition`: `string` &#124; `null`; `createdby`: `string`; `createddate`: `string`; `createdhost`: `string`; `dataType`: `string`; `detailType`: `string` &#124; `null`; `operator`: `string` &#124; `null`; `pkid`: `number`; `queryGroup`: `number` &#124; `null`; `ruleId`: `number` &#124; `null`; `seq`: `number` &#124; `null`; `stageFrom`: `string` &#124; `null`; `stageTo`: `string` &#124; `null`; `tableName`: `string`; `updatedby`: `string` &#124; `null`; `updateddate`: `string` &#124; `null`; `updatedhost`: `string` &#124; `null`; `value1`: `string`; `value2`: `string` &#124; `null`; &#125;, [`DatabaseError`](lib.errors.md#databaseerror), `never`&gt;

An Effect resolving to the updated detail or null

##### updateHeader

> **updateHeader**: (`id`, `data`) => `Effect`&lt;&#123; `activeFlag`: `boolean` &#124; `null`; `createdby`: `string`; `createddate`: `string`; `createdhost`: `string`; `pkid`: `number`; `ruleName`: `string`; `ruleType`: `string`; `seq`: `number` &#124; `null`; `updatedby`: `string` &#124; `null`; `updatedColumn`: `string` &#124; `null`; `updateddate`: `string` &#124; `null`; `updatedhost`: `string` &#124; `null`; `updatedTable`: `string` &#124; `null`; `value`: `string` &#124; `null`; &#125;, [`DatabaseError`](lib.errors.md#databaseerror), `never`&gt;

Update an existing rule header.

###### Parameters

###### id

`bigint`

The header ID

###### data

`Partial`&lt;*typeof* `frs9ParamScenarioRulesh.$inferInsert`&gt;

The data to update

###### Returns

`Effect`&lt;&#123; `activeFlag`: `boolean` &#124; `null`; `createdby`: `string`; `createddate`: `string`; `createdhost`: `string`; `pkid`: `number`; `ruleName`: `string`; `ruleType`: `string`; `seq`: `number` &#124; `null`; `updatedby`: `string` &#124; `null`; `updatedColumn`: `string` &#124; `null`; `updateddate`: `string` &#124; `null`; `updatedhost`: `string` &#124; `null`; `updatedTable`: `string` &#124; `null`; `value`: `string` &#124; `null`; &#125;, [`DatabaseError`](lib.errors.md#databaseerror), `never`&gt;

An Effect resolving to the updated header or null
