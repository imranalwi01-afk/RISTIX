[**Frontend API Reference v1.0.0**](index.md)

***

# utils/approval

## Interfaces

### ApprovalMetadata

Defined in: [utils/approval.ts:5](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/frontend/src/utils/approval.ts#L5)

Approval utilities for checking user eligibility and permission requirements

#### Properties

##### requiredApprovalLevel

> **requiredApprovalLevel**: `number` \| `null`

Defined in: [utils/approval.ts:7](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/frontend/src/utils/approval.ts#L7)

##### requiredApprovers

> **requiredApprovers**: `number`

Defined in: [utils/approval.ts:8](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/frontend/src/utils/approval.ts#L8)

##### requiresApproval

> **requiresApproval**: `boolean`

Defined in: [utils/approval.ts:6](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/frontend/src/utils/approval.ts#L6)

***

### UserRoleInfo

Defined in: [utils/approval.ts:11](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/frontend/src/utils/approval.ts#L11)

#### Properties

##### hierarchyLevel

> **hierarchyLevel**: `number`

Defined in: [utils/approval.ts:12](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/frontend/src/utils/approval.ts#L12)

##### roleCode

> **roleCode**: `string`

Defined in: [utils/approval.ts:13](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/frontend/src/utils/approval.ts#L13)

##### roleName

> **roleName**: `string`

Defined in: [utils/approval.ts:14](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/frontend/src/utils/approval.ts#L14)

## Functions

### canUserApprove()

> **canUserApprove**(`userMaxHierarchyLevel`, `requiredMinHierarchyLevel`): `boolean`

Defined in: [utils/approval.ts:23](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/frontend/src/utils/approval.ts#L23)

Check if user can approve based on their highest hierarchy level

#### Parameters

##### userMaxHierarchyLevel

`number`

Highest hierarchy level among user's roles

##### requiredMinHierarchyLevel

Minimum level required to approve

`number` | `null`

#### Returns

`boolean`

true if user meets or exceeds the required level

***

### checkApprovalEligibility()

> **checkApprovalEligibility**(`userRoles`, `approval`): `object`

Defined in: [utils/approval.ts:49](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/frontend/src/utils/approval.ts#L49)

Check if user has sufficient privileges for a permission

#### Parameters

##### userRoles

[`UserRoleInfo`](#userroleinfo)[]

User's current roles

##### approval

[`ApprovalMetadata`](#approvalmetadata)

Permission's approval requirements

#### Returns

`object`

Object with eligibility status and reason

##### canApprove

> **canApprove**: `boolean`

##### maxLevel

> **maxLevel**: `number`

##### reason

> **reason**: `string`

##### requiredLevel

> **requiredLevel**: `number` \| `null`

***

### getApprovalBadgeColor()

> **getApprovalBadgeColor**(`level`): `"error"` \| `"default"` \| `"info"` \| `"warning"`

Defined in: [utils/approval.ts:129](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/frontend/src/utils/approval.ts#L129)

Get approval badge color based on level

#### Parameters

##### level

Required approval level

`number` | `null`

#### Returns

`"error"` \| `"default"` \| `"info"` \| `"warning"`

MUI color name

***

### getApprovalStatusMessage()

> **getApprovalStatusMessage**(`approval`): `string`

Defined in: [utils/approval.ts:96](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/frontend/src/utils/approval.ts#L96)

Get approval status message for UI display

#### Parameters

##### approval

[`ApprovalMetadata`](#approvalmetadata)

Permission's approval requirements

#### Returns

`string`

Human-readable status string

***

### getHierarchyLevelName()

> **getHierarchyLevelName**(`level`): `string`

Defined in: [utils/approval.ts:113](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/frontend/src/utils/approval.ts#L113)

Get hierarchy level display name

#### Parameters

##### level

`number`

Hierarchy level number (1-10)

#### Returns

`string`

Human-readable level name

***

### getUserMaxHierarchyLevel()

> **getUserMaxHierarchyLevel**(`roles`): `number`

Defined in: [utils/approval.ts:38](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/frontend/src/utils/approval.ts#L38)

Get the highest hierarchy level from user's roles

#### Parameters

##### roles

[`UserRoleInfo`](#userroleinfo)[]

Array of user's role assignments

#### Returns

`number`

Maximum hierarchy level, or 1 if no roles
