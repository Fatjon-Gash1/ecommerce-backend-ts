[**server**](../README.md)

***

[server](../globals.md) / SubscriptionService

# Class: SubscriptionService

Defined in: [subscription\_service/index.ts:44](https://github.com/Fatjon-Gash1/edge-tech/blob/24d7692b2f898f47915b9666fb1c8515d276fe0f/services/subscription_service/index.ts#L44)

Service related to platform subscriptions

## Constructors

### new SubscriptionService()

> **new SubscriptionService**(`paymentService`?, `notificationService`?): [`SubscriptionService`](SubscriptionService.md)

Defined in: [subscription\_service/index.ts:48](https://github.com/Fatjon-Gash1/edge-tech/blob/24d7692b2f898f47915b9666fb1c8515d276fe0f/services/subscription_service/index.ts#L48)

#### Parameters

##### paymentService?

[`PaymentService`](PaymentService.md)

##### notificationService?

[`NotificationService`](NotificationService.md)

#### Returns

[`SubscriptionService`](SubscriptionService.md)

## Properties

### notificationService?

> `protected` `optional` **notificationService**: [`NotificationService`](NotificationService.md)

Defined in: [subscription\_service/index.ts:46](https://github.com/Fatjon-Gash1/edge-tech/blob/24d7692b2f898f47915b9666fb1c8515d276fe0f/services/subscription_service/index.ts#L46)

***

### paymentService?

> `protected` `optional` **paymentService**: [`PaymentService`](PaymentService.md)

Defined in: [subscription\_service/index.ts:45](https://github.com/Fatjon-Gash1/edge-tech/blob/24d7692b2f898f47915b9666fb1c8515d276fe0f/services/subscription_service/index.ts#L45)

## Methods

### cancelMembership()

> **cancelMembership**(`stripeCustomerId`): `Promise`\<`number`\>

Defined in: [subscription\_service/index.ts:428](https://github.com/Fatjon-Gash1/edge-tech/blob/24d7692b2f898f47915b9666fb1c8515d276fe0f/services/subscription_service/index.ts#L428)

Cancels a customer's membership.

#### Parameters

##### stripeCustomerId

`number`

The customer's stripe id

#### Returns

`Promise`\<`number`\>

#### Remarks

This method is called automatically from scheduled jobs.

***

### cancelMembershipSubscription()

> **cancelMembershipSubscription**(`userId`, `immediate`?): `Promise`\<`void`\>

Defined in: [subscription\_service/index.ts:148](https://github.com/Fatjon-Gash1/edge-tech/blob/24d7692b2f898f47915b9666fb1c8515d276fe0f/services/subscription_service/index.ts#L148)

Cancels a customer's membership subscription.

#### Parameters

##### userId

`number`

The customer's user id

##### immediate?

`boolean`

Whether to cancel the subscription immediately

#### Returns

`Promise`\<`void`\>

#### Throws

UserNotFoundError
Thrown if the customer does not exist.

***

### changeMembershipPrice()

> **changeMembershipPrice**(`membershipId`, `pricePlan`, `price`): `Promise`\<`void`\>

Defined in: [subscription\_service/index.ts:266](https://github.com/Fatjon-Gash1/edge-tech/blob/24d7692b2f898f47915b9666fb1c8515d276fe0f/services/subscription_service/index.ts#L266)

Changes a membership's price.

#### Parameters

##### membershipId

`string`

The membership's id

##### pricePlan

The type of the price (Annual or Monthly)

`"annual"` | `"monthly"`

##### price

`number`

The price of the membership

#### Returns

`Promise`\<`void`\>

#### Remarks

This method creates new subscriptions to the changed price for subscribed customers automatically if the price is less than the old one (Discounted).
If the price is higher, it sends a confirmation email to subscribed customers.
In this scenario, the subscription is created on confirmation.
If no action is taken from the customer, the customer's membership is canceled after the end of the period.

***

### createMembershipSubscription()

> **createMembershipSubscription**(`userId`, `membershipType`, `annual`?, `promoCode`?): `Promise`\<`void`\>

Defined in: [subscription\_service/index.ts:70](https://github.com/Fatjon-Gash1/edge-tech/blob/24d7692b2f898f47915b9666fb1c8515d276fe0f/services/subscription_service/index.ts#L70)

Creates a new membership subscription.

#### Parameters

##### userId

`number`

The customer's user id

##### membershipType

The type of the membership

`"plus"` | `"premium"`

##### annual?

`boolean`

Whether to create an annual subscription

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

Defined in: [subscription\_service/index.ts:173](https://github.com/Fatjon-Gash1/edge-tech/blob/24d7692b2f898f47915b9666fb1c8515d276fe0f/services/subscription_service/index.ts#L173)

Retrieves the membership subscription type.

#### Returns

`Promise`\<`MembershipResponse`[]\>

A promise resolving to the membership subscription type

***

### getMembershipSubscriptions()

> **getMembershipSubscriptions**(`filters`?): `Promise`\<\{ `subscriptions`: `MembershipSubscriptionResponse`[]; `total`: `number`; \}\>

Defined in: [subscription\_service/index.ts:185](https://github.com/Fatjon-Gash1/edge-tech/blob/24d7692b2f898f47915b9666fb1c8515d276fe0f/services/subscription_service/index.ts#L185)

Retrieves membership subscriptions based on filtering parameters. If none passed it returns all subscriptions.

#### Parameters

##### filters?

`MembershipSubscriptionFilters`

Optional filtering parameters

#### Returns

`Promise`\<\{ `subscriptions`: `MembershipSubscriptionResponse`[]; `total`: `number`; \}\>

A promise resolving to all membership subscriptions

***

### subscribeToNewMembershipPrice()

> **subscribeToNewMembershipPrice**(`userId`, `type`, `plan`, `endOfPeriod`): `Promise`\<`void`\>

Defined in: [subscription\_service/index.ts:382](https://github.com/Fatjon-Gash1/edge-tech/blob/24d7692b2f898f47915b9666fb1c8515d276fe0f/services/subscription_service/index.ts#L382)

Creates a new subscription to the increased membership price.

#### Parameters

##### userId

`number`

The customer's user id

##### type

The membership type (plus or premium)

`"plus"` | `"premium"`

##### plan

The membership plan (annual or monthly)

`"annual"` | `"monthly"`

##### endOfPeriod

`number`

The end of the subscription period

#### Returns

`Promise`\<`void`\>
