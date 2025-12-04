[**ecommerce-backend-ts**](../README.md)

***

[ecommerce-backend-ts](../globals.md) / ShippingService

# Class: ShippingService

Defined in: Shipping.service.ts:31

Service responsible for shipping-related operations

## Constructors

### new ShippingService()

> **new ShippingService**(): [`ShippingService`](ShippingService.md)

#### Returns

[`ShippingService`](ShippingService.md)

## Methods

### addCityToCountry()

> **addCityToCountry**(`countryId`, `name`, `postalCode`): `Promise`\<`ShippingCityResponse`\>

Defined in: Shipping.service.ts:63

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

Defined in: Shipping.service.ts:39

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

> **calculateShippingCost**(`countryName`, `shippingMethod`, `userId`?, `orderItems`?, `safeShippingPaid`?): `Promise`\<`ShippingCostResponse`\>

Defined in: Shipping.service.ts:350

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

##### safeShippingPaid?

`boolean`

If the customer paid for safe shipping

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

Defined in: Shipping.service.ts:212

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

Defined in: Shipping.service.ts:235

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

Defined in: Shipping.service.ts:195

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

Defined in: Shipping.service.ts:178

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

### determineWeightCategory()

> `protected` **determineWeightCategory**(`productItems`): `Promise`\<\{ `orderWeight`: `number`; `weightCategory`: `WeightCategory`; \}\>

Defined in: Shipping.service.ts:307

Determines the order items weight range.

#### Parameters

##### productItems

`ProductItem`[]

The product items. Either cart items or order items

#### Returns

`Promise`\<\{ `orderWeight`: `number`; `weightCategory`: `WeightCategory`; \}\>

A promise that resolves to a string representing the weight range

***

### determineWeightCategoryForCart()

> **determineWeightCategoryForCart**(`userId`): `Promise`\<\{ `orderWeight`: `number`; `weightCategory`: `WeightCategory`; \}\>

Defined in: Shipping.service.ts:269

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

Defined in: Shipping.service.ts:104

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

Defined in: Shipping.service.ts:92

Returns all shipping countries.

#### Returns

`Promise`\<`ShippingCountryResponse`[]\>

A promise that resolves to an array of shipping countries

***

### updateShippingCity()

> **updateShippingCity**(`cityId`, `name`, `postalCode`): `Promise`\<`ShippingCityResponse`\>

Defined in: Shipping.service.ts:153

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

Defined in: Shipping.service.ts:129

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
