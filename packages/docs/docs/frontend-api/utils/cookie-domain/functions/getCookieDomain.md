[**Frontend API Reference v1.0.0**](../../../README.md)

***

# Function: getCookieDomain()

> **getCookieDomain**(): `string` \| `undefined`

Defined in: [utils/cookie-domain.ts:18](https://github.com/ifrspro/ifrs9-iaf/blob/5a4b2221d62f9d823811e12bfc71b7ff82ae62fa/packages/frontend/src/utils/cookie-domain.ts#L18)

Get the appropriate cookie domain for the current hostname
Returns undefined for localhost (cookies default to exact host)
Returns parent domain for production domains (.ifrspro.id, .danafin.com, etc.)

## Returns

`string` \| `undefined`
