[**Backend API Reference v1.0.0**](../../../README.md)

***

# Variable: RuleBaseSettingsRepository

> `const` **RuleBaseSettingsRepository**: `object`

Defined in: [src/repositories/rule-base-settings.repository.ts:7](https://github.com/ifrspro/ifrs9-iaf/blob/cf4905123c7eb3e9046f36ce3f92dd13536ac238/packages/new-backend/src/repositories/rule-base-settings.repository.ts#L7)

## Type Declaration

### createDetail()

> **createDetail**: (`data`) => `Effect`\<\{ `columnName`: `string`; `condition`: `string` \| `null`; `createdby`: `string`; `createddate`: `string`; `createdhost`: `string`; `dataType`: `string`; `detailType`: `string` \| `null`; `operator`: `string` \| `null`; `pkid`: `number`; `queryGroup`: `number` \| `null`; `ruleId`: `number` \| `null`; `seq`: `number` \| `null`; `stageFrom`: `string` \| `null`; `stageTo`: `string` \| `null`; `tableName`: `string`; `updatedby`: `string` \| `null`; `updateddate`: `string` \| `null`; `updatedhost`: `string` \| `null`; `value1`: `string`; `value2`: `string` \| `null`; \}, [`DatabaseError`](../../../lib/errors/classes/DatabaseError.md), `never`\>

Create a new rule detail.

#### Parameters

##### data

The detail data

###### columnName

`string`

###### condition?

`string` \| `null`

###### createdby

`string`

###### createddate

`string`

###### createdhost

`string`

###### dataType

`string`

###### detailType?

`string` \| `null`

###### operator?

`string` \| `null`

###### pkid?

`number`

###### queryGroup?

`number` \| `null`

###### ruleId?

`number` \| `null`

###### seq?

`number` \| `null`

###### stageFrom?

`string` \| `null`

###### stageTo?

`string` \| `null`

###### tableName

`string`

###### updatedby?

`string` \| `null`

###### updateddate?

`string` \| `null`

###### updatedhost?

`string` \| `null`

###### value1

`string`

###### value2?

`string` \| `null`

#### Returns

`Effect`\<\{ `columnName`: `string`; `condition`: `string` \| `null`; `createdby`: `string`; `createddate`: `string`; `createdhost`: `string`; `dataType`: `string`; `detailType`: `string` \| `null`; `operator`: `string` \| `null`; `pkid`: `number`; `queryGroup`: `number` \| `null`; `ruleId`: `number` \| `null`; `seq`: `number` \| `null`; `stageFrom`: `string` \| `null`; `stageTo`: `string` \| `null`; `tableName`: `string`; `updatedby`: `string` \| `null`; `updateddate`: `string` \| `null`; `updatedhost`: `string` \| `null`; `value1`: `string`; `value2`: `string` \| `null`; \}, [`DatabaseError`](../../../lib/errors/classes/DatabaseError.md), `never`\>

An Effect resolving to the created detail

### createHeader()

> **createHeader**: (`data`) => `Effect`\<\{ `activeFlag`: `boolean` \| `null`; `createdby`: `string`; `createddate`: `string`; `createdhost`: `string`; `pkid`: `number`; `ruleName`: `string`; `ruleType`: `string`; `seq`: `number` \| `null`; `updatedby`: `string` \| `null`; `updatedColumn`: `string` \| `null`; `updateddate`: `string` \| `null`; `updatedhost`: `string` \| `null`; `updatedTable`: `string` \| `null`; `value`: `string` \| `null`; \}, [`DatabaseError`](../../../lib/errors/classes/DatabaseError.md), `never`\>

Create a new rule header.

#### Parameters

##### data

The header data

###### activeFlag?

`boolean` \| `null`

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

`number` \| `null`

###### updatedby?

`string` \| `null`

###### updatedColumn?

`string` \| `null`

###### updateddate?

`string` \| `null`

###### updatedhost?

`string` \| `null`

###### updatedTable?

`string` \| `null`

###### value?

`string` \| `null`

#### Returns

`Effect`\<\{ `activeFlag`: `boolean` \| `null`; `createdby`: `string`; `createddate`: `string`; `createdhost`: `string`; `pkid`: `number`; `ruleName`: `string`; `ruleType`: `string`; `seq`: `number` \| `null`; `updatedby`: `string` \| `null`; `updatedColumn`: `string` \| `null`; `updateddate`: `string` \| `null`; `updatedhost`: `string` \| `null`; `updatedTable`: `string` \| `null`; `value`: `string` \| `null`; \}, [`DatabaseError`](../../../lib/errors/classes/DatabaseError.md), `never`\>

An Effect resolving to the created header

### deleteDetail()

> **deleteDetail**: (`id`) => `Effect`\<`boolean`, [`DatabaseError`](../../../lib/errors/classes/DatabaseError.md), `never`\>

Delete a rule detail.

#### Parameters

##### id

`bigint`

The detail ID

#### Returns

`Effect`\<`boolean`, [`DatabaseError`](../../../lib/errors/classes/DatabaseError.md), `never`\>

An Effect resolving to true if deleted, false otherwise

### deleteHeader()

> **deleteHeader**: (`id`) => `Effect`\<`boolean`, [`DatabaseError`](../../../lib/errors/classes/DatabaseError.md), `never`\>

Delete a rule header and its associated details.

#### Parameters

##### id

`bigint`

The header ID

#### Returns

`Effect`\<`boolean`, [`DatabaseError`](../../../lib/errors/classes/DatabaseError.md), `never`\>

An Effect resolving to true on success

### findDetailsByRuleId()

> **findDetailsByRuleId**: (`ruleId`) => `Effect`\<`object`[], [`DatabaseError`](../../../lib/errors/classes/DatabaseError.md), `never`\>

Find details for a specific rule sorted by group and sequence.

#### Parameters

##### ruleId

`bigint`

The rule header ID

#### Returns

`Effect`\<`object`[], [`DatabaseError`](../../../lib/errors/classes/DatabaseError.md), `never`\>

An Effect resolving to an array of details

### findHeaderById()

> **findHeaderById**: (`id`) => `Effect`\<\{ `activeFlag`: `boolean` \| `null`; `createdby`: `string`; `createddate`: `string`; `createdhost`: `string`; `pkid`: `number`; `ruleName`: `string`; `ruleType`: `string`; `seq`: `number` \| `null`; `updatedby`: `string` \| `null`; `updatedColumn`: `string` \| `null`; `updateddate`: `string` \| `null`; `updatedhost`: `string` \| `null`; `updatedTable`: `string` \| `null`; `value`: `string` \| `null`; \}, [`DatabaseError`](../../../lib/errors/classes/DatabaseError.md), `never`\>

Find a rule header by ID.

#### Parameters

##### id

`bigint`

The header ID

#### Returns

`Effect`\<\{ `activeFlag`: `boolean` \| `null`; `createdby`: `string`; `createddate`: `string`; `createdhost`: `string`; `pkid`: `number`; `ruleName`: `string`; `ruleType`: `string`; `seq`: `number` \| `null`; `updatedby`: `string` \| `null`; `updatedColumn`: `string` \| `null`; `updateddate`: `string` \| `null`; `updatedhost`: `string` \| `null`; `updatedTable`: `string` \| `null`; `value`: `string` \| `null`; \}, [`DatabaseError`](../../../lib/errors/classes/DatabaseError.md), `never`\>

An Effect resolving to the header or null

### findHeaders()

> **findHeaders**: (`search?`, `ruleType?`, `activeFlag?`) => `Effect`\<`object`[], [`DatabaseError`](../../../lib/errors/classes/DatabaseError.md), `never`\>

Find rule headers with filtering.

#### Parameters

##### search?

`string`

Search term for rule name or type

##### ruleType?

`string`

Filter by rule type

##### activeFlag?

`boolean`

Filter by active status

#### Returns

`Effect`\<`object`[], [`DatabaseError`](../../../lib/errors/classes/DatabaseError.md), `never`\>

An Effect resolving to an array of headers

### updateDetail()

> **updateDetail**: (`id`, `data`) => `Effect`\<\{ `columnName`: `string`; `condition`: `string` \| `null`; `createdby`: `string`; `createddate`: `string`; `createdhost`: `string`; `dataType`: `string`; `detailType`: `string` \| `null`; `operator`: `string` \| `null`; `pkid`: `number`; `queryGroup`: `number` \| `null`; `ruleId`: `number` \| `null`; `seq`: `number` \| `null`; `stageFrom`: `string` \| `null`; `stageTo`: `string` \| `null`; `tableName`: `string`; `updatedby`: `string` \| `null`; `updateddate`: `string` \| `null`; `updatedhost`: `string` \| `null`; `value1`: `string`; `value2`: `string` \| `null`; \}, [`DatabaseError`](../../../lib/errors/classes/DatabaseError.md), `never`\>

Update an existing rule detail.

#### Parameters

##### id

`bigint`

The detail ID

##### data

`Partial`\<*typeof* `frs9ParamScenarioRulesd.$inferInsert`\>

The data to update

#### Returns

`Effect`\<\{ `columnName`: `string`; `condition`: `string` \| `null`; `createdby`: `string`; `createddate`: `string`; `createdhost`: `string`; `dataType`: `string`; `detailType`: `string` \| `null`; `operator`: `string` \| `null`; `pkid`: `number`; `queryGroup`: `number` \| `null`; `ruleId`: `number` \| `null`; `seq`: `number` \| `null`; `stageFrom`: `string` \| `null`; `stageTo`: `string` \| `null`; `tableName`: `string`; `updatedby`: `string` \| `null`; `updateddate`: `string` \| `null`; `updatedhost`: `string` \| `null`; `value1`: `string`; `value2`: `string` \| `null`; \}, [`DatabaseError`](../../../lib/errors/classes/DatabaseError.md), `never`\>

An Effect resolving to the updated detail or null

### updateHeader()

> **updateHeader**: (`id`, `data`) => `Effect`\<\{ `activeFlag`: `boolean` \| `null`; `createdby`: `string`; `createddate`: `string`; `createdhost`: `string`; `pkid`: `number`; `ruleName`: `string`; `ruleType`: `string`; `seq`: `number` \| `null`; `updatedby`: `string` \| `null`; `updatedColumn`: `string` \| `null`; `updateddate`: `string` \| `null`; `updatedhost`: `string` \| `null`; `updatedTable`: `string` \| `null`; `value`: `string` \| `null`; \}, [`DatabaseError`](../../../lib/errors/classes/DatabaseError.md), `never`\>

Update an existing rule header.

#### Parameters

##### id

`bigint`

The header ID

##### data

`Partial`\<*typeof* `frs9ParamScenarioRulesh.$inferInsert`\>

The data to update

#### Returns

`Effect`\<\{ `activeFlag`: `boolean` \| `null`; `createdby`: `string`; `createddate`: `string`; `createdhost`: `string`; `pkid`: `number`; `ruleName`: `string`; `ruleType`: `string`; `seq`: `number` \| `null`; `updatedby`: `string` \| `null`; `updatedColumn`: `string` \| `null`; `updateddate`: `string` \| `null`; `updatedhost`: `string` \| `null`; `updatedTable`: `string` \| `null`; `value`: `string` \| `null`; \}, [`DatabaseError`](../../../lib/errors/classes/DatabaseError.md), `never`\>

An Effect resolving to the updated header or null
