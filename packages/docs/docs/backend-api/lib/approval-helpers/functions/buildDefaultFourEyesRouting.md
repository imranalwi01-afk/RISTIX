[**Backend API Reference v1.0.0**](../../../README.md)

***

# Function: buildDefaultFourEyesRouting()

> **buildDefaultFourEyesRouting**(`_entityType`): [`ApprovalRoutingLevel`](../interfaces/ApprovalRoutingLevel.md)[]

Defined in: [src/lib/approval-helpers.ts:354](https://github.com/ifrspro/ifrs9-iaf/blob/5a4b2221d62f9d823811e12bfc71b7ff82ae62fa/packages/new-backend/src/lib/approval-helpers.ts#L354)

Default fallback routing for strict entities when matrix data is missing.
This keeps approval eligibility deterministic and visible.

## Parameters

### \_entityType

`string`

## Returns

[`ApprovalRoutingLevel`](../interfaces/ApprovalRoutingLevel.md)[]
