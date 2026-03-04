[**Frontend API Reference v1.0.0**](../../../README.md)

***

# Function: getAuthToken()

> **getAuthToken**(): `string` \| `null`

Defined in: [utils/auth-token.ts:8](https://github.com/ifrspro/ifrs9-iaf/blob/2301badfc5ea65510b50f0438f532e45a5ab486b/packages/frontend/src/utils/auth-token.ts#L8)

Get authentication token from cookies or localStorage
Prioritizes cookies for better security and SSR/middleware consistency

## Returns

`string` \| `null`
