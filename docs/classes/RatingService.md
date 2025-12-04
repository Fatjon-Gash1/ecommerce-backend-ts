[**ecommerce-backend-ts**](../README.md)

***

[ecommerce-backend-ts](../globals.md) / RatingService

# Class: RatingService

Defined in: Rating.service.ts:19

Service related to platform and product ratings

## Constructors

### new RatingService()

> **new RatingService**(): [`RatingService`](RatingService.md)

#### Returns

[`RatingService`](RatingService.md)

## Methods

### addPlatformRating()

> **addPlatformRating**(`userId`, `details`): `Promise`\<`PlatformRatingResponse`\>

Defined in: Rating.service.ts:30

Adds a rating to the platform.

#### Parameters

##### userId

`number`

The id of the user

##### details

`PlatformRatingDetails`

Rating details

#### Returns

`Promise`\<`PlatformRatingResponse`\>

A promise that resolves to the created platform rating

#### Throws

UserNotFoundError
Thrown if the user is not found.

***

### addProductRating()

> **addProductRating**(`userId`, `productId`, `details`): `Promise`\<`ProductRatingResponse`\>

Defined in: Rating.service.ts:72

Adds a rating & review to a product.

#### Parameters

##### userId

`number`

The id of the user

##### productId

`number`

The id of the product

##### details

`ProductRatingDetails`

Rating details

#### Returns

`Promise`\<`ProductRatingResponse`\>

A promise that resolves to a Product Rating object

#### Throws

UserNotFoundError
Thrown if the user is not found.

#### Throws

ProductNotFoundError
Thrown if the product is not found.

***

### deletePlatformRatingById()

> **deletePlatformRatingById**(`ratingId`, `userId`?): `Promise`\<`void`\>

Defined in: Rating.service.ts:333

Removes a platform rating by id.

#### Parameters

##### ratingId

`string`

The id of the platform rating

##### userId?

`number`

The user id (optional)

#### Returns

`Promise`\<`void`\>

#### Throws

RatingNotFoundError
Thrown if the rating is not found.

***

### deleteProductRatingById()

> **deleteProductRatingById**(`ratingId`, `userId`?): `Promise`\<`void`\>

Defined in: Rating.service.ts:364

Removes a product rating by id.

#### Parameters

##### ratingId

`string`

The id of the product rating

##### userId?

`number`

The user id (optional)

#### Returns

`Promise`\<`void`\>

#### Throws

RatingNotFoundError
Thrown if the rating is not found.

***

### getPlatformRatingById()

> **getPlatformRatingById**(`ratingId`): `Promise`\<`PlatformRatingResponse`\>

Defined in: Rating.service.ts:128

Retrieves a platform rating by object id.

#### Parameters

##### ratingId

`string`

The object id of the platform rating

#### Returns

`Promise`\<`PlatformRatingResponse`\>

A promise that resolves to the platform rating

#### Throws

RatingNotFoundError
Thrown if the rating is not found

***

### getPlatformRatings()

> **getPlatformRatings**(): `Promise`\<`PlatformRatingResponse`[]\>

Defined in: Rating.service.ts:113

Retrieves all platform ratings.

#### Returns

`Promise`\<`PlatformRatingResponse`[]\>

A promise that resolves to all platform ratings

***

### getPlatformRatingsByCustomer()

> **getPlatformRatingsByCustomer**(`customerId`): `Promise`\<\{ `count`: `number`; `ratings`: `PlatformRatingResponse`[]; \}\>

Defined in: Rating.service.ts:148

Retrieves all platform ratings by customer's id.

#### Parameters

##### customerId

`number`

The id of the customer

#### Returns

`Promise`\<\{ `count`: `number`; `ratings`: `PlatformRatingResponse`[]; \}\>

A promise that resolves to the customer's platform ratings
and their total count

***

### getProductRatingById()

> **getProductRatingById**(`ratingId`): `Promise`\<`ProductRatingResponse`\>

Defined in: Rating.service.ts:203

Retrieves a product rating & review by id.

#### Parameters

##### ratingId

`string`

The id of the product rating

#### Returns

`Promise`\<`ProductRatingResponse`\>

A promise that resolves to the product rating

#### Throws

RatingNotFoundError
Thrown if the rating is not found.

***

### getProductRatingsByCustomer()

> **getProductRatingsByCustomer**(`customerId`): `Promise`\<\{ `count`: `number`; `ratings`: `ProductRatingResponse`[]; \}\>

Defined in: Rating.service.ts:222

Retrieves all product ratings & reviews by customer's user id.

#### Parameters

##### customerId

`number`

#### Returns

`Promise`\<\{ `count`: `number`; `ratings`: `ProductRatingResponse`[]; \}\>

A promise that resolves to the user's product ratings

***

### getProductRatingsByProductId()

> **getProductRatingsByProductId**(`productId`): `Promise`\<`ProductRatingResponse`[]\>

Defined in: Rating.service.ts:176

Retrieves all ratings & reviews of a product.

#### Parameters

##### productId

`number`

The id of the product

#### Returns

`Promise`\<`ProductRatingResponse`[]\>

A promise that resolves to all product ratings

#### Throws

ProductNotFoundError
Thrown if the product is not found.

***

### updatePlatformRating()

> **updatePlatformRating**(`userId`, `ratingId`, `details`): `Promise`\<`PlatformRatingResponse`\>

Defined in: Rating.service.ts:287

Updates a platform rating

#### Parameters

##### userId

`number`

The id of the user

##### ratingId

`string`

The id of the platform rating

##### details

`PlatformRatingDetails`

Rating details

#### Returns

`Promise`\<`PlatformRatingResponse`\>

A promise that resolves to the updated platform rating

#### Throws

RatingNotFoundError
Thrown if the rating is not found.

***

### updateProductRating()

> **updateProductRating**(`userId`, `ratingId`, `details`): `Promise`\<`ProductRatingResponse`\>

Defined in: Rating.service.ts:311

Updates a product rating

#### Parameters

##### userId

`number`

The id of the user

##### ratingId

`string`

The id of the product rating

##### details

`ProductRatingDetails`

Rating details

#### Returns

`Promise`\<`ProductRatingResponse`\>

A promise that resolves to the updated product rating

#### Throws

RatingNotFoundError
Thrown if the rating is not found.

***

### updateRating()

> **updateRating**\<`T`\>(`ratingType`, `userId`, `ratingId`, `details`): `Promise`\<`PlatformRatingResponse` \| `ProductRatingResponse`\>

Defined in: Rating.service.ts:252

Generic method that updates an existing rating type

#### Type Parameters

• **T** *extends* `IRating`

#### Parameters

##### ratingType

`Model`\<`T`\>

The model to update

##### userId

`number`

##### ratingId

`string`

The id of the platform rating

##### details

Rating details

`PlatformRatingDetails` | `ProductRatingDetails`

#### Returns

`Promise`\<`PlatformRatingResponse` \| `ProductRatingResponse`\>

A promise that resolves to the updated platform rating

#### Throws

RatingNotFoundError
Thrown if the rating is not found.
