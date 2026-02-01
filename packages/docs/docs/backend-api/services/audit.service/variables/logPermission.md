[**Backend API Reference v1.0.0**](../../../README.md)

***

# Variable: logPermission

> `const` **logPermission**: `object`

Defined in: [packages/new-backend/src/services/audit.service.ts:215](https://github.com/ifrspro/ifrs9-iaf/blob/2c233b31171a451bb86daacd4389a961f1213deb/packages/new-backend/src/services/audit.service.ts#L215)

Log permission changes

## Type Declaration

### permissionsUpdated()

> **permissionsUpdated**: (`roleId`, `roleName`, `oldPermissions`, `newPermissions`, `updatedBy`, `tenantId`) => `Promise`\<`void`\>

#### Parameters

##### roleId

`string`

##### roleName

`string`

##### oldPermissions

`any`

##### newPermissions

`any`

##### updatedBy

`string`

##### tenantId

`string`

#### Returns

`Promise`\<`void`\>

### roleAssigned()

> **roleAssigned**: (`userId`, `roleId`, `roleName`, `assignedBy`, `tenantId`) => `Promise`\<`void`\>

#### Parameters

##### userId

`string`

##### roleId

`string`

##### roleName

`string`

##### assignedBy

`string`

##### tenantId

`string`

#### Returns

`Promise`\<`void`\>

### roleRevoked()

> **roleRevoked**: (`userId`, `roleId`, `roleName`, `revokedBy`, `tenantId`) => `Promise`\<`void`\>

#### Parameters

##### userId

`string`

##### roleId

`string`

##### roleName

`string`

##### revokedBy

`string`

##### tenantId

`string`

#### Returns

`Promise`\<`void`\>
