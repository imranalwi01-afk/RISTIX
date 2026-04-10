[**Frontend API Reference v1.0.0**](index.md)

***

# utils/loginRedirect

## Type Aliases

### StakeholderType

> **StakeholderType** = `"platform-admin"` \| `"banking"` \| `"consultant"` \| `"regulator"`

Defined in: [utils/loginRedirect.ts:8](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/frontend/src/utils/loginRedirect.ts#L8)

## Variables

### BANKING\_ROUTE\_MAPPING

> `const` **BANKING\_ROUTE\_MAPPING**: `object`

Defined in: [utils/loginRedirect.ts:169](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/frontend/src/utils/loginRedirect.ts#L169)

#### Type Declaration

##### analytics

> **analytics**: `string` = `'/banking/analytics'`

##### collective

> **collective**: `string` = `'/banking/collective'`

##### dashboard

> **dashboard**: `string` = `'/banking/dashboard'`

##### data

> **data**: `string` = `'/banking/data'`

##### ifrs9

> **ifrs9**: `string` = `'/banking/ifrs9'`

##### individual

> **individual**: `string` = `'/banking/individual'`

##### maintenance

> **maintenance**: `string` = `'/banking/maintenance'`

##### mode

> **mode**: `string` = `'/banking/mode'`

##### parameters

> **parameters**: `string` = `'/banking/parameters'`

##### portfolio

> **portfolio**: `string` = `'/banking/portfolio'`

##### reports

> **reports**: `string` = `'/banking/reports'`

##### setup

> **setup**: `string` = `'/banking/setup'`

##### tools

> **tools**: `string` = `'/banking/tools'`

##### workflow

> **workflow**: `string` = `'/banking/workflow'`

***

### debugRedirect()

> `const` **debugRedirect**: (`userRole`, `requestedPath`) => `void` = `debugRouting`

Defined in: [utils/loginRedirect.ts:223](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/frontend/src/utils/loginRedirect.ts#L223)

#### Parameters

##### userRole

`string`

##### requestedPath

`string`

#### Returns

`void`

***

### default

> **default**: `object`

Defined in: [utils/loginRedirect.ts:225](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/frontend/src/utils/loginRedirect.ts#L225)

#### Type Declaration

##### BANKING\_ROUTE\_MAPPING

> **BANKING\_ROUTE\_MAPPING**: `object`

###### BANKING\_ROUTE\_MAPPING.analytics

> **analytics**: `string` = `'/banking/analytics'`

###### BANKING\_ROUTE\_MAPPING.collective

> **collective**: `string` = `'/banking/collective'`

###### BANKING\_ROUTE\_MAPPING.dashboard

> **dashboard**: `string` = `'/banking/dashboard'`

###### BANKING\_ROUTE\_MAPPING.data

> **data**: `string` = `'/banking/data'`

###### BANKING\_ROUTE\_MAPPING.ifrs9

> **ifrs9**: `string` = `'/banking/ifrs9'`

###### BANKING\_ROUTE\_MAPPING.individual

> **individual**: `string` = `'/banking/individual'`

###### BANKING\_ROUTE\_MAPPING.maintenance

> **maintenance**: `string` = `'/banking/maintenance'`

###### BANKING\_ROUTE\_MAPPING.mode

> **mode**: `string` = `'/banking/mode'`

###### BANKING\_ROUTE\_MAPPING.parameters

> **parameters**: `string` = `'/banking/parameters'`

###### BANKING\_ROUTE\_MAPPING.portfolio

> **portfolio**: `string` = `'/banking/portfolio'`

###### BANKING\_ROUTE\_MAPPING.reports

> **reports**: `string` = `'/banking/reports'`

###### BANKING\_ROUTE\_MAPPING.setup

> **setup**: `string` = `'/banking/setup'`

###### BANKING\_ROUTE\_MAPPING.tools

> **tools**: `string` = `'/banking/tools'`

###### BANKING\_ROUTE\_MAPPING.workflow

> **workflow**: `string` = `'/banking/workflow'`

##### debugRouting()

> **debugRouting**: (`userRole`, `requestedPath`) => `void`

###### Parameters

###### userRole

`string`

###### requestedPath

`string`

###### Returns

`void`

##### getDefaultDashboard()

> **getDefaultDashboard**: (`userRole`) => `string`

###### Parameters

###### userRole

`string`

###### Returns

`string`

##### getSmartRedirect()

> **getSmartRedirect**: (`userRole`, `requestedPath?`, `fallbackPath?`) => `string`

###### Parameters

###### userRole

`string`

###### requestedPath?

`string`

###### fallbackPath?

`string`

###### Returns

`string`

##### getStakeholderType()

> **getStakeholderType**: (`userRole`) => [`StakeholderType`](#stakeholdertype) \| `null`

###### Parameters

###### userRole

`string`

###### Returns

[`StakeholderType`](#stakeholdertype) \| `null`

##### hasAccessToPath()

> **hasAccessToPath**: (`userRole`, `path`) => `boolean`

###### Parameters

###### userRole

`string`

###### path

`string`

###### Returns

`boolean`

##### ROLE\_TO\_STAKEHOLDER\_MAP

> **ROLE\_TO\_STAKEHOLDER\_MAP**: `Record`\<`string`, [`StakeholderType`](#stakeholdertype)\>

##### STAKEHOLDER\_DASHBOARDS

> **STAKEHOLDER\_DASHBOARDS**: `Record`\<[`StakeholderType`](#stakeholdertype), `string`\>

##### validateBankingRedirect()

> **validateBankingRedirect**: (`path`, `userRole`) => `string`

###### Parameters

###### path

`string`

###### userRole

`string`

###### Returns

`string`

***

### getLoginRedirectUrl()

> `const` **getLoginRedirectUrl**: (`userRole`, `requestedPath?`, `fallbackPath?`) => `string` = `getSmartRedirect`

Defined in: [utils/loginRedirect.ts:145](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/frontend/src/utils/loginRedirect.ts#L145)

#### Parameters

##### userRole

`string`

##### requestedPath?

`string`

##### fallbackPath?

`string`

#### Returns

`string`

***

### hasRoleAccess()

> `const` **hasRoleAccess**: (`userRole`, `path`) => `boolean` = `hasAccessToPath`

Defined in: [utils/loginRedirect.ts:222](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/frontend/src/utils/loginRedirect.ts#L222)

#### Parameters

##### userRole

`string`

##### path

`string`

#### Returns

`boolean`

***

### ROLE\_TO\_STAKEHOLDER\_MAP

> `const` **ROLE\_TO\_STAKEHOLDER\_MAP**: `Record`\<`string`, [`StakeholderType`](#stakeholdertype)\>

Defined in: [utils/loginRedirect.ts:11](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/frontend/src/utils/loginRedirect.ts#L11)

***

### STAKEHOLDER\_DASHBOARDS

> `const` **STAKEHOLDER\_DASHBOARDS**: `Record`\<[`StakeholderType`](#stakeholdertype), `string`\>

Defined in: [utils/loginRedirect.ts:54](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/frontend/src/utils/loginRedirect.ts#L54)

## Functions

### debugRouting()

> **debugRouting**(`userRole`, `requestedPath`): `void`

Defined in: [utils/loginRedirect.ts:193](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/frontend/src/utils/loginRedirect.ts#L193)

#### Parameters

##### userRole

`string`

##### requestedPath

`string`

#### Returns

`void`

***

### getDefaultDashboard()

> **getDefaultDashboard**(`userRole`): `string`

Defined in: [utils/loginRedirect.ts:97](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/frontend/src/utils/loginRedirect.ts#L97)

#### Parameters

##### userRole

`string`

#### Returns

`string`

***

### getSmartRedirect()

> **getSmartRedirect**(`userRole`, `requestedPath?`, `fallbackPath?`): `string`

Defined in: [utils/loginRedirect.ts:103](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/frontend/src/utils/loginRedirect.ts#L103)

#### Parameters

##### userRole

`string`

##### requestedPath?

`string`

##### fallbackPath?

`string`

#### Returns

`string`

***

### getStakeholderType()

> **getStakeholderType**(`userRole`): [`StakeholderType`](#stakeholdertype) \| `null`

Defined in: [utils/loginRedirect.ts:92](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/frontend/src/utils/loginRedirect.ts#L92)

#### Parameters

##### userRole

`string`

#### Returns

[`StakeholderType`](#stakeholdertype) \| `null`

***

### hasAccessToPath()

> **hasAccessToPath**(`userRole`, `path`): `boolean`

Defined in: [utils/loginRedirect.ts:148](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/frontend/src/utils/loginRedirect.ts#L148)

#### Parameters

##### userRole

`string`

##### path

`string`

#### Returns

`boolean`

***

### validateBankingRedirect()

> **validateBankingRedirect**(`path`, `userRole`): `string`

Defined in: [utils/loginRedirect.ts:62](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/frontend/src/utils/loginRedirect.ts#L62)

#### Parameters

##### path

`string`

##### userRole

`string`

#### Returns

`string`
