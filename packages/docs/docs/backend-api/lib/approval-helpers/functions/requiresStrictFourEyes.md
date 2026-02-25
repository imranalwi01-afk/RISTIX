[**Backend API Reference v1.0.0**](../../../README.md)

***

# Function: requiresStrictFourEyes()

> **requiresStrictFourEyes**(`entityType`): `boolean`

Defined in: [src/lib/approval-helpers.ts:343](https://github.com/ifrspro/ifrs9-iaf/blob/5a4b2221d62f9d823811e12bfc71b7ff82ae62fa/packages/new-backend/src/lib/approval-helpers.ts#L343)

Strict 4-eyes mode can be disabled explicitly for lower environments.
By default it is enabled to prevent self-approval bypass for privileged entities.

## Parameters

### entityType

`string`

## Returns

`boolean`
