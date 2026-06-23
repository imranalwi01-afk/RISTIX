[**Backend API Reference v1.0.0**](index.md)

***

# services/impact-config.service

## Interfaces

### ImpactConfig

Defined in: [src/services/impact-config.service.ts:16](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/new-backend/src/services/impact-config.service.ts#L16)

#### Properties

##### defaultImpact

> **defaultImpact**: [`ImpactLevel`](#impactlevel)

Defined in: [src/services/impact-config.service.ts:22](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/new-backend/src/services/impact-config.service.ts#L22)

##### defaultPriority

> **defaultPriority**: `string`

Defined in: [src/services/impact-config.service.ts:21](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/new-backend/src/services/impact-config.service.ts#L21)

##### jobTypeMinimums

> **jobTypeMinimums**: `Record`&lt;`string`, &#123; `forceComment`: `boolean`; `minApprovals`: `number`; `minImpact`: [`ImpactLevel`](#impactlevel); &#125;&gt;

Defined in: [src/services/impact-config.service.ts:18](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/new-backend/src/services/impact-config.service.ts#L18)

##### levels

> **levels**: `Record`&lt;[`ImpactLevel`](#impactlevel), [`ImpactLevelConfig`](#impactlevelconfig)&gt;

Defined in: [src/services/impact-config.service.ts:20](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/new-backend/src/services/impact-config.service.ts#L20)

##### priorityMapping

> **priorityMapping**: `Record`&lt;`string`, [`ImpactLevel`](#impactlevel)&gt;

Defined in: [src/services/impact-config.service.ts:17](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/new-backend/src/services/impact-config.service.ts#L17)

##### targetDbElevations

> **targetDbElevations**: `Record`&lt;`string`, [`ImpactLevel`](#impactlevel)&gt;

Defined in: [src/services/impact-config.service.ts:19](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/new-backend/src/services/impact-config.service.ts#L19)

***

### ImpactLevelConfig

Defined in: [src/services/impact-config.service.ts:6](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/new-backend/src/services/impact-config.service.ts#L6)

#### Properties

##### approvalsRequired

> **approvalsRequired**: `number`

Defined in: [src/services/impact-config.service.ts:9](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/new-backend/src/services/impact-config.service.ts#L9)

##### escalationAfterHours

> **escalationAfterHours**: `number`

Defined in: [src/services/impact-config.service.ts:11](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/new-backend/src/services/impact-config.service.ts#L11)

##### queuePriority

> **queuePriority**: `number`

Defined in: [src/services/impact-config.service.ts:13](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/new-backend/src/services/impact-config.service.ts#L13)

##### requireDecisionComment

> **requireDecisionComment**: `boolean`

Defined in: [src/services/impact-config.service.ts:12](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/new-backend/src/services/impact-config.service.ts#L12)

##### scoreMax

> **scoreMax**: `number`

Defined in: [src/services/impact-config.service.ts:8](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/new-backend/src/services/impact-config.service.ts#L8)

##### scoreMin

> **scoreMin**: `number`

Defined in: [src/services/impact-config.service.ts:7](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/new-backend/src/services/impact-config.service.ts#L7)

##### slaHours

> **slaHours**: `number`

Defined in: [src/services/impact-config.service.ts:10](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/new-backend/src/services/impact-config.service.ts#L10)

## Type Aliases

### ImpactLevel

> **ImpactLevel** = `"low"` &#124; `"medium"` &#124; `"high"` &#124; `"critical"`

Defined in: [src/services/impact-config.service.ts:4](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/new-backend/src/services/impact-config.service.ts#L4)

## Functions

### clearImpactConfigCache()

> **clearImpactConfigCache**(): `void`

Defined in: [src/services/impact-config.service.ts:114](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/new-backend/src/services/impact-config.service.ts#L114)

#### Returns

`void`

***

### deriveImpactFromScore()

> **deriveImpactFromScore**(`score`, `jobType`, `targetDatabase`, `config?`): `object`

Defined in: [src/services/impact-config.service.ts:123](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/new-backend/src/services/impact-config.service.ts#L123)

Derive impact level from a numeric score (1-100) using configured score ranges.
Falls back to deriveImpactLevel if score is not provided.

#### Parameters

##### score

`number` &#124; `null` &#124; `undefined`

##### jobType

`string` &#124; `null` &#124; `undefined`

##### targetDatabase

`string` &#124; `null` &#124; `undefined`

##### config?

[`ImpactConfig`](#impactconfig) = `DEFAULT_CONFIG`

#### Returns

`object`

##### approvalsRequired

> **approvalsRequired**: `number`

##### escalationAfterHours

> **escalationAfterHours**: `number`

##### impactLevel

> **impactLevel**: [`ImpactLevel`](#impactlevel)

##### queuePriority

> **queuePriority**: `number`

##### requireDecisionComment

> **requireDecisionComment**: `boolean`

##### slaHours

> **slaHours**: `number`

***

### deriveImpactLevel()

> **deriveImpactLevel**(`priority`, `jobType`, `targetDatabase`, `config?`): `object`

Defined in: [src/services/impact-config.service.ts:175](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/new-backend/src/services/impact-config.service.ts#L175)

Derive impact level and requirements from priority, job type, and target database.

#### Parameters

##### priority

`string` &#124; `null` &#124; `undefined`

##### jobType

`string` &#124; `null` &#124; `undefined`

##### targetDatabase

`string` &#124; `null` &#124; `undefined`

##### config?

[`ImpactConfig`](#impactconfig) = `DEFAULT_CONFIG`

#### Returns

`object`

##### approvalsRequired

> **approvalsRequired**: `number`

##### escalationAfterHours

> **escalationAfterHours**: `number`

##### impactLevel

> **impactLevel**: [`ImpactLevel`](#impactlevel)

##### queuePriority

> **queuePriority**: `number`

##### requireDecisionComment

> **requireDecisionComment**: `boolean`

##### slaHours

> **slaHours**: `number`

***

### getImpactConfig()

> **getImpactConfig**(): `Promise`&lt;[`ImpactConfig`](#impactconfig)&gt;

Defined in: [src/services/impact-config.service.ts:105](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/new-backend/src/services/impact-config.service.ts#L105)

#### Returns

`Promise`&lt;[`ImpactConfig`](#impactconfig)&gt;
