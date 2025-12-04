[**ecommerce-backend-ts**](../README.md)

***

[ecommerce-backend-ts](../globals.md) / PaymentService

# Class: PaymentService

Defined in: Payment.service.ts:41

Service responsible for all payment related tasks.

## Constructors

### new PaymentService()

> **new PaymentService**(`stripeKey`, `orderService`?, `shippingService`?, `notificationService`?): [`PaymentService`](PaymentService.md)

Defined in: Payment.service.ts:47

#### Parameters

##### stripeKey

`string`

##### orderService?

[`OrderService`](OrderService.md)

##### shippingService?

[`ShippingService`](ShippingService.md)

##### notificationService?

[`NotificationService`](NotificationService.md)

#### Returns

[`PaymentService`](PaymentService.md)

## Methods

### addPaymentDetails()

> **addPaymentDetails**(`userId`, `paymentType`, `token`): `Promise`\<`void`\>

Defined in: Payment.service.ts:125

#### Parameters

##### userId

`number`

##### paymentType

`"card"`

##### token

`string`

#### Returns

`Promise`\<`void`\>

***

### cancelMembershipSubscriptionWithProrate()

> **cancelMembershipSubscriptionWithProrate**(`customerId`): `Promise`\<`void`\>

Defined in: Payment.service.ts:1064

Cancels membership subscription and credits unused time.

#### Parameters

##### customerId

`string`

The id of the customer to cancel

#### Returns

`Promise`\<`void`\>

***

### cancelMembershipSubscriptionWithRefund()

> **cancelMembershipSubscriptionWithRefund**(`userId`, `customerId`, `immediate`?): `Promise`\<`void`\>

Defined in: Payment.service.ts:973

Cancels a stripe customer's subscription.

#### Parameters

##### userId

`number`

The customer's user ID

##### customerId

`string`

The id of the customer to cancel

##### immediate?

`boolean`

Whether to cancel the subscription immediately

#### Returns

`Promise`\<`void`\>

#### Remarks

This method is called from the subscription service.

#### Throws

Error
Thrown if no subscriptions were found.

#### Throws

Error
Thrown if no invoice or invoice charge was found for the subscription.

***

### createCustomer()

> **createCustomer**(`name`, `email`): `Promise`\<`string`\>

Defined in: Payment.service.ts:78

Creates a new stripe customer.

#### Parameters

##### name

`string`

Name of the customer

##### email

`string`

Email of the customer

#### Returns

`Promise`\<`string`\>

A Promise resolving to the Stripe customer id

***

### createDiscountCouponAndPromotionCode()

> **createDiscountCouponAndPromotionCode**(`percentage`, `customerId`): `Promise`\<`string`\>

Defined in: Payment.service.ts:890

Creates a discount coupon and promotion code.

#### Parameters

##### percentage

`number`

The percentage of the discount to apply

##### customerId

`string`

The id of the customer that can use the promotion code

#### Returns

`Promise`\<`string`\>

A promise resolving to the promotion code

#### Remarks

This method is called from the subscription service and from a job scheduler's jobs.

***

### createMembershipSubscription()

> **createMembershipSubscription**(`customerId`, `membership`, `annual`?, `trial`?, `promoCode`?): `Promise`\<`void`\>

Defined in: Payment.service.ts:920

Creates a customer subscription to a membership plan.

#### Parameters

##### customerId

`string`

The id of the customer to create a subscription for

##### membership

`MembershipSubscribeDetails`

The membership plan to subscribe to

##### annual?

`boolean`

Whether to create an annual subscription

##### trial?

`boolean`

Whether to create a trial

##### promoCode?

`string`

The promotion code to apply

#### Returns

`Promise`\<`void`\>

#### Remarks

This method is called from the subscription service.

***

### createPaymentIntent()

> **createPaymentIntent**(`userId`, `amount`, `currency`, `paymentMethodId`?): `Promise`\<`string`\>

Defined in: Payment.service.ts:367

Create a payment intent using the Stripe API.

#### Parameters

##### userId

`number`

The user id of the customer

##### amount

`number`

The amount to charge (in smallest currency unit, such as cents).

##### currency

Currency for the payment, 'usd' or 'eur'.

`"eur"` | `"usd"`

##### paymentMethodId?

`string`

The customer's payment method id

#### Returns

`Promise`\<`string`\>

A Promise resolving to the created payment intent id.

#### Throws

UserNotFoundError
Thrown if the user is not found.

#### Throws

Thrown if the stripe customer is deleted.

***

### createProduct()

> **createProduct**(`details`): `Promise`\<\{ `priceId`: `string`; `productId`: `string`; \}\>

Defined in: Payment.service.ts:716

#### Parameters

##### details

`PaymentProductDetails`

#### Returns

`Promise`\<\{ `priceId`: `string`; `productId`: `string`; \}\>

***

### createRefundRequest()

> **createRefundRequest**(`userId`, `orderId`, `reason`, `amount`?): `Promise`\<`boolean` \| `void`\>

Defined in: Payment.service.ts:471

Creates a refund request for an order.

#### Parameters

##### userId

`number`

The user ID of the customer

##### orderId

`number`

The ID of the order to refund

##### reason

`string`

The reason for the refund request

##### amount?

`number`

The amount to refund

#### Returns

`Promise`\<`boolean` \| `void`\>

#### Remarks

This method can be only called by customers.
The request is reviewed by a support agent or admin before the refund is processed.

#### Throws

UserNotFoundError
Thrown if the customer is not found.

#### Throws

OrderNotFoundError
Thrown if the order is not found.

***

### createSubscriptionsForCustomers()

> **createSubscriptionsForCustomers**(`subscriptionData`, `priceId`): `Promise`\<`void`\>

Defined in: Payment.service.ts:788

Creates new subscriptions for a set of customers.

#### Parameters

##### subscriptionData

`Map`\<`string`, `number`\>

##### priceId

`string`

The price id of the membership plan

#### Returns

`Promise`\<`void`\>

#### Remarks

This method is called from the subscription service.

***

### deleteCustomer()

> **deleteCustomer**(`customerId`): `Promise`\<`void`\>

Defined in: Payment.service.ts:92

Removes a stripe customer.

#### Parameters

##### customerId

`string`

Stripe customer id

#### Returns

`Promise`\<`void`\>

***

### deletePaymentMethod()

> **deletePaymentMethod**(`userId`, `paymentMethodId`): `Promise`\<`void`\>

Defined in: Payment.service.ts:343

Delete (Detach) a payment method from a customer.

#### Parameters

##### userId

`number`

The user id of the customer

##### paymentMethodId

`string`

The payment method id to delete

#### Returns

`Promise`\<`void`\>

***

### extendMembershipSubscription()

> **extendMembershipSubscription**(`customerId`, `priceId`, `endOfPeriod`): `Promise`\<`void`\>

Defined in: Payment.service.ts:825

Extends the customer membership subscription.

#### Parameters

##### customerId

`string`

The id of the customer to create a subscription for

##### priceId

`string`

The membership annual or monthly priceId

##### endOfPeriod

`number`

The end of the subscription period

#### Returns

`Promise`\<`void`\>

#### Remarks

This method is called from the subscription service.

***

### getCustomerRefundRequests()

> **getCustomerRefundRequests**(`userId`): `Promise`\<`RefundRequestResponse`[]\>

Defined in: Payment.service.ts:578

Retrieve customer's refund requests.

#### Parameters

##### userId

`number`

The user ID of the customer

#### Returns

`Promise`\<`RefundRequestResponse`[]\>

- A promise resolving to an array of refund requests.

#### Remarks

This method can only be called by support or admins.

***

### getCustomerSubscription()

> **getCustomerSubscription**(`customerId`): `Promise`\<`null` \| `SubscriptionFormattedResponse`\>

Defined in: Payment.service.ts:251

Retrieves customer subscription

#### Parameters

##### customerId

`string`

The Stripe customer id

#### Returns

`Promise`\<`null` \| `SubscriptionFormattedResponse`\>

A promise resolving to the customer subscription object

#### Remarks

This method is called from the subscription service.

***

### getNotificationService()

> `protected` **getNotificationService**(): `null` \| [`NotificationService`](NotificationService.md)

Defined in: Payment.service.ts:63

#### Returns

`null` \| [`NotificationService`](NotificationService.md)

***

### getPaymentIntentsForCustomer()

> **getPaymentIntentsForCustomer**(`userId`): `Promise`\<`string`[]\>

Defined in: Payment.service.ts:422

Retrieve a payment intent by its ID.

#### Parameters

##### userId

`number`

#### Returns

`Promise`\<`string`[]\>

A Promise resolving to the retrieved payment intent.

#### Throws

Thrown if it fails to retrieve the payment intent.

***

### getPaymentMethodById()

> **getPaymentMethodById**(`userId`, `paymentMethodId`): `Promise`\<`PaymentMethodResponse`\>

Defined in: Payment.service.ts:212

Retrieves a customer's payment method by its id.

#### Parameters

##### userId

`number`

The user id of the customer

##### paymentMethodId

`string`

The payment method id to retrieve

#### Returns

`Promise`\<`PaymentMethodResponse`\>

A promise resolving to the payment method object

***

### getPaymentMethods()

> **getPaymentMethods**(`userId`): `Promise`\<`PaymentMethodResponse`[]\>

Defined in: Payment.service.ts:175

Retrieve all customer's payment methods.

#### Parameters

##### userId

`number`

The user id of the customer

#### Returns

`Promise`\<`PaymentMethodResponse`[]\>

A promise resolving to an array of payment methods

***

### getRefundRequests()

> **getRefundRequests**(`filter`?): `Promise`\<\{ `requests`: `RefundRequestResponse`[]; `total`: `number`; \}\>

Defined in: Payment.service.ts:545

Retrieves refund requests.

#### Parameters

##### filter?

Optional filter object

###### customerId

`number`

###### status

`"pending"` \| `"approved"` \| `"denied"`

#### Returns

`Promise`\<\{ `requests`: `RefundRequestResponse`[]; `total`: `number`; \}\>

- A promise resolving to an array of refund requests.

#### Remarks

This method can only be called by support or admins.

***

### getShippingService()

> `protected` **getShippingService**(): `null` \| [`ShippingService`](ShippingService.md)

Defined in: Payment.service.ts:67

#### Returns

`null` \| [`ShippingService`](ShippingService.md)

***

### getStripe()

> `protected` **getStripe**(): `Stripe`

Defined in: Payment.service.ts:59

#### Returns

`Stripe`

***

### handleRefundRequest()

> **handleRefundRequest**(`refundRequestId`, `action`, `rejectionReason`?): `Promise`\<`void`\>

Defined in: Payment.service.ts:604

Handles the refund request for an order.

#### Parameters

##### refundRequestId

`number`

The ID of the refund request

##### action

The action to take (deny or approve)

`"approved"` | `"denied"`

##### rejectionReason?

`string`

#### Returns

`Promise`\<`void`\>

#### Remarks

This method can only be called by support or admins.

***

### hasCanceledSubscriptions()

> **hasCanceledSubscriptions**(`customerId`): `Promise`\<`boolean`\>

Defined in: Payment.service.ts:279

Checks if customer has canceled subscriptions.

#### Parameters

##### customerId

`string`

The id of the customer to check

#### Returns

`Promise`\<`boolean`\>

A promise resolving to a boolean

***

### processPayment()

> **processPayment**(`userId`, `data`): `Promise`\<`ProcessedPaymentResponse`\>

Defined in: Payment.service.ts:1103

Handles payment processing for an order.

#### Parameters

##### userId

`number`

The id of the user to process payment for

##### data

`PaymentProcessingData`

The payment processing data

#### Returns

`Promise`\<`ProcessedPaymentResponse`\>

A promise resolving to the weight range, payment intent id, and the payment amount

#### Remarks

This method is also called from the replenishment service.

***

### processPaymentAndCreateOrder()

> **processPaymentAndCreateOrder**(`userId`, `data`): `Promise`\<`void`\>

Defined in: Payment.service.ts:1212

Processes a payment, audits new product purchases, and creates an order for a customer.

#### Parameters

##### userId

`number`

The customer's user ID

##### data

`PaymentProcessingData`

The payment processing data

#### Returns

`Promise`\<`void`\>

***

### refundPayment()

> `protected` **refundPayment**(`paymentIntentId`, `refundReason`, `amount`?): `Promise`\<`void`\>

Defined in: Payment.service.ts:441

Refunds a payment intent.

#### Parameters

##### paymentIntentId

`string`

The ID of the payment intent to refund

##### refundReason

`string`

The reason for the refund

##### amount?

`number`

The amount to refund

#### Returns

`Promise`\<`void`\>

***

### retrieveSubscribedCustomersByMembershipPriceAndCancelSubscriptions()

> **retrieveSubscribedCustomersByMembershipPriceAndCancelSubscriptions**(`priceId`): `Promise`\<`Map`\<`string`, `number`\>\>

Defined in: Payment.service.ts:749

Retrieves subscribed customers by membership price and cancels their subscriptions.

#### Parameters

##### priceId

`string`

The price id of the membership plan

#### Returns

`Promise`\<`Map`\<`string`, `number`\>\>

A promise resolving to an array of stripe customer ids

#### Remarks

This method is called from the subscription service.

***

### setDefaultPaymentMethod()

> **setDefaultPaymentMethod**(`userId`, `paymentMethodId`): `Promise`\<`void`\>

Defined in: Payment.service.ts:154

#### Parameters

##### userId

`number`

##### paymentMethodId

`string`

#### Returns

`Promise`\<`void`\>

***

### updateMembership()

> **updateMembership**(`productId`, `priceType`, `price`): `Promise`\<`string`\>

Defined in: Payment.service.ts:856

Updates a stripe membership product along with its related prices.

#### Parameters

##### productId

`string`

The id of the product to update

##### priceType

The type of the price (annual, monthly)

`"annual"` | `"monthly"`

##### price

`number`

The price of the product

#### Returns

`Promise`\<`string`\>

A promise resolving to the new price id

#### Remarks

This method is called from the subscription service.

***

### updatePaymentMethod()

> **updatePaymentMethod**(`userId`, `paymentMethodId`, `expMonth`?, `expYear`?): `Promise`\<`PaymentMethodResponse`\>

Defined in: Payment.service.ts:300

Updates a customer's payment method by its id.

#### Parameters

##### userId

`number`

The user id of the customer

##### paymentMethodId

`string`

The payment method id to update

##### expMonth?

`number`

The card expiration month

##### expYear?

`number`

The card expiration year

#### Returns

`Promise`\<`PaymentMethodResponse`\>

A promise resolving to the updated payment method object
