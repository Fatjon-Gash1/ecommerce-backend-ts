[**server**](../README.md)

***

[server](../README.md) / SubscriptionService

# Class: SubscriptionService

Defined in: Subscription.service.ts:46

Service related to platform subscriptions

## Constructors

### new SubscriptionService()

> **new SubscriptionService**(`paymentService`): [`SubscriptionService`](SubscriptionService.md)

Defined in: Subscription.service.ts:49

#### Parameters

##### paymentService

[`PaymentService`](PaymentService.md)

#### Returns

[`SubscriptionService`](SubscriptionService.md)

## Properties

### paymentService

> `protected` **paymentService**: [`PaymentService`](PaymentService.md)

Defined in: Subscription.service.ts:47

## Methods

### createMembershipSubscription()

> **createMembershipSubscription**(`userId`, `promoCode`?): `Promise`\<`void`\>

Defined in: Subscription.service.ts:65

Creates a new membership subscription.

#### Parameters

##### userId

`number`

The customer's user id

##### promoCode?

`string`

The discount coupon promotion code

#### Returns

`Promise`\<`void`\>

#### Remarks

This method is tightly coupled with the membership subscription type.
Indicating that any changes to the type must align with the method logic and vice versa.

#### Throws

UserNotFoundError
Thrown if the customer does not exist.

***

### getMemberships()

> **getMemberships**(): `Promise`\<`MembershipResponse`[]\>

Defined in: Subscription.service.ts:90

Retrieves the membership subscription type.

#### Returns

`Promise`\<`MembershipResponse`[]\>

A promise resolving to the membership subscription type

***

### updateMembershipById()

> **updateMembershipById**(`membershipId`, `name`, `monthlyPrice`, `annualPrice`, `currency`, `otherDetails`): `Promise`\<`MembershipResponse`\>

Defined in: Subscription.service.ts:103

Updates a membership subscription type.

#### Parameters

##### membershipId

`string`

The membership id

##### name

`string`

##### monthlyPrice

`number`

##### annualPrice

`number`

##### currency

`string`

##### otherDetails

`MembershipAdditionalDetails`

#### Returns

`Promise`\<`MembershipResponse`\>

A promise resolving to the updated membership
