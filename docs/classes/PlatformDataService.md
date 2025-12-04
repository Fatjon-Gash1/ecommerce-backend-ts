[**ecommerce-backend-ts**](../README.md)

***

[ecommerce-backend-ts](../globals.md) / PlatformDataService

# Class: PlatformDataService

Defined in: PlatformData.service.ts:8

Service responsible only for retrieval and modification of platform data

## Constructors

### new PlatformDataService()

> **new PlatformDataService**(): [`PlatformDataService`](PlatformDataService.md)

#### Returns

[`PlatformDataService`](PlatformDataService.md)

## Methods

### getActiveUsers()

> **getActiveUsers**(`type`): `Promise`\<`number`\>

Defined in: PlatformData.service.ts:57

Retrieves the number of active users of a given type.

#### Parameters

##### type

`UserType`

The type of user ('admin', 'manager', 'customer')

#### Returns

`Promise`\<`number`\>

A promise resolving to the number of active users

***

### getPlatformData()

> **getPlatformData**(): `Promise`\<`PlatformDataResponse`\>

Defined in: PlatformData.service.ts:41

Retrieves the platform data.

#### Returns

`Promise`\<`PlatformDataResponse`\>

A promise that resolves to the platform data

***

### updatePlatformData()

> **updatePlatformData**(`id`, `data`): `Promise`\<`PlatformDataResponse`\>

Defined in: PlatformData.service.ts:19

Updates the platform data.

#### Parameters

##### id

`string`

The id of the platform data to update

##### data

`PlatformDataObject`

The new platform data

#### Returns

`Promise`\<`PlatformDataResponse`\>

A promise that resolves to the updated platform data

#### Throws

Error
Thrown if the platform data is not found.
