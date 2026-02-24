[**Backend API Reference v1.0.0**](../../../README.md)

***

# Function: buildDefaultFourEyesRouting()

> **buildDefaultFourEyesRouting**(`_entityType`): [`ApprovalRoutingLevel`](../interfaces/ApprovalRoutingLevel.md)[]

Defined in: [src/lib/approval-helpers.ts:351](https://github.com/ifrspro/ifrs9-iaf/blob/cf4905123c7eb3e9046f36ce3f92dd13536ac238/packages/new-backend/src/lib/approval-helpers.ts#L351)

Default fallback routing for strict entities when matrix data is missing.
This keeps approval eligibility deterministic and visible.

## Parameters

### \_entityType

`string`

## Returns

[`ApprovalRoutingLevel`](../interfaces/ApprovalRoutingLevel.md)[]
