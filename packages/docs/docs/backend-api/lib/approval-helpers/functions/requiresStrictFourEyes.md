[**Backend API Reference v1.0.0**](../../../README.md)

***

# Function: requiresStrictFourEyes()

> **requiresStrictFourEyes**(`entityType`): `boolean`

Defined in: [src/lib/approval-helpers.ts:340](https://github.com/ifrspro/ifrs9-iaf/blob/cf4905123c7eb3e9046f36ce3f92dd13536ac238/packages/new-backend/src/lib/approval-helpers.ts#L340)

Strict 4-eyes mode can be disabled explicitly for lower environments.
By default it is enabled to prevent self-approval bypass for privileged entities.

## Parameters

### entityType

`string`

## Returns

`boolean`
