[**Backend API Reference v1.0.0**](index.md)

***

# services/report-debug-settings.service

## Interfaces

### ReportDebugConfig

Defined in: [src/services/report-debug-settings.service.ts:8](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/new-backend/src/services/report-debug-settings.service.ts#L8)

#### Properties

##### enabled

> **enabled**: `boolean`

Defined in: [src/services/report-debug-settings.service.ts:9](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/new-backend/src/services/report-debug-settings.service.ts#L9)

##### paramCode

> **paramCode**: `string`

Defined in: [src/services/report-debug-settings.service.ts:11](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/new-backend/src/services/report-debug-settings.service.ts#L11)

##### source

> **source**: `"default"` &#124; `"db"`

Defined in: [src/services/report-debug-settings.service.ts:10](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/new-backend/src/services/report-debug-settings.service.ts#L10)

## Variables

### reportDebugSettingsService

> `const` **reportDebugSettingsService**: `object`

Defined in: [src/services/report-debug-settings.service.ts:18](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/new-backend/src/services/report-debug-settings.service.ts#L18)

#### Type Declaration

##### getConfig()

> **getConfig**(): `Promise`&lt;[`ReportDebugConfig`](#reportdebugconfig)&gt;

###### Returns

`Promise`&lt;[`ReportDebugConfig`](#reportdebugconfig)&gt;

##### setEnabled()

> **setEnabled**(`enabled`, `userId`): `Promise`&lt;[`ReportDebugConfig`](#reportdebugconfig)&gt;

###### Parameters

###### enabled

`boolean`

###### userId

`string`

###### Returns

`Promise`&lt;[`ReportDebugConfig`](#reportdebugconfig)&gt;
