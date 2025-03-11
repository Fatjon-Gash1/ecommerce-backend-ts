[**server**](../README.md)

***

[server](../globals.md) / ShippingService

# Class: ShippingService

Defined in: [Shipping.service.ts:58](https://github.com/Fatjon-Gash1/edge-tech/blob/dd4dbe3ef2bb1640eb688285399d259174ec7226/services/Shipping.service.ts#L58)

Service responsible for shipping-related operations

## Constructors

### new ShippingService()

> **new ShippingService**(): [`ShippingService`](ShippingService.md)

#### Returns

[`ShippingService`](ShippingService.md)

## Methods

### addCityToCountry()

> **addCityToCountry**(`countryId`, `name`, `postalCode`): `Promise`\<`ShippingCityResponse`\>

Defined in: [Shipping.service.ts:90](https://github.com/Fatjon-Gash1/edge-tech/blob/dd4dbe3ef2bb1640eb688285399d259174ec7226/services/Shipping.service.ts#L90)

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

Defined in: [Shipping.service.ts:66](https://github.com/Fatjon-Gash1/edge-tech/blob/dd4dbe3ef2bb1640eb688285399d259174ec7226/services/Shipping.service.ts#L66)

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

Defined in: [Shipping.service.ts:372](https://github.com/Fatjon-Gash1/edge-tech/blob/dd4dbe3ef2bb1640eb688285399d259174ec7226/services/Shipping.service.ts#L372)

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

Defined in: [Shipping.service.ts:239](https://github.com/Fatjon-Gash1/edge-tech/blob/dd4dbe3ef2bb1640eb688285399d259174ec7226/services/Shipping.service.ts#L239)

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

Defined in: [Shipping.service.ts:262](https://github.com/Fatjon-Gash1/edge-tech/blob/dd4dbe3ef2bb1640eb688285399d259174ec7226/services/Shipping.service.ts#L262)

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

Defined in: [Shipping.service.ts:222](https://github.com/Fatjon-Gash1/edge-tech/blob/dd4dbe3ef2bb1640eb688285399d259174ec7226/services/Shipping.service.ts#L222)

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

Defined in: [Shipping.service.ts:205](https://github.com/Fatjon-Gash1/edge-tech/blob/dd4dbe3ef2bb1640eb688285399d259174ec7226/services/Shipping.service.ts#L205)

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

### determineWeightRangeForCart()

> **determineWeightRangeForCart**(`userId`): `Promise`\<`WeightRange`\>

Defined in: [Shipping.service.ts:296](https://github.com/Fatjon-Gash1/edge-tech/blob/dd4dbe3ef2bb1640eb688285399d259174ec7226/services/Shipping.service.ts#L296)

Determines the product(s) weight range based on the provided cart items.

#### Parameters

##### userId

`number`

#### Returns

`Promise`\<`WeightRange`\>

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

Defined in: [Shipping.service.ts:131](https://github.com/Fatjon-Gash1/edge-tech/blob/dd4dbe3ef2bb1640eb688285399d259174ec7226/services/Shipping.service.ts#L131)

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

Defined in: [Shipping.service.ts:119](https://github.com/Fatjon-Gash1/edge-tech/blob/dd4dbe3ef2bb1640eb688285399d259174ec7226/services/Shipping.service.ts#L119)

Returns all shipping countries.

#### Returns

`Promise`\<`ShippingCountryResponse`[]\>

A promise that resolves to an array of shipping countries

***

### updateShippingCity()

> **updateShippingCity**(`cityId`, `name`, `postalCode`): `Promise`\<`ShippingCityResponse`\>

Defined in: [Shipping.service.ts:180](https://github.com/Fatjon-Gash1/edge-tech/blob/dd4dbe3ef2bb1640eb688285399d259174ec7226/services/Shipping.service.ts#L180)

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

Defined in: [Shipping.service.ts:156](https://github.com/Fatjon-Gash1/edge-tech/blob/dd4dbe3ef2bb1640eb688285399d259174ec7226/services/Shipping.service.ts#L156)

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
