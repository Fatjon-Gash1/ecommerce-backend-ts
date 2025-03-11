[**server**](../README.md)

***

[server](../globals.md) / OrderService

# Class: OrderService

Defined in: [Order.service.ts:49](https://github.com/Fatjon-Gash1/edge-tech/blob/dd4dbe3ef2bb1640eb688285399d259174ec7226/services/Order.service.ts#L49)

Service responsible for Order-related operations.

## Constructors

### new OrderService()

> **new OrderService**(): [`OrderService`](OrderService.md)

#### Returns

[`OrderService`](OrderService.md)

## Methods

### cancelOrder()

> **cancelOrder**(`userId`, `orderId`): `Promise`\<`void`\>

Defined in: [Order.service.ts:400](https://github.com/Fatjon-Gash1/edge-tech/blob/dd4dbe3ef2bb1640eb688285399d259174ec7226/services/Order.service.ts#L400)

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

> **createOrder**(`userId`, `items`, `paymentMethod`, `shippingCountry`, `shippingWeight`, `shippingMethod`, `orderTotal`, `paymentIntentId`, `transactionObj`?): `Promise`\<`OrderResponse`\>

Defined in: [Order.service.ts:64](https://github.com/Fatjon-Gash1/edge-tech/blob/dd4dbe3ef2bb1640eb688285399d259174ec7226/services/Order.service.ts#L64)

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

##### shippingWeight

The shipping weight for the order

`"light"` | `"standard"` | `"heavy"`

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

Defined in: [Order.service.ts:346](https://github.com/Fatjon-Gash1/edge-tech/blob/dd4dbe3ef2bb1640eb688285399d259174ec7226/services/Order.service.ts#L346)

Retrieves all orders in the database.

#### Returns

`Promise`\<\{ `count`: `number`; `orders`: `OrderResponse`[]; \}\>

A promise resolving to an array of Order instances

***

### getCustomerOrderHistory()

> **getCustomerOrderHistory**(`customerId`, `userId`): `Promise`\<\{ `count`: `number`; `orders`: `OrderResponse`[]; \}\>

Defined in: [Order.service.ts:315](https://github.com/Fatjon-Gash1/edge-tech/blob/dd4dbe3ef2bb1640eb688285399d259174ec7226/services/Order.service.ts#L315)

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

Defined in: [Order.service.ts:274](https://github.com/Fatjon-Gash1/edge-tech/blob/dd4dbe3ef2bb1640eb688285399d259174ec7226/services/Order.service.ts#L274)

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

Defined in: [Order.service.ts:128](https://github.com/Fatjon-Gash1/edge-tech/blob/dd4dbe3ef2bb1640eb688285399d259174ec7226/services/Order.service.ts#L128)

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

Defined in: [Order.service.ts:168](https://github.com/Fatjon-Gash1/edge-tech/blob/dd4dbe3ef2bb1640eb688285399d259174ec7226/services/Order.service.ts#L168)

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

Defined in: [Order.service.ts:247](https://github.com/Fatjon-Gash1/edge-tech/blob/dd4dbe3ef2bb1640eb688285399d259174ec7226/services/Order.service.ts#L247)

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

Defined in: [Order.service.ts:220](https://github.com/Fatjon-Gash1/edge-tech/blob/dd4dbe3ef2bb1640eb688285399d259174ec7226/services/Order.service.ts#L220)

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

Defined in: [Order.service.ts:370](https://github.com/Fatjon-Gash1/edge-tech/blob/dd4dbe3ef2bb1640eb688285399d259174ec7226/services/Order.service.ts#L370)

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
