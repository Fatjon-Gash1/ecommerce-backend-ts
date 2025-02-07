[**server**](../README.md)

---

[server](../README.md) / OrderService

# Class: OrderService

Defined in: [Order.service.ts:38](https://github.com/Fatjon-Gash1/edge-tech/blob/085a51adf25b768e5a328e0a366f458113cc8929/server/services/Order.service.ts#L38)

Service responsible for Order-related operations.

## Constructors

### new OrderService()

> **new OrderService**(): [`OrderService`](OrderService.md)

#### Returns

[`OrderService`](OrderService.md)

## Methods

### cancelOrder()

> **cancelOrder**(`userId`, `orderId`): `Promise`\<`void`\>

Defined in: [Order.service.ts:388](https://github.com/Fatjon-Gash1/edge-tech/blob/085a51adf25b768e5a328e0a366f458113cc8929/server/services/Order.service.ts#L388)

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

---

### createOrder()

> **createOrder**(`userId`, `items`, `paymentMethod`, `shippingCountry`, `shippingWeight`, `shippingMethod`, `transactionObj`?): `Promise`\<`OrderResponse`\>

Defined in: [Order.service.ts:51](https://github.com/Fatjon-Gash1/edge-tech/blob/085a51adf25b768e5a328e0a366f458113cc8929/server/services/Order.service.ts#L51)

Creates an order for a customer.

#### Parameters

##### userId

`number`

The user id

##### items

`OrderItemAttributes`[]

The items to add to the order

##### paymentMethod

The payment method for the order

`"card"` | `"wallet"` | `"bank-transfer"`

##### shippingCountry

`string`

The shipping country for the order

##### shippingWeight

The shipping weight for the order

`"light"` | `"standard"` | `"heavy"`

##### shippingMethod

The shipping method for the order

`"standard"` | `"express"` | `"next-day"`

##### transactionObj?

`Transaction`

An existing transaction

#### Returns

`Promise`\<`OrderResponse`\>

A promise resolving to the created order

---

### getAllOrders()

> **getAllOrders**(): `Promise`\<\{ `count`: `number`; `orders`: `OrderResponse`[]; \}\>

Defined in: [Order.service.ts:334](https://github.com/Fatjon-Gash1/edge-tech/blob/085a51adf25b768e5a328e0a366f458113cc8929/server/services/Order.service.ts#L334)

Retrieves all orders in the database.

#### Returns

`Promise`\<\{ `count`: `number`; `orders`: `OrderResponse`[]; \}\>

A promise resolving to an array of Order instances

---

### getCustomerOrderHistory()

> **getCustomerOrderHistory**(`customerId`, `userId`): `Promise`\<\{ `count`: `number`; `orders`: `OrderResponse`[]; \}\>

Defined in: [Order.service.ts:303](https://github.com/Fatjon-Gash1/edge-tech/blob/085a51adf25b768e5a328e0a366f458113cc8929/server/services/Order.service.ts#L303)

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

---

### getCustomerOrdersByStatus()

> **getCustomerOrdersByStatus**(`status`, `customerId`, `userId`): `Promise`\<\{ `count`: `number`; `orders`: `OrderResponse`[]; \}\>

Defined in: [Order.service.ts:262](https://github.com/Fatjon-Gash1/edge-tech/blob/085a51adf25b768e5a328e0a366f458113cc8929/server/services/Order.service.ts#L262)

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

---

### getOrderById()

> **getOrderById**(`userId`, `orderId`): `Promise`\<`OrderResponse`\>

Defined in: [Order.service.ts:116](https://github.com/Fatjon-Gash1/edge-tech/blob/085a51adf25b768e5a328e0a366f458113cc8929/server/services/Order.service.ts#L116)

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

---

### getOrderItemsByOrderId()

> **getOrderItemsByOrderId**(`userId`, `orderId`): `Promise`\<`OrderItemResponse`[]\>

Defined in: [Order.service.ts:156](https://github.com/Fatjon-Gash1/edge-tech/blob/085a51adf25b768e5a328e0a366f458113cc8929/server/services/Order.service.ts#L156)

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

---

### getOrdersByStatus()

> **getOrdersByStatus**(`status`): `Promise`\<\{ `count`: `number`; `orders`: `OrderResponse`[]; \}\>

Defined in: [Order.service.ts:235](https://github.com/Fatjon-Gash1/edge-tech/blob/085a51adf25b768e5a328e0a366f458113cc8929/server/services/Order.service.ts#L235)

Retrieves all platform orders by a given status.

#### Parameters

##### status

`string`

The status of the order

#### Returns

`Promise`\<\{ `count`: `number`; `orders`: `OrderResponse`[]; \}\>

A promise resolving to an array of Order instances and their count

---

### getTotalPriceOfOrderItems()

> **getTotalPriceOfOrderItems**(`userId`, `orderId`): `Promise`\<`number`\>

Defined in: [Order.service.ts:208](https://github.com/Fatjon-Gash1/edge-tech/blob/085a51adf25b768e5a328e0a366f458113cc8929/server/services/Order.service.ts#L208)

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

---

### markAsDelivered()

> **markAsDelivered**(`orderId`): `Promise`\<`void`\>

Defined in: [Order.service.ts:358](https://github.com/Fatjon-Gash1/edge-tech/blob/085a51adf25b768e5a328e0a366f458113cc8929/server/services/Order.service.ts#L358)

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
