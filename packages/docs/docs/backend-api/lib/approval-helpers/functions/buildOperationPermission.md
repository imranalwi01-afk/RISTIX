[**Backend API Reference v1.0.0**](../../../README.md)

***

# Function: buildOperationPermission()

> **buildOperationPermission**(`entityType`, `operation`): `string`

Defined in: [src/lib/approval-helpers.ts:182](https://github.com/ifrspro/ifrs9-iaf/blob/cf4905123c7eb3e9046f36ce3f92dd13536ac238/packages/new-backend/src/lib/approval-helpers.ts#L182)

Build canonical banking CRUD permission code.
Example: 'product_parameter' + 'create' => 'banking.parameter.product.create'

## Parameters

### entityType

`string`

### operation

`"update"` | `"delete"` | `"create"`

## Returns

`string`
