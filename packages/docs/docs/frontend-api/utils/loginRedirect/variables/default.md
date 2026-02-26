[**Frontend API Reference v1.0.0**](../../../README.md)

***

# Variable: default

> **default**: `object`

Defined in: [utils/loginRedirect.ts:225](https://github.com/ifrspro/ifrs9-iaf/blob/5a4b2221d62f9d823811e12bfc71b7ff82ae62fa/packages/frontend/src/utils/loginRedirect.ts#L225)

## Type Declaration

### BANKING\_ROUTE\_MAPPING

> **BANKING\_ROUTE\_MAPPING**: `object`

#### BANKING\_ROUTE\_MAPPING.analytics

> **analytics**: `string` = `'/banking/analytics'`

#### BANKING\_ROUTE\_MAPPING.collective

> **collective**: `string` = `'/banking/collective'`

#### BANKING\_ROUTE\_MAPPING.dashboard

> **dashboard**: `string` = `'/banking/dashboard'`

#### BANKING\_ROUTE\_MAPPING.data

> **data**: `string` = `'/banking/data'`

#### BANKING\_ROUTE\_MAPPING.ifrs9

> **ifrs9**: `string` = `'/banking/ifrs9'`

#### BANKING\_ROUTE\_MAPPING.individual

> **individual**: `string` = `'/banking/individual'`

#### BANKING\_ROUTE\_MAPPING.maintenance

> **maintenance**: `string` = `'/banking/maintenance'`

#### BANKING\_ROUTE\_MAPPING.mode

> **mode**: `string` = `'/banking/mode'`

#### BANKING\_ROUTE\_MAPPING.parameters

> **parameters**: `string` = `'/banking/parameters'`

#### BANKING\_ROUTE\_MAPPING.portfolio

> **portfolio**: `string` = `'/banking/portfolio'`

#### BANKING\_ROUTE\_MAPPING.reports

> **reports**: `string` = `'/banking/reports'`

#### BANKING\_ROUTE\_MAPPING.setup

> **setup**: `string` = `'/banking/setup'`

#### BANKING\_ROUTE\_MAPPING.tools

> **tools**: `string` = `'/banking/tools'`

#### BANKING\_ROUTE\_MAPPING.workflow

> **workflow**: `string` = `'/banking/workflow'`

### debugRouting()

> **debugRouting**: (`userRole`, `requestedPath`) => `void`

#### Parameters

##### userRole

`string`

##### requestedPath

`string`

#### Returns

`void`

### getDefaultDashboard()

> **getDefaultDashboard**: (`userRole`) => `string`

#### Parameters

##### userRole

`string`

#### Returns

`string`

### getSmartRedirect()

> **getSmartRedirect**: (`userRole`, `requestedPath?`, `fallbackPath?`) => `string`

#### Parameters

##### userRole

`string`

##### requestedPath?

`string`

##### fallbackPath?

`string`

#### Returns

`string`

### getStakeholderType()

> **getStakeholderType**: (`userRole`) => [`StakeholderType`](../type-aliases/StakeholderType.md) \| `null`

#### Parameters

##### userRole

`string`

#### Returns

[`StakeholderType`](../type-aliases/StakeholderType.md) \| `null`

### hasAccessToPath()

> **hasAccessToPath**: (`userRole`, `path`) => `boolean`

#### Parameters

##### userRole

`string`

##### path

`string`

#### Returns

`boolean`

### ROLE\_TO\_STAKEHOLDER\_MAP

> **ROLE\_TO\_STAKEHOLDER\_MAP**: `Record`\<`string`, [`StakeholderType`](../type-aliases/StakeholderType.md)\>

### STAKEHOLDER\_DASHBOARDS

> **STAKEHOLDER\_DASHBOARDS**: `Record`\<[`StakeholderType`](../type-aliases/StakeholderType.md), `string`\>

### validateBankingRedirect()

> **validateBankingRedirect**: (`path`, `userRole`) => `string`

#### Parameters

##### path

`string`

##### userRole

`string`

#### Returns

`string`
