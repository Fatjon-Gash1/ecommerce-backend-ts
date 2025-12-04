[**ecommerce-backend-ts**](../README.md)

***

[ecommerce-backend-ts](../globals.md) / CartService

# Class: CartService

Defined in: Cart.service.ts:15

Service responsible for Customer Cart-related operations.

## Constructors

### new CartService()

> **new CartService**(): [`CartService`](CartService.md)

#### Returns

[`CartService`](CartService.md)

## Methods

### addItemToCart()

> **addItemToCart**(`userId`, `productId`, `quantity`): `Promise`\<`CartItemResponse`[]\>

Defined in: Cart.service.ts:24

Inserts an item into the cart.

#### Parameters

##### userId

`number`

The user id.

##### productId

`number`

The id of the product to insert.

##### quantity

`number`

The product quantity.

#### Returns

`Promise`\<`CartItemResponse`[]\>

A promise resolving to an array of the updated cart items

***

### cartCheckout()

> **cartCheckout**(`userId`): `Promise`\<`number`\>

Defined in: Cart.service.ts:119

Retrieves the total cart items amount.

#### Parameters

##### userId

`number`

The user ID

#### Returns

`Promise`\<`number`\>

A promise resolving to a number representing the total cart items amount

***

### clearCart()

> **clearCart**(`userId`): `Promise`\<`void`\>

Defined in: Cart.service.ts:178

Clears the customer's cart.

#### Parameters

##### userId

`number`

The user id of the cart owner

#### Returns

`Promise`\<`void`\>

***

### getCartItems()

> **getCartItems**(`userId`): `Promise`\<`CartItemResponse`[]\>

Defined in: Cart.service.ts:89

Retrieves all items in the customer's cart.

#### Parameters

##### userId

`number`

The user id

#### Returns

`Promise`\<`CartItemResponse`[]\>

A promise resolving to an array of cart items

***

### removeItemFromCart()

> **removeItemFromCart**(`userId`, `productId`): `Promise`\<`void`\>

Defined in: Cart.service.ts:141

Removes an item from the customer's cart.

#### Parameters

##### userId

`number`

The user id

##### productId

`number`

The ID of the product to remove

#### Returns

`Promise`\<`void`\>
