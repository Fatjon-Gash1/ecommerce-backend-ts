[**ecommerce-backend-ts**](../README.md)

***

[ecommerce-backend-ts](../globals.md) / NotificationService

# Class: NotificationService

Defined in: Notification.service.ts:42

Service responsible for handling platform notifications.

## Constructors

### new NotificationService()

> **new NotificationService**(): [`NotificationService`](NotificationService.md)

Defined in: Notification.service.ts:46

#### Returns

[`NotificationService`](NotificationService.md)

## Methods

### markAsRead()

> **markAsRead**(`userId`, `notificationId`?, `all`?): `Promise`\<`void`\>

Defined in: Notification.service.ts:623

Marks user notification as read.

#### Parameters

##### userId

`number`

The user id

##### notificationId?

`number`

The notification id

##### all?

`boolean`

Whether to mark all notifications as read

#### Returns

`Promise`\<`void`\>

#### Throws

Error
Thrown if the notification is not found

***

### removeNotification()

> **removeNotification**(`userId`, `notificationId`?, `all`?): `Promise`\<`void`\>

Defined in: Notification.service.ts:651

Removes a customer notification/s.

#### Parameters

##### userId

`number`

The customer's user id

##### notificationId?

`number`

The notification id

##### all?

`boolean`

Whether to remove all notifications

#### Returns

`Promise`\<`void`\>

***

### sendBirthdayPromotionCodeEmail()

> **sendBirthdayPromotionCodeEmail**(`email`, `firstName`, `birthday`, `promotionCode`): `Promise`\<`void`\>

Defined in: Notification.service.ts:381

Sends an email with a promotion code to a customer on its birthday.

#### Parameters

##### email

`string`

The email of the customer

##### firstName

`string`

The first name of the customer

##### birthday

`Date`

The birthday of the customer

##### promotionCode

`string`

The customer's promotion code

#### Returns

`Promise`\<`void`\>

***

### sendEmail()

> **sendEmail**(`options`): `Promise`\<`void`\>

Defined in: Notification.service.ts:58

Generic email sending method.

#### Parameters

##### options

`EmailOptions`

The email options
Throws {Error}
Thrown if it fails to send the email

#### Returns

`Promise`\<`void`\>

***

### sendEmailOnMembershipPriceIncrease()

> **sendEmailOnMembershipPriceIncrease**(`subscriptionData`, `membershipPlan`, `pricePlan`, `oldPrice`, `increasedPrice`): `Promise`\<`void`\>

Defined in: Notification.service.ts:261

Sends emails to subscribed customers on membership price increase.

#### Parameters

##### subscriptionData

`Map`\<`string`, `number`\>

A map that contains the stripe customer id and the end date of the customer subscription

##### membershipPlan

`string`

The membership plan (plus, premium)

##### pricePlan

The price plan (Annual or Monthly)

`"annual"` | `"monthly"`

##### oldPrice

`number`

The old price of the membership plan

##### increasedPrice

`number`

The increased price of the membership plan

#### Returns

`Promise`\<`void`\>

***

### sendEmailVerificationEmail()

> **sendEmailVerificationEmail**(`userEmail`, `verificationToken`): `Promise`\<`void`\>

Defined in: Notification.service.ts:528

Sends an email verification email to a user.

#### Parameters

##### userEmail

`string`

The email of the user

##### verificationToken

`string`

The email verification token

Throws EmailNotificationError
Thrown if it fails to send the email to the user.

#### Returns

`Promise`\<`void`\>

***

### sendHandledRefundEmail()

> **sendHandledRefundEmail**(`customerEmail`, `data`): `Promise`\<`void`\>

Defined in: Notification.service.ts:467

Sends a handled refund request email to a customer.

Throws EmailNotificationError
Thrown if it fails to send the email to the customer.

#### Parameters

##### customerEmail

`string`

##### data

`HandledRefundEmailData`

#### Returns

`Promise`\<`void`\>

***

### sendHolidayPromotionEmail()

> **sendHolidayPromotionEmail**(`email`, `firstName`, `holiday`, `loyaltyPoints`, `promotionCode`?, `percentOff`?): `Promise`\<`void`\>

Defined in: Notification.service.ts:424

Sends a rewarding email to a customer on a holiday.

#### Parameters

##### email

`string`

The email of the customer

##### firstName

`string`

The first name of the customer

##### holiday

`string`

The name of the holiday

##### loyaltyPoints

`number`

The amount of loyalty points the customer has been rewarded

##### promotionCode?

The customer's promotion code

`null` | `string`

##### percentOff?

The percentage of the promocode discount

`null` | `number`

#### Returns

`Promise`\<`void`\>

***

### sendMembershipDiscountEmailToNonSubscribers()

> **sendMembershipDiscountEmailToNonSubscribers**(`membershipType`, `pricePlan`, `oldPrice`, `discountedPrice`): `Promise`\<`void`\>

Defined in: Notification.service.ts:171

Sends emails to non-subscribed customers on membership price discount.

#### Parameters

##### membershipType

`string`

The membership type

##### pricePlan

The price plan (Annual or Monthly)

`"annual"` | `"monthly"`

##### oldPrice

`number`

The old price of the membership plan

##### discountedPrice

`number`

The discounted price

#### Returns

`Promise`\<`void`\>

***

### sendNotification()

> **sendNotification**(`userId`, ...`messages`): `Promise`\<`void`\>

Defined in: Notification.service.ts:596

Generic method that sends in-platfrom notifications to users.

#### Parameters

##### userId

`number`

The id of the user to send the notification to

##### messages

...`string`[]

The messages to send

#### Returns

`Promise`\<`void`\>

***

### sendPasswordResetEmail()

> **sendPasswordResetEmail**(`userEmail`, `firstName`, `resetToken`): `Promise`\<`void`\>

Defined in: Notification.service.ts:565

Sends a password reset email to a user.

#### Parameters

##### userEmail

`string`

The email of the user

##### firstName

`string`

The first name of the user

##### resetToken

`string`

The reset token

Throws EmailNotificationError
Thrown if it fails to send the email to the user.

#### Returns

`Promise`\<`void`\>

***

### sendPromotionsEmail()

> **sendPromotionsEmail**(`products`, `promotion`): `Promise`\<`void`\>

Defined in: Notification.service.ts:78

Sends an email to all customers about new promotions.

#### Parameters

##### products

`NewProduct`[]

An array of promoted products

Throws EmailNotificationError
Thrown if it fails to send the email to some of the customers.

##### promotion

`Promotion`

#### Returns

`Promise`\<`void`\>

***

### sendReplenishmentPaymentEmail()

> **sendReplenishmentPaymentEmail**(`userEmail`, `subject`, `emailTemplate`, `data`): `Promise`\<`void`\>

Defined in: Notification.service.ts:497

Sends a successful or failed payment email to a customer on replenishment.

#### Parameters

##### userEmail

`string`

##### subject

`string`

##### emailTemplate

`string`

##### data

`SuccessfulPaymentEmailData` | `FailedPaymentEmailData`

#### Returns

`Promise`\<`void`\>

#### User Email

- The email of the customer

#### Subject

- The subject of the email

#### Email Template

- The template of the email

#### Data

- The data to be sent in the email

***

### sendWelcomeEmail()

> **sendWelcomeEmail**(`firstName`, `email`): `Promise`\<`void`\>

Defined in: Notification.service.ts:348

Sends a welcome email to a newly registered customer.

#### Parameters

##### firstName

`string`

The first name of the customer

##### email

`string`

The email of the customer

#### Returns

`Promise`\<`void`\>
