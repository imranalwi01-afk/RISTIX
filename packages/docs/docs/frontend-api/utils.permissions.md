[**Frontend API Reference v1.0.0**](index.md)

***

# utils/permissions

## Variables

### PERMISSIONS

> `const` **PERMISSIONS**: `object`

Defined in: [utils/permissions.ts:3](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/frontend/src/utils/permissions.ts#L3)

#### Type Declaration

##### CONSULTANT\_ACCESS\_PROJECTS

> `readonly` **CONSULTANT\_ACCESS\_PROJECTS**: `"consultant:access:projects"` = `'consultant:access:projects'`

##### CONSULTANT\_ACCESS\_TENANT\_DATA

> `readonly` **CONSULTANT\_ACCESS\_TENANT\_DATA**: `"consultant:access:tenant_data"` = `'consultant:access:tenant_data'`

##### CONSULTANT\_PERFORM\_VALIDATION

> `readonly` **CONSULTANT\_PERFORM\_VALIDATION**: `"consultant:perform:validation"` = `'consultant:perform:validation'`

##### CONSULTANT\_SUBMIT\_DELIVERABLES

> `readonly` **CONSULTANT\_SUBMIT\_DELIVERABLES**: `"consultant:submit:deliverables"` = `'consultant:submit:deliverables'`

##### PLATFORM\_MANAGE\_ALL

> `readonly` **PLATFORM\_MANAGE\_ALL**: `"platform:manage:all"` = `'platform:manage:all'`

##### PLATFORM\_MANAGE\_CONSULTANTS

> `readonly` **PLATFORM\_MANAGE\_CONSULTANTS**: `"platform:manage:consultants"` = `'platform:manage:consultants'`

##### PLATFORM\_MANAGE\_INSTITUTIONS

> `readonly` **PLATFORM\_MANAGE\_INSTITUTIONS**: `"platform:manage:institutions"` = `'platform:manage:institutions'`

##### PLATFORM\_MANAGE\_USERS

> `readonly` **PLATFORM\_MANAGE\_USERS**: `"platform:manage:users"` = `'platform:manage:users'`

##### PLATFORM\_VIEW\_ALL\_TENANTS

> `readonly` **PLATFORM\_VIEW\_ALL\_TENANTS**: `"platform:view:all_tenants"` = `'platform:view:all_tenants'`

##### REGULATOR\_AUDIT\_COMPLIANCE

> `readonly` **REGULATOR\_AUDIT\_COMPLIANCE**: `"regulator:audit:compliance"` = `'regulator:audit:compliance'`

##### REGULATOR\_VIEW\_ALL\_BANKS

> `readonly` **REGULATOR\_VIEW\_ALL\_BANKS**: `"regulator:view:all_banks"` = `'regulator:view:all_banks'`

##### REGULATOR\_VIEW\_CONSULTANT\_WORK

> `readonly` **REGULATOR\_VIEW\_CONSULTANT\_WORK**: `"regulator:view:consultant_work"` = `'regulator:view:consultant_work'`

##### TENANT\_CALCULATE\_ECL

> `readonly` **TENANT\_CALCULATE\_ECL**: `"tenant:calculate:ecl"` = `'tenant:calculate:ecl'`

##### TENANT\_MANAGE\_ACCOUNTS

> `readonly` **TENANT\_MANAGE\_ACCOUNTS**: `"tenant:manage:accounts"` = `'tenant:manage:accounts'`

##### TENANT\_MANAGE\_CONSULTANTS

> `readonly` **TENANT\_MANAGE\_CONSULTANTS**: `"tenant:manage:consultants"` = `'tenant:manage:consultants'`

##### TENANT\_MANAGE\_IFRS9

> `readonly` **TENANT\_MANAGE\_IFRS9**: `"tenant:manage:ifrs9"` = `'tenant:manage:ifrs9'`

##### TENANT\_MANAGE\_USERS

> `readonly` **TENANT\_MANAGE\_USERS**: `"tenant:manage:users"` = `'tenant:manage:users'`

##### TENANT\_VIEW\_PORTFOLIO

> `readonly` **TENANT\_VIEW\_PORTFOLIO**: `"tenant:view:portfolio"` = `'tenant:view:portfolio'`

##### TENANT\_VIEW\_REPORTS

> `readonly` **TENANT\_VIEW\_REPORTS**: `"tenant:view:reports"` = `'tenant:view:reports'`

***

### STAKEHOLDER\_PERMISSIONS

> `const` **STAKEHOLDER\_PERMISSIONS**: `object`

Defined in: [utils/permissions.ts:34](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/frontend/src/utils/permissions.ts#L34)

#### Type Declaration

##### bank\_admin

> `readonly` **bank\_admin**: readonly \[`"tenant:manage:users"`, `"tenant:manage:ifrs9"`, `"tenant:view:reports"`, `"tenant:manage:consultants"`, `"tenant:view:portfolio"`, `"tenant:calculate:ecl"`, `"tenant:manage:accounts"`\]

##### bank\_user

> `readonly` **bank\_user**: readonly \[`"tenant:view:portfolio"`, `"tenant:calculate:ecl"`, `"tenant:manage:accounts"`\]

##### consultant

> `readonly` **consultant**: readonly \[`"consultant:access:projects"`, `"consultant:perform:validation"`, `"consultant:submit:deliverables"`, `"consultant:access:tenant_data"`\]

##### platform\_admin

> `readonly` **platform\_admin**: readonly \[`"platform:manage:all"`, `"platform:view:all_tenants"`, `"platform:manage:users"`, `"platform:manage:institutions"`, `"platform:manage:consultants"`\]

##### regulator

> `readonly` **regulator**: readonly \[`"regulator:view:all_banks"`, `"regulator:audit:compliance"`, `"regulator:view:consultant_work"`, `"tenant:view:reports"`, `"tenant:view:portfolio"`\]

## Functions

### hasAllPermissions()

> **hasAllPermissions**(`userStakeholderType`, `requiredPermissions`): `boolean`

Defined in: [utils/permissions.ts:80](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/frontend/src/utils/permissions.ts#L80)

#### Parameters

##### userStakeholderType

`string`

##### requiredPermissions

`string`[]

#### Returns

`boolean`

***

### hasAnyPermission()

> **hasAnyPermission**(`userStakeholderType`, `requiredPermissions`): `boolean`

Defined in: [utils/permissions.ts:76](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/frontend/src/utils/permissions.ts#L76)

#### Parameters

##### userStakeholderType

`string`

##### requiredPermissions

`string`[]

#### Returns

`boolean`

***

### hasPermission()

> **hasPermission**(`userStakeholderType`, `requiredPermission`): `boolean`

Defined in: [utils/permissions.ts:71](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/frontend/src/utils/permissions.ts#L71)

#### Parameters

##### userStakeholderType

`string`

##### requiredPermission

`string`

#### Returns

`boolean`
