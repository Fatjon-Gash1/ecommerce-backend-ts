[**server**](../README.md)

***

[server](../globals.md) / PlatformDataService

# Class: PlatformDataService

Defined in: [PlatformData.service.ts:26](https://github.com/Fatjon-Gash1/edge-tech/blob/24d7692b2f898f47915b9666fb1c8515d276fe0f/services/PlatformData.service.ts#L26)

Service responsible only for retrieval and modification of platform data

## Constructors

### new PlatformDataService()

> **new PlatformDataService**(): [`PlatformDataService`](PlatformDataService.md)

#### Returns

[`PlatformDataService`](PlatformDataService.md)

## Methods

### getPlatformData()

> **getPlatformData**(): `Promise`\<`PlatformDataResponse`\>

Defined in: [PlatformData.service.ts:59](https://github.com/Fatjon-Gash1/edge-tech/blob/24d7692b2f898f47915b9666fb1c8515d276fe0f/services/PlatformData.service.ts#L59)

Retrieves the platform data.

#### Returns

`Promise`\<`PlatformDataResponse`\>

A promise that resolves to the platform data

***

### updatePlatformData()

> **updatePlatformData**(`id`, `data`): `Promise`\<`PlatformDataResponse`\>

Defined in: [PlatformData.service.ts:37](https://github.com/Fatjon-Gash1/edge-tech/blob/24d7692b2f898f47915b9666fb1c8515d276fe0f/services/PlatformData.service.ts#L37)

Updates the platform data.

#### Parameters

##### id

`string`

The id of the platform data to update

##### data

`PlatformData`

The new platform data

#### Returns

`Promise`\<`PlatformDataResponse`\>

A promise that resolves to the updated platform data

#### Throws

Error
Thrown if the platform data is not found.
