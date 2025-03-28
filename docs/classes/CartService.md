[**server**](../README.md)

***

[server](../globals.md) / CartService

# Class: CartService

Defined in: [Cart.service.ts:14](https://github.com/Fatjon-Gash1/edge-tech/blob/24d7692b2f898f47915b9666fb1c8515d276fe0f/services/Cart.service.ts#L14)

Service responsible for Customer Cart-related operations.

## Constructors

### new CartService()

> **new CartService**(): [`CartService`](CartService.md)

#### Returns

[`CartService`](CartService.md)

## Methods

### addItemToCart()

> **addItemToCart**(`userId`, `productId`, `quantity`): `Promise`\<`object`[]\>

Defined in: [Cart.service.ts:24](https://github.com/Fatjon-Gash1/edge-tech/blob/24d7692b2f898f47915b9666fb1c8515d276fe0f/services/Cart.service.ts#L24)

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

`Promise`\<`object`[]\>

A promise resolving to a boolean value indicating
whether the item was inserted successfully.

***

### cartCheckout()

> **cartCheckout**(`userId`): `Promise`\<`number`\>

Defined in: [Cart.service.ts:119](https://github.com/Fatjon-Gash1/edge-tech/blob/24d7692b2f898f47915b9666fb1c8515d276fe0f/services/Cart.service.ts#L119)

Retrieves the total cart items amount.

#### Parameters

##### userId

`number`

The user ID

#### Returns

`Promise`\<`number`\>

A promise resolving to the total cart items amount

***

### clearCart()

> **clearCart**(`userId`): `Promise`\<`void`\>

Defined in: [Cart.service.ts:176](https://github.com/Fatjon-Gash1/edge-tech/blob/24d7692b2f898f47915b9666fb1c8515d276fe0f/services/Cart.service.ts#L176)

Clears the customer's cart.

#### Parameters

##### userId

`number`

The user id

#### Returns

`Promise`\<`void`\>

***

### getCartItems()

> **getCartItems**(`userId`): `Promise`\<`object`[]\>

Defined in: [Cart.service.ts:87](https://github.com/Fatjon-Gash1/edge-tech/blob/24d7692b2f898f47915b9666fb1c8515d276fe0f/services/Cart.service.ts#L87)

Retrieves all items in the customer's cart.

#### Parameters

##### userId

`number`

The user id

#### Returns

`Promise`\<`object`[]\>

A promise resolving to an array of CartItem instances

***

### removeItemFromCart()

> **removeItemFromCart**(`userId`, `productId`): `Promise`\<`void`\>

Defined in: [Cart.service.ts:140](https://github.com/Fatjon-Gash1/edge-tech/blob/24d7692b2f898f47915b9666fb1c8515d276fe0f/services/Cart.service.ts#L140)

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
