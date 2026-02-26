[**Frontend API Reference v1.0.0**](../../../README.md)

***

# Function: getAuthToken()

> **getAuthToken**(): `string` \| `null`

Defined in: [utils/auth-token.ts:8](https://github.com/ifrspro/ifrs9-iaf/blob/5a4b2221d62f9d823811e12bfc71b7ff82ae62fa/packages/frontend/src/utils/auth-token.ts#L8)

Get authentication token from cookies or localStorage
Prioritizes cookies for better security and SSR/middleware consistency

## Returns

`string` \| `null`
