[**ecommerce-backend-ts**](../README.md)

***

[ecommerce-backend-ts](../globals.md) / OrderService

# Class: OrderService

Defined in: Order.service.ts:16

Service responsible for Order-related operations.

## Constructors

### new OrderService()

> **new OrderService**(): [`OrderService`](OrderService.md)

#### Returns

[`OrderService`](OrderService.md)

## Methods

### createOrder()

> **createOrder**(`userId`, `items`, `paymentMethod`, `shippingCountry`, `weightCategory`, `orderWeight`, `shippingMethod`, `orderTotal`, `paymentIntentId`, `safeShippingPaid`?, `transactionObj`?): `Promise`\<`OrderResponse`\>

Defined in: Order.service.ts:31

Creates an order for a customer.

#### Parameters

##### userId

`number`

The user id

##### items

`OrderItemAttributes`[]

The items to add to the order

##### paymentMethod

`"card"`

The payment method for the order

##### shippingCountry

`string`

The shipping country for the order

##### weightCategory

`"light"` | `"standard"` | `"heavy"` | `"very-heavy"` | `"extra-heavy"`

##### orderWeight

`number`

##### shippingMethod

The shipping method for the order

`"standard"` | `"express"` | `"next-day"`

##### orderTotal

`number`

The total price of the order

##### paymentIntentId

`string`

The id of the payment intent which is used for refunds

##### safeShippingPaid?

`boolean`

##### transactionObj?

`Transaction`

An existing transaction

#### Returns

`Promise`\<`OrderResponse`\>

A promise resolving to the created order

***

### getAllOrders()

> **getAllOrders**(): `Promise`\<\{ `count`: `number`; `orders`: `OrderResponse`[]; \}\>

Defined in: Order.service.ts:318

Retrieves all orders in the database.

#### Returns

`Promise`\<\{ `count`: `number`; `orders`: `OrderResponse`[]; \}\>

A promise resolving to an array of Order instances

***

### getCustomerOrdersByStatus()

> **getCustomerOrdersByStatus**(`customerId`?, `userId`?, `status`?): `Promise`\<\{ `count`: `number`; `orders`: `OrderResponse`[]; \}\>

Defined in: Order.service.ts:269

Retrieves all orders of a given status for a customer.
If no status is provided, it returns the order history.

#### Parameters

##### customerId?

`number`

The id of the customer

##### userId?

`number`

The id of the user "Implicit customer id"

##### status?

`string`

The status of the order

#### Returns

`Promise`\<\{ `count`: `number`; `orders`: `OrderResponse`[]; \}\>

A promise resolving to an array of order instances

#### Remarks

The orders are retrieved for a customer either by their id
or their implicit id.

#### Throws

UserNotFoundError
Thrown if the customer is not found.

***

### getOrderById()

> **getOrderById**(`orderId`, `userId`?): `Promise`\<`OrderResponse`\>

Defined in: Order.service.ts:123

Retrieves a specific order by ID.

#### Parameters

##### orderId

`number`

The ID of the order

##### userId?

`number`

The ID of the user

#### Returns

`Promise`\<`OrderResponse`\>

A promise resolving to the order

***

### getOrderItemsByOrderId()

> **getOrderItemsByOrderId**(`orderId`, `userId`?): `Promise`\<`OrderItemResponse`[]\>

Defined in: Order.service.ts:162

Retrieves all items of a specific order.

#### Parameters

##### orderId

`number`

The ID of the order

##### userId?

`number`

The id of the user

#### Returns

`Promise`\<`OrderItemResponse`[]\>

A promise resolving to an array of OrderItem instances

#### Throws

OrderNotFoundError
Thrown if the order is not found.

***

### getOrdersByStatus()

> **getOrdersByStatus**(`status`): `Promise`\<\{ `count`: `number`; `orders`: `OrderResponse`[]; \}\>

Defined in: Order.service.ts:241

Retrieves all platform orders by a given status.

#### Parameters

##### status

`string`

The status of the order

#### Returns

`Promise`\<\{ `count`: `number`; `orders`: `OrderResponse`[]; \}\>

A promise resolving to an array of Order instances and their count

***

### getTotalPriceOfOrderItems()

> **getTotalPriceOfOrderItems**(`userId`, `orderId`): `Promise`\<`number`\>

Defined in: Order.service.ts:213

Calculates the total price of all items in a specific order.

#### Parameters

##### userId

`number`

The id of the user

##### orderId

`number`

The id of the order

#### Returns

`Promise`\<`number`\>

A promise resolving to the total price

***

### markOrder()

> **markOrder**(`userId`, `orderId`, `status`, `deliveryImageUrl`?): `Promise`\<`void`\>

Defined in: Order.service.ts:377

Marks order as shipped, awaiting pickup, or delivered.

#### Parameters

##### userId

`number`

The id of the user

##### orderId

`number`

The id of the order

##### status

The status to mark the order as

`"shipped"` | `"awaiting-pickup"` | `"delivered"` | `"uncollected"`

##### deliveryImageUrl?

`string`

#### Returns

`Promise`\<`void`\>

#### Throws

UserNotFoundError
Thrown if the user is not found.

#### Throws

OrderNotFoundError
Thrown if the order is not found.

***

### rateDeliveredOrder()

> **rateDeliveredOrder**(`userId`, `orderId`, `rating`): `Promise`\<`void`\>

Defined in: Order.service.ts:338

Rate delivered order.

#### Parameters

##### userId

`number`

The id of the user

##### orderId

`number`

The id of the order

##### rating

`number`

The rating to be given

#### Returns

`Promise`\<`void`\>
