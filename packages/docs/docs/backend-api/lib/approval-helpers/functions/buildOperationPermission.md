[**Backend API Reference v1.0.0**](../../../README.md)

***

# Function: buildOperationPermission()

> **buildOperationPermission**(`entityType`, `operation`): `string`

Defined in: [src/lib/approval-helpers.ts:182](https://github.com/ifrspro/ifrs9-iaf/blob/5a4b2221d62f9d823811e12bfc71b7ff82ae62fa/packages/new-backend/src/lib/approval-helpers.ts#L182)

Build canonical banking CRUD permission code.
Example: 'product_parameter' + 'create' => 'banking.parameter.product.create'

## Parameters

### entityType

`string`

### operation

`"update"` | `"delete"` | `"create"`

## Returns

`string`
