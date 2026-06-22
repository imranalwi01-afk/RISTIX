[**Backend API Reference v1.0.0**](index.md)

***

# services/ecl-configurations.service

## Variables

### EclConfigurationsService

> `const` **EclConfigurationsService**: `object`

Defined in: [src/services/ecl-configurations.service.ts:8](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/new-backend/src/services/ecl-configurations.service.ts#L8)

#### Type Declaration

##### create

> **create**: (`data`, `userId`) => `any`

Create a new ECL configuration.

###### Parameters

###### data

`any`

The configuration data (header and details)

###### userId

`string`

The ID of the user creating the configuration

###### Returns

`any`

An Effect resolving to the created configuration with details

##### delete

> **delete**: (`id`) => `any`

Delete an ECL configuration.

###### Parameters

###### id

`number`

The ECL configuration ID

###### Returns

`any`

An Effect resolving to a success message

##### get

> **get**: (`id`) => `any`

Get an ECL configuration by ID, including its details.

###### Parameters

###### id

`number`

The ECL configuration ID

###### Returns

`any`

An Effect resolving to the transformed configuration with details, or NotFoundError

##### getPdModelOutputs

> **getPdModelOutputs**: () => `any`

###### Returns

`any`

##### getPreviewResultDetail

> **getPreviewResultDetail**: (`id`, `accountId`) => `any`

###### Parameters

###### id

`number`

###### accountId

`number`

###### Returns

`any`

##### getPreviewResults

> **getPreviewResults**: (`id`) => `any`

###### Parameters

###### id

`number`

###### Returns

`any`

##### list

> **list**: () => `any`

List all ECL configurations with simplified header information.

###### Returns

`any`

An Effect resolving to an array of transformed ECL headers

##### update

> **update**: (`id`, `data`, `userId`) => `any`

Update an existing ECL configuration.

###### Parameters

###### id

`number`

The ECL configuration ID

###### data

`any`

The data to update

###### userId

`string`

The ID of the user updating the configuration

###### Returns

`any`

An Effect resolving to the updated configuration with details or NotFoundError
