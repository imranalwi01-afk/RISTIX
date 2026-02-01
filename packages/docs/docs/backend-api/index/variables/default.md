[**Backend API Reference v1.0.0**](../../README.md)

***

# Variable: default

> `const` **default**: `object`

Defined in: [packages/new-backend/src/index.ts:9](https://github.com/ifrspro/ifrs9-iaf/blob/2c233b31171a451bb86daacd4389a961f1213deb/packages/new-backend/src/index.ts#L9)

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
