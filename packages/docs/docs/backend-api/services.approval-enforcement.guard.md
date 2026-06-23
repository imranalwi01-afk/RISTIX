[**Backend API Reference v1.0.0**](index.md)

***

# services/approval-enforcement.guard

## Classes

### ApprovalEnforcementGuard

Defined in: [src/services/approval-enforcement.guard.ts:11](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/new-backend/src/services/approval-enforcement.guard.ts#L11)

Approval enforcement guard for permission execution
Checks if permission requires approval and validates user eligibility

#### Constructors

##### Constructor

> **new ApprovalEnforcementGuard**(`db`): [`ApprovalEnforcementGuard`](#approvalenforcementguard)

Defined in: [src/services/approval-enforcement.guard.ts:14](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/new-backend/src/services/approval-enforcement.guard.ts#L14)

###### Parameters

###### db

`PostgresJsDatabase`&lt;[`db/schema`](db.schema.md)&gt;

###### Returns

[`ApprovalEnforcementGuard`](#approvalenforcementguard)

#### Methods

##### enforceApproval()

> **enforceApproval**(`tenantId`, `permissionId`, `userId`, `userMaxHierarchyLevel`): `Effect`&lt;&#123; `allowed`: `boolean`; `canSelfApprove?`: `undefined`; `message`: `string`; `requirement?`: `undefined`; `requiresApproval`: `boolean`; &#125; &#124; &#123; `allowed`: `boolean`; `canSelfApprove`: `boolean`; `message`: `string`; `requirement?`: `undefined`; `requiresApproval`: `boolean`; &#125; &#124; &#123; `allowed`: `boolean`; `canSelfApprove`: `boolean`; `message`: `string`; `requirement`: [`ApprovalRequirement`](services.permission-approval.service.md#approvalrequirement); `requiresApproval`: `boolean`; &#125;, [`DatabaseError`](lib.errors.md#databaseerror), `never`&gt;

Defined in: [src/services/approval-enforcement.guard.ts:26](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/new-backend/src/services/approval-enforcement.guard.ts#L26)

Check if action can proceed or needs approval

###### Parameters

###### tenantId

`string`

Tenant context

###### permissionId

`string`

Permission being executed

###### userId

`string`

User attempting the action

###### userMaxHierarchyLevel

`number`

User's highest hierarchy level

###### Returns

`Effect`&lt;&#123; `allowed`: `boolean`; `canSelfApprove?`: `undefined`; `message`: `string`; `requirement?`: `undefined`; `requiresApproval`: `boolean`; &#125; &#124; &#123; `allowed`: `boolean`; `canSelfApprove`: `boolean`; `message`: `string`; `requirement?`: `undefined`; `requiresApproval`: `boolean`; &#125; &#124; &#123; `allowed`: `boolean`; `canSelfApprove`: `boolean`; `message`: `string`; `requirement`: [`ApprovalRequirement`](services.permission-approval.service.md#approvalrequirement); `requiresApproval`: `boolean`; &#125;, [`DatabaseError`](lib.errors.md#databaseerror), `never`&gt;

Effect that succeeds if allowed or fails with approval required

##### enforceOrFail()

> **enforceOrFail**(`tenantId`, `permissionId`, `userId`, `userMaxHierarchyLevel`): `Effect`&lt;&#123; `allowed`: `boolean`; `canSelfApprove?`: `undefined`; `message`: `string`; `requirement?`: `undefined`; `requiresApproval`: `boolean`; &#125; &#124; &#123; `allowed`: `boolean`; `canSelfApprove`: `boolean`; `message`: `string`; `requirement?`: `undefined`; `requiresApproval`: `boolean`; &#125; &#124; &#123; `allowed`: `boolean`; `canSelfApprove`: `boolean`; `message`: `string`; `requirement`: [`ApprovalRequirement`](services.permission-approval.service.md#approvalrequirement); `requiresApproval`: `boolean`; &#125;, [`DatabaseError`](lib.errors.md#databaseerror) &#124; [`AuthorizationError`](lib.errors.md#authorizationerror), `never`&gt;

Defined in: [src/services/approval-enforcement.guard.ts:78](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/new-backend/src/services/approval-enforcement.guard.ts#L78)

Enforce approval or throw authorization error
Use this in action handlers that should block if approval is needed

###### Parameters

###### tenantId

`string`

###### permissionId

`string`

###### userId

`string`

###### userMaxHierarchyLevel

`number`

###### Returns

`Effect`&lt;&#123; `allowed`: `boolean`; `canSelfApprove?`: `undefined`; `message`: `string`; `requirement?`: `undefined`; `requiresApproval`: `boolean`; &#125; &#124; &#123; `allowed`: `boolean`; `canSelfApprove`: `boolean`; `message`: `string`; `requirement?`: `undefined`; `requiresApproval`: `boolean`; &#125; &#124; &#123; `allowed`: `boolean`; `canSelfApprove`: `boolean`; `message`: `string`; `requirement`: [`ApprovalRequirement`](services.permission-approval.service.md#approvalrequirement); `requiresApproval`: `boolean`; &#125;, [`DatabaseError`](lib.errors.md#databaseerror) &#124; [`AuthorizationError`](lib.errors.md#authorizationerror), `never`&gt;
