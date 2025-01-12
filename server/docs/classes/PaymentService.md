[**server**](../README.md)

***

[server](../README.md) / PaymentService

# Class: PaymentService

Defined in: [Payment.service.ts:56](https://github.com/Fatjon-Gash1/edge-tech/blob/085a51adf25b768e5a328e0a366f458113cc8929/server/services/Payment.service.ts#L56)

## Constructors

### new PaymentService()

> **new PaymentService**(`stripeKey`): [`PaymentService`](PaymentService.md)

Defined in: [Payment.service.ts:59](https://github.com/Fatjon-Gash1/edge-tech/blob/085a51adf25b768e5a328e0a366f458113cc8929/server/services/Payment.service.ts#L59)

#### Parameters

##### stripeKey

`string`

#### Returns

[`PaymentService`](PaymentService.md)

## Methods

### addPaymentDetails()

> **addPaymentDetails**(`userId`, `paymentType`, `token`): `Promise`\<`void`\>

Defined in: [Payment.service.ts:108](https://github.com/Fatjon-Gash1/edge-tech/blob/085a51adf25b768e5a328e0a366f458113cc8929/server/services/Payment.service.ts#L108)

#### Parameters

##### userId

`number`

##### paymentType

`string`

##### token

`string`

#### Returns

`Promise`\<`void`\>

***

### archiveProduct()

> **archiveProduct**(`stripeProductId`): `Promise`\<`void`\>

Defined in: [Payment.service.ts:439](https://github.com/Fatjon-Gash1/edge-tech/blob/085a51adf25b768e5a328e0a366f458113cc8929/server/services/Payment.service.ts#L439)

Archives a stripe product.

#### Parameters

##### stripeProductId

`string`

The id of the product to archive

#### Returns

`Promise`\<`void`\>

***

### createCustomer()

> **createCustomer**(`name`, `email`): `Promise`\<`string`\>

Defined in: [Payment.service.ts:70](https://github.com/Fatjon-Gash1/edge-tech/blob/085a51adf25b768e5a328e0a366f458113cc8929/server/services/Payment.service.ts#L70)

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

### createMembershipSubscription()

> **createMembershipSubscription**(`customerId`, `membership`, `promoCode`?): `Promise`\<`void`\>

Defined in: [Payment.service.ts:445](https://github.com/Fatjon-Gash1/edge-tech/blob/085a51adf25b768e5a328e0a366f458113cc8929/server/services/Payment.service.ts#L445)

#### Parameters

##### customerId

`string`

##### membership

`MembershipSubscribeDetails`

##### promoCode?

`string`

#### Returns

`Promise`\<`void`\>

***

### createPaymentIntent()

> **createPaymentIntent**(`userId`, `amount`, `currency`, `paymentMethodId`?): `Promise`\<`void`\>

Defined in: [Payment.service.ts:276](https://github.com/Fatjon-Gash1/edge-tech/blob/085a51adf25b768e5a328e0a366f458113cc8929/server/services/Payment.service.ts#L276)

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

`Promise`\<`void`\>

A Promise resolving to the created payment intent object.

#### Throws

UserNotFoundError
Thrown if the user is not found.

#### Throws

Thrown if the stripe customer is deleted.

***

### createPaymentMethod()

> **createPaymentMethod**(`type`, `token`): `Promise`\<`string`\>

Defined in: [Payment.service.ts:79](https://github.com/Fatjon-Gash1/edge-tech/blob/085a51adf25b768e5a328e0a366f458113cc8929/server/services/Payment.service.ts#L79)

#### Parameters

##### type

`string`

##### token

`string`

#### Returns

`Promise`\<`string`\>

***

### createProduct()

> **createProduct**(`details`): `Promise`\<\{ `priceId`: `string`; `productId`: `string`; \}\>

Defined in: [Payment.service.ts:342](https://github.com/Fatjon-Gash1/edge-tech/blob/085a51adf25b768e5a328e0a366f458113cc8929/server/services/Payment.service.ts#L342)

#### Parameters

##### details

`ProductDetails`

#### Returns

`Promise`\<\{ `priceId`: `string`; `productId`: `string`; \}\>

***

### createSetupIntent()

> **createSetupIntent**(`customerId`, `paymentMethodId`): `Promise`\<`SetupIntentResponse`\>

Defined in: [Payment.service.ts:91](https://github.com/Fatjon-Gash1/edge-tech/blob/085a51adf25b768e5a328e0a366f458113cc8929/server/services/Payment.service.ts#L91)

#### Parameters

##### customerId

`string`

##### paymentMethodId

`string`

#### Returns

`Promise`\<`SetupIntentResponse`\>

***

### deletePaymentMethod()

> **deletePaymentMethod**(`userId`, `paymentMethodId`): `Promise`\<`void`\>

Defined in: [Payment.service.ts:252](https://github.com/Fatjon-Gash1/edge-tech/blob/085a51adf25b768e5a328e0a366f458113cc8929/server/services/Payment.service.ts#L252)

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

### getPaymentIntentsForCustomer()

> **getPaymentIntentsForCustomer**(`userId`): `Promise`\<`string`[]\>

Defined in: [Payment.service.ts:319](https://github.com/Fatjon-Gash1/edge-tech/blob/085a51adf25b768e5a328e0a366f458113cc8929/server/services/Payment.service.ts#L319)

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

Defined in: [Payment.service.ts:170](https://github.com/Fatjon-Gash1/edge-tech/blob/085a51adf25b768e5a328e0a366f458113cc8929/server/services/Payment.service.ts#L170)

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

Defined in: [Payment.service.ts:133](https://github.com/Fatjon-Gash1/edge-tech/blob/085a51adf25b768e5a328e0a366f458113cc8929/server/services/Payment.service.ts#L133)

Retrieve all customer's payment methods.

#### Parameters

##### userId

`number`

The user id of the customer

#### Returns

`Promise`\<`PaymentMethodResponse`[]\>

A promise resolving to an array of payment methods

***

### refundPayment()

> **refundPayment**(`paymentIntentId`, `amount`?): `Promise`\<`void`\>

Defined in: [Payment.service.ts:331](https://github.com/Fatjon-Gash1/edge-tech/blob/085a51adf25b768e5a328e0a366f458113cc8929/server/services/Payment.service.ts#L331)

#### Parameters

##### paymentIntentId

`string`

##### amount?

`number`

#### Returns

`Promise`\<`void`\>

***

### updatePaymentMethod()

> **updatePaymentMethod**(`userId`, `paymentMethodId`, `expMonth`?, `expYear`?): `Promise`\<`PaymentMethodResponse`\>

Defined in: [Payment.service.ts:209](https://github.com/Fatjon-Gash1/edge-tech/blob/085a51adf25b768e5a328e0a366f458113cc8929/server/services/Payment.service.ts#L209)

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

***

### updateProduct()

> **updateProduct**(`productId`, `name`, `monthlyPrice`, `annualPrice`, `currency`): `Promise`\<`StripePriceIds`\>

Defined in: [Payment.service.ts:379](https://github.com/Fatjon-Gash1/edge-tech/blob/085a51adf25b768e5a328e0a366f458113cc8929/server/services/Payment.service.ts#L379)

Updates a stripe product along with its related prices.

#### Parameters

##### productId

`string`

The id of the product to update

##### name

`string`

The name of the product

##### monthlyPrice

`number`

The monthly price of the product

##### annualPrice

`number`

The annual price of the product

##### currency

`string`

The currency of the product

#### Returns

`Promise`\<`StripePriceIds`\>

A promise resolving to the new price id(s)
