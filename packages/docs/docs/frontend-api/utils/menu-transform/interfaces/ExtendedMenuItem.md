[**Frontend API Reference v1.0.0**](../../../README.md)

***

# Interface: ExtendedMenuItem

Defined in: [utils/menu-transform.ts:13](https://github.com/ifrspro/ifrs9-iaf/blob/5a4b2221d62f9d823811e12bfc71b7ff82ae62fa/packages/frontend/src/utils/menu-transform.ts#L13)

## Extends

- `MenuItem`

## Properties

### badge?

> `optional` **badge**: `object`

Defined in: [services/menu.service.ts:21](https://github.com/ifrspro/ifrs9-iaf/blob/5a4b2221d62f9d823811e12bfc71b7ff82ae62fa/packages/frontend/src/services/menu.service.ts#L21)

#### color?

> `optional` **color**: `"error"` \| `"success"` \| `"primary"` \| `"secondary"` \| `"info"` \| `"warning"`

#### content?

> `optional` **content**: `string` \| `number`

#### Inherited from

`MenuItem.badge`

***

### banking\_modes?

> `optional` **banking\_modes**: (`"conventional"` \| `"syariah"` \| `"dual"`)[]

Defined in: [services/menu.service.ts:19](https://github.com/ifrspro/ifrs9-iaf/blob/5a4b2221d62f9d823811e12bfc71b7ff82ae62fa/packages/frontend/src/services/menu.service.ts#L19)

#### Inherited from

`MenuItem.banking_modes`

***

### children?

> `optional` **children**: `ExtendedMenuItem`[]

Defined in: [utils/menu-transform.ts:14](https://github.com/ifrspro/ifrs9-iaf/blob/5a4b2221d62f9d823811e12bfc71b7ff82ae62fa/packages/frontend/src/utils/menu-transform.ts#L14)

#### Overrides

`MenuItem.children`

***

### code

> **code**: `string`

Defined in: [services/menu.service.ts:9](https://github.com/ifrspro/ifrs9-iaf/blob/5a4b2221d62f9d823811e12bfc71b7ff82ae62fa/packages/frontend/src/services/menu.service.ts#L9)

#### Inherited from

`MenuItem.code`

***

### created\_at?

> `optional` **created\_at**: `string`

Defined in: [services/menu.service.ts:31](https://github.com/ifrspro/ifrs9-iaf/blob/5a4b2221d62f9d823811e12bfc71b7ff82ae62fa/packages/frontend/src/services/menu.service.ts#L31)

#### Inherited from

`MenuItem.created_at`

***

### description?

> `optional` **description**: `string`

Defined in: [services/menu.service.ts:12](https://github.com/ifrspro/ifrs9-iaf/blob/5a4b2221d62f9d823811e12bfc71b7ff82ae62fa/packages/frontend/src/services/menu.service.ts#L12)

#### Inherited from

`MenuItem.description`

***

### external\_url?

> `optional` **external\_url**: `string`

Defined in: [services/menu.service.ts:29](https://github.com/ifrspro/ifrs9-iaf/blob/5a4b2221d62f9d823811e12bfc71b7ff82ae62fa/packages/frontend/src/services/menu.service.ts#L29)

#### Inherited from

`MenuItem.external_url`

***

### href?

> `optional` **href**: `string`

Defined in: [services/menu.service.ts:11](https://github.com/ifrspro/ifrs9-iaf/blob/5a4b2221d62f9d823811e12bfc71b7ff82ae62fa/packages/frontend/src/services/menu.service.ts#L11)

#### Inherited from

`MenuItem.href`

***

### icon?

> `optional` **icon**: `string`

Defined in: [services/menu.service.ts:13](https://github.com/ifrspro/ifrs9-iaf/blob/5a4b2221d62f9d823811e12bfc71b7ff82ae62fa/packages/frontend/src/services/menu.service.ts#L13)

#### Inherited from

`MenuItem.icon`

***

### id

> **id**: `string`

Defined in: [services/menu.service.ts:8](https://github.com/ifrspro/ifrs9-iaf/blob/5a4b2221d62f9d823811e12bfc71b7ff82ae62fa/packages/frontend/src/services/menu.service.ts#L8)

#### Inherited from

`MenuItem.id`

***

### is\_active

> **is\_active**: `boolean`

Defined in: [services/menu.service.ts:18](https://github.com/ifrspro/ifrs9-iaf/blob/5a4b2221d62f9d823811e12bfc71b7ff82ae62fa/packages/frontend/src/services/menu.service.ts#L18)

#### Inherited from

`MenuItem.is_active`

***

### is\_new?

> `optional` **is\_new**: `boolean`

Defined in: [services/menu.service.ts:26](https://github.com/ifrspro/ifrs9-iaf/blob/5a4b2221d62f9d823811e12bfc71b7ff82ae62fa/packages/frontend/src/services/menu.service.ts#L26)

#### Inherited from

`MenuItem.is_new`

***

### key

> **key**: `string`

Defined in: [utils/menu-transform.ts:15](https://github.com/ifrspro/ifrs9-iaf/blob/5a4b2221d62f9d823811e12bfc71b7ff82ae62fa/packages/frontend/src/utils/menu-transform.ts#L15)

***

### label

> **label**: `string`

Defined in: [services/menu.service.ts:10](https://github.com/ifrspro/ifrs9-iaf/blob/5a4b2221d62f9d823811e12bfc71b7ff82ae62fa/packages/frontend/src/services/menu.service.ts#L10)

#### Inherited from

`MenuItem.label`

***

### level

> **level**: `number`

Defined in: [services/menu.service.ts:16](https://github.com/ifrspro/ifrs9-iaf/blob/5a4b2221d62f9d823811e12bfc71b7ff82ae62fa/packages/frontend/src/services/menu.service.ts#L16)

#### Inherited from

`MenuItem.level`

***

### parent\_id?

> `optional` **parent\_id**: `string`

Defined in: [services/menu.service.ts:14](https://github.com/ifrspro/ifrs9-iaf/blob/5a4b2221d62f9d823811e12bfc71b7ff82ae62fa/packages/frontend/src/services/menu.service.ts#L14)

#### Inherited from

`MenuItem.parent_id`

***

### path

> **path**: `string`

Defined in: [services/menu.service.ts:17](https://github.com/ifrspro/ifrs9-iaf/blob/5a4b2221d62f9d823811e12bfc71b7ff82ae62fa/packages/frontend/src/services/menu.service.ts#L17)

#### Inherited from

`MenuItem.path`

***

### requires\_setup?

> `optional` **requires\_setup**: `boolean`

Defined in: [services/menu.service.ts:27](https://github.com/ifrspro/ifrs9-iaf/blob/5a4b2221d62f9d823811e12bfc71b7ff82ae62fa/packages/frontend/src/services/menu.service.ts#L27)

#### Inherited from

`MenuItem.requires_setup`

***

### roles?

> `optional` **roles**: `string`[]

Defined in: [services/menu.service.ts:20](https://github.com/ifrspro/ifrs9-iaf/blob/5a4b2221d62f9d823811e12bfc71b7ff82ae62fa/packages/frontend/src/services/menu.service.ts#L20)

#### Inherited from

`MenuItem.roles`

***

### sort\_order

> **sort\_order**: `number`

Defined in: [services/menu.service.ts:15](https://github.com/ifrspro/ifrs9-iaf/blob/5a4b2221d62f9d823811e12bfc71b7ff82ae62fa/packages/frontend/src/services/menu.service.ts#L15)

#### Inherited from

`MenuItem.sort_order`

***

### status?

> `optional` **status**: `"error"` \| `"active"` \| `"disabled"` \| `"warning"`

Defined in: [services/menu.service.ts:25](https://github.com/ifrspro/ifrs9-iaf/blob/5a4b2221d62f9d823811e12bfc71b7ff82ae62fa/packages/frontend/src/services/menu.service.ts#L25)

#### Inherited from

`MenuItem.status`

***

### target?

> `optional` **target**: `"_self"` \| `"_blank"`

Defined in: [services/menu.service.ts:28](https://github.com/ifrspro/ifrs9-iaf/blob/5a4b2221d62f9d823811e12bfc71b7ff82ae62fa/packages/frontend/src/services/menu.service.ts#L28)

#### Inherited from

`MenuItem.target`

***

### updated\_at?

> `optional` **updated\_at**: `string`

Defined in: [services/menu.service.ts:32](https://github.com/ifrspro/ifrs9-iaf/blob/5a4b2221d62f9d823811e12bfc71b7ff82ae62fa/packages/frontend/src/services/menu.service.ts#L32)

#### Inherited from

`MenuItem.updated_at`
