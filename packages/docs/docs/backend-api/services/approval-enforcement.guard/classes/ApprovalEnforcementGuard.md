[**Backend API Reference v1.0.0**](../../../README.md)

***

# Class: ApprovalEnforcementGuard

Defined in: [src/services/approval-enforcement.guard.ts:11](https://github.com/ifrspro/ifrs9-iaf/blob/cf4905123c7eb3e9046f36ce3f92dd13536ac238/packages/new-backend/src/services/approval-enforcement.guard.ts#L11)

Approval enforcement guard for permission execution
Checks if permission requires approval and validates user eligibility

## Constructors

### Constructor

> **new ApprovalEnforcementGuard**(`db`): `ApprovalEnforcementGuard`

Defined in: [src/services/approval-enforcement.guard.ts:14](https://github.com/ifrspro/ifrs9-iaf/blob/cf4905123c7eb3e9046f36ce3f92dd13536ac238/packages/new-backend/src/services/approval-enforcement.guard.ts#L14)

#### Parameters

##### db

`PostgresJsDatabase`\<[`db/schema`](../../../db/schema/README.md)\>

#### Returns

`ApprovalEnforcementGuard`

## Methods

### enforceApproval()

> **enforceApproval**(`tenantId`, `permissionId`, `userId`, `userMaxHierarchyLevel`): `Effect`\<\{ `allowed`: `boolean`; `canSelfApprove?`: `undefined`; `message`: `string`; `requirement?`: `undefined`; `requiresApproval`: `boolean`; \} \| \{ `allowed`: `boolean`; `canSelfApprove`: `boolean`; `message`: `string`; `requirement?`: `undefined`; `requiresApproval`: `boolean`; \} \| \{ `allowed`: `boolean`; `canSelfApprove`: `boolean`; `message`: `string`; `requirement`: [`ApprovalRequirement`](../../permission-approval.service/interfaces/ApprovalRequirement.md); `requiresApproval`: `boolean`; \}, [`DatabaseError`](../../../lib/errors/classes/DatabaseError.md), `never`\>

Defined in: [src/services/approval-enforcement.guard.ts:26](https://github.com/ifrspro/ifrs9-iaf/blob/cf4905123c7eb3e9046f36ce3f92dd13536ac238/packages/new-backend/src/services/approval-enforcement.guard.ts#L26)

Check if action can proceed or needs approval

#### Parameters

##### tenantId

`string`

Tenant context

##### permissionId

`string`

Permission being executed

##### userId

`string`

User attempting the action

##### userMaxHierarchyLevel

`number`

User's highest hierarchy level

#### Returns

`Effect`\<\{ `allowed`: `boolean`; `canSelfApprove?`: `undefined`; `message`: `string`; `requirement?`: `undefined`; `requiresApproval`: `boolean`; \} \| \{ `allowed`: `boolean`; `canSelfApprove`: `boolean`; `message`: `string`; `requirement?`: `undefined`; `requiresApproval`: `boolean`; \} \| \{ `allowed`: `boolean`; `canSelfApprove`: `boolean`; `message`: `string`; `requirement`: [`ApprovalRequirement`](../../permission-approval.service/interfaces/ApprovalRequirement.md); `requiresApproval`: `boolean`; \}, [`DatabaseError`](../../../lib/errors/classes/DatabaseError.md), `never`\>

Effect that succeeds if allowed or fails with approval required

***

### enforceOrFail()

> **enforceOrFail**(`tenantId`, `permissionId`, `userId`, `userMaxHierarchyLevel`): `Effect`\<\{ `allowed`: `boolean`; `canSelfApprove?`: `undefined`; `message`: `string`; `requirement?`: `undefined`; `requiresApproval`: `boolean`; \} \| \{ `allowed`: `boolean`; `canSelfApprove`: `boolean`; `message`: `string`; `requirement?`: `undefined`; `requiresApproval`: `boolean`; \} \| \{ `allowed`: `boolean`; `canSelfApprove`: `boolean`; `message`: `string`; `requirement`: [`ApprovalRequirement`](../../permission-approval.service/interfaces/ApprovalRequirement.md); `requiresApproval`: `boolean`; \}, [`DatabaseError`](../../../lib/errors/classes/DatabaseError.md) \| [`AuthorizationError`](../../../lib/errors/classes/AuthorizationError.md), `never`\>

Defined in: [src/services/approval-enforcement.guard.ts:78](https://github.com/ifrspro/ifrs9-iaf/blob/cf4905123c7eb3e9046f36ce3f92dd13536ac238/packages/new-backend/src/services/approval-enforcement.guard.ts#L78)

Enforce approval or throw authorization error
Use this in action handlers that should block if approval is needed

#### Parameters

##### tenantId

`string`

##### permissionId

`string`

##### userId

`string`

##### userMaxHierarchyLevel

`number`

#### Returns

`Effect`\<\{ `allowed`: `boolean`; `canSelfApprove?`: `undefined`; `message`: `string`; `requirement?`: `undefined`; `requiresApproval`: `boolean`; \} \| \{ `allowed`: `boolean`; `canSelfApprove`: `boolean`; `message`: `string`; `requirement?`: `undefined`; `requiresApproval`: `boolean`; \} \| \{ `allowed`: `boolean`; `canSelfApprove`: `boolean`; `message`: `string`; `requirement`: [`ApprovalRequirement`](../../permission-approval.service/interfaces/ApprovalRequirement.md); `requiresApproval`: `boolean`; \}, [`DatabaseError`](../../../lib/errors/classes/DatabaseError.md) \| [`AuthorizationError`](../../../lib/errors/classes/AuthorizationError.md), `never`\>
