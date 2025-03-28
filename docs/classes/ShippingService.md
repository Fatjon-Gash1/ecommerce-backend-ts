[**server**](../README.md)

***

[server](../globals.md) / ShippingService

# Class: ShippingService

Defined in: [Shipping.service.ts:64](https://github.com/Fatjon-Gash1/edge-tech/blob/24d7692b2f898f47915b9666fb1c8515d276fe0f/services/Shipping.service.ts#L64)

Service responsible for shipping-related operations

## Constructors

### new ShippingService()

> **new ShippingService**(): [`ShippingService`](ShippingService.md)

#### Returns

[`ShippingService`](ShippingService.md)

## Methods

### addCityToCountry()

> **addCityToCountry**(`countryId`, `name`, `postalCode`): `Promise`\<`ShippingCityResponse`\>

Defined in: [Shipping.service.ts:96](https://github.com/Fatjon-Gash1/edge-tech/blob/24d7692b2f898f47915b9666fb1c8515d276fe0f/services/Shipping.service.ts#L96)

Adds a city to a Shipping Country.

#### Parameters

##### countryId

`number`

Country ID

##### name

`string`

City name

##### postalCode

`number`

Postal code

#### Returns

`Promise`\<`ShippingCityResponse`\>

A promise that resolves to the created city

***

### addShippingCountry()

> **addShippingCountry**(`name`, `rate`): `Promise`\<`ShippingCountryResponse`\>

Defined in: [Shipping.service.ts:72](https://github.com/Fatjon-Gash1/edge-tech/blob/24d7692b2f898f47915b9666fb1c8515d276fe0f/services/Shipping.service.ts#L72)

Adds a country to the Shipping Countries.

#### Parameters

##### name

`string`

Country name

##### rate

`number`

Shipping rate

#### Returns

`Promise`\<`ShippingCountryResponse`\>

A promise that resolves to the created country

***

### calculateShippingCost()

> **calculateShippingCost**(`countryName`, `shippingMethod`, `userId`?, `orderItems`?): `Promise`\<`ShippingCostResponse`\>

Defined in: [Shipping.service.ts:382](https://github.com/Fatjon-Gash1/edge-tech/blob/24d7692b2f898f47915b9666fb1c8515d276fe0f/services/Shipping.service.ts#L382)

Performs the calculation of shipping cost based on the provided parameters.

#### Parameters

##### countryName

`string`

The name of the shipping country

##### shippingMethod

`string`

The type of the shipping method

##### userId?

`number`

The id of the user

##### orderItems?

`ProductItem`[]

#### Returns

`Promise`\<`ShippingCostResponse`\>

A promise that resolves to the calculated shipping cost and the weight range

#### Throws

ShippingLocationNotFoundError
Thrown if the provided shipping country is not found.

#### Throws

ShippingOptionNotFoundError
Thrown if the provided shipping method or weight is not found.

***

### changeShippingMethodRate()

> **changeShippingMethodRate**(`method`, `rate`): `Promise`\<`ShippingMethodResponse`\>

Defined in: [Shipping.service.ts:245](https://github.com/Fatjon-Gash1/edge-tech/blob/24d7692b2f898f47915b9666fb1c8515d276fe0f/services/Shipping.service.ts#L245)

Changes the shipping method rate.

#### Parameters

##### method

`string`

Shipping method

##### rate

`number`

The new shipping method rate

#### Returns

`Promise`\<`ShippingMethodResponse`\>

A promise that resolves to the updated shipping method rate

***

### changeShippingWeightRate()

> **changeShippingWeightRate**(`weight`, `rate`): `Promise`\<`ShippingWeightResponse`\>

Defined in: [Shipping.service.ts:268](https://github.com/Fatjon-Gash1/edge-tech/blob/24d7692b2f898f47915b9666fb1c8515d276fe0f/services/Shipping.service.ts#L268)

Changes the shipping weight rate.

#### Parameters

##### weight

`string`

Shipping weight

##### rate

`number`

The new shipping weight rate

#### Returns

`Promise`\<`ShippingWeightResponse`\>

A promise that resolves to the updated shipping weight rate

***

### deleteShippingCity()

> **deleteShippingCity**(`cityId`): `Promise`\<`void`\>

Defined in: [Shipping.service.ts:228](https://github.com/Fatjon-Gash1/edge-tech/blob/24d7692b2f898f47915b9666fb1c8515d276fe0f/services/Shipping.service.ts#L228)

Deletes a shipping city.

#### Parameters

##### cityId

`number`

City id

#### Returns

`Promise`\<`void`\>

A promise that resolves to a boolean value indicating
whether the city was deleted

***

### deleteShippingCountry()

> **deleteShippingCountry**(`countryId`): `Promise`\<`void`\>

Defined in: [Shipping.service.ts:211](https://github.com/Fatjon-Gash1/edge-tech/blob/24d7692b2f898f47915b9666fb1c8515d276fe0f/services/Shipping.service.ts#L211)

Deletes a shipping country.

#### Parameters

##### countryId

`number`

Country id

#### Returns

`Promise`\<`void`\>

A promise that resolves to a boolean value indicating
whether the country was deleted

***

### determineWeightCategoryForCart()

> **determineWeightCategoryForCart**(`userId`): `Promise`\<\{ `orderWeight`: `number`; `weightCategory`: `WeightCategory`; \}\>

Defined in: [Shipping.service.ts:302](https://github.com/Fatjon-Gash1/edge-tech/blob/24d7692b2f898f47915b9666fb1c8515d276fe0f/services/Shipping.service.ts#L302)

Determines the product(s) weight range based on the provided cart items.

#### Parameters

##### userId

`number`

#### Returns

`Promise`\<\{ `orderWeight`: `number`; `weightCategory`: `WeightCategory`; \}\>

A promise that resolves to a string representing the weight range

#### Throws

CartNotFoundError
Thrown if the user's cart is not found.

#### Throws

EmptyCartError
Thrown is the provided cart has no items.

***

### getShippingCitiesByCountryId()

> **getShippingCitiesByCountryId**(`countryId`): `Promise`\<`ShippingCityResponse`[]\>

Defined in: [Shipping.service.ts:137](https://github.com/Fatjon-Gash1/edge-tech/blob/24d7692b2f898f47915b9666fb1c8515d276fe0f/services/Shipping.service.ts#L137)

Returns all shipping cities of a shipping country.

#### Parameters

##### countryId

`number`

Country ID

#### Returns

`Promise`\<`ShippingCityResponse`[]\>

A promise that resolves to an array of shipping cities

***

### getShippingCountries()

> **getShippingCountries**(): `Promise`\<`ShippingCountryResponse`[]\>

Defined in: [Shipping.service.ts:125](https://github.com/Fatjon-Gash1/edge-tech/blob/24d7692b2f898f47915b9666fb1c8515d276fe0f/services/Shipping.service.ts#L125)

Returns all shipping countries.

#### Returns

`Promise`\<`ShippingCountryResponse`[]\>

A promise that resolves to an array of shipping countries

***

### updateShippingCity()

> **updateShippingCity**(`cityId`, `name`, `postalCode`): `Promise`\<`ShippingCityResponse`\>

Defined in: [Shipping.service.ts:186](https://github.com/Fatjon-Gash1/edge-tech/blob/24d7692b2f898f47915b9666fb1c8515d276fe0f/services/Shipping.service.ts#L186)

Updates a shipping city.

#### Parameters

##### cityId

`number`

City id

##### name

`string`

City name

##### postalCode

`number`

Postal code

#### Returns

`Promise`\<`ShippingCityResponse`\>

A promise that resolves to the updated city

***

### updateShippingCountry()

> **updateShippingCountry**(`countryId`, `name`, `rate`): `Promise`\<`ShippingCountryResponse`\>

Defined in: [Shipping.service.ts:162](https://github.com/Fatjon-Gash1/edge-tech/blob/24d7692b2f898f47915b9666fb1c8515d276fe0f/services/Shipping.service.ts#L162)

Updates a shipping country.

#### Parameters

##### countryId

`number`

Country id

##### name

`string`

Country name

##### rate

`number`

Shipping rate

#### Returns

`Promise`\<`ShippingCountryResponse`\>

A promise that resolves to the updated country
