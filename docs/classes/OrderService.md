[**server**](../README.md)

***

[server](../globals.md) / OrderService

# Class: OrderService

Defined in: [Order.service.ts:54](https://github.com/Fatjon-Gash1/edge-tech/blob/24d7692b2f898f47915b9666fb1c8515d276fe0f/services/Order.service.ts#L54)

Service responsible for Order-related operations.

## Constructors

### new OrderService()

> **new OrderService**(): [`OrderService`](OrderService.md)

#### Returns

[`OrderService`](OrderService.md)

## Methods

### cancelOrder()

> **cancelOrder**(`userId`, `orderId`): `Promise`\<`void`\>

Defined in: [Order.service.ts:412](https://github.com/Fatjon-Gash1/edge-tech/blob/24d7692b2f898f47915b9666fb1c8515d276fe0f/services/Order.service.ts#L412)

Cancels a customer's order.

#### Parameters

##### userId

`number`

The id of the user

##### orderId

`number`

The id of the order

#### Returns

`Promise`\<`void`\>

#### Throws

OrderNotFoundError
Thrown if the order is not found.

***

### createOrder()

> **createOrder**(`userId`, `items`, `paymentMethod`, `shippingCountry`, `weightCategory`, `orderWeight`, `shippingMethod`, `orderTotal`, `paymentIntentId`, `transactionObj`?): `Promise`\<`OrderResponse`\>

Defined in: [Order.service.ts:69](https://github.com/Fatjon-Gash1/edge-tech/blob/24d7692b2f898f47915b9666fb1c8515d276fe0f/services/Order.service.ts#L69)

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

##### transactionObj?

`Transaction`

An existing transaction

#### Returns

`Promise`\<`OrderResponse`\>

A promise resolving to the created order

***

### getAllOrders()

> **getAllOrders**(): `Promise`\<\{ `count`: `number`; `orders`: `OrderResponse`[]; \}\>

Defined in: [Order.service.ts:358](https://github.com/Fatjon-Gash1/edge-tech/blob/24d7692b2f898f47915b9666fb1c8515d276fe0f/services/Order.service.ts#L358)

Retrieves all orders in the database.

#### Returns

`Promise`\<\{ `count`: `number`; `orders`: `OrderResponse`[]; \}\>

A promise resolving to an array of Order instances

***

### getCustomerOrderHistory()

> **getCustomerOrderHistory**(`customerId`, `userId`): `Promise`\<\{ `count`: `number`; `orders`: `OrderResponse`[]; \}\>

Defined in: [Order.service.ts:327](https://github.com/Fatjon-Gash1/edge-tech/blob/24d7692b2f898f47915b9666fb1c8515d276fe0f/services/Order.service.ts#L327)

Retrieves customer's order history.

#### Parameters

##### customerId

The customer id

`undefined` | `number`

##### userId

The id of the user "Implicit customer id"

`undefined` | `number`

#### Returns

`Promise`\<\{ `count`: `number`; `orders`: `OrderResponse`[]; \}\>

A promise resolving to an array of Order instances

#### Remarks

The order history is retrieved for a customer either by their id
or their implicit id.

#### Throws

UserNotFoundError
Thrown if the user of type Customer is not found.

***

### getCustomerOrdersByStatus()

> **getCustomerOrdersByStatus**(`status`, `customerId`, `userId`): `Promise`\<\{ `count`: `number`; `orders`: `OrderResponse`[]; \}\>

Defined in: [Order.service.ts:286](https://github.com/Fatjon-Gash1/edge-tech/blob/24d7692b2f898f47915b9666fb1c8515d276fe0f/services/Order.service.ts#L286)

Retrieves all orders by a given status for a customer.

#### Parameters

##### status

`string`

The status of the order

##### customerId

The id of the customer

`undefined` | `number`

##### userId

The id of the user "Implicit customer id"

`undefined` | `number`

#### Returns

`Promise`\<\{ `count`: `number`; `orders`: `OrderResponse`[]; \}\>

A promise resolving to an array of Order instances

#### Remarks

The order history is retrieved for a customer either by their id
or their implicit id.

#### Throws

UserNotFoundError
Thrown if the user of type Customer is not found.

***

### getOrderById()

> **getOrderById**(`userId`, `orderId`): `Promise`\<`OrderResponse`\>

Defined in: [Order.service.ts:140](https://github.com/Fatjon-Gash1/edge-tech/blob/24d7692b2f898f47915b9666fb1c8515d276fe0f/services/Order.service.ts#L140)

Retrieves a specific order by ID.

#### Parameters

##### userId

The id of the user

`undefined` | `number`

##### orderId

`number`

The ID of the order

#### Returns

`Promise`\<`OrderResponse`\>

A promise resolving to the order

***

### getOrderItemsByOrderId()

> **getOrderItemsByOrderId**(`userId`, `orderId`): `Promise`\<`OrderItemResponse`[]\>

Defined in: [Order.service.ts:180](https://github.com/Fatjon-Gash1/edge-tech/blob/24d7692b2f898f47915b9666fb1c8515d276fe0f/services/Order.service.ts#L180)

Retrieves all items of a specific order.

#### Parameters

##### userId

The id of the user

`undefined` | `number`

##### orderId

`number`

The ID of the order

#### Returns

`Promise`\<`OrderItemResponse`[]\>

A promise resolving to an array of OrderItem instances

#### Throws

OrderNotFoundError
Thrown if the order is not found.

***

### getOrdersByStatus()

> **getOrdersByStatus**(`status`): `Promise`\<\{ `count`: `number`; `orders`: `OrderResponse`[]; \}\>

Defined in: [Order.service.ts:259](https://github.com/Fatjon-Gash1/edge-tech/blob/24d7692b2f898f47915b9666fb1c8515d276fe0f/services/Order.service.ts#L259)

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

Defined in: [Order.service.ts:232](https://github.com/Fatjon-Gash1/edge-tech/blob/24d7692b2f898f47915b9666fb1c8515d276fe0f/services/Order.service.ts#L232)

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

### markAsDelivered()

> **markAsDelivered**(`orderId`): `Promise`\<`void`\>

Defined in: [Order.service.ts:382](https://github.com/Fatjon-Gash1/edge-tech/blob/24d7692b2f898f47915b9666fb1c8515d276fe0f/services/Order.service.ts#L382)

Marks customer's order as delivered.

#### Parameters

##### orderId

`number`

The id of the order

#### Returns

`Promise`\<`void`\>

#### Throws

OrderNotFoundError
Thrown if the order is not found.

#### Throws

OrderAlreadyMarkedError
Thrown if the order is already marked as delivered or canceled.
