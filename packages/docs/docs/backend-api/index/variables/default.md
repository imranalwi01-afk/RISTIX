[**Backend API Reference v1.0.0**](../../README.md)

***

# Variable: default

> `const` **default**: `object`

Defined in: [src/index.ts:9](https://github.com/ifrspro/ifrs9-iaf/blob/5a4b2221d62f9d823811e12bfc71b7ff82ae62fa/packages/new-backend/src/index.ts#L9)

## Type Declaration

### idleTimeout

> **idleTimeout**: `number` = `30`

### port

> **port**: `number`

### websocket

> **websocket**: `object`

#### websocket.close()

> **close**: (`ws`, `code`, `message`) => `void`

##### Parameters

###### ws

`BunWebSocket`

###### code

`number`

###### message

`string`

##### Returns

`void`

#### websocket.maxPayloadLength

> **maxPayloadLength**: `number`

#### websocket.message()

> **message**: (`ws`, `message`) => `void`

##### Parameters

###### ws

`BunWebSocket`

###### message

`RawData`

##### Returns

`void`

#### websocket.open()

> **open**: (`ws`) => `void`

##### Parameters

###### ws

`BunWebSocket`

##### Returns

`void`

### fetch()

> **fetch**(`req`, `server`): `Response` \| `Promise`\<`Response`\>

#### Parameters

##### req

`Request`

##### server

`any`

#### Returns

`Response` \| `Promise`\<`Response`\>
