[**Frontend API Reference v1.0.0**](../../README.md)

***

# utils/cookie-domain

## Interfaces

| Interface | Description |
| ------ | ------ |
| [CookieDomainConfig](interfaces/CookieDomainConfig.md) | Utility for determining the correct cookie domain based on current hostname Supports: localhost, ifrspro.id, danafin.com, and other domains |

## Functions

| Function | Description |
| ------ | ------ |
| [buildCookieRemovalString](functions/buildCookieRemovalString.md) | Build cookie removal string |
| [buildCookieString](functions/buildCookieString.md) | Build complete cookie string for document.cookie |
| [getCookieConfig](functions/getCookieConfig.md) | Get complete cookie configuration based on environment |
| [getCookieDomain](functions/getCookieDomain.md) | Get the appropriate cookie domain for the current hostname Returns undefined for localhost (cookies default to exact host) Returns parent domain for production domains (.ifrspro.id, .danafin.com, etc.) |
| [getCookieDomainString](functions/getCookieDomainString.md) | Get cookie domain string for raw document.cookie manipulation Returns empty string for localhost, "domain=.example.com;" for production |
| [getCookieSameSiteString](functions/getCookieSameSiteString.md) | Get sameSite string for raw document.cookie manipulation |
