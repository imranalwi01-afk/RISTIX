[**Frontend API Reference v1.0.0**](index.md)

***

# utils/cookie-domain

## Interfaces

### CookieDomainConfig

Defined in: [utils/cookie-domain.ts:7](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/frontend/src/utils/cookie-domain.ts#L7)

Utility for determining the correct cookie domain based on current hostname
Supports: localhost, ifrspro.id, ristix.bdo-ki.com, and other domains

#### Properties

##### domain?

> `optional` **domain**: `string`

Defined in: [utils/cookie-domain.ts:8](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/frontend/src/utils/cookie-domain.ts#L8)

##### sameSite

> **sameSite**: `"none"` &#124; `"strict"` &#124; `"lax"`

Defined in: [utils/cookie-domain.ts:10](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/frontend/src/utils/cookie-domain.ts#L10)

##### secure

> **secure**: `boolean`

Defined in: [utils/cookie-domain.ts:9](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/frontend/src/utils/cookie-domain.ts#L9)

## Functions

### buildCookieRemovalString()

> **buildCookieRemovalString**(`name`): `string`

Defined in: [utils/cookie-domain.ts:108](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/frontend/src/utils/cookie-domain.ts#L108)

Build cookie removal string

#### Parameters

##### name

`string`

#### Returns

`string`

***

### buildCookieString()

> **buildCookieString**(`name`, `value`, `maxAge?`): `string`

Defined in: [utils/cookie-domain.ts:92](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/frontend/src/utils/cookie-domain.ts#L92)

Build complete cookie string for document.cookie

#### Parameters

##### name

`string`

##### value

`string`

##### maxAge?

`number` = `...`

#### Returns

`string`

***

### getCookieConfig()

> **getCookieConfig**(`expiryDays?`): [`CookieDomainConfig`](#cookiedomainconfig) & `object`

Defined in: [utils/cookie-domain.ts:50](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/frontend/src/utils/cookie-domain.ts#L50)

Get complete cookie configuration based on environment

#### Parameters

##### expiryDays?

`number` = `7`

#### Returns

[`CookieDomainConfig`](#cookiedomainconfig) & `object`

***

### getCookieDomain()

> **getCookieDomain**(): `string` &#124; `undefined`

Defined in: [utils/cookie-domain.ts:18](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/frontend/src/utils/cookie-domain.ts#L18)

Get the appropriate cookie domain for the current hostname
Returns undefined for localhost (cookies default to exact host)
Returns parent domain for production domains (.ifrspro.id, .ristix.bdo-ki.com, etc.)

#### Returns

`string` &#124; `undefined`

***

### getCookieDomainString()

> **getCookieDomainString**(): `string`

Defined in: [utils/cookie-domain.ts:74](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/frontend/src/utils/cookie-domain.ts#L74)

Get cookie domain string for raw document.cookie manipulation
Returns empty string for localhost, "domain=.example.com;" for production

#### Returns

`string`

***

### getCookieSameSiteString()

> **getCookieSameSiteString**(): `string`

Defined in: [utils/cookie-domain.ts:82](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/frontend/src/utils/cookie-domain.ts#L82)

Get sameSite string for raw document.cookie manipulation

#### Returns

`string`
